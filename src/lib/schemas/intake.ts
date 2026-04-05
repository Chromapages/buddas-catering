import { z } from "zod";

export const intakeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  company: z.string().min(2, "Company name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  eventType: z.string().min(1, "Please select an event type."),
  cateringNeed: z.enum(["Breakfast", "Lunch", "Pastries", "Not Sure Yet"]),
  estimatedGroupSize: z.number().int().min(10, "Group size must be at least 10."),
  preferredDate: z.string().optional().refine((dateStr) => {
    if (!dateStr) return true; // Optional
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, { message: "Preferred date must be in the future." }),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),

  // Hidden attribution fields
  source: z.string().default("direct"),
  medium: z.string().default("none"),
  campaign: z.string().optional(),
  content: z.string().optional(),
  refCode: z.string().optional(),
  landingPageSlug: z.string().optional(),
  referringUrl: z.string().optional(),

  // Optional explicit assignment
  assignedRepId: z.string().optional(),
  assignedRepName: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof intakeSchema>;
