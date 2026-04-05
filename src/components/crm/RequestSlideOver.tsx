"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Building2, DollarSign, Users, UserRound, Link2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { ActivityLog } from "@/components/crm/ActivityLog";
import { useAuth } from "@/lib/firebase/context/auth";
import { getActivitiesByEntity, logActivity } from "@/lib/firebase/services/base";
import { updateCateringRequest } from "@/lib/firebase/services/request.service";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type RequestStatus = "Pending" | "Confirmed" | "Fulfilled" | "Invoiced" | "Paid" | "Cancelled";

interface RequestRecord {
  id: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  companyId?: string;
  contactId?: string;
  cateringNeed?: string;
  eventType?: string;
  estimatedGroupSize?: number;
  preferredDate?: string;
  quoteAmount?: number;
  fulfillmentStatus?: RequestStatus;
  notes?: string;
  assignedRepName?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface ActivityRecord {
  id?: string;
  actionType?: string;
  actorName?: string;
  createdAt?: unknown;
  data?: Record<string, string | number | boolean | null | undefined>;
}

interface RequestSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestRecord | null;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Fulfilled", label: "Fulfilled" },
  { value: "Invoiced", label: "Invoiced" },
  { value: "Paid", label: "Paid" },
  { value: "Cancelled", label: "Cancelled" },
];

