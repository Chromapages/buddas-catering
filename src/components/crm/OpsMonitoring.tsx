"use client";

import { useQuery } from "@tanstack/react-query";
import { getOpsMonitoringAlerts } from "@/lib/firebase/services/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Skeleton } from "@/components/shared/Skeleton";
import { AlertTriangle, Clock, Users, Zap, ShieldAlert } from "lucide-react";

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
    <Card className={`border-2 transition-colors ${totalAlerts > 5 ? 'border-red-500/20' : 'border-gray-border/40'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${totalAlerts > 5 ? 'text-red-500' : 'text-orange'}`} />
            <CardTitle className="text-lg font-heading font-semibold text-brown">SLA Monitoring</CardTitle>
          </div>
          {totalAlerts > 0 && (
            <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
              {totalAlerts} ACTION REQUIRED
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pt-4">
        {alertItems.map((item, i) => (
          <div key={i} className={`p-4 rounded-xl border border-gray-border/20 ${item.bg} relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-2">
              <div className={`p-1.5 rounded-lg bg-white/80 shadow-sm ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className={`text-2xl font-black ${item.count > 0 ? item.color : 'text-brown/20'}`}>
                {item.count}
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brown/70">{item.label}</p>
            <p className="text-[10px] text-brown/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
