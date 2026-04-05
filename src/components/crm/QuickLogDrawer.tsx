"use client";

import { useEffect, useState } from "react";
import { X, Phone, Mail, Users, MessageSquare, Clock, Plus, Loader2, RefreshCw, Search, Zap } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import { logActivity } from "@/lib/firebase/services/base";
import { createTask } from "@/lib/firebase/services/task.service";
import { searchCrm } from "@/lib/firebase/services/crm";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

type ActivityType = "CALL" | "EMAIL" | "MEETING" | "NOTE" | "RENEWAL";
type EntityType = "LEAD" | "COMPANY" | "CONTACT" | "REQUEST";
type RenewalOutcome = "Renewed" | "Tier Change" | "Declined" | "Undecided";

interface SearchResult {
  id: string;
  type: "LEAD" | "COMPANY";
  title: string;
  subtitle: string;
}

interface QuickLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId?: string;
  entityType?: EntityType;
  entityName?: string;
  defaultType?: ActivityType;
  onSuccess?: () => void;
  entitySearchMode?: boolean;
  currentStatus?: string;
  currentLeadStatus?: string;
  autoExpandFollowUp?: boolean;
}

const ACTIVITY_TYPES: {
  id: ActivityType;
  label: string;
  icon: typeof Phone;
  color: string;
  bg: string;
}[] = [
  { id: "CALL", label: "Call", icon: Phone, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "EMAIL", label: "Email", icon: Mail, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "MEETING", label: "Meeting", icon: Users, color: "text-teal-500", bg: "bg-teal-50" },
  { id: "RENEWAL", label: "Renewal", icon: RefreshCw, color: "text-teal-500", bg: "bg-teal-50" },
  { id: "NOTE", label: "Note", icon: MessageSquare, color: "text-gray-500", bg: "bg-gray-50" },
];

const RENEWAL_OUTCOMES: RenewalOutcome[] = ["Renewed", "Tier Change", "Declined", "Undecided"];

const SMART_SNIPPETS: {
  label: string;
  type: ActivityType;
  text: string;
  nextStep?: string;
  daysOut?: number;
  priority?: "Low" | "Medium" | "High";
}[] = [
  {
    label: "Left Voicemail",
    type: "CALL",
    text: "Left voicemail with a concise intro and callback details.",
    nextStep: "Call back after voicemail",
    daysOut: 2,
    priority: "Medium",
  },
  {
    label: "Spoke - Follow Up",
    type: "CALL",
    text: "Reached the contact. They are interested, but timing is tight. Follow up next week.",
    nextStep: "Follow up on next week's conversation",
    daysOut: 7,
    priority: "High",
  },
  {
    label: "Gatekeeper - Try Later",
    type: "CALL",
    text: "Reached a gatekeeper. Decision-maker unavailable right now. Try again later today or tomorrow.",
    nextStep: "Retry decision-maker",
    daysOut: 1,
    priority: "Medium",
  },
  {
    label: "Sent Pricing",
    type: "EMAIL",
    text: "Sent pricing and menu guidance. Waiting for questions or approval.",
    nextStep: "Check in on pricing email",
    daysOut: 3,
    priority: "High",
  },
  {
    label: "Meeting Booked",
    type: "MEETING",
    text: "Booked a meeting to review menu, headcount, and delivery details.",
    nextStep: "Prepare for meeting",
    daysOut: 2,
    priority: "High",
  },
];

