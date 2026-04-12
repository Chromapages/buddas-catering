"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export interface DataPoint {
  label: string;
  value: number;
}

interface RevenueBarChartProps {
  title: string;
  data: DataPoint[];
  height?: number;
  goal?: number;
  className?: string;
  metric?: string;
  trend?: string;
  showToggles?: boolean;
}

export function RevenueBarChart({
  title,
  data,
  height = 240,
  goal = 35000,
  className,
  metric,
  trend,
  showToggles = true
}: RevenueBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), goal, 1);
  
  const totalRevenue = data.find(d => d.label === 'Current')?.value || data.reduce((acc, curr) => acc + curr.value, 0);
  const displayMetric = metric || `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className={cn("bg-v-surface rounded-[24px] shadow-ambient border border-v-outline/20 p-8 flex flex-col h-full", className)}>
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E07B54]">
            {title}
          </p>
          <div className="flex flex-col mt-2">
            <span className="text-4xl font-black text-v-on-surface tracking-tighter tabular-nums leading-none">
              {displayMetric}
            </span>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-v-primary/10 rounded-lg">
                <TrendingUp className="h-3 w-3 text-v-primary" />
                <span className="text-[10px] font-black text-v-primary uppercase tracking-tight">
                  {trend || "+12.4% from last month"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {showToggles && (
          <div className="flex bg-v-container/30 p-1 rounded-full border border-v-outline/5 transition-all">
            <button className="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-v-surface shadow-md text-v-on-surface">30D</button>
            <button className="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-v-on-surface/40 hover:text-v-on-surface transition-colors">90D</button>
          </div>
        )}
      </div>

      <div 
        className="relative flex items-end justify-between gap-4 px-2 mt-auto"
        style={{ height: `${height}px` }}
      >
        {/* Y-Axis Grid Lines */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none opacity-30">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-v-outline/20" />
          ))}
        </div>

        {data.map((point, i) => {
          const isHighlighted = point.label === 'Current' || point.value === Math.max(...data.map(d => d.value));
          return (
            <div key={point.label} className="flex-1 flex flex-col items-center gap-4 z-10 group relative max-w-[64px]">
              <div className="relative w-full flex flex-col items-center h-full justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(point.value / maxValue) * 100}%` }}
                  transition={{ duration: 1.2, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                  className={cn(
                    "w-full rounded-2xl shadow-sm transition-all duration-500 relative group-hover:brightness-110",
                    isHighlighted 
                      ? "bg-[#0D7377] shadow-[0_15px_35px_rgba(13,115,119,0.25)] ring-1 ring-white/10" 
                      : "bg-v-container opacity-30 group-hover:opacity-50"
                  )}
                >
                  {/* Tooltip-style highlight label */}
                  {point.label === 'Current' && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-v-on-surface text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-700 whitespace-nowrap">
                        ${(point.value/1000).toFixed(0)}k
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-v-on-surface rotate-45" />
                     </div>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
