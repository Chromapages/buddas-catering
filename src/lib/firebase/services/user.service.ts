import { db } from "../config";
import { 
  doc, 
  updateDoc, 
  getDocs, 
  collection,
  query, 
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

/**
 * Fetches all CRM users.
 */
export async function getAllUsers() {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Updates a user's display name in Firestore.
 */
export async function updateUserProfile(userId: string, displayName: string) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { displayName, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Fetches all users with the 'rep' role and returns a record of { [uid]: displayName }.
 */
export async function getSalesReps(): Promise<Record<string, string>> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "rep"));
    const snap = await getDocs(q);
    const reps: Record<string, string> = {};
    snap.docs.forEach(doc => {
      const data = doc.data();
      reps[doc.id] = data.displayName || data.email || "Unknown Rep";
    });
    return reps;
  } catch (error) {
    console.error("Error fetching sales reps:", error);
    return {};
  }
}
