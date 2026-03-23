import { db } from "../config";
import { 
  collection, 
  doc, 
  getDoc,
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { logActivity, triggerNotification } from "./base";
import { createNotification } from "./notification.service";

/**
 * Completes a Catering Request and updates Membership usage.
 */
export async function completeCateringRequest(
  requestId: string,
  companyId: string,
  actorId: string,
  actorName: string
) {
  try {
    const requestRef = doc(db, "cateringRequests", requestId);
    
    await updateDoc(requestRef, {
      fulfillmentStatus: "Completed",
      updatedAt: serverTimestamp()
    });

    await logActivity("REQUEST", requestId, "REQUEST_COMPLETED", {}, actorId, actorName);

    const membershipsRef = collection(db, "memberships");
    const q = query(membershipsRef, where("companyId", "==", companyId), where("active", "==", true));
    const membershipSnap = await getDocs(q);

    if (!membershipSnap.empty) {
      const membershipDoc = membershipSnap.docs[0];
      const data = membershipDoc.data();
      const newCompleted = (data.eventsCompleted || 0) + 1;
      const committed = data.eventsCommitted || 0;

      await updateDoc(membershipDoc.ref, {
        eventsCompleted: newCompleted,
        updatedAt: serverTimestamp()
      });

      await logActivity("COMPANY", companyId, "MEMBERSHIP_EVENT_USED", {
        used: newCompleted,
        total: committed
      }, actorId, actorName);

      if (newCompleted === committed) {
        triggerNotification("Email", `Company ${companyId} has fully utilized their membership events (${committed}/${committed}).`);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error completing catering request:", error);
    throw error;
  }
}

/**
 * Fetches all catering requests (Role-aware).
 */
export async function getAllCateringRequests(userId?: string, userRole?: string) {
  try {
    const requestsRef = collection(db, "cateringRequests");
    let q = query(requestsRef, orderBy("createdAt", "desc"));
    
    if (userRole === 'rep' && userId) {
      q = query(q, where("assignedRepId", "==", userId));
    }

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all catering requests:", error);
    return [];
  }
}

/**
 * Fetches a single catering request by ID.
 */
export async function getCateringRequestById(id: string) {
  try {
    const docRef = doc(db, "cateringRequests", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching catering request:", error);
    return null;
  }
}

/**
 * Initiates a commission approval for a request.
 */
export async function submitForApproval(
  requestId: string,
  repId: string,
  repName: string,
  amount: number,
  actorId: string,
  actorName: string
) {
  try {
    const approvalsRef = collection(db, "commission_approvals");
    await addDoc(approvalsRef, {
      cateringRequestId: requestId,
      repId,
      repName,
      amount,
      eligible: true,
      approved: false,
      createdAt: serverTimestamp(),
      description: `Commission for Request ${requestId.slice(-6)}`
    });

    await logActivity("REQUEST", requestId, "SUBMITTED_FOR_APPROVAL", { amount }, actorId, actorName);
    
    // Notify Owners
    const usersRef = collection(db, "users");
    const adminSnapshot = await getDocs(query(usersRef, where("role", "==", "owner")));
    
    adminSnapshot.forEach(adminDoc => {
      createNotification(
        adminDoc.id,
        "New Approval Needed",
        `${repName} submitted a commission quote for approval.`,
        "INFO",
        "/app/approvals"
      );
    });

    return true;
  } catch (error) {
    console.error("Error submitting for approval:", error);
    throw error;
  }
}

/**
 * Fetches all catering requests for a specific contact.
 */
export async function getRequestsByContactId(contactId: string) {
  try {
    const requestsRef = collection(db, "cateringRequests");
    const q = query(
      requestsRef, 
      where("contactId", "==", contactId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching requests by contact:", error);
    return [];
  }
}
