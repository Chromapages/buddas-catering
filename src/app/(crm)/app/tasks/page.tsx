"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";
import {
  AlarmClock,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  Search,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/firebase/context/auth";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";
import { SnoozeModal } from "@/components/crm/SnoozeModal";
import {
  createTask,
  completeTask,
  getRepTasksByStatus,
} from "@/lib/firebase/services/task.service";
import { searchCrm } from "@/lib/firebase/services/crm";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { CRMTask } from "@/types/crm";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "overdue" | "today" | "upcoming" | "renewal" | "activation";
type SearchResult = {
  id: string;
  type: "LEAD" | "COMPANY";
  title: string;
  subtitle: string;
};

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Due Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "renewal", label: "Renewal" },
  { id: "activation", label: "Activation" },
];

const PRIORITY_STYLES = {
  High: "border-orange/20 bg-orange/10 text-orange",
  Medium: "border-gold/20 bg-gold/10 text-gold",
  Low: "border-teal-base/20 bg-teal-base/10 text-teal-dark",
} as const;

function formatDueDate(task: CRMTask) {
  const dueDate = task.dueDate?.toDate?.();
  if (!dueDate) return "No due date";
  if (isToday(dueDate)) return `Today, ${format(dueDate, "h:mm a")}`;
  if (isYesterday(dueDate)) return `Yesterday, ${format(dueDate, "h:mm a")}`;
  return format(dueDate, "EEE, MMM d");
}

function getTaskBucketLabel(task: CRMTask) {
  const dueDate = task.dueDate?.toDate?.();
  if (!dueDate) return "Upcoming";
  if (isToday(dueDate)) return "Today";
  return dueDate < new Date() ? "Overdue" : "Upcoming";
}

function matchesSpecialFilter(task: CRMTask, tab: FilterTab) {
  const subject = task.subject.toLowerCase();
  if (tab === "renewal") return subject.includes("renewal");
  if (tab === "activation") {
    return task.entityType === "COMPANY" && (subject.includes("activation") || subject.includes("first order"));
  }
  return true;
}

function NewTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<SearchResult | null>(null);
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm("");
    setResults([]);
    setSelectedEntity(null);
    setSubject("");
    setPriority("Medium");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().slice(0, 10));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const response = await searchCrm(searchTerm.trim(), user.uid, role || undefined);
      setResults(response as SearchResult[]);
    }, 250);

    return () => clearTimeout(timeout);
  }, [isOpen, role, searchTerm, user]);

  const handleSubmit = async () => {
    if (!user || !selectedEntity || !subject.trim() || !dueDate) {
      toast.error("Fill out the task details first");
      return;
    }

    setLoading(true);
    try {
      await createTask({
        subject: subject.trim(),
        dueDate: Timestamp.fromDate(new Date(`${dueDate}T09:00:00`)),
        priority,
        assignedRepId: user.uid,
        entityType: selectedEntity.type,
        entityId: selectedEntity.id,
        entityName: selectedEntity.title,
        status: "Upcoming",
      });
      toast.success("Task created");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <p className="mt-2 text-sm text-brown/60">Create a follow-up tied to a lead or account.</p>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brown">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Follow up on quote" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brown">Linked Entity</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown/40" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                placeholder="Search leads or companies..."
              />
            </div>
            {selectedEntity ? (
              <div className="rounded-xl border border-teal-base/20 bg-teal-base/5 px-3 py-2 text-sm font-medium text-teal-dark">
                Linked to {selectedEntity.title}
              </div>
            ) : null}
            {results.length > 0 ? (
              <div className="space-y-2 rounded-2xl border border-gray-border bg-gray-bg/40 p-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedEntity(result);
                      setSearchTerm(result.title);
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-3 text-left transition-colors",
                      selectedEntity?.id === result.id ? "bg-teal-base/10 text-teal-dark" : "hover:bg-white"
                    )}
                  >
                    <p className="text-sm font-semibold">{result.title}</p>
                    <p className="text-xs text-brown/50">{result.subtitle}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brown">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brown">Priority</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "Low" | "Medium" | "High")}
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Medium", label: "Medium" },
                  { value: "High", label: "High" },
                ]}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={loading}>
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [snoozeTask, setSnoozeTask] = useState<CRMTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<CRMTask | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["rep-task-buckets", user?.uid],
    queryFn: () => getRepTasksByStatus(user!.uid),
    enabled: !!user?.uid,
  });

  const groupedTasks = useMemo(() => {
    const buckets = {
      Overdue: data?.overdue || [],
      Today: data?.today || [],
      Upcoming: data?.upcoming || [],
    };

    return Object.entries(buckets)
      .map(([label, tasks]) => ({
        label,
        tasks: tasks.filter((task) => {
          if (activeTab === "all") return true;
          if (activeTab === "overdue") return label === "Overdue";
          if (activeTab === "today") return label === "Today";
          if (activeTab === "upcoming") return label === "Upcoming";
          return matchesSpecialFilter(task, activeTab);
        }),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [activeTab, data]);

  const counts = {
    all: (data?.overdue.length || 0) + (data?.today.length || 0) + (data?.upcoming.length || 0),
    overdue: data?.overdue.length || 0,
    today: data?.today.length || 0,
    upcoming: data?.upcoming.length || 0,
    renewal:
      [...(data?.overdue || []), ...(data?.today || []), ...(data?.upcoming || [])].filter((task) =>
        matchesSpecialFilter(task, "renewal")
      ).length,
    activation:
      [...(data?.overdue || []), ...(data?.today || []), ...(data?.upcoming || [])].filter((task) =>
        matchesSpecialFilter(task, "activation")
      ).length,
  };

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["rep-task-buckets", user?.uid] });
    void queryClient.invalidateQueries({ queryKey: ["rep-task-summary", user?.uid] });
  };

  const handleComplete = async () => {
    if (!user || !selectedTask) return;

    try {
      await completeTask(
        selectedTask.id,
        user.uid,
        user.displayName || user.email || "User"
      );
      toast.success("Task completed");
      setSelectedTask(null);
      setIsLogOpen(false);
      handleRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete task");
    }
  };

  return (
    <div className="space-y-8 overscroll-y-contain p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-teal-dark">My Tasks</h1>
          <p className="mt-1 text-sm text-brown/70">Your daily outreach queue, grouped by urgency and rep workflow.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <Card className="border-gray-border/70 shadow-sm">
        <CardContent className="space-y-6 p-5">
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "min-h-[44px] rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  activeTab === tab.id
                    ? "border-teal-base bg-teal-base/10 text-teal-dark"
                    : "border-gray-border bg-white text-brown/60 hover:border-teal-base/30 hover:text-brown"
                )}
                style={{ touchAction: "manipulation" }}
              >
                {tab.label} <span className="ml-1 text-brown/40">{counts[tab.id]}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-gray-border bg-gray-bg/40 px-6 py-14 text-center text-brown/50">
              Loading your tasks...
            </div>
          ) : groupedTasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-border bg-gray-bg/40 px-6 py-14 text-center">
              <p className="text-lg font-semibold text-brown">No tasks in this view</p>
              <p className="mt-2 text-sm text-brown/55">Clear board. You can add a follow-up or switch filters to check another bucket.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedTasks.map((group) => (
                <section key={group.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-brown/40">{group.label}</h2>
                    <span className="text-xs font-medium text-brown/40">{group.tasks.length} tasks</span>
                  </div>
                  <div className="space-y-3">
                    {group.tasks.map((task) => {
                      const entityHref =
                        task.entityType === "COMPANY"
                          ? `/app/companies/${task.entityId}`
                          : `/app/leads/${task.entityId}`;
                      const isOverdue = getTaskBucketLabel(task) === "Overdue";

                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "rounded-3xl border bg-white p-4 shadow-sm transition-colors",
                            isOverdue ? "border-orange/20" : "border-gray-border/70"
                          )}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                                  task.entityType === "COMPANY" ? "bg-teal-base/10 text-teal-dark" : "bg-gold/15 text-gold"
                                )}>
                                  {task.entityType === "COMPANY" ? <Building2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-base font-semibold text-brown">{task.subject}</p>
                                    <Badge className={cn("border", PRIORITY_STYLES[task.priority])}>{task.priority}</Badge>
                                  </div>
                                  <Link href={entityHref} className="inline-flex items-center gap-1 text-sm font-medium text-teal-dark hover:underline">
                                    {task.entityName}
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-brown/55">
                                    <span className="inline-flex items-center gap-1">
                                      <CalendarClock className="h-4 w-4" />
                                      {formatDueDate(task)}
                                    </span>
                                    <span className={cn("inline-flex items-center gap-1", isOverdue ? "text-orange" : "")}>
                                      <Clock3 className="h-4 w-4" />
                                      {formatDistanceToNowStrict(task.dueDate.toDate(), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              <Button
                                variant="outline"
                                onClick={() => setSnoozeTask(task)}
                                className="rounded-2xl"
                                style={{ touchAction: "manipulation" }}
                              >
                                <AlarmClock className="mr-2 h-4 w-4" />
                                Snooze
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsLogOpen(true);
                                }}
                                className="rounded-2xl"
                                style={{ touchAction: "manipulation" }}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Complete
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <QuickLogDrawer
        isOpen={isLogOpen}
        onClose={() => {
          setIsLogOpen(false);
          setSelectedTask(null);
        }}
        entityId={selectedTask?.entityId}
        entityType={selectedTask?.entityType}
        entityName={selectedTask?.entityName}
        autoExpandFollowUp
        onSuccess={() => {
          void handleComplete();
        }}
      />

      <SnoozeModal
        isOpen={Boolean(snoozeTask)}
        onClose={() => setSnoozeTask(null)}
        taskId={snoozeTask?.id}
        taskLabel={snoozeTask?.subject}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
