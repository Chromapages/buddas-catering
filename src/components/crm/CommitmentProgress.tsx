"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Commitment } from "@/types/crm";
import { format } from "date-fns";

interface CommitmentProgressProps {
  commitment: Commitment;
}

export function CommitmentProgress({ commitment }: CommitmentProgressProps) {
  const usagePercent = Math.min(Math.round((commitment.ordersUsed / commitment.ordersCommitted) * 100), 100);
  const remaining = commitment.ordersRemaining || Math.max(commitment.ordersCommitted - commitment.ordersUsed, 0);
  
  const isExpiring = commitment.status === 'Expiring';
  const isLapsed = commitment.status === 'Lapsed';

  return (
    <Card className={cn(
      "border border-teal-dark/10 dark:border-white/5 shadow-glass backdrop-blur-3xl overflow-hidden rounded-[24px] bg-white/40 dark:bg-zinc-900/40",
      isExpiring ? 'border-orange-500/20' : ''
    )}>
      <CardHeader className="pb-6 flex flex-row items-center justify-between border-b border-teal-dark/10 dark:border-white/5 bg-white/5 dark:bg-black/20 p-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <CardTitle className="text-[12px] font-black uppercase tracking-[0.3em] text-teal-dark dark:text-brown">Commitment Protocol</CardTitle>
        </div>
        <Badge variant="neutral" className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md",
          isExpiring ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
          isLapsed ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
          'bg-teal-base/10 text-teal-base border-teal-base/20'
        )}>
          {commitment.status}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-10 p-8">
        {/* Tier & Usage Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-teal-dark/5 dark:bg-white/5 rounded-2xl border border-teal-dark/10 dark:border-white/10 shadow-glass transition-all hover:bg-teal-dark/10 dark:hover:bg-white/10 group">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40 mb-3 group-hover:text-teal-dark/60 dark:group-hover:text-teal-base/60 transition-colors">Tier Level</p>
            <p className="text-3xl font-black text-teal-base tracking-widest">{commitment.tier}</p>
          </div>
          <div className="text-center p-6 bg-teal-dark/5 dark:bg-white/5 rounded-2xl border border-teal-dark/10 dark:border-white/10 shadow-glass transition-all hover:bg-teal-dark/10 dark:hover:bg-white/10 group">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40 mb-3 group-hover:text-teal-dark/60 dark:group-hover:text-teal-base/60 transition-colors">Units Used</p>
            <p className="text-3xl font-black text-teal-dark dark:text-brown tracking-widest">{commitment.ordersUsed}</p>
          </div>
          <div className="text-center p-6 bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl border border-orange-500/10 dark:border-orange-500/20 shadow-glass transition-all hover:bg-orange-500/10 dark:hover:bg-orange-500/20 group">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600/40 mb-3 group-hover:text-orange-600/60 transition-colors">Remaining</p>
            <p className="text-3xl font-black text-orange-600 tracking-widest">{remaining}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40">Utilization Vector</span>
            <span className="text-[14px] font-black text-teal-dark dark:text-brown tracking-widest">{usagePercent}%</span>
          </div>
          <div className="h-3 bg-teal-dark/5 dark:bg-white/5 rounded-full overflow-hidden border border-teal-dark/10 dark:border-white/10 p-0.5">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(45,212,191,0.3)]",
                usagePercent > 90 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-teal-base to-teal-dark'
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* Key Dates & Targets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-t border-teal-dark/10 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-teal-dark/5 dark:bg-white/5 border border-teal-dark/10 dark:border-white/10 flex items-center justify-center shrink-0 text-teal-dark/40 dark:text-teal-base/40">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40">Termination</span>
              <span className="text-[11px] font-black text-teal-dark dark:text-brown uppercase tracking-widest">
                {commitment.endDate && 'toDate' in commitment.endDate ? format((commitment.endDate as any).toDate(), "MMM d, yyyy") : 
                 commitment.renewalDate && 'toDate' in commitment.renewalDate ? format((commitment.renewalDate as any).toDate(), "MMM d, yyyy") : "N/A"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-teal-dark/5 dark:bg-white/5 border border-teal-dark/10 dark:border-white/10 flex items-center justify-center shrink-0 text-teal-dark/40 dark:text-teal-base/40">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40">Qualifying Min</span>
              <span className="text-[11px] font-black text-teal-base uppercase tracking-widest">$200 / Unit</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-teal-dark/5 dark:bg-white/5 border border-teal-dark/10 dark:border-white/10 flex items-center justify-center shrink-0 font-heading">
              <CheckCircle2 className={cn("h-4 w-4", commitment.firstOrderPlaced ? 'text-teal-base' : 'text-teal-dark/10 dark:text-white/10')} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 dark:text-teal-base/40">Inaugural Booking</span>
              <span className={cn(
                "text-[11px] font-black uppercase tracking-widest",
                commitment.firstOrderPlaced ? 'text-teal-base' : 'text-teal-dark/20 dark:text-white/20'
              )}>
                {commitment.firstOrderPlaced ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {isExpiring && (
          <div className="p-6 bg-orange-500/10 rounded-2xl flex items-start gap-4 border border-orange-500/20 shadow-glass animate-pulse">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600">Renewal Critical Path</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/60 leading-relaxed">Account within 30-day renewal window. Initiate re-engagement immediately.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
