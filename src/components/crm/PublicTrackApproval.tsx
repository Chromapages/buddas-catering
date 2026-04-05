"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { approvePublicRequest } from "@/lib/firebase/services/public.service";
import toast from "react-hot-toast";

interface PublicTrackApprovalProps {
  requestId: string;
  onSuccess: () => void;
}

export function PublicTrackApproval({ requestId, onSuccess }: PublicTrackApprovalProps) {
  const [loading, setLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const success = await approvePublicRequest(requestId);
      if (success) {
        setIsApproved(true);
        toast.success("Proposal approved! We're on it.");
        onSuccess();
      } else {
        toast.error("Approval failed. Please contact your representative.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isApproved) {
    return (
      <div className="flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-base text-white shadow-xl shadow-teal-base/30">
          <PartyPopper className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-teal-dark">Booking Finalized!</p>
          <p className="text-sm text-brown/60">Thank you for choosing Budda's Catering.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Next Step: Finalize</h3>
      <p className="text-sm leading-relaxed text-white/80">
        Review your quote and details. If everything looks good, click "Approve" below to move your booking to the production queue.
      </p>
      <Button 
        onClick={handleApprove}
        disabled={loading}
        className="group relative w-full overflow-hidden bg-white py-6 text-lg font-bold text-teal-dark hover:bg-white/90"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5 transition-transform group-hover:scale-110" />}
          {loading ? "Processing..." : "Approve Proposal"}
        </span>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-teal-base/10 via-transparent to-teal-base/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </Button>
    </div>
  );
}
