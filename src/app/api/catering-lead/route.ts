import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/schemas/intake";
import { db } from "@/lib/firebase/admin";
import * as admin from 'firebase-admin';
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

    const normalizedPhone = normalizePhone(data.phone);
    const normalizedCompanyName = data.company.trim();

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
    const now = admin.firestore.Timestamp.now();

    if (existingContactDoc) {
      // Existing contact -> Use their ID and their Company ID
      contactId = existingContactDoc.id;
      companyId = existingContactDoc.data().companyId as string;
      
      // Update contact's phone and name if changed (freshening data)
      batch.update(existingContactDoc.ref, { 
        fullName: data.name,
        phone: data.phone,
        updatedAt: now
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
      // No contact found, but check if the Company already exists by name
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
          name: data.company,
          totalEventsCompleted: 0,
          sourceHistory: [data.source],
          createdAt: now,
          updatedAt: now,
        };
        batch.set(newCompanyRef, newCompany);
      }

      // Create new contact (linked to either existing or new company)
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

    // 3. Assign Sales Rep (Explicit or Auto-Assign)
    let assignedRep = { 
      id: data.assignedRepId || "unassigned", 
      name: data.assignedRepName || "Unassigned Queue" 
    };
    
    let assignmentMethod = data.assignedRepId ? "Manual Entry" : "Auto-Assign";

    if (!data.assignedRepId) {
      try {
        const repsSnap = await db.collection("users")
          .where("role", "in", ["rep", "owner"])
          .where("active", "==", true)
          .get();
        
        if (!repsSnap.empty) {
          // Simple random assignment for now (can be upgraded to round-robin later)
          const randomIndex = Math.floor(Math.random() * repsSnap.size);
          const repDoc = repsSnap.docs[randomIndex];
          assignedRep = { id: repDoc.id, name: repDoc.data().displayName || "Rep" };
        }
      } catch (err) {
        console.error("Failed to auto-assign rep:", err);
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
      assignedRepName: assignedRep.name,
      source: data.source,
      medium: data.medium,
      campaign: data.campaign || "",
      content: data.content || "",
      refCode: data.refCode || "",
      landingPageSlug: data.landingPageSlug || "",
      referringUrl: data.referringUrl || "",
      isDuplicate, // Flag if they already existed
      needsReview: false,
      archived: false,
      isWaitlist: false,
      createdAt: now,
      lastActivityAt: now,
      statusChangedAt: now,
      statusHistory: [
        { status: "New", timestamp: now }
      ]
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
      assignedRepName: assignedRep.name,
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
      actorId: data.medium === "internal" ? assignedRep.id : "system",
      actorName: data.medium === "internal" ? `${assignedRep.name} (Manual)` : "System (Public Form)",
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
        repName: assignedRep.name,
        method: assignmentMethod
      },
      actorId: "system",
      actorName: `System (${assignmentMethod})`,
      createdAt: now,
    });

    // 7. Trigger Notifications
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

    // 7b. Create Automated Task (Revenue Mode)
    const taskRef = db.collection("tasks").doc();
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 2); // 2-hour SLA

    batch.set(taskRef, {
      id: taskRef.id,
      subject: `Quote Request: ${data.eventType}`,
      description: `New lead from ${data.company} (${data.name}). Promised response within 2 hours.`,
      dueDate: admin.firestore.Timestamp.fromDate(dueDate),
      status: 'Upcoming',
      priority: 'High',
      assignedRepId: assignedRep.id,
      entityType: 'LEAD',
      entityId: leadId,
      entityName: data.company,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
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

    // 8. Send Confirmation Email to the Lead (Async)
    // We don't await this to keep the API response snappy, but we trigger it now
    const { sendLeadConfirmation } = await import("@/lib/utils/notifications");
    sendLeadConfirmation(data.name, normalizedEmail).catch(err => {
      console.error("Failed to send lead confirmation email:", err);
    });

    return NextResponse.json({ success: true, leadId });

  } catch (error: unknown) {
    console.error("Error processing lead:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error connecting to CRM" },
      { status: 500 }
    );
  }
}
