import { db } from "../config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { Company, Contact, CateringRequest, Commitment } from "@/types/crm";
import { logActivity } from "./base";

/**
 * Fetches all companies (for the Companies Table).
 * Excludes archived companies.
 */
export async function getAllCompanies(userId?: string, userRole?: string): Promise<Company[]> {
  try {
    const companiesRef = collection(db, "companies");
    let q = query(
      companiesRef, 
      where("archived", "==", false),
      orderBy("createdAt", "desc")
    );

    if (userRole === "rep" && userId) {
      q = query(
        companiesRef,
        where("archived", "==", false),
        where("assignedRepId", "==", userId),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    })) as Company[];
  } catch (error) {
    // Fallback if index is missing
    const q = query(collection(db, "companies"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Company))
      .filter((company) => {
        if ((company as any).archived) return false;
        if (userRole === "rep" && userId) {
          return company.assignedRepId === userId;
        }
        return true;
      });
  }
}

export async function getCompaniesByHealthState(
  repId: string | undefined,
  state: "expiring" | "no-first-order" | "lapsed"
): Promise<Company[]> {
  try {
    let q = query(collection(db, "companies"));
    if (repId) {
      q = query(q, where("assignedRepId", "==", repId));
    }
    const [companiesSnap, commitmentsSnap] = await Promise.all([
      getDocs(q),
      getDocs(query(collection(db, "commitments"))),
    ]);

    const companies = companiesSnap.docs
      .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) } as Company))
      .filter((company) => !(company as any).archived);
    const commitments = commitmentsSnap.docs.map(
      (docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) } as Commitment)
    );

    const now = new Date();
    const sixtyDaysFromNow = new Date(now);
    sixtyDaysFromNow.setDate(now.getDate() + 60);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    return companies.filter((company) => {
      const activeCommitment = commitments.find(
        (commitment) =>
          commitment.companyId === company.id &&
          (commitment.active || company.activeCommitmentId === commitment.id || company.activeMembershipId === commitment.id)
      );

      if (state === "no-first-order") {
        const createdAt = company.createdAt?.toDate?.();
        return Boolean(createdAt && createdAt <= sevenDaysAgo && company.firstOrderPlaced === false);
      }

      if (!activeCommitment) return false;

      const renewalDate = activeCommitment.endDate?.toDate?.() || activeCommitment.renewalDate?.toDate?.();
      if (!renewalDate) return false;

      if (state === "expiring") {
        return activeCommitment.status !== "Lapsed" && renewalDate >= now && renewalDate <= sixtyDaysFromNow;
      }

      if (state === "lapsed") {
        return activeCommitment.status === "Lapsed" || renewalDate < now;
      }

      return false;
    });
  } catch (error) {
    console.error("Error fetching companies by health state:", error);
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
      const data = docSnap.data() as Company;
      if ((data as any).archived) return null;
      return { ...data, id: docSnap.id };
    }
    return null;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

/**
 * Fetches all contacts for a specific company using the new relational model.
 */
export async function getContactsByCompanyId(companyId: string): Promise<Contact[]> {
  try {
    // Use the optimized contact service logic
    const { getContactsByCompany } = await import("./contact.service");
    return await getContactsByCompany(companyId);
  } catch (error) {
    console.error("Error fetching company contacts:", error);
    return [];
  }
}

/**
 * Fetches all catering requests for a specific company.
 */
export async function getRequestsByCompanyId(
  companyId: string,
  userId?: string,
  userRole?: string
): Promise<CateringRequest[]> {
  try {
    const requestsRef = collection(db, "cateringRequests");
    let q = query(requestsRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
    
    if (userRole === "rep" && userId) {
      q = query(q, where("assignedRepId", "==", userId));
    }

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

/**
 * Updates a company document.
 * Logs ownership change for audit trail if assignedRepId is changed.
 */
export async function updateCompany(
  id: string, 
  data: Record<string, unknown>,
  actorId: string,
  actorName: string
) {
  try {
    const docRef = doc(db, "companies", id);
    const oldSnap = await getDoc(docRef);
    const oldData = oldSnap.data() as Company;

    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });

    if (data.assignedRepId && data.assignedRepId !== oldData.assignedRepId) {
      await logActivity(
        "COMPANY",
        id,
        "OWNERSHIP_CHANGE",
        { previousValue: oldData.assignedRepId, newValue: data.assignedRepId },
        actorId,
        actorName,
        "ACCOUNT_REASSIGNED"
      );
    } else {
      await logActivity(
        "COMPANY",
        id,
        "NOTE_ADDED",
        { updates: data },
        actorId,
        actorName,
        "ACCOUNT_UPDATED"
      );
    }
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
}

/**
 * Soft-deletes (archives) a company.
 */
export async function archiveCompany(companyId: string, actorId: string, actorName: string) {
  try {
    const docRef = doc(db, "companies", companyId);
    await updateDoc(docRef, {
      archived: true,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logActivity(
      "COMPANY",
      companyId,
      "STATUS_CHANGE",
      { newValue: "Archived" },
      actorId,
      actorName,
      "COMPANY_ARCHIVED"
    );
  } catch (error) {
    console.error("Error archiving company:", error);
    throw error;
  }
}

/**
 * Creates a new company in Firestore.
 */
export async function createCompany(companyData: Partial<Company>, actorId: string, actorName: string) {
  try {
    const { addDoc, serverTimestamp } = await import("firebase/firestore");
    const companiesRef = collection(db, "companies");
    const docRef = await addDoc(companiesRef, {
      ...companyData,
      archived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await logActivity(
      "COMPANY",
      docRef.id,
      "STATUS_CHANGE",
      { newValue: "Created" },
      actorId,
      actorName,
      "COMPANY_CREATED"
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
}

/**
 * Updates a company's lifecycle status.
 * Logs the transition for the audit trail.
 */
export async function updateCompanyStatus(
  id: string,
  newStatus: string,
  oldStatus: string | undefined,
  actorId: string,
  actorName: string
) {
  try {
    const docRef = doc(db, "companies", id);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    await logActivity(
      "COMPANY",
      id,
      "STATUS_CHANGE",
      { previousValue: oldStatus, newValue: newStatus },
      actorId,
      actorName,
      "COMPANY_STATUS_UPDATED"
    );
  } catch (error) {
    console.error("Error updating company status:", error);
    throw error;
  }
}
