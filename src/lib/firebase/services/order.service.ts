import { CateringRequest, Company } from "@/types/crm";
import { Membership } from "../../types";
import { getAllCateringRequests, getCateringRequestById } from "./request.service";
import { getCompanyById } from "./company.service";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config";

export interface EnhancedOrder extends CateringRequest {
  isProgramOrder: boolean;
  programTier?: string;
  potentialDiscount?: number;
  companyDetails?: Company;
  assignedRepName?: string;
}

/**
 * Fetches all orders and enhances them with program/membership info.
 */
export async function getAllEnhancedOrders(userId?: string, userRole?: string): Promise<EnhancedOrder[]> {
  const requests = await getAllCateringRequests(userId, userRole);
  
  // Enhancement logic (can be optimized with a batch fetch if needed)
  const enhancedOrders = await Promise.all(requests.map(async (req) => {
    return enhanceOrder(req as CateringRequest);
  }));

  return enhancedOrders;
}

/**
 * Enhances a single order with membership and company data.
 */
export async function enhanceOrder(order: CateringRequest): Promise<EnhancedOrder> {
  const enhanced: EnhancedOrder = { ...order, isProgramOrder: false };

  try {
    // 1. Get Company info
    if (order.companyId) {
      const company = await getCompanyById(order.companyId);
      if (company) {
        enhanced.companyDetails = company;
      }

      // 2. Check for active membership
      const membershipsRef = collection(db, "memberships");
      const q = query(
        membershipsRef, 
        where("companyId", "==", order.companyId), 
        where("active", "==", true)
      );
      const membershipSnap = await getDocs(q);

      if (!membershipSnap.empty) {
        const membership = membershipSnap.docs[0].data() as Membership;
        enhanced.isProgramOrder = true;
        enhanced.programTier = membership.tier;
        enhanced.potentialDiscount = membership.discountPercent;
      }
    }
  } catch (error) {
    console.error(`Error enhancing order ${order.id}:`, error);
  }

  return enhanced;
}

/**
 * Get a single enhanced order by ID.
 */
export async function getEnhancedOrderById(id: string): Promise<EnhancedOrder | null> {
  const order = await getCateringRequestById(id);
  if (!order) return null;
  return enhanceOrder(order as CateringRequest);
}
