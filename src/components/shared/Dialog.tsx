"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[110] bg-brown/20 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
            {children}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "w-full bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-border relative",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-2">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-bold text-brown">{children}</h3>;
}

export function DialogFooter({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("p-6 pt-2 flex items-center justify-end gap-3 bg-gray-bg/30", className)}>
      {children}
    </div>
  );
}
