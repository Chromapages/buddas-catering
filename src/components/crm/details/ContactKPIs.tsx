"use client";

import { 
  TrendingUp, 
  ShoppingCart, 
  Target, 
  Zap, 
  ArrowUpRight 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ContactKPIsProps {
  totalSpend: number;
  ordersCount: number;
  aov: number;
  conversionRate?: string;
}

export const ContactKPIs = ({
  totalSpend,
  ordersCount,
  aov,
  conversionRate = "12.4%"
}: ContactKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Total Spend */}
      <div className="relative group bg-white p-8 rounded-[32px] border border-chef-charcoal/5 shadow-soft-low overflow-hidden transition-all hover:shadow-soft-mid hover:-translate-y-1 duration-500">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
          <TrendingUp className="w-16 h-16 text-chef-charcoal" />
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent-fresh/10 rounded-[14px] shadow-soft-low border border-accent-fresh/10">
              <TrendingUp size={16} className="text-accent-fresh" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-chef-muted">Total Gross</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black text-chef-charcoal tracking-tighter tabular-nums">
              {formatCurrency(totalSpend)}
            </h3>
            <div className="flex items-center text-[10px] font-black text-accent-fresh bg-accent-fresh/10 px-2.5 py-1 rounded-full uppercase tracking-widest border border-accent-fresh/10">
              <ArrowUpRight size={10} className="mr-1" />
              +24%
            </div>
          </div>
        </div>
      </div>

      {/* Orders Count */}
      <div className="relative group bg-white p-8 rounded-[32px] border border-chef-charcoal/5 shadow-soft-low overflow-hidden transition-all hover:shadow-soft-mid hover:-translate-y-1 duration-500">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
          <ShoppingCart className="w-16 h-16 text-chef-charcoal" />
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-chef-prep rounded-[14px] shadow-soft-low border border-chef-charcoal/5">
              <ShoppingCart size={16} className="text-chef-muted" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-chef-muted">Total Events</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black text-chef-charcoal tracking-tighter tabular-nums">
              {ordersCount}
            </h3>
            <span className="text-[10px] font-black text-chef-muted/30 uppercase tracking-[0.2em]">Executed</span>
          </div>
        </div>
      </div>

      {/* AOV */}
      <div className="relative group bg-white p-8 rounded-[32px] border border-chef-charcoal/5 shadow-soft-low overflow-hidden transition-all hover:shadow-soft-mid hover:-translate-y-1 duration-500">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
          <Target className="w-16 h-16 text-chef-charcoal" />
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-chef-prep rounded-[14px] shadow-soft-low border border-chef-charcoal/5">
              <Target size={16} className="text-chef-muted" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-chef-muted">Unit Value (AOV)</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black text-chef-charcoal tracking-tighter tabular-nums">
              {formatCurrency(aov)}
            </h3>
            <span className="text-[10px] font-black text-chef-muted/30 uppercase tracking-[0.2em]">Per Cycle</span>
          </div>
        </div>
      </div>

      {/* Conversion / Heat Score */}
      <div className="relative group bg-chef-charcoal p-8 rounded-[32px] shadow-soft-mid overflow-hidden transition-all hover:shadow-chef-charcoal/30 hover:-translate-y-1 duration-500">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-[14px] border border-white/5 shadow-soft-low">
              <Zap size={16} className="text-accent-heat" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white/40">Deal Intensity</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">
              {conversionRate}
            </h3>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent-heat rounded-full" style={{ width: conversionRate }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
