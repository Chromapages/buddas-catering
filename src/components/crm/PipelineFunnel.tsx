"use client";

import { useQuery } from "@tanstack/react-query";
import { getPipelineFunnelStats } from "@/lib/firebase/services/crm";
import { TrendingUp, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function PipelineFunnel({ className }: { className?: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['pipeline-funnel'],
    queryFn: () => getPipelineFunnelStats(),
  });

  if (isLoading) return <div className={cn("h-full w-full animate-pulse bg-v-surface rounded-[24px] shadow-ambient", className)} />;
  if (!stats) return null;

  const steps = [
    { label: "Pipeline Entry", value: stats.newLeads, intensity: "bg-v-primary/5 border-v-primary/10 text-v-on-surface" },
    { label: "Direct Engagement", value: stats.contactedLeads, intensity: "bg-v-primary/15 border-v-primary/20 text-v-on-surface" },
    { label: "Qualified Intent", value: stats.qualifiedLeads, intensity: "bg-v-primary/30 border-v-primary/30 text-v-on-surface" },
    { label: "Active Accounts", value: stats.enrolledAccounts, intensity: "bg-v-primary/50 border-v-primary/40 text-white" },
    { label: "Retention Wins", value: stats.renewedMemberships, intensity: "bg-v-primary border-v-primary text-white" },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-v-surface border border-v-outline/20 shadow-ambient", className)}>
      <div className="px-6 py-5 border-b border-v-outline/20 bg-v-container/30">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-v-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-v-on-surface">Revenue Pipeline</h3>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-8 flex flex-col justify-center">
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div 
                className={cn(
                  "h-12 flex items-center justify-between px-6 rounded-2xl border transition-all duration-300 cursor-default shadow-sm hover:shadow-md hover:-translate-y-0.5",
                  step.intensity
                )}
                style={{ width: `${100 - (i * 8)}%` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{step.label}</span>
                <span className="text-lg font-black tabular-nums">{step.value}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-v-outline/20">
          <div className="p-4 bg-v-secondary/5 rounded-[20px] border border-v-secondary/20 group hover:shadow-ambient-lite transition-all">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-3 w-3 text-v-secondary" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-v-secondary leading-none">Leakage</p>
            </div>
            <p className="text-2xl font-bold text-v-on-surface tabular-nums leading-none tracking-tight mb-1">{stats.noFirstOrder}</p>
            <p className="text-[9px] font-medium text-v-on-surface/30 truncate">Unactivated Enrolled Accounts</p>
          </div>
          
          <div className="p-4 bg-v-primary/5 rounded-[20px] border border-v-primary/20 group hover:shadow-ambient-lite transition-all">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="h-3 w-3 text-v-primary" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-v-primary leading-none">Growth</p>
            </div>
            <p className="text-2xl font-bold text-v-on-surface tabular-nums leading-none tracking-tight mb-1">{stats.expiringMemberships}</p>
            <p className="text-[9px] font-medium text-v-on-surface/30 truncate">Memberships in Renewal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
