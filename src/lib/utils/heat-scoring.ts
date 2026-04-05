import { Lead } from "@/types/crm";

type ActivityRecord = {
  createdAt?: { toDate?: () => Date } | Date | null;
};

function toDate(value?: ActivityRecord["createdAt"] | Lead["createdAt"] | Lead["lastActivityAt"]) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return null;
}

function getSourceScore(source?: string) {
  const normalizedSource = source?.trim().toLowerCase();

  if (!normalizedSource) return 6;
  if (normalizedSource.includes("referral")) return 15;
  if (normalizedSource.includes("repeat")) return 15;
  if (normalizedSource.includes("direct")) return 12;
  if (normalizedSource.includes("website")) return 8;
  if (normalizedSource.includes("social")) return 6;

  return 5;
}

function getFulfillmentProbabilityScore(lead: Lead) {
  const statusProbability: Record<Lead["status"], number> = {
    New: 0.2,
    Contacted: 0.45,
    "Quote Sent": 0.72,
    Approved: 0.88,
    Won: 1,
    Lost: 0.05,
  };

  return Math.round((statusProbability[lead.status] ?? 0.2) * 25);
}

/**
 * Calculates a lead "Heat Score" from 0-100 based on recent engagement and buying intent.
 */
export function calculateLeadHeat(lead: Lead, activities: ActivityRecord[] = []): number {
  const now = new Date();
  const sortedActivities = [...activities].sort((a, b) => {
    const left = toDate(a.createdAt)?.getTime() ?? 0;
    const right = toDate(b.createdAt)?.getTime() ?? 0;
    return right - left;
  });

  const lastTouchDate =
    toDate(sortedActivities[0]?.createdAt) ??
    toDate(lead.lastActivityAt) ??
    toDate(lead.updatedAt) ??
    toDate(lead.createdAt);

  let score = 0;

  if (lastTouchDate) {
    const ageInHours = (now.getTime() - lastTouchDate.getTime()) / (1000 * 60 * 60);

    if (ageInHours <= 24) score += 35;
    else if (ageInHours <= 72) score += 26;
    else if (ageInHours <= 168) score += 16;
    else if (ageInHours <= 336) score += 8;
  }

  const recentActivityCount = sortedActivities.filter((activity) => {
    const activityDate = toDate(activity.createdAt);
    if (!activityDate) return false;
    return (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  score += Math.min(recentActivityCount * 8, 25);
  score += getSourceScore(lead.source);
  score += getFulfillmentProbabilityScore(lead);

  return Math.max(0, Math.min(Math.round(score), 100));
}

/**
 * Returns UI metadata for rendering a heat state.
 */
export function getHeatMetadata(score: number): { label: string; color: string; bg: string; ring: string } {
  if (score >= 80) return { label: "Hot", color: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" };
  if (score >= 60) return { label: "Warm", color: "text-orange-700", bg: "bg-orange-50", ring: "ring-orange-200" };
  if (score >= 35) return { label: "Active", color: "text-teal-700", bg: "bg-teal-50", ring: "ring-teal-200" };
  return { label: "Cool", color: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200" };
}
