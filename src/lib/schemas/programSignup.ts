import { z } from "zod";

export const programSignupSchema = z.object({
  // Section A — Business Information
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  jobTitle: z.string().optional(),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email address is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  preferredContactMethod: z.enum(["Call", "Text", "Email"]),

  // Section B — Organization Type
  organizationType: z.string().min(1, "Please select an organization type"),

  // Section C — Program Selection
  programTier: z.enum(["2_events", "4_events", "6_events"]),

  // Section D — Catering Needs
  estimatedGroupSize: z.string().min(1, "Please estimate your group size"),
  interestedIn: z.array(z.string()).min(1, "Please select at least one interest"),
  typicalEventTypes: z.array(z.string()).min(1, "Please select at least one event type"),
  estimatedFirstOrderDate: z.string().optional(),
  preferredOrderingFrequency: z.string().optional(),
  preferredMenuItems: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  deliveryOrPickup: z.enum(["Delivery", "Pickup", "Both"]),
  additionalNotes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export type ProgramSignupFormData = z.infer<typeof programSignupSchema>;
