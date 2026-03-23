import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/schemas/intake";
import { db } from "@/lib/firebase/admin";
import type { Company, Contact, Lead, CateringRequest } from "@/lib/types";

// Standardize phone numbers to just digits
function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validate payload
    const parsed = intakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 422 }
      );
    }
    
    const data = parsed.data;
    const normalizedEmail = data.email.toLowerCase().trim();
    // Phone usually normalized, omitting for linting

    // 2. Dedup: Check for existing contact by exact email match
    const contactsQuery = await db.collection("contacts").where("email", "==", normalizedEmail).limit(1).get();
    
    let contactId = "";
    let companyId = "";
    const isDuplicate = !contactsQuery.empty;

    const batch = db.batch();
    const now = new Date().toISOString();

    if (!contactsQuery.empty) {
      // Existing contact -> Use their ID and their Company ID
      const existingContact = contactsQuery.docs[0];
      contactId = existingContact.id;
      companyId = existingContact.data().companyId as string;
      
      // Update contact's phone and name if changed (optional, but good for freshness)
      batch.update(existingContact.ref, { 
        fullName: data.name,
        phone: data.phone 
      });
      
      // Update company's source history
      const companyRef = db.collection("companies").doc(companyId);
      const companyDoc = await companyRef.get();
      if (companyDoc.exists) {
        const sourceHistory = companyDoc.data()?.sourceHistory || [];
        if (!sourceHistory.includes(data.source)) {
          batch.update(companyRef, {
            sourceHistory: [...sourceHistory, data.source],
            updatedAt: now
          });
        }
      }

    } else {
      // New Contact -> Create Company and Contact
      const newCompanyRef = db.collection("companies").doc();
      companyId = newCompanyRef.id;
      
      const newCompany: Company = {
        id: companyId,
        name: data.company,
        totalEventsCompleted: 0,
        sourceHistory: [data.source],
        createdAt: now,
        updatedAt: now,
      };
      batch.set(newCompanyRef, newCompany);

      const newContactRef = db.collection("contacts").doc();
      contactId = newContactRef.id;
      
      const newContact: Contact = {
        id: contactId,
        fullName: data.name,
        email: normalizedEmail,
        phone: data.phone,
        companyId: companyId,
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
      companyName: data.company,
      contactId,
      contactName: data.name,
      status: "New",
      assignedRepId: assignedRep.id,
      source: data.source,
      medium: data.medium,
      campaign: data.campaign || "",
      content: data.content || "",
      refCode: data.refCode || "",
      landingPageSlug: data.landingPageSlug || "",
      referringUrl: data.referringUrl || "",
      isDuplicate, // Flag if they already existed
      needsReview: false,
      createdAt: now,
      lastActivityAt: now,
      statusChangedAt: now,
    };
    batch.set(leadRef, newLead);

    // 5. Create the Catering Request
    const requestRef = db.collection("cateringRequests").doc();
    
    const newRequest: CateringRequest = {
      id: requestRef.id,
      leadId,
      companyId,
      companyName: data.company,
      contactId,
      contactName: data.name,
      assignedRepId: assignedRep.id,
      eventType: data.eventType,
      cateringNeed: data.cateringNeed,
      estimatedGroupSize: data.estimatedGroupSize,
      preferredDate: data.preferredDate || "",
      notes: data.notes || "",
      fulfillmentStatus: "Pending",
      createdAt: now,
    };
    batch.set(requestRef, newRequest);

    // 6. Write the Activity logs
    const activityRef1 = db.collection("activities").doc();
    batch.set(activityRef1, {
      id: activityRef1.id,
      entityType: "LEAD",
      entityId: leadId,
      actionType: "FORM_SUBMITTED",
      data: {
        eventType: data.eventType,
        cateringNeed: data.cateringNeed,
        groupSize: data.estimatedGroupSize,
        isDuplicate
      },
      actorId: "system",
      actorName: "System (Public Form)",
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
    // Notify the assigned Sales Rep
    const repNotifRef = db.collection("notifications").doc();
    batch.set(repNotifRef, {
      userId: assignedRep.id,
      title: "New Lead Assigned 🚀",
      message: `You have been assigned ${data.name} from ${data.company}.`,
      type: "INFO",
      read: false,
      link: `/app/leads/${leadId}`,
      createdAt: now
    });

    // Notify all Owners
    const ownersSnap = await db.collection("users").where("role", "==", "owner").get();
    ownersSnap.forEach(ownerDoc => {
      const ownerNotifRef = db.collection("notifications").doc();
      batch.set(ownerNotifRef, {
        userId: ownerDoc.id,
        title: "New Inbound Lead",
        message: `${data.name} (${data.company}) just submitted a request.`,
        type: "INFO",
        read: false,
        link: `/app/leads/${leadId}`,
        createdAt: now
      });
    });

    // Execute the atomic batch write
    await batch.commit();

    return NextResponse.json({ success: true, leadId });

  } catch (error: unknown) {
    console.error("Error processing lead:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error connecting to CRM" },
      { status: 500 }
    );
  }
}
