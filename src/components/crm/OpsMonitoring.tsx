"use client";

import { useQuery } from "@tanstack/react-query";
import { getOpsMonitoringAlerts } from "@/lib/firebase/services/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Skeleton } from "@/components/shared/Skeleton";
import { AlertTriangle, Clock, Users, Zap, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function OpsMonitoring() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['ops-alerts'],
    queryFn: () => getOpsMonitoringAlerts(),
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!alerts) return null;

  const alertItems = [
    { 
      label: "Untouched Leads", 
      count: alerts.untouchedNewLeads, 
      icon: Users, 
      color: "text-orange", 
      bg: "bg-orange/10",
      description: "Leads with no response > 24h"
    },
    { 
      label: "Critical Tasks", 
      count: alerts.extremeOverdueTasks, 
      icon: Clock, 
      color: "text-red-500", 
      bg: "bg-red-500/10",
      description: "Tasks overdue > 3 days"
    },
    { 
      label: "Inactive Enrolled", 
      count: alerts.inactiveEnrolled, 
      icon: Zap, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10",
      description: "Enrolled accounts with no orders"
    },
    { 
      label: "Expiring Accounts", 
      count: alerts.expiringNoOutreach, 
      icon: ShieldAlert, 
      color: "text-teal-base", 
      bg: "bg-teal-base/10",
      description: "Memberships expiring < 30 days"
    },
  ];

  const totalAlerts = Object.values(alerts).reduce((a, b) => a + b, 0);

  return (
    <div className={cn("p-6 space-y-6", totalAlerts > 5 ? 'bg-v-secondary/5' : 'bg-transparent')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${totalAlerts > 5 ? 'text-v-secondary' : 'text-v-on-surface/40'}`} />
          <h3 className="text-sm font-bold text-v-on-surface tracking-tight">SLA Performance</h3>
        </div>
        {totalAlerts > 5 && (
          <div className="bg-v-secondary text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            {totalAlerts} Critical
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {alertItems.map((item, i) => {
          const isDanger = item.color.includes('red') || item.count > 10;
          const isWarning = item.color.includes('orange') || item.count > 5;
          
          return (
            <div key={i} className="p-4 rounded-[20px] bg-v-surface border border-v-outline/20 shadow-sm group hover:shadow-ambient hover:border-v-primary/10 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-2 rounded-full",
                  isDanger ? "bg-v-secondary/10 text-v-secondary" : isWarning ? "bg-v-primary/10 text-v-primary" : "bg-v-container text-v-on-surface/40"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  "text-2xl font-bold tabular-nums",
                  item.count > 0 ? (isDanger ? "text-v-secondary" : "text-v-on-surface") : "text-v-on-surface/20"
                )}>
                  {item.count}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-v-on-surface/40 leading-none">{item.label}</p>
                <p className="text-[9px] font-medium text-v-on-surface/30 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
