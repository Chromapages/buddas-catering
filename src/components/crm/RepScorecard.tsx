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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading text-brown">{repName}&apos;s Performance</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="border-gray-border/40 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-gray-bg ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brown/50">{m.label}</p>
                <p className="text-lg font-bold text-brown">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
