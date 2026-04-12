"use client";

import React from 'react';
import { 
  Award, 
  Target, 
  Calendar, 
  ChevronRight,
  Zap,
  Clock,
  CircleDollarSign,
  ArrowUpRight,
  PieChart,
  BarChart3
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Commitment } from "@/types/crm";
import { Badge } from "@/components/shared/Badge";
import { format } from "date-fns";

interface MembershipGridProps {
  commitments: Commitment[];
  companyMap: Record<string, string>;
  onSelect: (commitment: Commitment) => void;
}

export function MembershipGrid({ commitments, companyMap, onSelect }: MembershipGridProps) {
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 2: return "text-chef-charcoal bg-chef-prep";
      case 4: return "text-gold bg-gold/10 border-gold/20";
      case 6: return "text-accent-fresh bg-accent-fresh/10 border-accent-fresh/20";
      default: return "text-chef-muted bg-chef-prep";
    }
  };

  const getStatusBadge = (status: string, active: boolean) => {
    if (!active) return <Badge className="bg-accent-heat/10 text-accent-heat border-accent-heat/20 font-black uppercase text-[9px] px-3 py-1">Inactive</Badge>;
    if (status === 'Expiring') return <Badge className="bg-gold/10 text-gold border-gold/20 font-black uppercase text-[9px] px-3 py-1">Expiring Soon</Badge>;
    return <Badge className="bg-accent-fresh/10 text-accent-fresh border-accent-fresh/20 font-black uppercase text-[9px] px-3 py-1">Active Ledger</Badge>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {commitments.map((commitment) => {
        const usagePercent = Math.round((commitment.ordersUsed / commitment.ordersCommitted) * 100);
        
        return (
          <div 
            key={commitment.id}
            onClick={() => onSelect(commitment)}
            className="group relative bg-white rounded-[40px] border border-chef-charcoal/5 shadow-soft-low hover:shadow-soft-mid transition-all duration-700 cursor-pointer overflow-hidden active:scale-[0.98] flex flex-col h-full"
          >
            {/* Tier Indicator */}
            <div className="absolute top-0 right-0 p-8 pt-10">
              <div className={cn(
                "h-12 w-12 rounded-[18px] flex items-center justify-center shadow-soft-low transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 border",
                getTierColor(commitment.tier)
              )}>
                <Award size={20} />
              </div>
            </div>

            <div className="p-8 pb-0 relative z-10">
              <div className="flex flex-col gap-2">
                {getStatusBadge(commitment.status, commitment.active)}
                <h3 className="font-black text-2xl text-chef-charcoal tracking-tight leading-tight group-hover:text-accent-fresh transition-colors truncate max-w-[80%]">
                  {companyMap[commitment.companyId] || "Loading Company..."}
                </h3>
              </div>
            </div>

            {/* Usage Metrics */}
            <div className="p-8 pt-6 space-y-6 flex-1 z-10">
              <div className="space-y-3">
                <div className="flex items-end justify-between px-1">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-chef-muted opacity-40 mb-1">Utilization Pulse</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-chef-charcoal tabular-nums">{commitment.ordersUsed}</span>
                      <span className="text-xs font-black text-chef-muted opacity-30 uppercase">/ {commitment.ordersCommitted} Events</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-accent-fresh tabular-nums">{usagePercent}%</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-4 bg-chef-prep/30 rounded-full overflow-hidden p-1 shadow-inner">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out shadow-soft-low relative overflow-hidden",
                      usagePercent > 80 ? "bg-accent-heat" : "bg-chef-charcoal"
                    )}
                    style={{ width: `${usagePercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-[24px] bg-chef-prep/20 border border-chef-charcoal/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 opacity-30">
                    <Calendar size={12} className="text-chef-charcoal" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-chef-charcoal">Fulfillment End</span>
                  </div>
                  <span className="text-[12px] font-black text-chef-charcoal uppercase tracking-tighter">
                    {commitment.endDate?.seconds ? format(commitment.endDate.toDate(), "MMM dd, yyyy") : "—"}
                  </span>
                </div>
                <div className="p-4 rounded-[24px] bg-chef-prep/20 border border-chef-charcoal/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 opacity-30">
                    <CircleDollarSign size={12} className="text-chef-charcoal" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-chef-charcoal">Yield Benefit</span>
                  </div>
                  <span className="text-[12px] font-black text-accent-fresh uppercase tracking-tighter">
                    {commitment.discountPercent}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Intelligence */}
            <div className="px-8 py-5 border-t border-chef-charcoal/[0.03] bg-chef-prep/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-chef-muted opacity-40" />
                <span className="text-[10px] font-bold text-chef-muted tracking-tight">
                  Tier {commitment.tier} Protocol
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-chef-muted group-hover:bg-chef-charcoal group-hover:text-white transition-all shadow-soft-low">
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
