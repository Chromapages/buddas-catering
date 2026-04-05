import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config";
import { ProgramSignup } from "@/lib/types";
import { createNotification } from "./notification.service";
import { logActivity } from "./base";

const COLLECTION_NAME = "programSignups";

/**
 * Approves a program signup application.
 */
export async function approveProgramSignup(
  signupId: string,
  approverId: string,
  approverName: string
) {
  try {
    const signupRef = doc(db, "programSignups", signupId);
    await updateDoc(signupRef, {
      status: "Active",
      approvedById: approverId,
      approvedAt: serverTimestamp(),
    });
    await logActivity("LEAD", signupId, "PROGRAM_SIGNUP_APPROVED", {}, approverId, approverName);
    return true;
  } catch (error) {
    console.error("Error approving program signup:", error);
    throw error;
  }
}

/**
 * Rejects a program signup application.
 */
export async function rejectProgramSignup(
  signupId: string,
  approverId: string,
  approverName: string,
  reason?: string
) {
  try {
    const signupRef = doc(db, "programSignups", signupId);
    await updateDoc(signupRef, {
      status: "Declined",
      approvedById: approverId,
      approvedAt: serverTimestamp(),
      rejectionReason: reason ?? "",
    });
    await logActivity("LEAD", signupId, "PROGRAM_SIGNUP_REJECTED", { reason: reason ?? "" }, approverId, approverName);
    return true;
  } catch (error) {
    console.error("Error rejecting program signup:", error);
    throw error;
  }
}

export async function getProgramSignups(): Promise<ProgramSignup[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ProgramSignup));
  } catch (error) {
    console.error("Error fetching program signups:", error);
    return [];
  }
}

