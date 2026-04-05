"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivationPipeline } from "@/lib/firebase/services/sales.service";
import { useAuth } from "@/lib/firebase/context/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Building2, ArrowUpRight, Trophy, Zap } from "lucide-react";
import Link from "next/link";

export function ActivationWidget() {
  const { user } = useAuth();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['activation-pipeline', user?.uid],
    queryFn: () => getActivationPipeline(user!.uid),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="h-64 w-full bg-white/50 animate-pulse rounded-xl border border-gray-border/50"></div>;
  }

  return (
    <Card className="border-gray-border shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="border-b border-gray-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange" />
            <CardTitle className="text-lg text-brown font-heading font-semibold">Ready to Activate</CardTitle>
          </div>
          <Badge variant="neutral" className="px-2 py-0.5">{accounts?.length || 0} Targets</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {accounts && accounts.length > 0 ? (
          <div className="divide-y divide-gray-border/50">
            {accounts.map(account => (
              <Link 
                key={account.id} 
                href={`/app/companies/${account.id}`}
                className="p-4 hover:bg-gray-bg/30 transition-colors flex items-center justify-between group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-brown/30" />
                    <p className="font-bold text-sm text-brown truncate">{account.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brown/40 uppercase tracking-tighter">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Signed Commitment
                    </div>
                    {/* Placeholder for tier-specific badges if needed */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-teal-dark uppercase tracking-widest">Action</p>
                        <p className="text-[11px] text-brown/60">Schedule First Lunch</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-bg flex items-center justify-center group-hover:bg-teal-base group-hover:text-white transition-all">
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
             <Trophy className="w-12 h-12 text-orange/20 mb-3" />
             <p className="text-sm font-bold text-brown/70 mb-1 caps tracking-wide">All Accounts Activated!</p>
             <p className="text-xs text-brown/40 px-6">Every signed account has placed their first order. Find more leads to convert.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
