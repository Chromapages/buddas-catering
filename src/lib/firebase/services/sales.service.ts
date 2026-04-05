import { db } from "../config";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit,
  Timestamp
} from "firebase/firestore";
import { Company, Lead, CateringRequest, CommissionApproval } from "@/types/crm";

/**
 * Fetches companies assigned to a rep that are 'Active' but haven't placed their first order.
 * This is the primary 'Activation' target for reps.
 */
export async function getActivationPipeline(repId: string) {
  try {
    const companiesRef = collection(db, "companies");
    // We check for activeMembershipId meaning they signed up, but firstOrderPlaced is false
    const q = query(
      companiesRef,
      where("assignedRepId", "==", repId),
      where("firstOrderPlaced", "==", false)
    );
    const querySnapshot = await getDocs(q);
    
    // Filter for those with an active membership in memory if needed, 
    // but the flag firstOrderPlaced is the key.
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Company))
      .filter(c => !!c.activeMembershipId); 
  } catch (error) {
    console.error("Error fetching activation pipeline:", error);
    return [];
  }
}

/**
 * Fetches leads assigned to a rep that haven't had status movement or updates in 3+ days.
 */
export async function getStaleLeads(repId: string) {
  try {
    const leadsRef = collection(db, "leads");
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const q = query(
      leadsRef,
      where("assignedRepId", "==", repId),
      where("status", "in", ["New", "Contacted", "Quote Sent"]),
      where("updatedAt", "<", Timestamp.fromDate(threeDaysAgo)),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
  } catch (error) {
    console.error("Error fetching stale leads:", error);
    return [];
  }
}

/**
 * Fetches the rep's monthly performance vs goals.
 */
export async function getRepMonthlyStats(repId: string) {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [leadsSnap, companiesSnap, requestsSnap, approvalsSnap, tasksSnap] = await Promise.all([
      getDocs(query(collection(db, "leads"), where("assignedRepId", "==", repId))),
      getDocs(query(collection(db, "companies"), where("assignedRepId", "==", repId))),
      getDocs(query(collection(db, "cateringRequests"), where("assignedRepId", "==", repId))),
      getDocs(query(collection(db, "commission_approvals"), where("repId", "==", repId))),
      getDocs(query(collection(db, "tasks"), where("assignedRepId", "==", repId), where("status", "==", "Upcoming"))),
    ]);

    const leads = leadsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Lead));
    const companies = companiesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Company));
    const requests = requestsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CateringRequest));
    const approvals = approvalsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CommissionApproval));
    const tasks = tasksSnap.docs.map((docSnap) => docSnap.data());

    const isThisMonth = (value: any) => {
      if (!value || typeof value !== "object" || !("toDate" in value)) return false;
      const date = value.toDate();
      return date >= firstDayOfMonth;
    };

    const wonDeals = leads.filter((lead) => lead.status === "Won" && (isThisMonth(lead.convertedAt) || isThisMonth(lead.statusChangedAt))).length;
    const leadsAssigned = leads.filter((lead) => isThisMonth(lead.createdAt)).length;
    const leadsContacted = leads.filter((lead) => lead.status !== "New" && isThisMonth(lead.statusChangedAt)).length;
    const quotesSent = leads.filter((lead) => lead.status === "Quote Sent" && isThisMonth(lead.statusChangedAt)).length;
    const openLeadPipelineValue = leads
      .filter((lead) => !["Won", "Lost"].includes(lead.status))
      .reduce((sum, lead) => sum + ((lead as Lead & { quoteAmount?: number }).quoteAmount || 0), 0);
    const activationsThisMonth = companies.filter((company) => company.firstOrderPlaced && isThisMonth(company.updatedAt)).length;
    const overdueFollowUps = tasks.filter((task) => {
      const dueDate = task.dueDate?.toDate?.();
      return dueDate && dueDate < now;
    }).length;
    const commissionEstimate = approvals.reduce((sum, approval) => {
      const createdAt = approval.createdAt?.toDate?.();
      if (!createdAt || createdAt < firstDayOfMonth) return sum;
      return sum + (approval.amount || 0);
    }, 0);

    const activationDurations = requests
      .filter((request) => request.companyId && request.fulfillmentStatus !== "Cancelled")
      .map((request) => {
        const company = companies.find((entry) => entry.id === request.companyId);
        const requestCreated = request.createdAt?.toDate?.();
        const companyCreated = company?.createdAt?.toDate?.();
        if (!requestCreated || !companyCreated) return null;
        const days = Math.max(0, Math.round((requestCreated.getTime() - companyCreated.getTime()) / (1000 * 60 * 60 * 24)));
        return days;
      })
      .filter((value): value is number => value != null);

    const avgActivationDays = activationDurations.length
      ? Math.round(activationDurations.reduce((sum, value) => sum + value, 0) / activationDurations.length)
      : 0;

    const winRate = leadsContacted > 0 ? Math.round((wonDeals / leadsContacted) * 100) : 0;

    return {
      signups: wonDeals,
      goal: 10, // Static goal for now, could be fetched from user profile
      leadsAssigned,
      leadsContacted,
      quotesSent,
      wonDeals,
      winRate,
      activationsThisMonth,
      avgActivationDays,
      overdueFollowUps,
      commissionEstimate,
      pipelineValue: openLeadPipelineValue,
      closingRate: leadsAssigned > 0 ? Math.round((wonDeals / leadsAssigned) * 100) : 0,
    };
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    return {
      signups: 0,
      goal: 10,
      leadsAssigned: 0,
      leadsContacted: 0,
      quotesSent: 0,
      wonDeals: 0,
      winRate: 0,
      activationsThisMonth: 0,
      avgActivationDays: 0,
      overdueFollowUps: 0,
      commissionEstimate: 0,
      pipelineValue: 0,
      closingRate: 0,
    };
  }
}
