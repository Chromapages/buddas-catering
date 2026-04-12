"use client";

import { 
  TrendingUp, 
  ShoppingCart, 
  Activity, 
  Zap, 
  ArrowUpRight 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CompanyKPIsProps {
  totalRevenue: number;
  orderVolume: number;
  healthScore: number;
  commitmentLevel?: string;
}

export const CompanyKPIs = ({
  totalRevenue,
  orderVolume,
  healthScore,
  commitmentLevel = "Tier 2"
}: CompanyKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Lifetime Revenue */}
      <div className="relative group bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-teal-dark/10 shadow-sm overflow-hidden transition-all hover:shadow-glass hover:shadow-teal-dark/5 hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp className="w-12 h-12 text-teal-dark" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-base/10 rounded-xl">
              <TrendingUp className="w-4 h-4 text-teal-dark" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brown/40 font-heading">Lifetime Yield</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-teal-dark dark:text-brown tracking-tighter font-heading">
              {formatCurrency(totalRevenue)}
            </h3>
            <div className="flex items-center text-[10px] font-black text-teal-base bg-teal-base/5 px-1.5 py-0.5 rounded-lg font-heading tracking-widest">
              <ArrowUpRight className="w-2 h-2 mr-0.5" />
              +18%
            </div>
          </div>
        </div>
      </div>

      {/* Order Volume */}
      <div className="relative group bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-teal-dark/10 shadow-sm overflow-hidden transition-all hover:shadow-glass hover:shadow-orange/5 hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShoppingCart className="w-12 h-12 text-orange" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange/10 rounded-xl">
              <ShoppingCart className="w-4 h-4 text-orange" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brown/40 font-heading">Event Frequency</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-teal-dark dark:text-brown tracking-tighter font-heading">
              {orderVolume}
            </h3>
            <span className="text-[10px] font-black uppercase text-brown/30 font-body tracking-widest">Total Successful</span>
          </div>
        </div>
      </div>

      {/* Account Health */}
      <div className="relative group bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-teal-dark/10 shadow-sm overflow-hidden transition-all hover:shadow-glass hover:shadow-teal-base/5 hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity className="w-12 h-12 text-teal-base" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-base/10 rounded-xl">
              <Activity className="w-4 h-4 text-teal-base" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brown/40 font-heading">Operational Vitality</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-teal-dark dark:text-brown tracking-tighter font-heading">
              {healthScore}%
            </h3>
            <span className="text-[10px] font-black uppercase text-brown/30 font-body tracking-widest">Health Pulse</span>
          </div>
        </div>
      </div>

      {/* Engagement Intensity */}
      <div className="relative group bg-teal-dark dark:bg-zinc-900 p-6 rounded-[2rem] shadow-glass shadow-teal-dark/20 dark:shadow-teal-base/5 border border-white/5 dark:border-teal-base/10 overflow-hidden transition-all hover:-translate-y-1 hover:bg-teal-dark/90 dark:hover:bg-zinc-800">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 font-heading">Engagement Rank</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white tracking-tighter font-heading">
              {commitmentLevel.toUpperCase()}
            </h3>
            <span className="text-[10px] font-black uppercase text-white/40 font-body tracking-widest">Protocol Status</span>
          </div>
        </div>
      </div>
    </div>
  );
};
