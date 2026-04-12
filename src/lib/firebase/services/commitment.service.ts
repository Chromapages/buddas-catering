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
import { Commitment, CommitmentStatus } from "@/types/crm";
import { createNotification } from "./notification.service";
import { logActivity } from "./base";
import { createTask, getTasksByEntity } from "./task.service";
import { getCompanyById } from "./company.service";

/**
 * Fetches all commitments.
 */
export async function getAllCommitments(): Promise<Commitment[]> {
  try {
    const commitmentsRef = collection(db, "commitments");
    const q = query(commitmentsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    })) as Commitment[];
  } catch (error) {
    console.error("Error fetching all commitments:", error);
    return [];
  }
}

/**
 * Fetches a single commitment by ID.
 */
export async function getCommitmentById(id: string): Promise<Commitment | null> {
  try {
    const docRef = doc(db, "commitments", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as any) } as Commitment;
    }
    return null;
  } catch (error) {
    console.error("Error fetching commitment:", error);
    return null;
  }
}

/**
 * Fetches all commitments for a specific company.
 */
export async function getCommitmentsByCompanyId(companyId: string): Promise<Commitment[]> {
  try {
    const commitmentsRef = collection(db, "commitments");
    const q = query(commitmentsRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    })) as Commitment[];
  } catch (error) {
    console.error("Error fetching company commitments:", error);
    return [];
  }
}

/**
 * Fetches active commitment for a specific company.
 */
export async function getActiveCommitmentByCompanyId(companyId: string): Promise<Commitment | null> {
  try {
    const commitmentsRef = collection(db, "commitments");
    const q = query(commitmentsRef, where("companyId", "==", companyId), where("active", "==", true));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as any) } as Commitment;
    }
    return null;
  } catch (error) {
    console.error("Error fetching active company commitment:", error);
    return null;
  }
}

/**
 * Creates a new commitment in Firestore.
 * Logs a creation event.
 */
export async function createCommitment(commitmentData: Partial<Commitment>, actorId: string, actorName: string) {
  try {
    const { addDoc, serverTimestamp } = await import("firebase/firestore");
    const commitmentsRef = collection(db, "commitments");
    
    // Calculate initial remaining if not provided
    const committed = commitmentData.ordersCommitted || 0;
    const used = commitmentData.ordersUsed || 0;
    
    const docRef = await addDoc(commitmentsRef, {
      ...commitmentData,
      status: 'Active',
      ordersUsed: used,
      ordersRemaining: Math.max(committed - used, 0),
      firstOrderPlaced: false,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await logActivity(
      "COMMITMENT",
      docRef.id,
      "STATUS_CHANGE",
      { newValue: "Active", tier: commitmentData.tier },
      actorId,
      actorName,
      "COMMITMENT_CREATED"
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating commitment:", error);
    throw error;
  }
}

/**
 * Records an order usage against a commitment with full audit link.
 */
export async function recordCommitmentUsage(
  commitmentId: string, 
  orderId: string, 
  actorId: string, 
  actorName: string
) {
  try {
    const commitmentRef = doc(db, "commitments", commitmentId);
    const snap = await getDoc(commitmentRef);
    if (!snap.exists()) throw new Error("Commitment not found");
    
    const data = snap.data() as Commitment;
    const isFirstOrder = !data.firstOrderPlaced;
    const newUsed = data.ordersUsed + 1;
    const newRemaining = Math.max(data.ordersCommitted - newUsed, 0);

    const update: any = {
      ordersUsed: newUsed,
      ordersRemaining: newRemaining,
      updatedAt: serverTimestamp()
    };

    if (isFirstOrder) {
      update.firstOrderPlaced = true;
      update.activationDate = serverTimestamp();
    }

    await updateDoc(commitmentRef, update);

    await logActivity(
      "COMMITMENT",
      commitmentId,
      "COMMITMENT_USAGE",
      { orderId, previousValue: data.ordersUsed, newValue: newUsed },
      actorId,
      actorName,
      isFirstOrder ? "COMMITMENT_ACTIVATED" : "CREDIT_CONSUMED"
    );

    // Also link it on the company timeline
    await logActivity(
      "COMPANY",
      data.companyId,
      "COMMITMENT_USAGE",
      { orderId, commitmentId },
      actorId,
      actorName,
      "ORDER_QUALIFIED"
    );

  } catch (error) {
    console.error("Error recording commitment usage:", error);
    throw error;
  }
}

/**
 * Syncs commitment statuses based on renewal dates.
 * Marks commitments as 'Expiring' if within 30 days of renewal.
 */
export async function syncCommitmentStatuses() {
  try {
    const commitmentsRef = collection(db, "commitments");
    const q = query(commitmentsRef, where("active", "==", true), where("status", "==", "Active"));
    const querySnapshot = await getDocs(q);

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    for (const commitmentDoc of querySnapshot.docs) {
      const data = commitmentDoc.data();
      const renewalDate = data.endDate?.toDate() || data.renewalDate?.toDate();

      if (renewalDate && renewalDate <= thirtyDaysFromNow && renewalDate > now) {
        await updateDoc(commitmentDoc.ref, {
          status: 'Expiring',
          updatedAt: serverTimestamp()
        });
        console.log(`Commitment ${commitmentDoc.id} marked as Expiring`);
      }
    }
  } catch (error) {
    console.error("Error syncing commitment statuses:", error);
  }
}

/**
 * Checks for expiring commitments and creates renewal tasks if they don't exist.
 */
export async function triggerRenewalTasks(userId?: string, userRole?: string) {
  try {
    // First, sync statuses to ensure we catch all expiring commitments
    // This requires write permission, which Reps typically lack for global records
    try {
      await syncCommitmentStatuses();
    } catch (syncError) {
      console.warn("[CRM] Skipping commitment status sync due to restricted permissions or network state.");
    }

    const commitmentsRef = collection(db, "commitments");
    const q = query(commitmentsRef, where("status", "==", "Expiring"), where("active", "==", true));
    const querySnapshot = await getDocs(q);

    for (const commitmentDoc of querySnapshot.docs) {
      const commitment = { id: commitmentDoc.id, ...commitmentDoc.data() } as Commitment;
      
      // Check if an upcoming task already exists for this commitment/company
      // We pass userId/Role to satisfy security rules for the check
      const existingTasks = await getTasksByEntity("COMPANY", commitment.companyId, userId, userRole);
      const hasRenewalTask = existingTasks.some(t => 
        t.status === 'Upcoming' && t.subject.includes("Commitment Renewal")
      );

      if (!hasRenewalTask) {
        const company = await getCompanyById(commitment.companyId);
        if (company) {
          await createTask({
            subject: `Commitment Renewal: ${company.name}`,
            dueDate: commitment.endDate || commitment.renewalDate, 
            priority: 'High',
            assignedRepId: company.assignedRepId || userId || 'system',
            entityType: 'COMPANY',
            entityId: company.id,
            entityName: company.name,
            status: 'Upcoming'
          });
          
          console.log(`Created renewal task for ${company.name}`);
        }
      }
    }
  } catch (error) {
    console.error("Error triggering renewal tasks:", error);
  }
}
