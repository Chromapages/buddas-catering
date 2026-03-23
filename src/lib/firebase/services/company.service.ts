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
import { Company, Contact, CateringRequest } from "@/types/crm";

/**
 * Fetches all companies (for the Companies Table).
 */
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const companiesRef = collection(db, "companies");
    const q = query(companiesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    })) as Company[];
  } catch (error) {
    console.error("Error fetching all companies:", error);
    return [];
  }
}

/**
 * Fetches a single company by ID.
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const docRef = doc(db, "companies", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as any) } as Company;
    }
    return null;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

/**
 * Fetches all contacts for a specific company.
 */
export async function getContactsByCompanyId(companyId: string): Promise<Contact[]> {
  try {
    const contactsRef = collection(db, "contacts");
    const q = query(contactsRef, where("companyId", "==", companyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ 
      id: docSnap.id, 
      ...(docSnap.data() as any) 
    })) as Contact[];
  } catch (error) {
    console.error("Error fetching company contacts:", error);
    return [];
  }
}

/**
 * Fetches all catering requests for a specific company.
 */
export async function getRequestsByCompanyId(companyId: string): Promise<CateringRequest[]> {
  try {
    const requestsRef = collection(db, "cateringRequests");
    const q = query(requestsRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ 
      id: docSnap.id, 
      ...(docSnap.data() as any) 
    })) as CateringRequest[];
  } catch (error) {
    console.error("Error fetching company requests:", error);
    return [];
  }
}
