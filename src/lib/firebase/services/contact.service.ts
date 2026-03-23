import { db } from "../config";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy
} from "firebase/firestore";

/**
 * Fetches a single contact by ID.
 */
export async function getContactById(id: string) {
  try {
    const docRef = doc(db, "contacts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching contact:", error);
    return null;
  }
}
