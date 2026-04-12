import { db } from "../config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { CRMTask, TaskStatus } from "@/types/crm";
import { logActivity } from "./base";

const COLLECTION_NAME = "tasks";

/**
 * Creates a new task.
 */
export async function createTask(taskData: Omit<CRMTask, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const tasksRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      status: 'Upcoming',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    await logActivity(
      taskData.entityType, 
      taskData.entityId, 
      "TASK_CREATED", 
      { subject: taskData.subject, dueDate: taskData.dueDate }, 
      taskData.assignedRepId, 
      "System"
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

/**
 * Updates a task with partial fields.
 */
export async function updateTask(taskId: string, updates: Partial<CRMTask>) {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

/**
 * Completes a task.
 */
export async function completeTask(taskId: string, actorId: string, actorName: string) {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (!taskSnap.exists()) throw new Error("Task not found");
    const taskData = taskSnap.data() as CRMTask;

    await updateDoc(taskRef, {
      status: 'Completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await logActivity(
      taskData.entityType,
      taskData.entityId,
      "TASK_COMPLETED",
      { subject: taskData.subject },
      actorId,
      actorName
    );

    return true;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
}

/**
 * Fetches tasks for a specific rep.
 */
export async function getTasksByRep(repId: string, status?: TaskStatus) {
  try {
    const tasksRef = collection(db, COLLECTION_NAME);
    let q = query(
      tasksRef, 
      where("assignedRepId", "==", repId),
      orderBy("dueDate", "asc")
    );
    
    if (status) {
      q = query(q, where("status", "==", status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CRMTask[];
  } catch (error) {
    console.error("Error fetching rep tasks:", error);
    return [];
  }
}

export async function getRepTaskSummary(repId: string): Promise<{ overdue: number; dueToday: number }> {
  try {
    const tasks = await getTasksByRep(repId, "Upcoming");
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const overdue = tasks.filter((task) => task.dueDate.toDate() < startOfToday).length;
    const dueToday = tasks.filter((task) => {
      const dueDate = task.dueDate.toDate();
      return dueDate >= startOfToday && dueDate < endOfToday;
    }).length;

    return { overdue, dueToday };
  } catch (error) {
    console.error("Error fetching rep task summary:", error);
    return { overdue: 0, dueToday: 0 };
  }
}

export async function getRepTasksByStatus(repId: string): Promise<{
  overdue: CRMTask[];
  today: CRMTask[];
  upcoming: CRMTask[];
}> {
  try {
    const tasks = await getTasksByRep(repId, "Upcoming");
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return {
      overdue: tasks.filter((task) => task.dueDate.toDate() < startOfToday),
      today: tasks.filter((task) => {
        const dueDate = task.dueDate.toDate();
        return dueDate >= startOfToday && dueDate < endOfToday;
      }),
      upcoming: tasks.filter((task) => task.dueDate.toDate() >= endOfToday),
    };
  } catch (error) {
    console.error("Error fetching rep task buckets:", error);
    return { overdue: [], today: [], upcoming: [] };
  }
}

/**
 * Fetches tasks for a specific entity (Lead, Company, etc.).
 */
export async function getTasksByEntity(entityType: string, entityId: string, userId?: string, userRole?: string) {
  try {
    const tasksRef = collection(db, COLLECTION_NAME);
    let q = query(
      tasksRef,
      where("entityType", "==", entityType),
      where("entityId", "==", entityId),
      orderBy("dueDate", "desc")
    );

    if (userRole === "rep" && userId) {
      q = query(q, where("assignedRepId", "==", userId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CRMTask[];
  } catch (error) {
    console.error("Error fetching entity tasks:", error);
    return [];
  }
}
