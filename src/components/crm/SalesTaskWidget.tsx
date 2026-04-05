"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasksByRep, completeTask } from "@/lib/firebase/services/task.service";
import { useAuth } from "@/lib/firebase/context/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

interface SalesTaskRecord {
  id: string;
  subject: string;
  entityType?: "LEAD" | "COMPANY" | "REQUEST" | string;
  entityId?: string;
  entityName?: string;
  dueDate: {
    toDate: () => Date;
  };
}

export function SalesTaskWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', user?.uid],
    queryFn: () => getTasksByRep(user!.uid, 'Upcoming'),
    enabled: !!user,
  });

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId, user!.uid, user?.displayName || "Rep");
      await queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
      toast.success("Hustle logged! Task cleared.");
    } catch {
      toast.error("Failed to clear task");
    }
  };

  if (isLoading) {
    return <div className="h-48 w-full bg-white/50 animate-pulse rounded-xl border border-gray-border/50"></div>;
  }

  const overdue = tasks?.filter(t => isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate())) || [];
  const today = tasks?.filter(t => isToday(t.dueDate.toDate())) || [];
  const totalUrgent = overdue.length + today.length;

  return (
    <Card className={totalUrgent > 0 ? "border-red-200 shadow-md ring-1 ring-red-500/10" : "border-gray-border shadow-sm"}>
      <CardHeader className="border-b border-gray-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={totalUrgent > 0 ? "h-5 w-5 text-red-600" : "h-5 w-5 text-teal-base"} />
            <CardTitle className="text-lg text-brown font-heading font-semibold">
              {totalUrgent > 0 ? "Action Required" : "Upcoming Tasks"}
            </CardTitle>
          </div>
          {totalUrgent > 0 && (
            <Badge variant="danger" className="animate-pulse px-2 py-0.5">{totalUrgent} Urgent</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto max-h-[500px]">
        {tasks && tasks.length > 0 ? (
          <div className="divide-y divide-gray-border/50">
            {/* Overdue Section */}
            {overdue.length > 0 && (
              <div className="bg-red-50/20">
                <div className="px-4 py-2 bg-red-600/5 text-[10px] font-bold text-red-700 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> OVERDUE</span>
                  <span>{overdue.length}</span>
                </div>
                {overdue.map(task => (
                  <SalesTaskItem key={task.id} task={task} onComplete={() => handleComplete(task.id)} isOverdue />
                ))}
              </div>
            )}

            {/* Today Section */}
            {today.length > 0 && (
              <div className="bg-orange-50/10">
                <div className="px-4 py-2 bg-orange-600/5 text-[10px] font-bold text-orange-700 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> DUE TODAY</span>
                  <span>{today.length}</span>
                </div>
                {today.map(task => (
                  <SalesTaskItem key={task.id} task={task} onComplete={() => handleComplete(task.id)} />
                ))}
              </div>
            )}

            {/* Empty States for urgent */}
            {totalUrgent === 0 && (
                <div className="p-12 text-center text-brown/40 italic text-sm">
                    All caught up on today&apos;s tasks. Get out there and hunt!
                </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-brown/40">
             <CheckCircle2 className="w-12 h-12 text-teal-base/10 mx-auto mb-3" />
             <p className="text-sm italic">Clear board. Clear mind.</p>
          </div>
        )}
      </CardContent>
      {tasks && tasks.length > today.length + overdue.length && (
          <div className="p-3 border-t border-gray-border/50 bg-gray-bg/30 text-center">
              <Link href="/app/tasks" className="text-xs font-bold text-teal-dark hover:underline flex items-center justify-center gap-1 group">
                  View {tasks.length - totalUrgent} future tasks <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
          </div>
      )}
    </Card>
  );
}

function SalesTaskItem({ task, onComplete, isOverdue }: { task: SalesTaskRecord, onComplete: () => void, isOverdue?: boolean }) {
  const entityHref = task.entityType === 'LEAD' ? `/app/leads/${task.entityId}` 
                   : task.entityType === 'COMPANY' ? `/app/companies/${task.entityId}`
                   : task.entityType === 'REQUEST' ? `/app/requests/${task.entityId}`
                   : '#';

  return (
    <div className="p-4 hover:bg-white transition-colors group flex items-start gap-3">
      <button 
        onClick={onComplete}
        className="mt-1 h-6 w-6 rounded-md border border-gray-border/60 flex items-center justify-center hover:border-teal-base transition-all text-transparent hover:text-teal-base hover:bg-teal-base/5 shadow-sm active:scale-95"
      >
        <CheckCircle2 className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className={`font-bold text-sm truncate ${isOverdue ? "text-red-700" : "text-brown"}`}>{task.subject}</p>
          <div className="flex items-center gap-1">
             <Phone className="w-3.5 h-3.5 text-brown/20 hover:text-teal-base cursor-pointer" />
             <Mail className="w-3.5 h-3.5 text-brown/20 hover:text-teal-base cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-brown/60">
          <span className="flex items-center gap-1 font-bold text-teal-dark/90">
            <Link href={entityHref} className="hover:underline flex items-center gap-1">
                {task.entityName} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </Link>
          </span>
          <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-bold" : ""}`}>
            <Calendar className="w-2.5 h-2.5" />
            {isToday(task.dueDate.toDate()) ? "Today" : format(task.dueDate.toDate(), 'MMM d')}
          </span>
        </div>
      </div>
    </div>
  );
}
