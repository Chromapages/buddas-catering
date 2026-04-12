"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  Calendar,
  Plus,
  Loader2,
  Clock
} from "lucide-react";
import { createTask } from "@/lib/firebase/services/task.service";
import { logActivity } from "@/lib/firebase/services/base";
import { useAuth } from "@/lib/firebase/context/auth";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

interface ActivityLogProps {
  entityId: string;
  entityType: 'LEAD' | 'COMPANY' | 'CONTACT' | 'REQUEST';
  entityName: string;
  onSuccess?: () => void;
}

const ACTIVITY_TYPES = [
  { id: 'CALL', label: 'Call', icon: Phone },
  { id: 'EMAIL', label: 'Email', icon: Mail },
  { id: 'MEETING', label: 'Meeting', icon: Users },
  { id: 'NOTE', label: 'Note', icon: MessageSquare },
];

export function ActivityLog({ entityId, entityType, entityName, onSuccess }: ActivityLogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('NOTE');
  const [note, setNote] = useState('');
  const [showTask, setShowTask] = useState(false);
  const [taskSubject, setTaskSubject] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const handleSubmit = async () => {
    if (!note && !showTask) return;
    setLoading(true);
    
    try {
      // 1. Log Activity
      if (note) {
        await logActivity(
          entityType,
          entityId,
          selectedType,
          { note },
          user!.uid,
          user?.displayName || "User"
        );
      }

      // 2. Create Task (if enabled)
      if (showTask && taskSubject && taskDueDate) {
        await createTask({
          subject: taskSubject,
          dueDate: Timestamp.fromDate(new Date(taskDueDate)),
          priority: 'Medium',
          assignedRepId: user!.uid,
          entityType,
          entityId,
          entityName,
          status: 'Upcoming'
        });
      }

      toast.success("Activity recorded");
      setNote('');
      setTaskSubject('');
      setTaskDueDate('');
      setShowTask(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save activity");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-teal-dark/10 dark:border-white/5 shadow-glass backdrop-blur-3xl overflow-hidden rounded-[24px] bg-white/40 dark:bg-zinc-900/40">
      <CardHeader className="pb-6 border-b border-teal-dark/10 dark:border-white/5 bg-white/5 dark:bg-black/20 p-8 flex flex-row items-center justify-between">
        <CardTitle className="text-[12px] font-black uppercase tracking-[0.3em] text-teal-dark dark:text-brown">Engagement Protocol</CardTitle>
        <div className="flex bg-teal-dark/5 dark:bg-white/5 p-1 rounded-xl border border-teal-dark/10 dark:border-white/10">
          {ACTIVITY_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                "p-2 rounded-lg transition-all duration-300",
                selectedType === type.id 
                  ? 'bg-teal-base text-teal-dark shadow-glass' 
                  : 'text-teal-dark/30 dark:text-white/30 hover:text-teal-dark/60 dark:hover:text-white/60 hover:bg-teal-dark/5 dark:hover:bg-white/5'
              )}
              title={type.label}
            >
              <type.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Initialize ${selectedType.toLowerCase()} sequence...`}
          className="w-full min-h-[120px] p-4 text-[13px] font-medium bg-teal-dark/5 dark:bg-white/5 border border-teal-dark/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-base/20 focus:border-teal-base outline-none transition-all resize-none text-teal-dark dark:text-brown placeholder:text-teal-dark/20 dark:placeholder:text-white/10"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowTask(!showTask)}
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              showTask ? 'text-orange-600 dark:text-orange-500' : 'text-teal-base hover:text-teal-dark dark:hover:text-teal-base/80'
            )}
          >
            {showTask ? <Clock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showTask ? 'Abort Follow-up' : 'Schedule Continuity'}
          </button>
        </div>

        {showTask && (
          <div className="p-6 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 dark:border-orange-500/20 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300 shadow-glass overflow-hidden font-heading">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.2em] ml-1">Follow-up Objective</label>
              <Input 
                value={taskSubject} 
                onChange={(e) => setTaskSubject(e.target.value)}
                placeholder="e.g., Tactical sync on requirements"
                className="bg-teal-dark/5 dark:bg-white/5 border-orange-500/20 text-teal-dark dark:text-brown rounded-xl h-11 focus:border-orange-500 placeholder:text-orange-500/20 text-xs font-black uppercase tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.2em] ml-1">Execution Date</label>
              <Input 
                type="date"
                value={taskDueDate} 
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="bg-teal-dark/5 dark:bg-white/5 border-orange-500/20 text-teal-dark dark:text-brown rounded-xl h-11 focus:border-orange-500 text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={loading || (!note && !showTask)}
          className="w-full h-14 rounded-2xl bg-teal-base hover:bg-teal-base/80 text-teal-dark font-black uppercase tracking-[0.3em] text-[12px] shadow-glass"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : null}
          Commit Interaction
        </Button>
      </CardContent>
    </Card>
  );
}
