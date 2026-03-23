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
  limit
} from "firebase/firestore";
import { logActivity } from "./base";
import { createNotification } from "./notification.service";

/**
 * Owner-only flow to approve commission payouts.
 */
export async function approveCommission(
  commissionId: string,
  ownerId: string,
  ownerName: string
) {
  try {
    const commissionRef = doc(db, "commission_approvals", commissionId);
    
    await updateDoc(commissionRef, {
      approved: true,
      approvedById: ownerId,
      approvedAt: serverTimestamp()
    });

    await logActivity("REQUEST", commissionId, "COMMISSION_APPROVED", {}, ownerId, ownerName);
    
    const commissionSnap = await getDoc(commissionRef);
    const data = commissionSnap.data();
    if (data?.repId) {
      await createNotification(
        data.repId,
        "Commission Approved! 🎉",
        `Your commission for request ${data.cateringRequestId?.slice(-6)} has been approved.`,
        "SUCCESS",
        `/app/requests/${data.cateringRequestId}`
      );
    }
    
    return true;
  } catch (error) {
    console.error("Error approving commission:", error);
    throw error;
  }
}

/**
 * Rejects a commission approval.
 */
export async function rejectCommission(
  commissionId: string,
  ownerId: string,
  ownerName: string
) {
  try {
    const commissionRef = doc(db, "commission_approvals", commissionId);
    await updateDoc(commissionRef, {
      eligible: false,
      approvedById: ownerId,
      approvedAt: serverTimestamp()
    });
    await logActivity("REQUEST", commissionId, "COMMISSION_REJECTED", {}, ownerId, ownerName);
    
    const commissionSnap = await getDoc(commissionRef);
    const data = commissionSnap.data();
    if (data?.repId) {
      await createNotification(
        data.repId,
        "Commission Declined",
        `Your commission for request ${data.cateringRequestId?.slice(-6)} was not approved.`,
        "WARNING",
        `/app/requests/${data.cateringRequestId}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error rejecting commission:", error);
    throw error;
  }
}

/**
 * Fetches all commission approvals (Owner only).
 */
export async function getAllCommissionApprovals() {
  try {
    const approvalsRef = collection(db, "commission_approvals");
    const q = query(approvalsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching commission approvals:", error);
    return [];
  }
}

/**
 * Fetches pending commission approvals (Owner/Ops sees all, Rep sees own).
 */
export async function getPendingApprovals(userId?: string, userRole?: string) {
  try {
    let approvalsRef = query(collection(db, "commission_approvals"), where("approved", "==", false));
    
    if (userRole === 'rep' && userId) {
      approvalsRef = query(approvalsRef, where("repId", "==", userId));
    }

    const q = query(approvalsRef, limit(5));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return [];
  }
}
