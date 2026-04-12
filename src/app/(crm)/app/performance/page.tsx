"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/lib/firebase/services/crm";
import { RepScorecard } from "@/components/crm/RepScorecard";
import { TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-teal-dark/40">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-teal-base border-t-transparent shadow-lg shadow-teal-base/20 mb-4"></div>
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Sorting sales intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-12 overscroll-y-contain">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
        <div>
          <h1 className="text-4xl font-bold font-heading text-teal-dark tracking-tight">Sales Force</h1>
          <p className="text-sm text-brown/70 mt-1 font-medium italic">High-density performance monitoring and rep diagnostics.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 border border-white/20 p-4 rounded-2xl shadow-xl shadow-teal-dark/5 backdrop-blur-md group-hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 text-teal-dark">
            <div className="p-2 bg-teal-base/20 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40">Active Quota Period</span>
              <span className="text-xs font-black uppercase tracking-widest">Q1 2026 CYCLE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-20 flex-1">
        {users && users.length > 0 ? (
          users.map((rep) => (
            <RepScorecard 
              key={rep.id} 
              repId={rep.id} 
              repName={rep.displayName || rep.email || "Unknown Rep"} 
            />
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/40 bg-white/10 px-6 py-24 text-center group">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                <BarChart3 className="h-8 w-8 text-teal-base" />
              </div>
              <div>
                <p className="text-xl font-bold text-teal-dark">No Reps Available</p>
                <p className="mt-1 text-sm text-brown/50 font-medium">Assign a 'rep' role to active members to begin tracking performance.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
