"use client";

import { useQuery } from "@tanstack/react-query";
import { getRepDetailedScorecard } from "@/lib/firebase/services/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { 
  Users, 
  Target, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  Award,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/shared/Skeleton";
import { useAuth } from "@/lib/firebase/context/auth";

interface RepScorecardProps {
  repId: string;
  repName: string;
}

export function RepScorecard({ repId, repName }: RepScorecardProps) {
  const { user, role } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['rep-scorecard', repId, user?.uid],
    queryFn: () => getRepDetailedScorecard(repId, user?.uid, role || undefined),
    enabled: !!repId && !!user && !!role,
  });

  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
    </div>;
  }

  if (!stats) return null;

  const metrics = [
    { label: "Leads Assigned", value: stats.assigned, icon: Users, color: "text-blue-500" },
    { label: "Leads Contacted", value: stats.contacted, icon: Target, color: "text-teal-500" },
    { label: "Signups Closed", value: stats.signups, icon: Award, color: "text-orange" },
    { label: "Accounts Active", value: stats.activeAccounts, icon: Briefcase, color: "text-purple-500" },
    { label: "First Orders", value: stats.firstOrders, icon: CheckCircle2, color: "text-green-500" },
    { label: "Overdue Tasks", value: stats.overdue, icon: Clock, color: stats.overdue > 0 ? "text-red-500" : "text-gray-400" },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-brown" },
    { label: "Comm. Revenue", value: `$${stats.commissionRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-teal-dark" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-brown/30 whitespace-nowrap">{repName} Performance Scorecard</h2>
        <div className="h-px bg-white/10 flex-1" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} variant="glass" className="border-white/20 p-5 group hover:bg-white/40 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-dark/5">
            <div className="flex flex-col gap-4">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
                m.color.replace('text-', 'bg-').replace('500', '500/10').replace('orange', 'orange/10').replace('brown', 'brown/10').replace('teal-dark', 'teal-dark/10')
              )}>
                <m.icon className={cn("w-5 h-5", m.color === "text-brown" ? "text-teal-dark" : m.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-dark/40">{m.label}</p>
                <p className="text-xl font-bold text-teal-dark group-hover:text-teal-base transition-colors leading-none">{m.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
