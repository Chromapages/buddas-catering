"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-brown/20 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-border"
            >
              <div className="relative p-6 px-8">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-1 rounded-full text-brown/40 hover:bg-gray-bg hover:text-brown transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                    variant === "danger" ? "bg-orange/10 text-orange" : "bg-teal-base/10 text-teal-base"
                  )}>
                    <AlertCircle size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-brown mb-2">{title}</h3>
                  <p className="text-sm text-brown/60 leading-relaxed mb-8">
                    {description}
                  </p>

                  <div className="flex items-center gap-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={onClose}
                    >
                      {cancelText}
                    </Button>
                    <Button
                      variant={variant === "danger" ? "primary" : "primary"} // Custom primary for danger if needed
                      className={cn(
                        "flex-1",
                        variant === "danger" ? "bg-orange hover:bg-orange/90 text-white border-0" : ""
                      )}
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                    >
                      {confirmText}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
