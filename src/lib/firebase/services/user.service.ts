import { db } from "../config";
import { 
  doc, 
  updateDoc, 
  getDocs, 
  collection,
  query, 
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
