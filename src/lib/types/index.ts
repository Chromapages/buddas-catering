export type Role = 'owner' | 'rep' | 'marketing' | 'ops';

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Quote Sent'
  | 'Membership Discussed'
  | 'Won'
  | 'Lost'
  | 'Fulfilled'
  | 'Commission Approved';

export type MembershipTier = '2' | '4' | '6';

export type FulfillmentStatus = 'Pending' | 'In Progress' | 'Fulfilled' | 'Cancelled';

export interface Company {
  id: string; // Document ID
  name: string;
  companyType?: string;
  address?: string;
  website?: string;
  phone?: string;
  industry?: string;
  assignedRepId?: string;
  activeMembershipId?: string;
  totalEventsCompleted: number;
  notes?: string;
  sourceHistory: string[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface Contact {
  id: string; // Document ID
  fullName: string;
  email: string;
  phone?: string;
  title?: string;
  companyId: string;
  preferredContactMethod?: string;
  notes?: string;
  createdAt: string; // ISO String
}

export interface Lead {
  id: string; // Document ID
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  assignedRepId?: string;
  status: LeadStatus;
  
  // Attribution
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  refCode?: string;
  landingPageSlug?: string;
  referringUrl?: string;

  isDuplicate: boolean;
  needsReview: boolean;
  
  createdAt: string; // ISO String
  lastActivityAt: string; // ISO String
  statusChangedAt: string; // ISO String
}

export interface CateringRequest {
  id: string; // Document ID
  leadId: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  assignedRepId?: string;
  
  eventType: string;
  cateringNeed: 'Breakfast' | 'Lunch' | 'Pastries' | 'Not Sure Yet';
  estimatedGroupSize: number;
  preferredDate?: string; // ISO String
  
  quoteAmount?: number;
  fulfillmentStatus?: FulfillmentStatus;
  notes?: string;
  
  createdAt: string; // ISO String
}

export interface Membership {
  id: string; // Document ID
  companyId: string;
  tier: MembershipTier;
  discountPercent: number;
  eventsCommitted: number;
  eventsCompleted: number;
  includesDelivery: boolean;
  includesSetup: boolean;
  startDate: string; // ISO String
  renewalDate: string; // ISO String
  active: boolean;
  notes?: string;
  createdAt: string; // ISO String
}

export interface CommissionApproval {
  id: string; // Document ID
  cateringRequestId: string;
  repId: string;
  eligible: boolean;
  approved: boolean;
  approvedById?: string;
  approvedAt?: string; // ISO String
  notes?: string;
  createdAt: string; // ISO String
}

export interface Activity {
  id: string; // Document ID
  entityType: 'company' | 'contact' | 'lead' | 'cateringRequest' | 'membership' | 'commissionApproval';
  entityId: string;
  
  actionType: string;
  // Payload for the activity
  data: Record<string, any>;
  
  actorId?: string; // System if undefined
  actorName?: string;
  
  createdAt: string; // ISO String
}

export interface AppUser {
  id: string; // Matches Firebase Auth UID
  email: string;
  displayName: string;
  role: Role;
  active: boolean;
  createdAt: string; // ISO String
}
