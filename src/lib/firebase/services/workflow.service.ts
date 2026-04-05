import { db } from "../config";
import { Timestamp, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { CRMTask, Lead, CateringRequest } from "@/types/crm";
import { addDays } from "date-fns";

/**
 * Handles automated side-effects when certain business events occur.
 * This keeps the main service files focused on CRUD operations.
 */

/**
 * Triggered when a lead is first contacted.
 * Creates an automatic follow-up task.
 */
export async function autoCreateFollowUpTask(lead: Lead, actorId: string) {
  try {
    const tasksRef = collection(db, "tasks");
    const dueDate = addDays(new Date(), 2);

    const newTask: Partial<CRMTask> = {
      subject: `Follow up with ${lead.companyName}`,
      description: `Auto-generated follow-up after initial contact with ${lead.contactName}.`,
      dueDate: Timestamp.fromDate(dueDate),
      status: "Upcoming",
      priority: "Medium",
      assignedRepId: lead.assignedRepId || actorId,
      entityType: "LEAD",
      entityId: lead.id,
      entityName: lead.companyName,
      createdAt: serverTimestamp() as Timestamp,
    };

    await addDoc(tasksRef, newTask);
    console.log(`[WORKFLOW] Auto-created follow-up task for lead ${lead.id}`);
  } catch (error) {
    console.error("[WORKFLOW] Error creating auto follow-up task:", error);
  }
}

/**
 * Triggered when a catering request is created.
 * Creates an automatic "Send Proposal" task.
 */
export async function autoCreateProposalTask(request: CateringRequest, actorId: string) {
  try {
    const tasksRef = collection(db, "tasks");
    const dueDate = addDays(new Date(), 1);

    const newTask: Partial<CRMTask> = {
      subject: `Send Proposal: ${request.cateringNeed}`,
      description: `Auto-generated: Prepare and send proposal for ${request.companyName}.`,
      dueDate: Timestamp.fromDate(dueDate),
      status: "Upcoming",
      priority: "High",
      assignedRepId: request.assignedRepId || actorId,
      entityType: "REQUEST",
      entityId: request.id,
      entityName: request.companyName || "Unknown Company",
      createdAt: serverTimestamp() as Timestamp,
    };

    await addDoc(tasksRef, newTask);
    console.log(`[WORKFLOW] Auto-created proposal task for request ${request.id}`);
  } catch (error) {
    console.error("[WORKFLOW] Error creating auto proposal task:", error);
  }
}
