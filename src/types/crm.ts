import { Timestamp } from "firebase/firestore";

export type LeadStatus = "New" | "Contacted" | "Quote Sent" | "Approved" | "Lost" | "Won";

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source?: string;
  assignedRepId?: string;
  cateringNeed?: string;
  estimatedGroupSize?: number;
  notes?: string;
  companyId?: string;
  contactId?: string;
  cateringRequestId?: string;
  utm_campaign?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  convertedAt?: Timestamp;
  lastActivityAt?: Timestamp;
  statusChangedAt?: Timestamp;
  statusHistory?: { status: LeadStatus; timestamp: Timestamp }[];
  followUpDate?: string;
  quoteAmount?: number;
  archived?: boolean;
  bookedCallDate?: Timestamp;
  isWaitlist?: boolean;
}

export interface CommissionApproval {
  id: string;
  repId: string;
  repName: string;
  cateringRequestId: string;
  amount: number;
  approved: boolean;
  eligible: boolean;
  approvedById?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
}

export interface Company {
  id: string;
  name: string;
  companyType?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  activeMembershipId?: string; // To be deprecated in favor of activeCommitmentId
  activeCommitmentId?: string;
  assignedRepId?: string;
  firstOrderPlaced?: boolean;
  totalOrdersCompleted?: number;
  sourceHistory?: string[];
  notes?: string;
  status?: "Active" | "Inactive" | "Lapsed" | "Lead";
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Contact {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  phone?: string;
  title?: string;
  role?: string; // e.g. "Decision Maker", "Billing", "On-site Lead"
  isPrimary: boolean;
  companyName?: string; // Denormalized for display
  name?: string; // Alias for fullName
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type FulfillmentStatus = "Pending" | "Confirmed" | "Fulfilled" | "Invoiced" | "Paid" | "Cancelled" | "Commission Approved" | "Commission Rejected";

export interface CateringRequest {
  id: string;
  leadId?: string;
  companyId: string;
  contactId: string; // The specific contact for this request
  contactName?: string;
  cateringNeed: string;
  estimatedGroupSize: number;
  fulfillmentStatus: FulfillmentStatus;
  preferredDate?: string;
  quoteAmount?: number;
  assignedRepId?: string;
  assignedRepName?: string;
  companyName?: string;
  eventType?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface CRMNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  link?: string;
  createdAt: Timestamp;
}

export type ActivityActionType = 
  | "STATUS_CHANGE" 
  | "NOTE_ADDED" 
  | "TASK_COMPLETED" 
  | "OWNERSHIP_CHANGE" 
  | "COMMITMENT_USAGE" 
  | "QUALIFICATION_EVENT" 
  | "CONVERSION";

export interface Activity {
  id: string;
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST" | "COMMITMENT";
  entityId: string;
  actionType: ActivityActionType | string;
  subType?: string; // Further granular distinction
  data: {
    previousValue?: any;
    newValue?: any;
    orderId?: string; // For commitment usage tracking
    reason?: string;
    [key: string]: any;
  };
  actorId: string;
  actorName: string;
  createdAt: Timestamp;
}

export type CommitmentStatus = 'Pending' | 'Active' | 'Expiring' | 'Lapsed' | 'Renewed';

export interface Commitment {
  id: string;
  companyId: string;
  tier: number;
  status: CommitmentStatus;
  ordersCommitted: number;
  ordersUsed: number;
  ordersRemaining: number;
  startDate: Timestamp;
  endDate: Timestamp;
  renewalDate: Timestamp; // Keep for legacy/UI display
  firstOrderPlaced: boolean;
  discountPercent: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type TaskStatus = 'Upcoming' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface CRMTask {
  id: string;
  subject: string;
  description?: string;
  dueDate: Timestamp;
  status: TaskStatus;
  priority: TaskPriority;
  assignedRepId: string;
  entityType: 'LEAD' | 'COMPANY' | 'CONTACT' | 'REQUEST';
  entityId: string;
  entityName: string; // Cached for quick display
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp;
}
