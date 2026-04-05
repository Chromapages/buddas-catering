import { db } from "../config";
import { 
  collection, 
  doc, 
  getDoc,
  updateDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch,
  addDoc
} from "firebase/firestore";
import { logActivity, triggerNotification } from "./base";
import { Lead } from "@/types/crm";
import { autoCreateFollowUpTask } from "./workflow.service";
import { calculateLeadHeat } from "../../utils/heat-scoring";

/**
 * Fetches a single Lead by ID.
 */
export async function getLeadById(id: string, userId?: string, userRole?: string): Promise<Lead | null> {
  try {
    const leadRef = doc(db, "leads", id);
    const snap = await getDoc(leadRef);
    if (!snap.exists()) return null;
    
    const data = snap.data() as Lead;
    
    // Ignore soft-deleted leads
    if ((data as Lead & { archived?: boolean }).archived) return null;
    
    // Security check: Reps can only view leads assigned to them
    if (userRole === 'rep' && userId && data.assignedRepId !== userId) {
      throw new Error("Permission denied: You can only view leads assigned to you.");
    }
    
    return { ...data, id: snap.id };
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }
}

/**
 * Updates a Lead's status. Includes basic state machine validation.
 */
export async function updateLeadStatus(
  leadId: string, 
  newStatus: "New" | "Contacted" | "Quote Sent" | "Approved" | "Lost" | "Won",
  currentStatus: string,
  actorId: string,
  actorName: string
) {
  if (currentStatus === "Lost" && newStatus !== "New") {
    throw new Error("Cannot transition a Lost lead directly to an active state. Must reopen to New.");
  }

  const leadRef = doc(db, "leads", leadId);
  
  try {
    const leadSnap = await getDoc(leadRef);
    const leadData = leadSnap.data();
    const statusHistory = leadData?.statusHistory || [];

    await updateDoc(leadRef, {
      status: newStatus,
      statusChangedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
      statusHistory: [
        ...statusHistory,
        { status: newStatus, timestamp: new Date() }
      ]
    });

    await logActivity(
      "LEAD", 
      leadId, 
      "STATUS_CHANGE", 
      { previousValue: currentStatus, newValue: newStatus }, 
      actorId, 
      actorName,
      "LEAD_STATUS_UPDATED"
    );

    // 2.5 Automation: Create Follow-up task when Contacted
    if (newStatus === "Contacted" && currentStatus === "New" && leadSnap.exists()) {
      await autoCreateFollowUpTask({ id: leadSnap.id, ...leadSnap.data() } as Lead, actorId);
    }
    
    // 3. Automation: Create Catering Request when Approved
    if (newStatus === "Approved" && leadData) {
      const requestsRef = collection(db, "cateringRequests");
      
      const q = query(requestsRef, where("leadId", "==", leadId));
      const existingRequests = await getDocs(q);
      
      if (existingRequests.empty) {
        const newRequest = {
          leadId: leadId,
          companyId: leadData.companyId || "",
          companyName: leadData.companyName || "",
          contactId: leadData.contactId || "",
          contactName: leadData.contactName || "",
          assignedRepId: leadData.assignedRepId || actorId,
          eventType: leadData.cateringNeed || "General Inquiry",
          estimatedGroupSize: leadData.estimatedGroupSize || 0,
          fulfillmentStatus: "Pending",
          notes: leadData.notes || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(requestsRef, newRequest);
        
        await updateDoc(leadRef, { 
          cateringRequestId: docRef.id,
          convertedAt: serverTimestamp()
        });

        await logActivity(
          "LEAD", 
          leadId, 
          "CONVERSION", 
          { requestId: docRef.id }, 
          actorId, 
          actorName,
          "LEAD_TO_REQUEST"
        );
      }
    }

    if (newStatus === "Lost") {
      triggerNotification("Email", `Lead ${leadId} was marked as Lost.`);
    }

    return true;
  } catch (error) {
    console.error("Error updating lead status:", error);
    throw error;
  }
}

/**
 * Assigns a sales rep to a Lead.
 * Logs ownership change for audit trail.
 */
export async function assignRep(
  leadId: string,
  repId: string,
  repName: string,
  assignedByUserId: string,
  assignedByUserName: string
) {
  const leadRef = doc(db, "leads", leadId);

  try {
    const snap = await getDoc(leadRef);
    const oldRepId = snap.data()?.assignedRepId;

    await updateDoc(leadRef, {
      assignedRepId: repId,
      lastActivityAt: serverTimestamp()
    });

    await logActivity(
      "LEAD", 
      leadId, 
      "OWNERSHIP_CHANGE", 
      { previousValue: oldRepId, newValue: repId, repName }, 
      assignedByUserId, 
      assignedByUserName,
      "REP_REASSIGNED"
    );

    triggerNotification("Email", `You have been assigned to Lead ${leadId}.`);
    return true;
  } catch (error) {
    console.error("Error assigning rep:", error);
    throw error;
  }
}

/**
 * Detects if a lead might be a duplicate based on email.
 * This is meant to be called during Lead Creation intake.
 */
export async function detectDuplicateLead(email: string): Promise<boolean> {
  try {
    const contactsRef = collection(db, "contacts");
    const q = query(contactsRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking duplicate lead:", error);
    return false;
  }
}

/**
 * Soft-deletes (archives) a lead.
 */
export async function archiveLead(leadId: string, actorId: string, actorName: string) {
  try {
    const leadRef = doc(db, "leads", leadId);
    await updateDoc(leadRef, {
      archived: true,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logActivity(
      "LEAD",
      leadId,
      "STATUS_CHANGE",
      { newValue: "Archived" },
      actorId,
      actorName,
      "LEAD_ARCHIVED"
    );
  } catch (error) {
    console.error("Error archiving lead:", error);
    throw error;
  }
}

/**
 * Fetches leads that "Need Attention" (New or Contacted status).
 */
export async function getNeedsAttentionLeads(userId?: string, userRole?: string) {
  try {
    let q = query(
      collection(db, "leads"), 
      where("status", "in", ["New", "Contacted"]), 
      where("archived", "==", false),
      orderBy("createdAt", "desc"), 
      limit(5)
    );
    
    if (userRole === 'rep' && userId) {
      q = query(
        collection(db, "leads"),
        where("assignedRepId", "==", userId),
        where("status", "in", ["New", "Contacted"]),
        where("archived", "==", false),
        orderBy("createdAt", "desc"),
        limit(5)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const leads = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
      const data = docSnap.data() as Lead;
      
      // Fetch recent activities for heat scoring
      const activitiesRef = query(
        collection(db, "activities"),
        where("entityType", "==", "LEAD"),
        where("entityId", "==", docSnap.id),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const activitiesSnap = await getDocs(activitiesRef);
      const activities = activitiesSnap.docs.map(a => a.data());
      
      const heatScore = calculateLeadHeat(data, activities);
      
      return {
        ...data,
        id: docSnap.id,
        heatScore
      };
    }));

    return leads.sort((a, b) => (b.heatScore || 0) - (a.heatScore || 0));
  } catch (error) {
    console.error("Error fetching needs attention leads:", error);
    throw error;
  }
}

/**
 * Fetches all leads (for the Leads Table).
 */
export async function getAllLeads(userId?: string, userRole?: string): Promise<Lead[]> {
  try {
    let q = query(
      collection(db, "leads"), 
      where("archived", "==", false),
      orderBy("createdAt", "desc")
    );

    if (userRole === 'rep' && userId) {
      q = query(
        collection(db, "leads"),
        where("archived", "==", false),
        where("assignedRepId", "==", userId),
        orderBy("createdAt", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Lead[];
  } catch (error) {
    console.error("Error fetching all leads:", error);
    throw error;
  }
}

/**
 * Updates multiple leads in a single transaction/batch.
 * Reps may only update leads assigned to them.
 */
export async function batchUpdateLeads(
  leadIds: string[],
  updates: Partial<Lead>,
  actorId: string,
  actorName: string,
  callerRole?: string
) {
  try {
    const batch = writeBatch(db);

    for (const id of leadIds) {
      const leadRef = doc(db, "leads", id);

      if (callerRole === "rep") {
        const snap = await getDoc(leadRef);
        if (snap.exists() && snap.data()?.assignedRepId !== actorId) {
          throw new Error(`Permission denied: lead ${id} is not assigned to you`);
        }
      }

      batch.update(leadRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp()
      });

      // Log activity
      const activityRef = doc(collection(db, "activities"));
      batch.set(activityRef, {
        entityType: "LEAD",
        entityId: id,
        actionType: "NOTE_ADDED",
        subType: "BATCH_UPDATE",
        data: updates,
        actorId,
        actorName,
        createdAt: serverTimestamp()
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error in batch update:", error);
    throw error;
  }
}

/**
 * Updates arbitrary fields on a Lead document.
 */
export async function updateLead(leadId: string, updates: Record<string, unknown>) {
  try {
    const leadRef = doc(db, "leads", leadId);
    await updateDoc(leadRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

/**
 * Converts a Lead into a Company (Account) record.
 * Creates a company doc and links it back to the lead.
 */
/**
 * Converts a Lead into a Company (Account) record.
 * Creates a company doc and links it back to the lead.
 */
export async function convertLeadToCompany(
  lead: Lead,
  actorId: string,
  actorName: string
) {
  try {
    const companiesRef = collection(db, "companies");
    const companyDoc = await addDoc(companiesRef, {
      name: lead.companyName || lead.contactName || "Unknown",
      email: lead.email || "",
      phone: lead.phone || "",
      contactName: lead.contactName || "",
      assignedRepId: lead.assignedRepId || actorId,
      sourceLeadId: lead.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const leadRef = doc(db, "leads", lead.id);
    await updateDoc(leadRef, {
      companyId: companyDoc.id,
      convertedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logActivity(
      "LEAD",
      lead.id,
      "CONVERTED_TO_ACCOUNT",
      { companyId: companyDoc.id },
      actorId,
      actorName,
      "LEAD_TO_COMPANY"
    );

    return companyDoc.id;
  } catch (error) {
    console.error("Error converting lead to company:", error);
    throw error;
  }
}

/**
 * Converts a Lead into a Catering Order (Request) record.
 * Creates a cateringRequests doc and links it back to the lead.
 */
export async function convertLeadToOrder(
  lead: Lead,
  actorId: string,
  actorName: string
) {
  try {
    const requestsRef = collection(db, "cateringRequests");
    const requestDoc = await addDoc(requestsRef, {
      leadId: lead.id,
      companyId: lead.companyId || "",
      companyName: lead.companyName || "",
      contactId: lead.contactId || "",
      contactName: lead.contactName || "",
      assignedRepId: lead.assignedRepId || actorId,
      eventType: lead.cateringNeed || "General Inquiry",
      estimatedGroupSize: lead.estimatedGroupSize || 0,
      fulfillmentStatus: "Pending",
      notes: lead.notes || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const leadRef = doc(db, "leads", lead.id);
    await updateDoc(leadRef, {
      cateringRequestId: requestDoc.id,
      convertedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logActivity(
      "LEAD",
      lead.id,
      "LEAD_CONVERTED",
      { requestId: requestDoc.id },
      actorId,
      actorName,
      "LEAD_TO_ORDER"
    );

    return requestDoc.id;
  } catch (error) {
    console.error("Error converting lead to order:", error);
    throw error;
  }
}

/**
 * Bulk archives (soft-deletes) multiple leads.
 */
export async function deleteLeads(leadIds: string[]) {
  try {
    const batch = writeBatch(db);
    for (const id of leadIds) {
      const leadRef = doc(db, "leads", id);
      batch.update(leadRef, {
        archived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error batch deleting leads:", error);
    throw error;
  }
}

/**
 * Fetches leads that have no assigned sales representative.
 */
export async function getUnassignedLeads() {
  try {
    const q = query(
      collection(db, "leads"),
      where("assignedRepId", "==", ""),
      where("archived", "==", false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
  } catch (error) {
    console.error("Error fetching unassigned leads:", error);
    return [];
  }
}

/**
 * Fetches leads that haven't been touched in the specified number of days.
 */
export async function getOverdueLeads(daysThreshold: number = 3) {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
    
    const q = query(
      collection(db, "leads"),
      where("status", "in", ["New", "Contacted"]),
      where("updatedAt", "<", Timestamp.fromDate(thresholdDate)),
      where("archived", "==", false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
  } catch (error) {
    console.error("Error fetching overdue leads:", error);
    return [];
  }
}

/**
 * Calculates the total projected revenue from leads in 'Quote Sent' status.
 */
export async function getPipelineRevenue() {
  try {
    const q = query(
      collection(db, "leads"),
      where("status", "==", "Quote Sent"),
      where("archived", "==", false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce((sum, doc) => {
      const data = doc.data() as Lead;
      return sum + (data.quoteAmount || 0);
    }, 0);
  } catch (error) {
    console.error("Error calculating pipeline revenue:", error);
    return 0;
  }
}

/**
 * Fetches leads that have a scheduled kickoff call.
 */
export async function getBookedCallLeads(userId?: string, userRole?: string) {
  try {
    let q = query(
      collection(db, "leads"),
      where("bookedCallDate", "!=", null),
      where("status", "in", ["New", "Contacted"]),
      where("archived", "==", false),
      orderBy("bookedCallDate", "asc"),
      limit(5)
    );

    if (userRole === "rep" && userId) {
      q = query(
        collection(db, "leads"),
        where("assignedRepId", "==", userId),
        where("bookedCallDate", "!=", null),
        where("status", "in", ["New", "Contacted"]),
        where("archived", "==", false),
        orderBy("bookedCallDate", "asc"),
        limit(5)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Lead[];
  } catch (error) {
    console.error("Error fetching booked call leads:", error);
    return [];
  }
}
