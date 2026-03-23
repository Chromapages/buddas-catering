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
    requestsSnap.forEach(doc => {
      pipelineValue += (doc.data().quoteAmount || 0);
    });

    return {
      totalLeads: leadsSnap.data().count,
      pipelineValue,
      activeMemberships: membershipsSnap.data().count,
      winRate
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { totalLeads: 0, pipelineValue: 0, activeMemberships: 0, winRate: 0 };
  }
}

/**
 * Fetches recent activity for the dashboard feed.
 */
export async function getRecentActivity(limitCount: number = 10) {
  try {
    const activitiesRef = collection(db, "activities");
    const q = query(activitiesRef, orderBy("createdAt", "desc"), limit(limitCount));
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
      results.push({
        id: docSnap.id,
        type: 'COMPANY',
        title: docSnap.data().name,
        subtitle: 'Company Profile',
        link: `/app/companies/${docSnap.id}`
      });
    });

    return results;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}
