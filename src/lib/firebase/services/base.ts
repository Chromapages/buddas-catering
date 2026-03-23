import { db } from "../config";
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";

/**
 * Logs an activity to the generic activity timeline.
 * Used for audits and the timeline UI.
 */
export async function logActivity(
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST",
  entityId: string,
  actionType: string,
  data: any,
  actorId: string,
  actorName: string
) {
  try {
    const activitiesRef = collection(db, "activities");
    await addDoc(activitiesRef, {
      entityType,
      entityId,
      actionType,
      data,
      actorId,
      actorName,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
}

/**
 * Helper to trigger external notifications (Stubbed for MVP)
 */
export function triggerNotification(channel: "Email" | "Webhook", message: string) {
  console.log(`[NOTIFICATION ${channel}]: ${message}`);
}
