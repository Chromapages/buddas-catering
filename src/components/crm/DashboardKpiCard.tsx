"use client";

import { Card, CardContent } from "@/components/shared/Card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  subtext?: string;
  className?: string;
}

export function DashboardKpiCard({
  title,
  value,
  trend,
  icon: Icon,
  subtext,
  className
}: DashboardKpiCardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <div className={cn(
      "bg-v-surface p-6 rounded-[24px] shadow-ambient border border-v-outline/20 h-full",
      className
    )}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-v-on-surface/40 mb-3">
            {title}
          </p>
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl font-bold text-v-on-surface tabular-nums tracking-tight">
              {value}
            </h3>
            <div className="flex items-center gap-2">
              {trend !== undefined && (
                <span className={cn(
                   "text-[11px] font-bold flex items-center gap-1",
                  isPositive ? "text-v-primary" : "text-v-secondary"
                )}>
                  {isPositive ? "+" : "-"}{Math.abs(trend)}%
                  <span className="text-v-on-surface/30 font-medium">vs last period</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-v-container flex items-center justify-center border border-v-outline/25 text-v-on-surface/40">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
