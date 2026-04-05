import { db } from "../config";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  getCountFromServer,
  limit,
  orderBy
} from "firebase/firestore";

/**
 * Fetches aggregate stats for the CRM dashboard.
 */
export async function getDashboardStats(userId?: string, userRole?: string) {
  try {
    const isRestricted = userRole === 'rep' && userId;
    
    let leadsRef = query(collection(db, "leads"));
    let requestsRef = query(collection(db, "cateringRequests"));
    let membershipsRef = query(collection(db, "memberships"), where("active", "==", true));

    if (isRestricted) {
      leadsRef = query(leadsRef, where("assignedRepId", "==", userId));
      requestsRef = query(requestsRef, where("assignedRepId", "==", userId));
      // Memberships are currently company-wide, but we could restrict if needed
    }

    const leadsSnap = await getCountFromServer(leadsRef);
    const membershipsSnap = await getCountFromServer(membershipsRef);
    
    const wonSnap = await getCountFromServer(query(leadsRef, where("status", "==", "Won")));
    const lostSnap = await getCountFromServer(query(leadsRef, where("status", "==", "Lost")));
    
    const wonCount = wonSnap.data().count;
    const lostCount = lostSnap.data().count;
    const totalResolved = wonCount + lostCount;
    const winRate = totalResolved > 0 ? Math.round((wonCount / totalResolved) * 100) : 0;

    const requestsSnap = await getDocs(query(requestsRef, where("fulfillmentStatus", "!=", "Cancelled")));
    let pipelineValue = 0;
    let weightedPipeline = 0;
    
    const PROBABILITY_MAP: Record<string, number> = {
      "Pending": 0.2,
      "Confirmed": 0.8,
      "Fulfilled": 1.0,
      "Invoiced": 1.0,
      "Paid": 1.0,
      "Commission Approved": 1.0,
    };

    requestsSnap.forEach(doc => {
      const data = doc.data();
      const amount = data.quoteAmount || 0;
      pipelineValue += amount;
      weightedPipeline += amount * (PROBABILITY_MAP[data.fulfillmentStatus] || 0);
    });

    // Simple Sales Velocity: Average days to close (Won)
    const velocitySnap = await getDocs(query(leadsRef, where("status", "==", "Won")));
    let totalDays = 0;
    let wonCountVelocity = 0;
    
    velocitySnap.forEach(doc => {
      const data = doc.data();
      if (data.createdAt && data.convertedAt) {
        const start = data.createdAt.toDate();
        const end = data.convertedAt.toDate();
        totalDays += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        wonCountVelocity++;
      }
    });

    const avgSalesVelocity = wonCountVelocity > 0 ? Math.round(totalDays / wonCountVelocity) : 0;

    return {
      totalLeads: leadsSnap.data().count,
      pipelineValue,
      weightedPipeline: Math.round(weightedPipeline),
      activeMemberships: membershipsSnap.data().count,
      winRate,
      avgSalesVelocity
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { totalLeads: 0, pipelineValue: 0, activeMemberships: 0, winRate: 0 };
  }
}

/**
 * Fetches recent activity for the dashboard feed.
 */
export async function getRecentActivity(limitCount: number = 10, userId?: string, userRole?: string) {
  try {
    let q = query(collection(db, "activities"), orderBy("createdAt", "desc"), limit(limitCount));
    
    if (userRole === 'rep' && userId) {
      // For Reps, we only show activities where they are the actor OR the entity is assigned to them
      // Note: Firestore doesn't support OR across different fields easily without composite indexes or multiple queries.
      // We'll filter for activities where they are the actor for now, or fetch and filter in memory if volume is low.
      q = query(q, where("actorId", "==", userId));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

/**
 * Aggregates leads by source for reporting.
 */
export async function getLeadSourceStats(userId?: string, userRole?: string) {
  try {
    let leadsRef = query(collection(db, "leads"));
    if (userRole === 'rep' && userId) {
      leadsRef = query(leadsRef, where("assignedRepId", "==", userId));
    }
    
    const querySnapshot = await getDocs(leadsRef);
    const stats: Record<string, number> = {};
    
    querySnapshot.forEach(doc => {
      const source = doc.data().source || "Unknown";
      stats[source] = (stats[source] || 0) + 1;
    });

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  } catch (error) {
    console.error("Error fetching lead source stats:", error);
    return [];
  }
}

/**
 * Global prefix search for leads and companies.
 */
export async function searchCrm(searchTerm: string, userId?: string, userRole?: string) {
  if (!searchTerm || searchTerm.length < 2) return [];

  try {
    const isRestricted = userRole === 'rep' && userId;
    
    let leadQuery = query(
      collection(db, "leads"), 
      where("companyName", ">=", searchTerm), 
      where("companyName", "<=", searchTerm + '\uf8ff'),
      limit(5)
    );
    
    if (isRestricted) {
      leadQuery = query(leadQuery, where("assignedRepId", "==", userId));
    }
    
    const companiesRef = collection(db, "companies");
    const compQuery = query(
      companiesRef, 
      where("name", ">=", searchTerm), 
      where("name", "<=", searchTerm + '\uf8ff'),
      limit(5)
    );

    const [leadSnap, compSnap] = await Promise.all([
      getDocs(leadQuery),
      getDocs(compQuery)
    ]);
    //... (rest of search logic remains same)

    const results: any[] = [];

    leadSnap.forEach(docSnap => {
      results.push({
        id: docSnap.id,
        type: 'LEAD',
        title: docSnap.data().companyName,
        subtitle: `Lead: ${docSnap.data().contactName}`,
        link: `/app/leads`
      });
    });

    compSnap.forEach(docSnap => {
      const data = docSnap.data();
      const statusText = data.activeMembershipId || data.activeCommitmentId ? 'Active Account' : 'Company Account';
      results.push({
        id: docSnap.id,
        type: 'COMPANY',
        title: data.name,
        subtitle: `${data.companyType || 'Corporate'} • ${statusText}`,
        link: `/app/companies/${docSnap.id}`
      });
    });

    return results;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

/**
 * Aggregates revenue by sales rep for fulfilled requests.
 */
export async function getRevenueByRep() {
  try {
    const requestsRef = query(
      collection(db, "cateringRequests"), 
      where("fulfillmentStatus", "==", "Fulfilled")
    );
    const snap = await getDocs(requestsRef);
    
    const revMap: Record<string, number> = {};
    const repNames: Record<string, string> = {};

    // We'll collect unique rep IDs to avoid redundant user fetches
    const repIds = new Set<string>();

    snap.forEach(doc => {
      const data = doc.data();
      const repId = data.assignedRepId || "unassigned";
      repIds.add(repId);
      revMap[repId] = (revMap[repId] || 0) + (data.quoteAmount || 0);
    });

    // In a production app, we'd cache these or use a smarter join
    // For now, we'll fetch rep names for the results
    const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "rep")));
    usersSnap.forEach(u => {
      repNames[u.id] = u.data().displayName || u.data().email;
    });
    repNames["unassigned"] = "Unassigned";

    return Object.entries(revMap).map(([id, value]) => ({
      name: repNames[id] || `Rep ${id.slice(0, 4)}`,
      value
    })).sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error("Error fetching revenue by rep:", error);
    return [];
  }
}

/**
 * Calculates close rate and average deal size per sales rep.
 */
export async function getRepPerformanceMetrics(userId?: string, userRole?: string) {
  try {
    const isRestricted = userRole === 'rep' && userId;
    
    let leadsRef = query(collection(db, "leads"));
    let requestsRef = query(collection(db, "cateringRequests"));

    if (isRestricted) {
      leadsRef = query(leadsRef, where("assignedRepId", "==", userId));
      requestsRef = query(requestsRef, where("assignedRepId", "==", userId));
    }

    const [leadsSnap, requestsSnap] = await Promise.all([
      getDocs(leadsRef),
      getDocs(requestsRef)
    ]);

    const stats: Record<string, { won: number; lost: number; totalValue: number; count: number }> = {};
    const repNames: Record<string, string> = { "unassigned": "Unassigned" };

    // Initialize stats from all reps
    const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "rep")));
    usersSnap.forEach((u: any) => {
      const data = u.data();
      const id = u.id;
      repNames[id] = data.displayName || data.email;
      stats[id] = { won: 0, lost: 0, totalValue: 0, count: 0 };
    });

    // Process leads for win rate
    leadsSnap.forEach((doc: any) => {
      const data = doc.data();
      const repId = data.assignedRepId || "unassigned";
      if (!stats[repId]) stats[repId] = { won: 0, lost: 0, totalValue: 0, count: 0 };
      
      if (data.status === "Won") stats[repId].won++;
      if (data.status === "Lost") stats[repId].lost++;
    });

    // Process requests for average deal size
    requestsSnap.forEach((doc: any) => {
      const data = doc.data();
      const repId = data.assignedRepId || "unassigned";
      if (!stats[repId]) stats[repId] = { won: 0, lost: 0, totalValue: 0, count: 0 };
      
      if (data.quoteAmount) {
        stats[repId].totalValue += data.quoteAmount;
        stats[repId].count++;
      }
    });

    return Object.entries(stats).map(([id, s]) => {
      const totalResolved = s.won + s.lost;
      return {
        name: repNames[id] || `Rep ${id.slice(0, 4)}`,
        closeRate: totalResolved > 0 ? Math.round((s.won / totalResolved) * 100) : 0,
        avgDealSize: s.count > 0 ? Math.round(s.totalValue / s.count) : 0,
        totalRevenue: s.totalValue
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  } catch (error) {
    console.error("Error fetching rep metrics:", error);
    return [];
  }
}

/**
 * Aggregates revenue by company to calculate Lifetime Value (LTV).
 */
export async function getCompanyLTVStats(userId?: string, userRole?: string) {
  try {
    const isRestricted = userRole === 'rep' && userId;
    
    let requestsRef = query(
      collection(db, "cateringRequests"),
      where("fulfillmentStatus", "==", "Fulfilled")
    );
    
    if (isRestricted) {
      requestsRef = query(requestsRef, where("assignedRepId", "==", userId));
    }

    const requestsSnap = await getDocs(requestsRef);
    const companiesSnap = await getDocs(collection(db, "companies"));
    
    const companyNames: Record<string, string> = {};
    companiesSnap.forEach(c => companyNames[c.id] = c.data().name);

    const ltvMap: Record<string, number> = {};
    requestsSnap.forEach(doc => {
      const data = doc.data();
      if (data.companyId && data.quoteAmount) {
        ltvMap[data.companyId] = (ltvMap[data.companyId] || 0) + data.quoteAmount;
      }
    });

    return Object.entries(ltvMap).map(([id, value]) => ({
      name: companyNames[id] || "Unknown Company",
      value
    })).sort((a, b) => b.value - a.value).slice(0, 10);
  } catch (error) {
    console.error("Error fetching company LTV:", error);
    return [];
  }
}

/**
 * Calculates average pipeline velocity (days spent in each stage).
 */
export async function getPipelineVelocity(userId?: string, userRole?: string) {
  try {
    let leadsRef = query(collection(db, "leads"));
    
    if (userRole === 'rep' && userId) {
      leadsRef = query(leadsRef, where("assignedRepId", "==", userId));
    }

    const leadsSnap = await getDocs(leadsRef);
    const stageDurations: Record<string, number[]> = {};

    leadsSnap.forEach(doc => {
      const data = doc.data();
      const history = data.statusHistory || [];
      if (history.length < 2) return;

      for (let i = 0; i < history.length - 1; i++) {
        const start = history[i].timestamp.toDate();
        const end = history[i+1].timestamp.toDate();
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        
        const stage = history[i].status;
        if (!stageDurations[stage]) stageDurations[stage] = [];
        stageDurations[stage].push(diffDays);
      }
    });

    return Object.entries(stageDurations).map(([stage, durations]) => ({
      stage,
      avgDays: Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
    }));
  } catch (error) {
    console.error("Error fetching pipeline velocity:", error);
    return [];
  }
}
export async function getRepDetailedScorecard(targetRepId: string, callerId?: string, callerRole?: string) {
  try {
    // Security check: Reps can only see their own scorecard
    if (callerRole === 'rep' && callerId !== targetRepId) {
      throw new Error("Permission denied: You can only view your own performance metrics.");
    }

    const now = new Date();
    const repId = targetRepId;
    
    // 1. Leads
    const leadsRef = query(collection(db, "leads"), where("assignedRepId", "==", repId));
    const leadsSnap = await getDocs(leadsRef);
    const leads = leadsSnap.docs.map(d => d.data());
    
    const assigned = leads.length;
    const contacted = leads.filter(l => l.status !== "New").length;
    const signups = leads.filter(l => l.status === "Won").length;
    
    // 2. Tasks
    const tasksRef = query(
      collection(db, "tasks"), 
      where("assignedRepId", "==", repId), 
      where("status", "==", "Upcoming")
    );
    const tasksSnap = await getDocs(tasksRef);
    const overdue = tasksSnap.docs.filter(d => d.data().dueDate.toDate() < now).length;
    
    // 3. Companies & Orders
    const companiesRef = query(collection(db, "companies"), where("assignedRepId", "==", repId));
    const companiesSnap = await getDocs(companiesRef);
    const companies = companiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const firstOrders = companies.filter((c: any) => c.firstOrderPlaced).length;
    const activeAccounts = companies.filter((c: any) => c.activeMembershipId).length;
    
    // 4. Revenue & Commissions
    const requestsRef = query(
      collection(db, "cateringRequests"), 
      where("assignedRepId", "==", repId),
      where("fulfillmentStatus", "==", "Fulfilled")
    );
    const requestsSnap = await getDocs(requestsRef);
    
    let totalRevenue = 0;
    let commissionRevenue = 0;
    
    requestsSnap.forEach(doc => {
      const data = doc.data();
      const amount = data.quoteAmount || 0;
      totalRevenue += amount;
      if (amount >= 200) { // Standard qualifying threshold
        commissionRevenue += amount;
      }
    });

    return {
      assigned,
      contacted,
      overdue,
      signups,
      firstOrders,
      activeAccounts,
      totalRevenue,
      commissionRevenue
    };
  } catch (error) {
    console.error("Error fetching rep scorecard:", error);
    return null;
  }
}

/**
 * Fetches pipeline funnel metrics for the dashboard.
 */
export async function getPipelineFunnelStats(userId?: string, userRole?: string) {
  try {
    const isRestricted = userRole === 'rep' && userId;
    
    let leadsRef = query(collection(db, "leads"));
    let membershipsRef = query(collection(db, "memberships"));
    let companiesRef = query(collection(db, "companies"));
    
    if (isRestricted) {
       leadsRef = query(leadsRef, where("assignedRepId", "==", userId));
       // Memberships/Companies filtering logic could be added here if needed
       companiesRef = query(companiesRef, where("assignedRepId", "==", userId));
    }

    const [leadsSnap, membershipsSnap, companiesSnap] = await Promise.all([
      getDocs(leadsRef),
      getDocs(membershipsRef),
      getDocs(companiesRef)
    ]);
    
    const leads = leadsSnap.docs.map(d => d.data());
    const memberships = membershipsSnap.docs.map(d => d.data());
    const companies = companiesSnap.docs.map(d => d.data());
    
    return {
      newLeads: leads.filter(l => l.status === "New").length,
      contactedLeads: leads.filter(l => l.status === "Contacted").length,
      qualifiedLeads: leads.filter(l => l.status === "Won").length,
      enrolledAccounts: memberships.filter(m => m.active).length,
      noFirstOrder: companies.filter((c: any) => !c.firstOrderPlaced && c.activeMembershipId).length,
      activeMemberships: memberships.filter(m => m.status === 'Active' && m.active).length,
      expiringMemberships: memberships.filter(m => m.status === 'Expiring' && m.active).length,
      renewedMemberships: memberships.filter(m => m.status === 'Renewed').length,
    };
  } catch (error) {
    console.error("Error fetching funnel stats:", error);
    return null;
  }
}

/**
 * Fetches operational monitoring alerts (SLAs).
 */
export async function getOpsMonitoringAlerts(userId?: string, userRole?: string) {
  try {
    const isRestricted = userRole === 'rep' && userId;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    let tasksRef = query(
      collection(db, "tasks"), 
      where("status", "==", "Upcoming")
    );
    let leadsRef = query(collection(db, "leads"));
    let companiesRef = query(collection(db, "companies"));
    let membershipsRef = query(collection(db, "memberships"), where("status", "==", "Expiring"), where("active", "==", true));
    
    if (isRestricted) {
      tasksRef = query(tasksRef, where("assignedRepId", "==", userId));
      leadsRef = query(leadsRef, where("assignedRepId", "==", userId));
      companiesRef = query(companiesRef, where("assignedRepId", "==", userId));
    }

    const [tasksSnap, leadsSnap, companiesSnap, membershipsSnap] = await Promise.all([
      getDocs(tasksRef),
      getDocs(leadsRef),
      getDocs(companiesRef),
      getDocs(membershipsRef)
    ]);
    
    const alerts = {
      extremeOverdueTasks: tasksSnap.docs.filter(d => d.data().dueDate.toDate() < threeDaysAgo).length,
      untouchedNewLeads: leadsSnap.docs.filter(d => {
        const data = d.data();
        return data.status === "New" && data.createdAt.toDate() < oneDayAgo;
      }).length,
      inactiveEnrolled: companiesSnap.docs.filter((c: any) => {
        const data = c.data();
        return data.activeMembershipId && !data.firstOrderPlaced && data.createdAt.toDate() < oneDayAgo;
      }).length,
      expiringNoOutreach: membershipsSnap.docs.length, // This is a simplified check
    };
    
    return alerts;
  } catch (error) {
    console.error("Error fetching ops alerts:", error);
    return null;
  }
}
