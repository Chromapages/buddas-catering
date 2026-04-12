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
  orderBy,
  increment,
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { CateringRequest } from "@/types/crm";
import { logActivity } from "./base";
import { createNotification } from "./notification.service";
import { autoCreateProposalTask } from "./workflow.service";

export async function completeCateringRequest(
  requestId: string,
  companyId: string,
  actorId: string,
  actorName: string
) {
  try {
    const requestRef = doc(db, "cateringRequests", requestId);
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.data();

    if (!requestSnap.exists() || !requestData) {
      throw new Error("Request not found");
    }

    // 1. Update status to Fulfilled
    await updateDoc(requestRef, {
      fulfillmentStatus: "Fulfilled",
      updatedAt: serverTimestamp()
    });

    await logActivity("REQUEST", requestId, "REQUEST_COMPLETED", { status: "Fulfilled" }, actorId, actorName);

    // Logic for Commissions and Membership Usage has been moved to processInvoice
    // to ensure they only trigger once revenue is finalized/invoiced.
    
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
}

export async function batchUpdateCateringRequests(
  requestIds: string[],
  updates: Partial<CateringRequest>,
  actorId: string,
  actorName: string,
  callerRole?: string
) {
  try {
    const batch = writeBatch(db);

    for (const id of requestIds) {
      const requestRef = doc(db, "cateringRequests", id);

      if (callerRole === "rep") {
        const snap = await getDoc(requestRef);
        if (snap.exists() && snap.data()?.assignedRepId !== actorId) {
          throw new Error(`Permission denied: request ${id} is not assigned to you`);
        }
      }

      batch.update(requestRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      const activityRef = doc(collection(db, "activities"));
      batch.set(activityRef, {
        entityType: "REQUEST",
        entityId: id,
        actionType: "STATUS_CHANGE",
        subType: "BATCH_UPDATE",
        data: updates,
        actorId,
        actorName,
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error batch updating catering requests:", error);
    throw error;
  }
}

export async function batchDeleteCateringRequests(
  requestIds: string[],
  callerId?: string,
  callerRole?: string
) {
  try {
    const batch = writeBatch(db);

    for (const id of requestIds) {
      const requestRef = doc(db, "cateringRequests", id);

      if (callerRole === "rep" && callerId) {
        const snap = await getDoc(requestRef);
        if (snap.exists() && snap.data()?.assignedRepId !== callerId) {
          throw new Error(`Permission denied: request ${id} is not assigned to you`);
        }
      }

      batch.delete(requestRef);
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error batch deleting catering requests:", error);
    throw error;
  }
}

/**
 * Fetches a catering request by ID for public tracking (no role check).
 * Used for the "Magic Link" customer portal.
 */
export async function getPublicRequestById(id: string) {
  try {
    const docRef = doc(db, "cateringRequests", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    // Only return non-sensitive fields for the public view
    return {
      id: docSnap.id,
      companyName: data.companyName,
      contactName: data.contactName,
      cateringNeed: data.cateringNeed,
      fulfillmentStatus: data.fulfillmentStatus,
      preferredDate: data.preferredDate,
      eventType: data.eventType,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error fetching public request:", error);
    return null;
  }
}

/**
 * Fetches a single catering request by ID.
 */
export async function getCateringRequestById(id: string, userId?: string, userRole?: string) {
  try {
    const docRef = doc(db, "cateringRequests", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data() as CateringRequest;

    // Security check: Reps can only view requests assigned to them
    if (userRole === 'rep' && userId && data.assignedRepId !== userId) {
      throw new Error("Permission denied: You can only view requests assigned to you.");
    }

    return { ...data, id: docSnap.id };
  } catch (error) {
    console.error("Error fetching catering request:", error);
    throw error;
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
export async function getRequestsByContactId(
  contactId: string,
  userId?: string,
  userRole?: string
) {
  try {
    const requestsRef = collection(db, "cateringRequests");
    let q = query(
      requestsRef, 
      where("contactId", "==", contactId),
      orderBy("createdAt", "desc")
    );

    if (userRole === "rep" && userId) {
      q = query(q, where("assignedRepId", "==", userId));
    }

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

/**
 * Fetches all catering requests for a specific lead.
 */
export async function getRequestsByLeadId(
  leadId: string,
  userId?: string,
  userRole?: string
) {
  try {
    const requestsRef = collection(db, "cateringRequests");
    let q = query(
      requestsRef, 
      where("leadId", "==", leadId),
      orderBy("createdAt", "desc")
    );

    if (userRole === "rep" && userId) {
      q = query(q, where("assignedRepId", "==", userId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching requests by lead:", error);
    return [];
  }
}

/**
 * Updates a catering request with new data.
 */
export async function updateCateringRequest(id: string, data: Partial<CateringRequest>) {
  try {
    const docRef = doc(db, "cateringRequests", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    // If quote amount changed, sync associated commission
    if (data.quoteAmount !== undefined) {
      const commissionRef = collection(db, "commission_approvals");
      const q = query(commissionRef, where("cateringRequestId", "==", id));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const commDoc = snap.docs[0];
        const commData = commDoc.data();
        
        // Only sync if not yet approved to prevent audit issues
        if (!commData.approved) {
          const newAmount = Math.round(data.quoteAmount * (commData.rate || 0.10) * 100) / 100;
          await updateDoc(commDoc.ref, {
            amount: newAmount,
            baseAmount: data.quoteAmount,
            updatedAt: serverTimestamp()
          });
          console.log(`Synced commission for request ${id} to $${newAmount}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating catering request:", error);
    throw error;
  }
}
/**
 * Creates a new catering request.
 */
export async function createCateringRequest(data: Partial<CateringRequest>, actorId: string, actorName: string) {
  try {
    const requestsRef = collection(db, "cateringRequests");
    const docRef = await addDoc(requestsRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    await logActivity("REQUEST", docRef.id, "REQUEST_CREATED", { type: data.cateringNeed }, actorId, actorName);
    
    // 2. Automation: Create Proposal Task
    await autoCreateProposalTask({ id: docRef.id, ...data } as CateringRequest, actorId);

    return docRef.id;
  } catch (error) {
    console.error("Error creating catering request:", error);
    throw error;
  }
}

/**
 * Marks a catering request as invoiced.
 */
export async function processInvoice(
  requestId: string,
  actorId: string,
  actorName: string
) {
  try {
    const requestRef = doc(db, "cateringRequests", requestId);
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.data();

    if (!requestSnap.exists() || !requestData) {
      throw new Error("Request not found");
    }

    // 1. Update status to Invoiced
    await updateDoc(requestRef, {
      fulfillmentStatus: "Invoiced",
      updatedAt: serverTimestamp()
    });

    await logActivity("REQUEST", requestId, "REQUEST_INVOICED", { status: "Invoiced" }, actorId, actorName);

    return true;
  } catch (error) {
    console.error("Error processing invoice:", error);
    throw error;
  }
}

/**
 * Marks a catering request as Paid and triggers financial credits.
 */
export async function processPayment(
  requestId: string,
  actorId: string,
  actorName: string
) {
  try {
    const requestRef = doc(db, "cateringRequests", requestId);
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.data();

    if (!requestSnap.exists() || !requestData) {
      throw new Error("Request not found");
    }

    // 1. Update status to Paid
    await updateDoc(requestRef, {
      fulfillmentStatus: "Paid",
      updatedAt: serverTimestamp()
    });

    await logActivity("REQUEST", requestId, "REQUEST_PAID", { status: "Paid" }, actorId, actorName);

    const quoteAmount = requestData.quoteAmount || 0;
    const isQualifying = quoteAmount >= 200;

    // 2. Automate Commission Record (Triggered ONLY on Paid)
    if (isQualifying && requestData.assignedRepId) {
      const commissionRef = collection(db, "commission_approvals");
      const commissionQuery = query(commissionRef, where("cateringRequestId", "==", requestId));
      const commissionSnap = await getDocs(commissionQuery);

      if (commissionSnap.empty) {
        let commissionRate = 0.10;
        try {
          const rateSnap = await getDoc(doc(db, "system_configs", "commission"));
          if (rateSnap.exists()) {
            commissionRate = rateSnap.data().rate ?? 0.10;
          }
        } catch {}

        const commissionAmount = Math.round(quoteAmount * commissionRate * 100) / 100;

        await addDoc(commissionRef, {
          cateringRequestId: requestId,
          repId: requestData.assignedRepId,
          eligible: true,
          approved: false,
          amount: commissionAmount,
          rate: commissionRate,
          baseAmount: quoteAmount,
          createdAt: serverTimestamp(),
          description: `Auto-generated commission for Paid Request ${requestId.slice(-6)}`
        });
      }
    }

    // 3. Membership Usage Logic (Atomic Increment)
    if (isQualifying && requestData.companyId) {
      const membershipsRef = collection(db, "memberships");
      const q = query(
        membershipsRef, 
        where("companyId", "==", requestData.companyId), 
        where("active", "==", true)
      );
      const membershipSnap = await getDocs(q);

      if (!membershipSnap.empty) {
        const membershipDoc = membershipSnap.docs[0];
        const data = membershipDoc.data();
        
        const renewalDate = data.renewalDate?.toDate();
        const now = new Date();
        
        if (renewalDate && now > renewalDate) {
           await logActivity("COMPANY", requestData.companyId, "MEMBERSHIP_EXPIRED_ORDER", {
             requestId,
             renewalDate: renewalDate.toISOString()
           }, "system", "System");
        } else {
          // Use ATOMIC increment
          await updateDoc(membershipDoc.ref, {
            eventsCompleted: increment(1),
            firstOrderPlaced: true,
            updatedAt: serverTimestamp()
          });

          // Also update company firstOrderPlaced flag
          const companyRef = doc(db, "companies", requestData.companyId);
          await updateDoc(companyRef, {
            firstOrderPlaced: true,
            updatedAt: serverTimestamp()
          });

          await logActivity("COMPANY", requestData.companyId, "MEMBERSHIP_EVENT_USED_ATOMIC", {
            requestId,
            isFirstOrder: !data.firstOrderPlaced
          }, actorId, actorName);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
}

/**
 * Cancels a catering request and rolls back financial credits if necessary.
 */
export async function cancelCateringRequest(
  requestId: string,
  actorId: string,
  actorName: string
) {
  try {
    const requestRef = doc(db, "cateringRequests", requestId);
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.data();

    if (!requestSnap.exists() || !requestData) {
      throw new Error("Request not found");
    }

    const previousStatus = requestData.fulfillmentStatus;

    // 1. Update status to Cancelled
    await updateDoc(requestRef, {
      fulfillmentStatus: "Cancelled",
      updatedAt: serverTimestamp()
    });

    await logActivity("REQUEST", requestId, "REQUEST_CANCELLED", { previousStatus }, actorId, actorName);

    // 2. Rollback logic if it was already Paid
    if (previousStatus === "Paid") {
      // Decrement membership events
      if (requestData.companyId) {
        const membershipsRef = collection(db, "memberships");
        const q = query(
          membershipsRef, 
          where("companyId", "==", requestData.companyId), 
          where("active", "==", true)
        );
        const membershipSnap = await getDocs(q);

        if (!membershipSnap.empty) {
          const membershipDoc = membershipSnap.docs[0];
          await updateDoc(membershipDoc.ref, {
            eventsCompleted: increment(-1),
            updatedAt: serverTimestamp()
          });

          await logActivity("COMPANY", requestData.companyId, "MEMBERSHIP_EVENT_ROLLBACK", {
            requestId,
            reason: "Order Cancelled"
          }, actorId, actorName);
        }
      }

      // Delete/Flag commission as ineligible
      const commissionRef = collection(db, "commission_approvals");
      const commissionQuery = query(commissionRef, where("cateringRequestId", "==", requestId));
      const commissionSnap = await getDocs(commissionQuery);

      for (const commDoc of commissionSnap.docs) {
        await updateDoc(commDoc.ref, {
          eligible: false,
          notes: "Ineligible: Associated order was cancelled.",
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error processing invoice:", error);
    throw error;
  }
}

/**
 * Deletes a catering request.
 * Reps may only delete requests assigned to them. Owners/ops may delete any.
 */
export async function deleteCateringRequest(
  id: string,
  callerId?: string,
  callerRole?: string
) {
  try {
    const docRef = doc(db, "cateringRequests", id);

    if (callerRole === "rep" && callerId) {
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.assignedRepId !== callerId) {
        throw new Error("Permission denied: this request is not assigned to you");
      }
    }

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting catering request:", error);
    throw error;
  }
}
