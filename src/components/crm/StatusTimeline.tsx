"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivitiesByEntity } from "@/lib/firebase/services/base";
import { format } from "date-fns";
import { Loader2, Clock } from "lucide-react";

interface Props {
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST";
  entityId: string;
  /** Static seed events shown below Firestore activities (e.g. "Lead Created") */
  seedEvents?: { label: string; timestamp?: number; color?: string }[];
}

const ACTION_LABELS: Record<string, string> = {
  LEAD_CREATED: "Lead created",
  LEAD_UPDATED: "Lead updated",
  LEAD_STATUS_CHANGED: "Status changed",
  LEAD_CONVERTED: "Converted to company",
  REQUEST_CREATED: "Request created",
  REQUEST_UPDATED: "Request updated",
  REQUEST_COMPLETED: "Request fulfilled",
  REQUEST_INVOICED: "Invoice processed",
  COMMISSION_AUTO_GENERATED: "Commission auto-generated",
  SUBMITTED_FOR_APPROVAL: "Submitted for approval",
  PROGRAM_SIGNUP_APPROVED: "Application approved",
  PROGRAM_SIGNUP_REJECTED: "Application rejected",
  MEMBERSHIP_EVENT_USED: "Membership event used",
};

function dotColor(action: string) {
  if (action.includes("CREATED")) return "bg-teal-base";
  if (action.includes("COMPLETED") || action.includes("APPROVED")) return "bg-green-500";
  if (action.includes("REJECTED") || action.includes("DELETED")) return "bg-red-400";
  if (action.includes("COMMISSION") || action.includes("APPROVAL")) return "bg-yellow-400";
  return "bg-brown/40";
}

export function StatusTimeline({ entityType, entityId, seedEvents = [] }: Props) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", entityType, entityId],
    queryFn: () => getActivitiesByEntity(entityType, entityId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-brown/40 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading activity...
      </div>
    );
  }

  if (activities.length === 0 && seedEvents.length === 0) {
    return (
      <div className="flex items-center gap-2 py-6 text-brown/40 text-sm">
        <Clock className="w-4 h-4" /> No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((a: any, i: number) => (
        <div key={a.id} className={`relative pl-6 ${i < activities.length - 1 || seedEvents.length > 0 ? "border-l-2 border-gray-border/60 pb-5" : "pb-2"}`}>
          <div className={`absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 border-white shadow-sm ${dotColor(a.actionType)}`} />
          <p className="text-sm font-medium text-brown leading-snug">
            {ACTION_LABELS[a.actionType] ?? a.actionType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            {a.actorName && a.actorName !== "System" && (
              <span className="text-xs text-brown/50">by {a.actorName}</span>
            )}
            <span className="text-xs text-brown/40 font-mono">
              {a.createdAt?.seconds ? format(a.createdAt.seconds * 1000, "MMM d, yyyy 'at' h:mm a") : "Recently"}
            </span>
          </div>
          {a.data && Object.keys(a.data).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {Object.entries(a.data).map(([k, v]) => (
                <span key={k} className="text-[10px] font-mono bg-gray-bg px-1.5 py-0.5 rounded border border-gray-border/50 text-brown/50">
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {seedEvents.map((e, i) => (
        <div key={i} className={`relative pl-6 ${i < seedEvents.length - 1 ? "border-l-2 border-gray-border/60 pb-5" : "pb-2"}`}>
          <div className={`absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 border-white shadow-sm ${e.color ?? "bg-orange"}`} />
          <p className="text-sm font-medium text-brown">{e.label}</p>
          {e.timestamp && (
            <span className="text-xs text-brown/40 font-mono mt-0.5 block">
              {format(e.timestamp, "MMM d, yyyy 'at' h:mm a")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
