import { db } from "../config";
import { 
  collection, 
  doc, 
  getDoc,
  updateDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  writeBatch
} from "firebase/firestore";
import { logActivity, triggerNotification } from "./base";
import { Lead } from "@/types/crm";

/**
 * Updates a Lead's status. Includes basic state machine validation.
 */
export async function updateLeadStatus(
  leadId: string, 
  newStatus: "New" | "Contacted" | "Quote Sent" | "Approved" | "Lost",
  currentStatus: string,
  actorId: string,
  actorName: string
) {
  if (currentStatus === "Lost" && newStatus !== "New") {
    throw new Error("Cannot transition a Lost lead directly to an active state. Must reopen to New.");
  }

  const leadRef = doc(db, "leads", leadId);
  
  try {
    await updateDoc(leadRef, {
      status: newStatus,
      statusChangedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp()
    });

    await logActivity("LEAD", leadId, "STATUS_CHANGE", { from: currentStatus, to: newStatus }, actorId, actorName);
    
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
    await updateDoc(leadRef, {
      assignedRepId: repId,
      lastActivityAt: serverTimestamp()
    });

    await logActivity(
      "LEAD", 
      leadId, 
      "REP_ASSIGNED", 
      { repId, repName }, 
      assignedByUserId, 
      assignedByUserName
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
 * Fetches leads that "Need Attention" (New or Contacted status).
 */
export async function getNeedsAttentionLeads(userId?: string, userRole?: string) {
  try {
    let q = query(
      collection(db, "leads"), 
      where("status", "in", ["New", "Contacted"]), 
      orderBy("createdAt", "desc"), 
      limit(5)
    );
    
    if (userRole === 'rep' && userId) {
      q = query(q, where("assignedRepId", "==", userId));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching needs attention leads:", error);
    return [];
  }
}

/**
 * Fetches all leads (for the Leads Table).
 */
export async function getAllLeads(userId?: string, userRole?: string): Promise<Lead[]> {
  try {
    let q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    if (userRole === 'rep' && userId) {
      q = query(q, where("assignedRepId", "==", userId));
    }
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Lead[];
  } catch (error) {
    console.error("Error fetching all leads:", error);
    return [];
  }
}

/**
 * Updates multiple leads in a single transaction/batch.
 */
export async function batchUpdateLeads(
  leadIds: string[],
  updates: Partial<Lead>,
  actorId: string,
  actorName: string
) {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const id of leadIds) {
      const leadRef = doc(db, "leads", id);
      batch.update(leadRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp()
      });

      // Log activity for each lead
      const activityRef = doc(collection(db, "activities"));
      batch.set(activityRef, {
        id: activityRef.id,
        entityType: "LEAD",
        entityId: id,
        actionType: "BATCH_UPDATE",
        data: updates,
        actorId,
        actorName,
        createdAt: now
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error batch updating leads:", error);
    throw error;
  }
}
