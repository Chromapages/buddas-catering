"use client";

import { useQuery } from "@tanstack/react-query";
import { getPipelineFunnelStats } from "@/lib/firebase/services/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Skeleton } from "@/components/shared/Skeleton";
import { ArrowRight, ChevronRight } from "lucide-react";

export function PipelineFunnel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['pipeline-funnel'],
    queryFn: () => getPipelineFunnelStats(),
  });

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;
  if (!stats) return null;

  const steps = [
    { label: "New Leads", value: stats.newLeads, color: "bg-teal-base/20 border-teal-base/10" },
    { label: "Contacted", value: stats.contactedLeads, color: "bg-teal-base/40 border-teal-base/20" },
    { label: "Qualified (Won)", value: stats.qualifiedLeads, color: "bg-teal-base/60 border-teal-base/30 text-white" },
    { label: "Enrolled (Active)", value: stats.enrolledAccounts, color: "bg-teal-base/80 border-teal-base/40 text-white" },
    { label: "Renewed", value: stats.renewedMemberships, color: "bg-teal-dark border-teal-dark text-white" },
  ];

  return (
    <Card className="border-gray-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-heading font-semibold text-brown">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div 
                className={`h-12 flex items-center justify-between px-6 rounded-lg border flex-1 transition-all hover:scale-[1.02] cursor-default ${step.color}`}
                style={{ width: `${100 - (i * 10)}%` }}
              >
                <span className="text-sm font-bold uppercase tracking-wider">{step.label}</span>
                <span className="text-xl font-black">{step.value}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block">
                  <ArrowRight className="w-4 h-4 text-brown/20" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-border/40">
          <div className="p-4 bg-orange/5 rounded-xl border border-orange/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange/60 mb-1">Retention Leak</p>
            <p className="text-2xl font-black text-orange">{stats.noFirstOrder}</p>
            <p className="text-[10px] font-medium text-orange/80">Enrolled but no first order placed</p>
          </div>
          <div className="p-4 bg-teal-base/5 rounded-xl border border-teal-base/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-dark/60 mb-1">Growth High</p>
            <p className="text-2xl font-black text-teal-dark">{stats.expiringMemberships}</p>
            <p className="text-[10px] font-medium text-teal-dark/80">Memberships in renewal window</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