export function RequestSlideOver({ isOpen, onClose, request, onSuccess }: RequestSlideOverProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    eventType: "",
    estimatedGroupSize: "",
    preferredDate: "",
    quoteAmount: "",
    fulfillmentStatus: "Pending" as RequestStatus,
    notes: "",
  });

  useEffect(() => {
    if (!request) return;

    setForm({
      companyName: request.companyName || "",
      contactName: request.contactName || "",
      eventType: request.cateringNeed || request.eventType || "",
      estimatedGroupSize: request.estimatedGroupSize ? String(request.estimatedGroupSize) : "",
      preferredDate: request.preferredDate || "",
      quoteAmount: request.quoteAmount != null ? String(request.quoteAmount) : "",
      fulfillmentStatus: request.fulfillmentStatus || "Pending",
      notes: request.notes || "",
    });

    void fetchActivities(request.id);
  }, [request]);

  async function fetchActivities(requestId: string) {
    const data = await getActivitiesByEntity("REQUEST", requestId);
    setActivities(data as ActivityRecord[]);
  }

  if (!isOpen || !request) return null;

  const handleSave = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const previousStatus = request.fulfillmentStatus || "Pending";
      const nextStatus = form.fulfillmentStatus;

      await updateCateringRequest(request.id, {
        companyName: form.companyName,
        contactName: form.contactName,
        cateringNeed: form.eventType,
        eventType: form.eventType,
        estimatedGroupSize: Number(form.estimatedGroupSize || 0),
        preferredDate: form.preferredDate || undefined,
        quoteAmount: form.quoteAmount === "" ? undefined : Number(form.quoteAmount),
        fulfillmentStatus: nextStatus,
        notes: form.notes,
      });

      if (previousStatus !== nextStatus) {
        await logActivity(
          "REQUEST",
          request.id,
          "STATUS_CHANGE",
          { previousValue: previousStatus, newValue: nextStatus },
          user.uid,
          user.displayName || "User"
        );
      }

      toast.success("Request updated");
      await fetchActivities(request.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Failed to update request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "Pending":
        return <Badge variant="warning">{status}</Badge>;
      case "Confirmed":
        return <Badge variant="default">{status}</Badge>;
      case "Fulfilled":
      case "Paid":
        return <Badge variant="success">{status}</Badge>;
      case "Cancelled":
        return <Badge variant="danger">{status}</Badge>;
      case "Invoiced":
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-brown/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out sm:w-[560px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-start justify-between border-b border-gray-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold font-heading text-teal-dark">{request.companyName || "Untitled Request"}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-brown/70">{request.contactName || "No contact name"}</span>
              <span className="text-gray-border">•</span>
              <span className="text-sm text-brown/50">Created {formatDate(request.createdAt, "MMM d")}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-brown/40 hover:bg-gray-bg hover:text-brown transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          <div className="rounded-xl border border-gray-border bg-gray-bg/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brown/70">Request Status</h3>
            <div className="flex items-center gap-3">
              {getStatusBadge(form.fulfillmentStatus)}
              <Select
                className="flex-1 bg-white"
                value={form.fulfillmentStatus}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    fulfillmentStatus: e.target.value as RequestStatus,
                  }))
                }
                options={STATUS_OPTIONS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="border-b border-gray-border pb-2 text-sm font-semibold uppercase tracking-wider text-brown/70">
                Request Details
              </h3>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((current) => ({ ...current, companyName: e.target.value }))}
                placeholder="Company name"
              />
              <Input
                value={form.contactName}
                onChange={(e) => setForm((current) => ({ ...current, contactName: e.target.value }))}
                placeholder="Contact name"
              />
              <Input
                value={form.eventType}
                onChange={(e) => setForm((current) => ({ ...current, eventType: e.target.value }))}
                placeholder="Event type"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  value={form.estimatedGroupSize}
                  onChange={(e) => setForm((current) => ({ ...current, estimatedGroupSize: e.target.value }))}
                  placeholder="Group size"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quoteAmount}
                  onChange={(e) => setForm((current) => ({ ...current, quoteAmount: e.target.value }))}
                  placeholder="Quote amount"
                />
              </div>
              <Input
                type="date"
                value={form.preferredDate}
                onChange={(e) => setForm((current) => ({ ...current, preferredDate: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <h3 className="border-b border-gray-border pb-2 text-sm font-semibold uppercase tracking-wider text-brown/70">
                Snapshot
              </h3>
              <div className="space-y-3 rounded-xl border border-gray-border bg-white p-4">
                <DetailRow icon={Building2} label="Company" value={request.companyName || "Not set"} />
                <DetailRow icon={UserRound} label="Contact" value={request.contactName || "Not set"} />
                <DetailRow icon={Calendar} label="Preferred Date" value={request.preferredDate || "TBD"} />
                <DetailRow
                  icon={Users}
                  label="Group Size"
                  value={request.estimatedGroupSize ? `${request.estimatedGroupSize} guests` : "Unknown"}
                />
                <DetailRow
                  icon={DollarSign}
                  label="Quote"
                  value={
                    request.quoteAmount != null
                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(request.quoteAmount)
                      : "Not quoted"
                  }
                />
                <DetailRow icon={Link2} label="Assigned Rep" value={request.assignedRepName || "Unassigned"} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brown/45">Internal Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                  rows={6}
                  className="w-full rounded-xl border border-gray-border bg-white p-3 text-sm text-brown outline-none transition-colors focus:border-teal-base focus:ring-2 focus:ring-teal-base/20"
                  placeholder="Venue notes, menu notes, client concerns, setup details..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b border-gray-border pb-2 text-sm font-semibold uppercase tracking-wider text-brown/70">
              Activity Timeline
            </h3>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={activity.id || index} className="relative border-l-2 border-gray-border/50 pb-2 pl-6 last:border-l-transparent">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-teal-base" />
                    <p className="text-sm font-medium text-brown">
                      {activity.actionType === "STATUS_CHANGE"
                        ? `Status changed to ${String(activity.data?.newValue || "updated")}`
                        : activity.actionType === "NOTE_ADDED"
                          ? "Note added"
                          : activity.actionType || "Activity logged"}
                    </p>
                    <p className="mt-1 text-xs text-brown/50">
                      {formatDate(activity.createdAt, "MMM d, h:mm a")} by {activity.actorName || "System"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm italic text-brown/50">No request activity logged yet.</p>
              )}
            </div>

            <ActivityLog
              entityId={request.id}
              entityType="REQUEST"
              entityName={request.companyName || request.contactName || "Request"}
              onSuccess={() => {
                void fetchActivities(request.id);
                onSuccess?.();
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-border bg-gray-50 p-4">
          <div className="text-xs text-brown/50">
            Updated {request.updatedAt ? formatDate(request.updatedAt, "MMM d, yyyy h:mm a") : "not yet"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-brown/40" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-brown/40">{label}</p>
        <p className="text-brown">{value}</p>
      </div>
    </div>
  );
}
