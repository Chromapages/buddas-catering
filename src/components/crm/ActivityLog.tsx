"use client";

import { useState } from "react";
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
    <Card className="border-teal-base/20 shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-brown/60">Log Activity</CardTitle>
        <div className="flex bg-gray-bg p-1 rounded-lg">
          {ACTIVITY_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-1.5 rounded-md transition-all ${
                selectedType === type.id 
                  ? 'bg-white text-teal-base shadow-sm' 
                  : 'text-brown/40 hover:text-brown/60'
              }`}
              title={type.label}
            >
              <type.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Add a ${selectedType.toLowerCase()} note...`}
          className="w-full min-h-[80px] p-3 text-sm bg-gray-bg/50 border border-gray-border rounded-xl focus:ring-2 focus:ring-teal-base/20 focus:border-teal-base outline-none transition-all resize-none"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowTask(!showTask)}
            className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              showTask ? 'text-orange' : 'text-teal-base hover:text-teal-dark'
            }`}
          >
            {showTask ? <Clock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showTask ? 'Cancel Follow-up' : 'Schedule Follow-up'}
          </button>
        </div>

        {showTask && (
          <div className="p-4 bg-orange/5 border border-orange/10 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-orange uppercase tracking-wider">Follow-up Subject</label>
              <Input 
                value={taskSubject} 
                onChange={(e) => setTaskSubject(e.target.value)}
                placeholder="e.g., Call to confirm headcount"
                className="bg-white border-orange/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-orange uppercase tracking-wider">Due Date</label>
              <Input 
                type="date"
                value={taskDueDate} 
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="bg-white border-orange/20"
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={loading || (!note && !showTask)}
          className="w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Record Interaction
        </Button>
      </CardContent>
    </Card>
  );
}
