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
  onSnapshot,
  writeBatch,
  limit
} from "firebase/firestore";
import { sendEmail } from "@/lib/utils/notifications";

/**
 * Creates a new notification for a user.
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
  link?: string
) {
  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      userId,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: serverTimestamp()
    });

    const userSnap = await getDoc(doc(db, "users", userId));
    const userData = userSnap.data();
    if (userData?.email) {
      await sendEmail({
        to: userData.email,
        subject: title,
        message,
        link
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

/**
 * Fetches all notifications for a specific user.
 */
export function subscribeToUserNotifications(userId: string, callback: (notifications: any[]) => void) {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    },
    (error) => {
      // Permission errors are expected when rules haven't been deployed yet.
      // Fail silently so the rest of the CRM continues to work.
      if (error.code !== "permission-denied") {
        console.error("Notification listener error:", error);
      }
    }
  );
}

/**
 * Marks a notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const docRef = doc(db, "notifications", notificationId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", userId), where("read", "==", false));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}
