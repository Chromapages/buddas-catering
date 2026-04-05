"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/lib/firebase/services/crm";
import { RepScorecard } from "@/components/crm/RepScorecard";
import { Loader2, TrendingUp, BarChart3 } from "lucide-react";

export default function PerformancePage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['reps'],
    queryFn: async () => {
      const allUsers = await getAllUsers();
      return (allUsers as any[]).filter(u => u.role === 'rep');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brown/50">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Loading sales data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Sales Performance</h1>
          <p className="text-sm text-brown/70 mt-1">Real-time rep scorecards and revenue metrics.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-border/40 shadow-sm">
          <div className="flex items-center gap-2 text-teal-base">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Quota Period: Q1 2026</span>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {users && users.length > 0 ? (
          users.map((rep) => (
            <RepScorecard 
              key={rep.id} 
              repId={rep.id} 
              repName={rep.displayName || rep.email || "Unknown Rep"} 
            />
          ))
        ) : (
          <div className="text-center py-20 bg-gray-bg/30 rounded-2xl border-2 border-dashed border-gray-border">
            <BarChart3 className="w-16 h-16 text-brown/20 mx-auto mb-4" />
            <p className="text-lg font-bold text-brown">No Sales Reps Found</p>
            <p className="text-sm text-brown/50">Ensure users are assigned the &apos;rep&apos; role in settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
