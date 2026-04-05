"use client";

import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { updateTask } from "@/lib/firebase/services/task.service";

interface SnoozeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  taskLabel?: string;
  onSuccess?: () => void;
}

const QUICK_OPTIONS = [
  { label: "Tomorrow", days: 1 },
  { label: "In 2 days", days: 2 },
  { label: "In 1 week", days: 7 },
];

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function SnoozeModal({ isOpen, onClose, taskId, taskLabel, onSuccess }: SnoozeModalProps) {
  const [loading, setLoading] = useState(false);
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCustomDate(toDateValue(tomorrow));
  }, [isOpen]);

  const handleSnooze = async (nextDate: Date) => {
    if (!taskId) return;

    setLoading(true);
    try {
      await updateTask(taskId, { dueDate: Timestamp.fromDate(nextDate) });
      toast.success("Task snoozed");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to snooze task");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customDate) {
      toast.error("Choose a new date first");
      return;
    }

    await handleSnooze(new Date(`${customDate}T09:00:00`));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Snooze Task</DialogTitle>
          <p className="mt-2 text-sm text-brown/60">
            {taskLabel || "Move this follow-up to a better time."}
          </p>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 gap-2">
            {QUICK_OPTIONS.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                type="button"
                disabled={loading}
                className="justify-start rounded-xl"
                onClick={() => {
                  const nextDate = new Date();
                  nextDate.setDate(nextDate.getDate() + option.days);
                  nextDate.setHours(9, 0, 0, 0);
                  void handleSnooze(nextDate);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2 rounded-2xl border border-gray-border bg-gray-bg/40 p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brown/50">
              Custom Date
            </label>
            <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleCustomSubmit()} disabled={loading || !customDate}>
            Save Date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
