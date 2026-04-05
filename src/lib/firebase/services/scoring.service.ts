import { Lead } from "@/types/crm";
import { differenceInDays } from "date-fns";

export interface LeadScore {
  score: number;
  heat: "Cold" | "Warm" | "Hot";
  factors: string[];
}

/**
 * Calculates a "Heat Score" for a lead based on activity, status, and value.
 * This is used to prioritize the rep's daily tasks.
 */
export function calculateLeadScore(lead: Lead): LeadScore {
  let score = 50; // Base score
  const factors: string[] = [];

  // 1. Recency of Activity
  const lastTouch = lead.lastActivityAt?.toDate() || lead.createdAt?.toDate() || new Date();
  const daysSinceTouch = differenceInDays(new Date(), lastTouch);

  if (daysSinceTouch <= 1) {
    score += 20;
    factors.push("Recent activity (within 24h)");
  } else if (daysSinceTouch > 7) {
    score -= 30;
    factors.push("Stale (no activity for 7+ days)");
  } else if (daysSinceTouch > 3) {
    score -= 10;
    factors.push("Aging (no activity for 3+ days)");
  }

  // 2. Status Intent
  switch (lead.status) {
    case "Quote Sent":
      score += 30;
      factors.push("Proposal in hand");
      break;
    case "Contacted":
      score += 15;
      factors.push("Active dialogue");
      break;
    case "Won":
      score += 100; // Peak
      break;
    case "Lost":
      score = 0;
      factors.push("Closed Lost");
      break;
  }

  // 3. Booked Calls (High Priority)
  if (lead.bookedCallDate) {
    score += 25;
    factors.push("Upcoming kick-off call");
  }

  // 4. Value / Potential
  if (lead.quoteAmount && lead.quoteAmount > 5000) {
    score += 15;
    factors.push("High-value opportunity (>$5k)");
  }

  // Determine Heat Level
  let heat: "Cold" | "Warm" | "Hot" = "Warm";
  if (score >= 80) heat = "Hot";
  else if (score < 40) heat = "Cold";

  return { score: Math.max(0, Math.min(score, 100)), heat, factors };
}

/**
 * Sorts leads by their heat score (Hot first).
 */
export function sortLeadsByHeat(leads: Lead[]): (Lead & { scoring: LeadScore })[] {
  return leads
    .map(lead => ({
      ...lead,
      scoring: calculateLeadScore(lead)
    }))
    .sort((a, b) => b.scoring.score - a.scoring.score);
}
