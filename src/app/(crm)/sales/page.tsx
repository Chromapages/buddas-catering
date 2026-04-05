"use client";

import { useAuth } from "@/lib/firebase/context/auth";
import { DashboardHeader } from "@/components/crm/DashboardHeader";
import { SalesTaskWidget } from "@/components/crm/SalesTaskWidget";
import { ActivationWidget } from "@/components/crm/ActivationWidget";
import { RepScorecard } from "@/components/crm/RepScorecard";
import { useQuery } from "@tanstack/react-query";
import { getStaleLeads } from "@/lib/firebase/services/sales.service";
import { Card, CardContent } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function SalesDashboardPage() {
  const { user } = useAuth();
  // const user = { uid: "esGSNUUdSmaRHrPRLK5hUVeUigX2", email: "lewie@aura.catering" };
  const firstName = user?.email?.split('@')[0] || "Team Member";

  const { data: staleLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ['stale-leads', user?.uid],
    queryFn: () => getStaleLeads(user!.uid),
    enabled: !!user,
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-700">
      <DashboardHeader 
        title={`Aloha, ${firstName}!`} 
        description="Today's focus: Clear your overdue tasks and activate your signed commitments." 
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column - Urgent Tasks & Activation */}
        <div className="lg:col-span-2 space-y-6">
          <SalesTaskWidget />
          <ActivationWidget />
        </div>

        {/* Sidebar Column - Personal Scorecard & Stale Leads */}
        <div className="space-y-6">
          <RepScorecard repId={user?.uid || ""} repName={firstName} />
          
          <Card className="border-gray-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-border/50 bg-gray-bg/20 flex items-center justify-between">
                <h3 className="text-sm font-bold text-brown flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange" /> Needs Follow-up
                </h3>
                <span className="text-[10px] font-bold text-brown/40 uppercase tracking-widest">3+ Days Stale</span>
            </div>
            <CardContent className="p-0">
                {leadsLoading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-bg animate-pulse rounded-md" />)}
                    </div>
                ) : staleLeads && staleLeads.length > 0 ? (
                    <ul className="divide-y divide-gray-border/50">
                        {staleLeads.map(lead => (
                            <li key={lead.id} className="p-4 hover:bg-gray-bg/10 transition-colors group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-brown truncate mr-2">{lead.companyName}</span>
                                    <Badge variant="neutral" className="text-[9px] px-1.5 h-4 opacity-70">{lead.status}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-brown/50">Last active {lead.updatedAt ? formatDistanceToNow(lead.updatedAt.toDate(), { addSuffix: true }) : 'long ago'}</p>
                                    <Link href={`/app/leads/${lead.id}`} className="text-[11px] font-bold text-teal-dark opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        Re-engage <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-12 text-center text-brown/30 flex flex-col items-center">
                        <Users className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm italic">Every lead is fresh. Keep it up!</p>
                    </div>
                )}
                {staleLeads && staleLeads.length > 0 && (
                    <div className="p-4 border-t border-gray-border/30 text-center">
                        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                            <Link href="/app/leads">View All Leads</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
