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

export type FulfillmentStatus = 'Pending' | 'In Progress' | 'Fulfilled' | 'Invoiced' | 'Cancelled';

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
  totalEventsCompleted?: number;
  firstOrderPlaced?: boolean;
  notes?: string;
  sourceHistory: string[];
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
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
  createdAt: any; // Firestore Timestamp
}

export interface StatusHistoryEntry {
  status: LeadStatus;
  timestamp: any; // Firestore Timestamp
}

export interface Lead {
  id: string; // Document ID
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  assignedRepId?: string;
  assignedRepName?: string;
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
  archived?: boolean;
  isWaitlist?: boolean;
  
  createdAt: any; // Firestore Timestamp
  lastActivityAt: any; // Firestore Timestamp
  statusChangedAt: any; // Firestore Timestamp
  convertedAt?: any; // Firestore Timestamp
  statusHistory?: StatusHistoryEntry[];
}

export interface CateringRequest {
  id: string; // Document ID
  leadId: string;
  assignedRepId?: string;
  assignedRepName?: string;
  
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;

  eventType?: string;
  cateringNeed: 'Breakfast' | 'Lunch' | 'Pastries' | 'Not Sure Yet';
  estimatedGroupSize: number;
  preferredDate?: string; // ISO String
  
  quoteAmount?: number;
  fulfillmentStatus?: FulfillmentStatus;
  notes?: string;
  
  createdAt: any; // Firestore Timestamp
}

export type MembershipStatus = 'Pending' | 'Active' | 'Expiring' | 'Lapsed' | 'Renewed';

export interface Membership {
  id: string; // Document ID
  companyId: string;
  tier: MembershipTier;
  status: MembershipStatus;
  discountPercent: number;
  eventsCommitted: number;
  eventsCompleted: number;
  firstOrderPlaced: boolean;
  includesDelivery: boolean;
  includesSetup: boolean;
  startDate: any; // Firestore Timestamp
  renewalDate: any; // Firestore Timestamp
  active: boolean;
  notes?: string;
  createdAt: any; // Firestore Timestamp
}

export interface CommissionApproval {
  id: string; // Document ID
  cateringRequestId: string;
  repId: string;
  eligible: boolean;
  approved: boolean;
  approvedById?: string;
  approvedAt?: any; // Firestore Timestamp
  notes?: string;
  createdAt: any; // Firestore Timestamp
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
  
  createdAt: any; // Firestore Timestamp
}

export interface AppUser {
  id: string; // Matches Firebase Auth UID
  email: string;
  displayName: string;
  role: Role;
  active: boolean;
  createdAt: string; // ISO String
}

export type ProgramTier = '2_events' | '4_events' | '6_events';
export type ProgramStatus = 'Pending' | 'Active' | 'Declined';

export interface ProgramSignup {
  id: string;
  // Section A — Business Info
  businessName: string;
  contactName: string;
  jobTitle?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  zipCode?: string;
  preferredContactMethod: 'Call' | 'Text' | 'Email';
  // Section B — Org Type
  organizationType: string;
  // Section C — Program Selection
  programTier: ProgramTier;
  // Section D — Catering Needs
  estimatedGroupSize: string;
  interestedIn: string[];
  typicalEventTypes: string[];
  estimatedFirstOrderDate?: string;
  preferredOrderingFrequency?: string;
  preferredMenuItems?: string[];
  dietaryRestrictions?: string[];
  deliveryOrPickup: 'Delivery' | 'Pickup' | 'Both';
  additionalNotes?: string;
  // CRM meta
  status: ProgramStatus;
  assignedRepId?: string;
  linkedLeadId?: string;
  createdAt: any; // Firestore Timestamp
}
