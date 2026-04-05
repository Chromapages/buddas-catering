import { NextResponse } from "next/server";
import { programSignupSchema } from "@/lib/schemas/programSignup";
import { db, auth as adminAuth } from "@/lib/firebase/admin";
import * as admin from 'firebase-admin';
import type { Company, Contact, Lead, ProgramSignup } from "@/lib/types";

// Standardize phone numbers to just digits
function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    // Public endpoint for corporate program signups from the landing page.
    // (CRM users can also use it, but no token is required for lead capture)

    const body = await request.json();
    
    // 1. Validate payload
    const parsed = programSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 422 }
      );
    }
    
    const data = parsed.data;
    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(data.phone);
    const normalizedCompanyName = data.businessName.trim();

    // 2. Dedup: Check for existing contact by email OR phone
    let existingContactDoc: any = null;
    
    // First try Email
    const contactsByEmail = await db.collection("contacts").where("email", "==", normalizedEmail).limit(1).get();
    if (!contactsByEmail.empty) {
      existingContactDoc = contactsByEmail.docs[0];
    } else {
      // Then try Phone
      const contactsByPhone = await db.collection("contacts").where("phone", "==", data.phone).limit(1).get();
      if (!contactsByPhone.empty) {
        existingContactDoc = contactsByPhone.docs[0];
      }
    }
    
    let contactId = "";
    let companyId = "";
    const isDuplicate = !!existingContactDoc;

    const batch = db.batch();
    const now = new Date().toISOString();

    if (existingContactDoc) {
      // Existing contact -> Use their ID and their Company ID
      contactId = existingContactDoc.id;
      companyId = existingContactDoc.data().companyId as string;
      
      // Update contact's phone and name if changed (freshening data)
      batch.update(existingContactDoc.ref, { 
        fullName: data.contactName,
        phone: data.phone,
        updatedAt: now
      });
      
      // Update company's source history
      const companyRef = db.collection("companies").doc(companyId);
      const companyDoc = await companyRef.get();
      if (companyDoc.exists) {
        const sourceHistory = companyDoc.data()?.sourceHistory || [];
        if (!sourceHistory.includes("corporate_program")) {
          batch.update(companyRef, {
            sourceHistory: [...sourceHistory, "corporate_program"],
            updatedAt: now
          });
        }
      }

    } else {
      // No contact found, check if Company exists by name
      const companyQuery = await db.collection("companies").where("name", "==", normalizedCompanyName).limit(1).get();
      
      if (!companyQuery.empty) {
        // Link new contact to existing company
        companyId = companyQuery.docs[0].id;
      } else {
        // Create brand new company
        const newCompanyRef = db.collection("companies").doc();
        companyId = newCompanyRef.id;
        
        const newCompany: Company = {
          id: companyId,
          name: data.businessName,
          companyType: data.organizationType || "",
          address: data.address || "",
          totalEventsCompleted: 0,
          sourceHistory: ["corporate_program"],
          createdAt: now,
          updatedAt: now,
        };
        batch.set(newCompanyRef, newCompany);
      }

      // Create new contact
      const newContactRef = db.collection("contacts").doc();
      contactId = newContactRef.id;
      
      const newContact: Contact = {
        id: contactId,
        fullName: data.contactName,
        email: normalizedEmail,
        phone: data.phone,
        title: data.jobTitle || "",
        companyId: companyId,
        preferredContactMethod: data.preferredContactMethod || "Email",
        createdAt: now,
      };
      batch.set(newContactRef, newContact);
    }

    // 3. Assign Sales Rep (True Round-robin)
    let assignedRep = { id: "REP_001", name: "Alex K." }; // Default fallback
    
    try {
      const configRef = db.collection("system_configs").doc("lead_assignment");
      const repsSnap = await db.collection("users")
        .where("role", "==", "rep")
        .where("active", "==", true)
        .get();
      
      const reps = repsSnap.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().displayName || "Lead Rep" 
      }));
      
      if (reps.length > 0) {
        await db.runTransaction(async (transaction) => {
          const configDoc = await transaction.get(configRef);
          const lastIndex = configDoc.exists ? (configDoc.data()?.lastIndex ?? -1) : -1;
          
          const nextIndex = (lastIndex + 1) % reps.length;
          assignedRep = reps[nextIndex];
          
          transaction.set(configRef, { 
            lastIndex: nextIndex,
            updatedAt: now,
            lastAssignedEmail: data.email
          }, { merge: true });
        });
      }
    } catch (err) {
      console.warn("Round-robin failed, falling back to random assignment:", err);
      const fallbackReps = await db.collection("users").where("role", "==", "rep").limit(5).get();
      if (!fallbackReps.empty) {
        const reps = fallbackReps.docs.map(doc => ({ id: doc.id, name: doc.data().displayName }));
        assignedRep = reps[Math.floor(Math.random() * reps.length)];
      }
    }

    // 4. Create the new Lead record
    const leadRef = db.collection("leads").doc();
    const leadId = leadRef.id;
    
    const newLead: Lead = {
      id: leadId,
      companyId,
      companyName: data.businessName,
      contactId,
      contactName: data.contactName,
      status: "New",
      assignedRepId: assignedRep.id,
      source: "corporate_program",
      medium: "organic",
      landingPageSlug: "/corporate-program",
      isDuplicate,
      needsReview: false,
      archived: false,
      createdAt: now,
      lastActivityAt: now,
      statusChangedAt: now,
    };
    batch.set(leadRef, newLead);

    // 5. Create ProgramSignup document
    const signupRef = db.collection("programSignups").doc();
    
    const newSignup: ProgramSignup = {
      id: signupRef.id,
      ...data, // includes all form fields
      status: "Pending",
      assignedRepId: assignedRep.id,
      linkedLeadId: leadId,
      createdAt: now,
    };
    batch.set(signupRef, newSignup);

    // 6. Write Activity logs
    const activityRef1 = db.collection("activities").doc();
    batch.set(activityRef1, {
      id: activityRef1.id,
      entityType: "LEAD",
      entityId: leadId,
      actionType: "PROGRAM_SIGNUP_SUBMITTED",
      data: {
        tier: data.programTier,
        orgType: data.organizationType,
        groupSize: data.estimatedGroupSize,
        isDuplicate
      },
      actorId: "system",
      actorName: "System (Program Form)",
      createdAt: now,
    });

    const activityRef2 = db.collection("activities").doc();
    batch.set(activityRef2, {
      id: activityRef2.id,
      entityType: "LEAD",
      entityId: leadId,
      actionType: "REP_ASSIGNED",
      data: { 
        repId: assignedRep.id, 
        repName: assignedRep.name 
      },
      actorId: "system",
      actorName: "System (Auto-Assign)",
      createdAt: now,
    });

    // 7. Trigger Notifications
    const repNotifRef = db.collection("notifications").doc();
    batch.set(repNotifRef, {
      userId: assignedRep.id,
      title: "New Program Signup 🌟",
      message: `${data.contactName} (${data.businessName}) applied for the ${data.programTier.replace('_', ' ')} program.`,
      type: "SUCCESS",
      read: false,
      link: `/app/memberships?tab=applications&id=${signupRef.id}`,
      createdAt: now
    });

    // 7b. Create Automated Task (Revenue Mode)
    const taskRef = db.collection("tasks").doc();
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 24); // 24-hour Review SLA

    batch.set(taskRef, {
      id: taskRef.id,
      subject: `Review Corporate App: ${data.businessName}`,
      description: `New Corporate Program application for ${data.programTier.replace('_', ' ')} tier. Review and schedule kickoff call.`,
      dueDate: admin.firestore.Timestamp.fromDate(dueDate),
      status: 'Upcoming',
      priority: 'High',
      assignedRepId: assignedRep.id,
      entityType: 'LEAD',
      entityId: leadId,
      entityName: data.businessName,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // Notify all Owners
    const ownersSnap = await db.collection("users").where("role", "==", "owner").get();
    ownersSnap.forEach(ownerDoc => {
      const ownerNotifRef = db.collection("notifications").doc();
      batch.set(ownerNotifRef, {
        userId: ownerDoc.id,
        title: "New Program Application",
        message: `${data.businessName} just applied for the Corporate Program.`,
        type: "SUCCESS",
        read: false,
        link: `/app/memberships?tab=applications&id=${signupRef.id}`,
        createdAt: now
      });
    });

    await batch.commit();

    // 8. Send Program Confirmation Email to the Lead (Async)
    const { sendProgramConfirmation } = await import("@/lib/utils/notifications");
    sendProgramConfirmation(data.contactName, normalizedEmail, data.programTier).catch(err => {
      console.error("Failed to send program confirmation email:", err);
    });

    return NextResponse.json({ success: true, signupId: signupRef.id });

  } catch (error: any) {
    console.error("Error processing program signup:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error connecting to CRM" },
      { status: 500 }
    );
  }
}
