import { db } from "../config";
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { Membership } from "@/types/crm";

/**
 * Fetches all memberships.
 */
export async function getAllMemberships(): Promise<Membership[]> {
  try {
    const membershipsRef = collection(db, "memberships");
    const q = query(membershipsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    })) as Membership[];
  } catch (error) {
    console.error("Error fetching all memberships:", error);
    return [];
  }
}

/**
 * Fetches a single membership by ID.
 */
export async function getMembershipById(id: string): Promise<Membership | null> {
  try {
    const docRef = doc(db, "memberships", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as any) } as Membership;
    }
    return null;
  } catch (error) {
    console.error("Error fetching membership:", error);
    return null;
  }
}

/**
 * Fetches active membership for a specific company.
 */
export async function getActiveMembershipByCompanyId(companyId: string): Promise<Membership | null> {
  try {
    const membershipsRef = collection(db, "memberships");
    const q = query(membershipsRef, where("companyId", "==", companyId), where("active", "==", true));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as any) } as Membership;
    }
    return null;
  } catch (error) {
    console.error("Error fetching active company membership:", error);
    return null;
  }
}
