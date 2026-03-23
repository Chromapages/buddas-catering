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
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Company {
  id: string;
  name: string;
  companyType?: string;
  website?: string;
  address?: string;
  assignedRepId?: string;
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
  createdAt: Timestamp;
}

export interface CateringRequest {
  id: string;
  companyId: string;
  contactId: string;
  cateringNeed: string;
  estimatedGroupSize: number;
  fulfillmentStatus: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  preferredDate?: string;
  quoteAmount?: number;
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

export interface Activity {
  id: string;
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST";
  entityId: string;
  actionType: string;
  data: any;
  actorId: string;
  actorName: string;
  createdAt: Timestamp;
}

export interface Membership {
  id: string;
  companyId: string;
  tier: number;
  eventsCommitted: number;
  eventsCompleted: number;
  discountPercent: number;
  active: boolean;
  renewalDate: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