export function QuickLogDrawer({
  isOpen,
  onClose,
  entityId,
  entityType = "LEAD",
  entityName,
  defaultType = "CALL",
  onSuccess,
  currentStatus,
  currentLeadStatus,
  autoExpandFollowUp = false,
  entitySearchMode = false,
}: QuickLogDrawerProps) {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>(defaultType);
  const [note, setNote] = useState("");
  const [showTask, setShowTask] = useState(autoExpandFollowUp);
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [renewalOutcome, setRenewalOutcome] = useState<RenewalOutcome>("Undecided");
  const [showStatusPrompt, setShowStatusPrompt] = useState(false);
  const [entitySearch, setEntitySearch] = useState("");
  const [entityResults, setEntityResults] = useState<SearchResult[]>([]);
  const resolvedStatus = currentStatus ?? currentLeadStatus;
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; type: EntityType; name: string; subtitle?: string }>({
    id: entityId || "",
    type: entityType,
    name: entityName || "",
    subtitle: resolvedStatus,
  });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedType(defaultType);
    setNote("");
    setShowTask(autoExpandFollowUp);
    setTaskSubject("");
    setTaskDueDate("");
    setRenewalOutcome("Undecided");
    setShowStatusPrompt(false);
    setEntitySearch("");
    setEntityResults([]);
    setSelectedEntity({ id: entityId || "", type: entityType, name: entityName || "", subtitle: resolvedStatus });
  }, [isOpen, defaultType, entityId, entityName, entityType, autoExpandFollowUp, resolvedStatus]);

  useEffect(() => {
    if (!entitySearchMode || !isOpen || entitySearch.trim().length < 2 || !user) {
      setEntityResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await searchCrm(entitySearch.trim(), user.uid, role || undefined);
      setEntityResults(
        results.map((result: SearchResult & { title?: string }) => ({
          id: result.id,
          type: result.type,
          title: result.title,
          subtitle: result.subtitle,
        }))
      );
    }, 250);

    return () => clearTimeout(timeout);
  }, [entitySearch, entitySearchMode, isOpen, user, role]);

  const canPromptContacted =
    selectedEntity.type === "LEAD" &&
    ["CALL", "EMAIL"].includes(selectedType) &&
    ["New", "Contacted", undefined].includes(selectedEntity.subtitle);

  const canPromptActive = 
    selectedEntity.type === "COMPANY" &&
    ["CALL", "EMAIL", "MEETING"].includes(selectedType) &&
    !selectedEntity.subtitle?.includes("Active");

  const shouldPromptStatus = canPromptContacted || canPromptActive;
  const hasTaskDetails = !showTask || (Boolean(taskSubject.trim()) && Boolean(taskDueDate));
  const canSubmit = Boolean(selectedEntity.id) && (Boolean(note.trim()) || showTask) && hasTaskDetails;

  const completeAndClose = () => {
    toast.success(showTask ? "Activity logged & follow-up created" : "Activity logged");
    onSuccess?.();
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    if (!selectedEntity.id || !selectedEntity.name) {
      toast.error("Select a lead or company first");
      return;
    }

    setLoading(true);

    try {
      if (note) {
        await logActivity(
          selectedEntity.type,
          selectedEntity.id,
          selectedType,
          selectedType === "RENEWAL" ? { note, renewalOutcome } : { note },
          user.uid,
          user.displayName || "User"
        );
      }

      if (showTask && taskSubject && taskDueDate) {
        await createTask({
          subject: taskSubject,
          dueDate: Timestamp.fromDate(new Date(taskDueDate)),
          priority: "Medium",
          assignedRepId: user.uid,
          entityType: selectedEntity.type,
          entityId: selectedEntity.id,
          entityName: selectedEntity.name,
          status: "Upcoming",
        });
      }

      if (shouldPromptStatus) {
        setShowStatusPrompt(true);
      } else {
        completeAndClose();
      }
    } catch (error) {
      toast.error("Failed to log activity");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!user || !selectedEntity.id) return;

    setLoading(true);
    try {
      if (selectedEntity.type === "LEAD") {
        const { updateLeadStatus } = await import("@/lib/firebase/services/lead.service");
        await updateLeadStatus(selectedEntity.id, "Contacted", selectedEntity.subtitle || "New", user.uid, user.displayName || "User");
        toast.success("Lead marked as Contacted");
      } else if (selectedEntity.type === "COMPANY") {
        const { updateCompanyStatus } = await import("@/lib/firebase/services/company.service");
        await updateCompanyStatus(selectedEntity.id, "Active", selectedEntity.subtitle, user.uid, user.displayName || "User");
        toast.success("Company marked as Active");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update ${selectedEntity.type.toLowerCase()} status`);
    } finally {
      setLoading(false);
    }
  };

  const applySnippet = (snippet: (typeof SMART_SNIPPETS)[number]) => {
    setSelectedType(snippet.type);
    setNote(snippet.text);

    if (snippet.nextStep) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (snippet.daysOut || 1));

      setShowTask(true);
      setTaskSubject(snippet.nextStep);
      setTaskDueDate(futureDate.toISOString().split("T")[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-brown/40 backdrop-blur-sm transition-opacity lg:hidden" onClick={onClose} />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:rounded-l-3xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-border p-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-teal-dark">Quick Log</h2>
            <p className="text-sm text-brown/60">
              {selectedEntity.name || (entitySearchMode ? "Search for a lead or company" : "No entity selected")}
            </p>
            {selectedEntity.subtitle && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-base/70">
                {selectedEntity.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full p-2 transition-colors hover:bg-gray-bg touch-manipulation"
          >
            <X className="h-5 w-5 text-brown/40" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6 overscroll-y-contain">
          {entitySearchMode ? (
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brown/40">Search Entity</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown/40" />
                <Input
                  value={entitySearch}
                  onChange={(e) => setEntitySearch(e.target.value)}
                  placeholder="Search leads or companies..."
                  className="pl-9"
                />
              </div>
              {entityResults.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-gray-border bg-gray-bg/40 p-2">
                  {entityResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() =>
                        setSelectedEntity({
                          id: result.id,
                          type: result.type,
                          name: result.title,
                          subtitle: result.subtitle,
                        })
                      }
                      className={cn(
                        "w-full rounded-xl px-3 py-3 text-left transition-colors touch-manipulation",
                        selectedEntity.id === result.id ? "bg-teal-base/10 text-teal-dark" : "hover:bg-white"
                      )}
                    >
                      <p className="text-sm font-semibold">{result.title}</p>
                      <p className="text-xs text-brown/50">{result.subtitle}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brown/40">Select Outcome</label>
            <div className="grid grid-cols-5 gap-2">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "touch-manipulation min-h-[44px] rounded-2xl border-2 p-3 transition-all",
                    "flex flex-col items-center justify-center gap-2",
                    selectedType === type.id ? `border-teal-base ${type.bg} ${type.color}` : "border-transparent bg-gray-bg text-brown/40 hover:border-gray-border"
                  )}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedType === "RENEWAL" ? (
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brown/40">Renewal Outcome</label>
              <div className="grid grid-cols-2 gap-2">
                {RENEWAL_OUTCOMES.map((outcome) => (
                  <button
                    key={outcome}
                    onClick={() => setRenewalOutcome(outcome)}
                    className={cn(
                      "touch-manipulation min-h-[44px] rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors",
                      renewalOutcome === outcome ? "border-teal-base bg-teal-base/10 text-teal-dark" : "border-gray-border bg-white text-brown/70 hover:border-teal-base/30"
                    )}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brown/40">Notes / Outcome</label>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-teal-base">
                <Zap className="h-3 w-3 fill-teal-base" /> Smart Snippets
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {SMART_SNIPPETS.filter((snippet) => snippet.type === selectedType || selectedType === "NOTE").map((snippet) => (
                <button
                  key={snippet.label}
                  onClick={() => applySnippet(snippet)}
                  className="rounded-full border border-teal-base/20 bg-teal-base/5 px-3 py-1.5 text-[10px] font-bold text-teal-dark transition-colors hover:bg-teal-base/10"
                >
                  {snippet.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was discussed?"
              className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-border bg-gray-bg p-4 text-sm outline-none transition-all focus:border-teal-base focus:ring-2 focus:ring-teal-base/20"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowTask((current) => !current)}
              className={cn(
                "flex min-h-[44px] w-full touch-manipulation items-center gap-2 rounded-2xl border-2 border-dashed p-4 text-sm font-bold transition-colors",
                showTask ? "border-orange bg-orange/5 text-orange" : "border-teal-base/20 text-teal-base hover:bg-teal-base/5"
              )}
            >
              <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", showTask ? "bg-orange text-white" : "bg-teal-base/10")}>
                {showTask ? <Clock className="h-3 w-3" /> : <Plus className="h-4 w-4" />}
              </div>
              {showTask ? "Schedule Next Follow-up" : "Add Next Step?"}
            </button>

            {showTask ? (
              <div className="animate-in slide-in-from-top-2 space-y-4 rounded-2xl border border-orange/10 bg-orange/5 p-4 duration-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-orange">Follow-up Task</label>
                  <Input
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    placeholder="Call back in 2 days..."
                    className="border-orange/20 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-orange">Due Date</label>
                  <Input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="border-orange/20 bg-white px-3"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {showStatusPrompt ? (
            <div className="rounded-2xl border border-teal-base/20 bg-teal-base/5 p-4">
              <p className="text-sm font-semibold text-teal-dark">
                {selectedEntity.type === "LEAD" ? "Mark lead as Contacted?" : "Mark company as Active?"}
              </p>
              <p className="mt-1 text-sm text-brown/60">
                You logged a {selectedType.toLowerCase()} touch. Keep the {selectedEntity.type.toLowerCase()} status in sync with one tap.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={completeAndClose}>
                  Skip
                </Button>
                <Button size="sm" onClick={handleUpdateStatus} disabled={loading}>
                  {selectedEntity.type === "LEAD" ? "Mark Contacted" : "Mark Active"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-border bg-gray-50 p-6">
            <Button
              onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className="min-h-[44px] w-full rounded-2xl py-6 text-base touch-manipulation"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Complete Activity
          </Button>
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-brown/40">This will update the timeline & tasks</p>
        </div>
      </div>
    </>
  );
}
