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

export function TaskWidget() {
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
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 rounded bg-gray-border/50" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-border/30" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const overdue = tasks?.filter((t) => isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate())) || [];
  const today = tasks?.filter((t) => isToday(t.dueDate.toDate())) || [];
  const upcoming = tasks?.filter((t) => !isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate())) || [];

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden border-teal-base/20 shadow-sm">
        <CardHeader className="border-b border-gray-border/50 bg-teal-base/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-base" />
              <CardTitle className="text-lg font-heading font-semibold text-brown">Your Follow-ups</CardTitle>
            </div>
            <Badge variant="neutral">{tasks?.length || 0} Total</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto bg-gray-bg/10 p-0 overscroll-y-contain">
          {tasks && tasks.length > 0 ? (
            <div className="divide-y divide-gray-border/50">
              {overdue.length > 0 ? (
                <div className="bg-red-50/30">
                  <div className="flex items-center gap-1 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-red-600">
                    <AlertCircle className="h-3 w-3" /> Overdue
                  </div>
                  {overdue.map((task) => (
                    <TaskItem key={task.id} task={task} onComplete={() => setTaskToLog(task as TaskRecord)} />
                  ))}
                </div>
              ) : null}

              {today.length > 0 ? (
                <div>
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-teal-dark">Due Today</div>
                  {today.map((task) => (
                    <TaskItem key={task.id} task={task} onComplete={() => setTaskToLog(task as TaskRecord)} />
                  ))}
                </div>
              ) : null}

              {upcoming.length > 0 ? (
                <div className="opacity-75">
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-brown/50">Upcoming</div>
                  {upcoming.map((task) => (
                    <TaskItem key={task.id} task={task} onComplete={() => setTaskToLog(task as TaskRecord)} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-8 text-center text-brown/50">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-teal-base/20" />
              <p className="text-sm italic">Hooray! No pending follow-ups.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
    <div className="group flex items-start gap-3 p-4 transition-colors hover:bg-white">
      <button
        onClick={onComplete}
        className="mt-1 flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded border border-gray-border text-transparent transition-colors hover:border-teal-base hover:bg-teal-base/5 hover:text-teal-base"
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-brown">{task.subject}</p>
          {task.priority === "High" ? <Badge variant="danger" className="h-4 px-1.5 text-[9px]">High</Badge> : null}
        </div>
        <div className="flex items-center gap-3 text-xs text-brown/60">
          <span className="flex items-center gap-1 font-medium text-teal-dark/80">
            <ExternalLink className="h-3 w-3" />
            <Link href={entityHref} className="hover:underline">
              {task.entityName}
            </Link>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(task.dueDate.toDate(), "MMM d")}
          </span>
        </div>
      </div>
    </div>
  );
}
