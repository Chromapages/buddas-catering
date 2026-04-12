"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasksByRep, completeTask } from "@/lib/firebase/services/task.service";
import { useAuth } from "@/lib/firebase/context/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { CheckCircle2, AlertCircle, ExternalLink, Calendar } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";
import { cn } from "@/lib/utils";

interface TaskRecord {
  id: string;
  subject: string;
  priority: "Low" | "Medium" | "High";
  entityType: "LEAD" | "COMPANY" | "CONTACT" | "REQUEST";
  entityId: string;
  entityName: string;
  dueDate: {
    toDate: () => Date;
  };
}

export function TaskWidget({ className }: { className?: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [taskToLog, setTaskToLog] = useState<TaskRecord | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", user?.uid],
    queryFn: () => getTasksByRep(user!.uid, "Upcoming"),
    enabled: !!user,
  });

  const handleComplete = async () => {
    if (!taskToLog || !user) return;

    try {
      await completeTask(taskToLog.id, user.uid, user.displayName || "User");
      await queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
      toast.success("Task completed");
      setTaskToLog(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete task");
    }
  };

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-v-surface rounded-[24px] shadow-ambient", className)} />
    );
  }

  const overdue = tasks?.filter((t) => isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate())) || [];
  const today = tasks?.filter((t) => isToday(t.dueDate.toDate())) || [];
  const upcoming = tasks?.filter((t) => !isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate())) || [];

  return (
    <>
      <div className={cn("flex flex-col overflow-hidden bg-v-surface rounded-[24px] shadow-ambient border border-v-outline/20", className)}>
        <div className="px-6 py-5 border-b border-v-outline/20 bg-v-container/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-v-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-v-on-surface">Your Follow-ups</h3>
            </div>
            <Badge className="bg-v-on-surface/5 text-v-on-surface/40 border-transparent text-[9px] uppercase tracking-widest">{tasks?.length || 0} Tasks</Badge>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-0 overscroll-y-contain max-h-[400px]">
          {tasks && tasks.length > 0 ? (
            <div className="divide-y divide-v-outline/5">
              {overdue.length > 0 ? (
                <div className="bg-v-secondary/5">
                  <div className="flex items-center gap-1.5 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-v-secondary border-b border-v-outline/5">
                    <AlertCircle className="h-3 w-3" /> Overdue
                  </div>
                  {overdue.map((task) => (
                    <TaskItem key={task.id} task={task} onComplete={() => setTaskToLog(task as TaskRecord)} />
                  ))}
                </div>
              ) : null}

              {today.length > 0 ? (
                <div>
                  <div className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-v-primary border-b border-v-outline/5">Due Today</div>
                  {today.map((task) => (
                    <TaskItem key={task.id} task={task} onComplete={() => setTaskToLog(task as TaskRecord)} />
                  ))}
                </div>
              ) : null}

              {upcoming.length > 0 ? (
                <div className="opacity-80">
                  <div className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-v-on-surface/30 border-b border-v-outline/5">Upcoming</div>
                  {upcoming.map((task) => (
                    <TaskItem key={task.id} task={task} onComplete={() => setTaskToLog(task as TaskRecord)} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-10 text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-v-primary/5 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-v-primary/20" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-v-on-surface/20">All caught up!</p>
            </div>
          )}
        </div>
      </div>
      <QuickLogDrawer
        isOpen={!!taskToLog}
        onClose={() => setTaskToLog(null)}
        entityId={taskToLog?.entityId}
        entityType={taskToLog?.entityType}
        entityName={taskToLog?.entityName}
        defaultType="CALL"
        autoExpandFollowUp={true}
        onSuccess={() => {
          void handleComplete();
        }}
      />
    </>
  );
}

function TaskItem({ task, onComplete }: { task: TaskRecord; onComplete: () => void }) {
  const entityHref =
    task.entityType === "LEAD"
      ? `/app/leads/${task.entityId}`
      : task.entityType === "COMPANY"
        ? `/app/companies/${task.entityId}`
        : task.entityType === "REQUEST"
          ? `/app/requests/${task.entityId}`
          : "#";

  return (
    <div className="group flex items-start gap-3 py-2.5 px-6 transition-all hover:bg-v-container/30">
      <button
        onClick={onComplete}
        className="mt-1 flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-full border border-v-outline/20 text-transparent transition-all hover:border-v-primary/40 hover:bg-v-primary/5 hover:text-v-primary"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-bold text-v-on-surface tracking-tight group-hover:text-v-primary transition-colors">{task.subject}</p>
          {task.priority === "High" ? <Badge className="bg-v-secondary/10 text-v-secondary border-transparent text-[8px] font-black uppercase tracking-widest px-1.5">High</Badge> : null}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-v-on-surface/30">
          <span className="flex items-center gap-1 text-v-primary/60 hover:text-v-primary transition-colors">
            <Link href={entityHref} className="hover:underline">
              {task.entityName}
            </Link>
          </span>
          <span className="flex items-center gap-1">
             {format(task.dueDate.toDate(), "MMM d")}
          </span>
        </div>
      </div>
    </div>
  );
}
