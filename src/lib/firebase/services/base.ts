import { db } from "../config";
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs
} from "firebase/firestore";
import { ActivityActionType } from "@/types/crm";

/**
 * Recursively removes undefined values from an object.
 * Firestore does not allow undefined values in documents.
 */
export function sanitizeData(data: any): any {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData).filter(v => v !== undefined);
  }

  const result: any = {};
  Object.keys(data).forEach((key) => {
    const value = sanitizeData(data[key]);
    if (value !== undefined) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * Logs an activity to the generic activity timeline.
 * Used for audits and the timeline UI.
 */
export async function logActivity(
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST" | "COMMITMENT",
  entityId: string,
  actionType: ActivityActionType | string,
  data: {
    previousValue?: any;
    newValue?: any;
    orderId?: string;
    reason?: string;
    [key: string]: any;
  },
  actorId: string,
  actorName: string,
  subType?: string
) {
  try {
    const activitiesRef = collection(db, "activities");
    await addDoc(activitiesRef, {
      entityType,
      entityId,
      actionType,
      subType: subType || null,
      data: sanitizeData(data),
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
 * Fetches activities for a specific entity.
 */
export async function getActivitiesByEntity(
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST" | "COMMITMENT",
  entityId: string
) {
  try {
    const q = query(
      collection(db, "activities"),
      where("entityType", "==", entityType),
      where("entityId", "==", entityId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

/**
 * Triggers a notification to all owner-role users.
 * Fire-and-forget: errors are logged but not thrown.
 */
export function triggerNotification(channel: "Email" | "Webhook", message: string) {
  (async () => {
    try {
      const { createNotification } = await import("./notification.service");
      const ownersSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "owner"))
      );
      await Promise.all(
        ownersSnap.docs.map((d) =>
          createNotification(d.id, `[${channel}] System Alert`, message, "INFO")
        )
      );
    } catch (err) {
      console.error(`[NOTIFICATION ${channel}] failed:`, err);
    }
  })();
}
