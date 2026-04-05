import { db } from "../config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { CateringRequest, FulfillmentStatus } from "@/types/crm";
import { logActivity } from "./base";
import { createNotification } from "./notification.service";

export interface PublicCateringRequest {
  id: string;
  companyName: string;
  cateringNeed: string;
  estimatedGroupSize: number;
  fulfillmentStatus: FulfillmentStatus;
  preferredDate?: string;
  eventType?: string;
  updatedAt?: CateringRequest["updatedAt"];
}

/**
 * Fetches a catering request for public tracking.
 * This function is security-conscious and only returns a safe subset of data.
 */
export async function getPublicRequestById(id: string): Promise<PublicCateringRequest | null> {
  try {
    const docRef = doc(db, "cateringRequests", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as CateringRequest;
      
      // Security: Only return fields safe for public viewing
      return {
        id: docSnap.id,
        companyName: data.companyName || "Our Valued Client",
        cateringNeed: data.cateringNeed,
        estimatedGroupSize: data.estimatedGroupSize,
        fulfillmentStatus: data.fulfillmentStatus,
        preferredDate: data.preferredDate,
        eventType: data.eventType,
        updatedAt: data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error("Unable to load public tracker request:", error);
    return null;
  }
}

/**
 * Publicly approves a catering request (transition from Pending -> Confirmed).
 * Includes audit log and rep notification.
 */
export async function approvePublicRequest(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "cateringRequests", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    const data = docSnap.data() as CateringRequest;

    if (data.fulfillmentStatus !== "Pending") return false;

    await updateDoc(docRef, {
      fulfillmentStatus: "Confirmed",
      updatedAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
    });

    // Audit Log
    await logActivity(
      "REQUEST",
      id,
      "STATUS_CHANGE",
      { previousValue: "Pending", newValue: "Confirmed", source: "Customer Portal" },
      "customer",
      data.companyName || "Customer",
      "PORTAL_APPROVAL"
    );

    // Notify Rep
    if (data.assignedRepId) {
      await createNotification(
        data.assignedRepId,
        "Client Approved Proposal",
        `${data.companyName || "A client"} approved their proposal for ${data.cateringNeed}. Please review the request and confirm next steps.`,
        "SUCCESS",
        `/app/requests/${id}`
      );
    }

    return true;
  } catch (error) {
    console.error("Unable to approve public request:", error);
    return false;
  }
}
