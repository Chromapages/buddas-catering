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
      <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity lg:hidden" onClick={onClose} />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl border-l border-teal-dark/10 dark:border-white/10 shadow-glass transition-transform duration-500 ease-in-out sm:rounded-l-[32px] overflow-hidden font-heading",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-teal-dark/10 dark:border-white/10 bg-white/5 dark:bg-black/20 p-8 pt-10">
          <div className="space-y-1">
            <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-teal-dark dark:text-brown">Engagement Protocol</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-base">
              {selectedEntity.name || (entitySearchMode ? "Awaiting Entity Selection" : "Target Unidentified")}
            </p>
            {selectedEntity.subtitle && (
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-teal-dark/30 dark:text-teal-base/30 mt-1">
                {selectedEntity.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:bg-teal-dark/5 dark:hover:bg-white/5 border border-transparent hover:border-teal-dark/10 dark:hover:border-white/10 group"
          >
            <X className="h-5 w-5 text-teal-dark/30 dark:text-white/30 group-hover:text-teal-dark dark:group-hover:text-brown" />
          </button>
        </div>

        <div className="flex-1 space-y-10 overflow-y-auto p-8 overscroll-y-contain custom-scrollbar dark:custom-scrollbar-dark">
          {entitySearchMode ? (
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40 ml-1">Identify Target</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-dark/20 dark:text-white/20 group-focus-within:text-teal-base transition-colors" />
                <Input
                  value={entitySearch}
                  onChange={(e) => setEntitySearch(e.target.value)}
                  placeholder="Scan leads or companies..."
                  className="pl-11 bg-teal-dark/5 dark:bg-white/5 border-teal-dark/10 dark:border-white/10 text-teal-dark dark:text-brown rounded-xl h-12 focus:border-teal-base text-xs font-black uppercase tracking-widest placeholder:text-teal-dark/20 dark:placeholder:text-white/10"
                />
              </div>
              {entityResults.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-teal-dark/10 dark:border-white/10 bg-teal-dark/5 dark:bg-black/20 p-2 shadow-inner">
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
                        "w-full rounded-xl px-4 py-3 text-left transition-all duration-300",
                        selectedEntity.id === result.id 
                          ? "bg-teal-base/20 dark:bg-teal-base/10 text-teal-dark dark:text-teal-base border border-teal-base/20 shadow-glass" 
                          : "hover:bg-teal-dark/5 dark:hover:bg-white/5 border border-transparent hover:border-teal-dark/10 dark:hover:border-white/10 text-teal-dark/60 dark:text-brown/60"
                      )}
                    >
                      <p className="text-[11px] font-black uppercase tracking-widest font-heading">{result.title}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 font-heading">{result.subtitle}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40 ml-1">Sequence Protocol</label>
            <div className="grid grid-cols-5 gap-3">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 h-20 rounded-2xl border transition-all duration-300",
                    selectedType === type.id 
                      ? "bg-teal-base border-teal-base text-teal-dark shadow-glass scale-105" 
                      : "border-teal-dark/10 dark:border-white/10 bg-teal-dark/5 dark:bg-white/5 text-teal-dark/30 dark:text-white/30 hover:border-teal-dark/20 dark:hover:border-white/20 hover:bg-teal-dark/10 dark:hover:bg-white/10"
                  )}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedType === "RENEWAL" ? (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-teal-dark/40 dark:text-teal-base/40">Renewal Outcome</label>
              <div className="grid grid-cols-2 gap-2">
                {RENEWAL_OUTCOMES.map((outcome) => (
                  <button
                    key={outcome}
                    onClick={() => setRenewalOutcome(outcome)}
                    className={cn(
                      "touch-manipulation min-h-[44px] rounded-2xl border px-3 py-3 text-sm font-black uppercase tracking-widest transition-all",
                      renewalOutcome === outcome 
                        ? "border-teal-base bg-teal-base/10 text-teal-dark dark:text-teal-base shadow-glass" 
                        : "border-teal-dark/10 dark:border-white/10 bg-teal-dark/5 dark:bg-white/5 text-teal-dark/60 dark:text-brown/60 hover:border-teal-base/30"
                    )}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40">Intelligence Feed</label>
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-teal-base bg-teal-base/5 px-2 py-1 rounded-md border border-teal-base/10 animate-pulse">
                <Zap className="h-3 w-3 fill-teal-base" /> Smart Logic
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SMART_SNIPPETS.filter((snippet) => snippet.type === selectedType || selectedType === "NOTE").map((snippet) => (
                <button
                  key={snippet.label}
                  onClick={() => applySnippet(snippet)}
                  className="rounded-xl border border-teal-dark/10 dark:border-white/10 bg-teal-dark/5 dark:bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-teal-dark/50 dark:text-brown/40 transition-all hover:bg-teal-base/10 dark:hover:bg-teal-base/20 hover:border-teal-base/20 hover:text-teal-base"
                >
                  {snippet.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Initialize activity trace..."
              className="min-h-[140px] w-full font-body resize-none rounded-2xl border border-teal-dark/10 dark:border-white/10 bg-teal-dark/5 dark:bg-white/5 p-5 text-sm font-medium text-teal-dark dark:text-brown outline-none transition-all focus:border-teal-base focus:ring-4 focus:ring-teal-base/10 placeholder:text-teal-dark/20 dark:placeholder:text-white/10"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowTask((current) => !current)}
              className={cn(
                "flex min-h-[44px] w-full touch-manipulation items-center gap-2 rounded-2xl border-2 border-dashed p-4 text-sm font-black uppercase tracking-widest transition-all",
                showTask 
                  ? "border-orange-500 bg-orange-500/5 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 shadow-glass" 
                  : "border-teal-dark/10 dark:border-white/10 text-teal-base hover:bg-teal-base/5 dark:hover:bg-white/5"
              )}
            >
              <div className={cn("flex h-6 w-6 items-center justify-center rounded-full transition-colors", showTask ? "bg-orange-500 text-white" : "bg-teal-base/10")}>
                {showTask ? <Clock className="h-3 w-3" /> : <Plus className="h-4 w-4" />}
              </div>
              {showTask ? "Schedule Next Follow-up" : "Add Next Step?"}
            </button>

            {showTask ? (
              <div className="animate-in slide-in-from-top-2 space-y-4 rounded-2xl border border-orange-500/10 dark:border-orange-500/20 bg-orange-500/5 dark:bg-orange-500/10 p-4 duration-200 shadow-glass">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-500 ml-1">Follow-up Task</label>
                  <Input
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    placeholder="Call back in 2 days..."
                    className="border-orange-500/20 bg-white/50 dark:bg-black/20 text-teal-dark dark:text-brown font-black uppercase tracking-widest text-[10px] placeholder:text-orange-600/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-500 ml-1">Due Date</label>
                  <Input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="border-orange-500/20 bg-white/50 dark:bg-black/20 text-teal-dark dark:text-brown font-black uppercase tracking-widest text-[10px] px-3 cursor-pointer"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {showStatusPrompt ? (
            <div className="rounded-2xl border border-teal-base/20 dark:border-teal-base/40 bg-teal-base/5 dark:bg-teal-base/10 p-6 space-y-4 shadow-glass animate-in zoom-in-95 duration-300">
              <div className="space-y-1">
                <p className="text-[12px] font-black uppercase tracking-widest text-teal-dark dark:text-brown">
                  {selectedEntity.type === "LEAD" ? "Mark lead as Contacted?" : "Mark company as Active?"}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-dark/50 dark:text-brown/50 leading-relaxed font-body">
                  Sequence activity identified. Update {selectedEntity.type.toLowerCase()} protocol to maintain sync.
                </p>
              </div>
              <div className="flex gap-3 font-heading">
                <Button variant="outline" size="sm" onClick={completeAndClose} className="border-teal-dark/10 dark:border-white/10 text-teal-dark/40 dark:text-white/40 h-10 rounded-xl px-6 font-black uppercase tracking-widest text-[9px] hover:bg-white/10">
                  Skip
                </Button>
                <Button size="sm" onClick={handleUpdateStatus} disabled={loading} className="bg-teal-base hover:bg-teal-base/80 h-10 rounded-xl px-6 font-black uppercase tracking-widest text-[9px] text-teal-dark border border-teal-base/20">
                  {selectedEntity.type === "LEAD" ? "Mark Contacted" : "Mark Active"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-teal-dark/10 dark:border-white/10 bg-white/5 dark:bg-black/40 p-8 shadow-glass pb-10">
          <Button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className="h-14 w-full rounded-2xl bg-teal-base hover:bg-teal-base/80 text-teal-dark font-black uppercase tracking-[0.3em] text-[12px] shadow-glass border border-teal-base/20"
          >
            {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
            Finalize Entry
          </Button>
          <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/20 dark:text-teal-base/20 font-mono">Protocol Synchronization Active</p>
        </div>
      </div>
    </>
  );
}
