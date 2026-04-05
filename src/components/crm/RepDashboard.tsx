"use client";

import { useAuth } from "@/lib/firebase/context/auth";
import { useQuery } from "@tanstack/react-query";
import { 
  getNeedsAttentionLeads, 
  getActivationPipeline, 
  getRepMonthlyStats,
  getStaleLeads,
  getRepTaskSummary,
  getBookedCallLeads
} from "@/lib/firebase/services/crm";
import { TaskWidget } from "@/components/crm/TaskWidget";
import { BookedCallsWidget } from "@/components/crm/BookedCallsWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { 
  AlertCircle, 
  Users, 
  ArrowRight, 
  Clock, 
  Zap,
  Calendar,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { calculateLeadScore } from "@/lib/firebase/services/scoring.service";

export function RepDashboard() {
  const { user } = useAuth();
  // const user = { uid: "esGSNUUdSmaRHrPRLK5hUVeUigX2", email: "lewie@aura.catering" };
  const repId = user?.uid || "";
  
  const [logState, setLogState] = useState<{
    isOpen: boolean;
    entityId: string;
    entityType: 'LEAD' | 'COMPANY';
    entityName: string;
  }>({
    isOpen: false,
    entityId: "",
    entityType: "LEAD",
    entityName: "",
  });

  // Queries
  const { data: attentionLeads, refetch: refetchLeads } = useQuery({
    queryKey: ['attention-leads', repId],
    queryFn: () => getNeedsAttentionLeads(repId, 'rep'),
    enabled: !!repId,
  });

  const { data: activationPipeline, refetch: refetchActivation } = useQuery({
    queryKey: ['activation-pipeline', repId],
    queryFn: () => getActivationPipeline(repId),
    enabled: !!repId,
  });

  const { data: stats } = useQuery({
    queryKey: ['rep-stats', repId],
    queryFn: () => getRepMonthlyStats(repId),
    enabled: !!repId,
  });

  const { data: taskSummary } = useQuery({
    queryKey: ['rep-task-summary', repId],
    queryFn: () => getRepTaskSummary(repId),
    enabled: !!repId,
  });

  const { data: staleLeads, refetch: refetchStale } = useQuery({
    queryKey: ['stale-leads', repId],
    queryFn: () => getStaleLeads(repId),
    enabled: !!repId,
  });

  const { data: bookedCallLeads, refetch: refetchBookedCalls } = useQuery({
    queryKey: ['booked-call-leads', repId],
    queryFn: () => getBookedCallLeads(repId, 'rep'),
    enabled: !!repId,
  });

  const newLeads = attentionLeads?.filter((l: any) => l.status === 'New') || [];

  const renderHeatIndicator = (leadOrCompany: any) => {
    const scoring = calculateLeadScore(leadOrCompany);
    if (scoring.heat === "Hot") {
      return (
        <Badge className="bg-orange/10 text-orange border-orange/20 flex items-center gap-1 group-hover:bg-orange group-hover:text-white transition-colors">
          🔥 <span className="text-[10px] uppercase font-bold tracking-tighter">Hot</span>
        </Badge>
      );
    }
    if (scoring.heat === "Warm") {
      return (
        <Badge className="bg-gold/10 text-gold border-gold/20 flex items-center gap-1">
          ☀️ <span className="text-[10px] uppercase font-bold tracking-tighter">Warm</span>
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1">
        ❄️ <span className="text-[10px] uppercase font-bold tracking-tighter">Cold</span>
      </Badge>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8 overscroll-y-contain">
      {/* 1. Daily Priority Bar */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar pr-12">
          <div className="flex items-center gap-2 bg-orange/10 border border-orange/20 px-4 py-2 rounded-full whitespace-nowrap text-orange font-bold text-[10px] uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{taskSummary?.overdue || 0} Overdue</span>
          </div>
          <div className="flex items-center gap-2 bg-teal-base/10 border border-teal-base/20 px-4 py-2 rounded-full whitespace-nowrap text-teal-dark font-bold text-[10px] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{taskSummary?.dueToday || 0} Due Today</span>
          </div>
          <div className="flex items-center gap-2 bg-[#E9C559]/10 border border-[#E9C559]/20 px-4 py-2 rounded-full whitespace-nowrap text-[#B8860B] font-bold text-[10px] uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>{activationPipeline?.length || 0} Activation Need</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full whitespace-nowrap text-blue-600 font-bold text-[10px] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{bookedCallLeads?.length || 0} Booked Calls</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full whitespace-nowrap text-blue-600 font-bold text-[10px] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>{newLeads.length} New Leads</span>
          </div>
        </div>
        {/* Scroll affordance gradient */}
        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 1.5 Booked Calls Priority */}
          <BookedCallsWidget 
            leads={bookedCallLeads || []} 
            renderHeatIndicator={renderHeatIndicator} 
          />


          {/* 2. New Leads Assigned */}
          <Card className="border-gold/30 shadow-sm overflow-hidden">
            <CardHeader className="bg-gold/5 border-b border-gold/10 py-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                <CardTitle className="text-lg font-heading">New Leads (No Activity)</CardTitle>
              </div>
              <Badge variant="warning">{newLeads.length}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-border">
                {newLeads.map((lead: any) => (
                  <li key={lead.id} className="p-4 hover:bg-gray-bg/30 transition-colors flex items-center justify-between group">
                    <div>
                      <p className="font-bold text-brown">{lead.companyName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-brown/60">{lead.contactName || lead.email} · {lead.cateringNeed || "General Inquiry"}</p>
                        {renderHeatIndicator(lead)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="min-h-[44px] gap-2 text-teal-base hover:bg-teal-base/5"
                        style={{ touchAction: "manipulation" }}
                        onClick={() => setLogState({
                          isOpen: true,
                          entityId: lead.id,
                          entityType: "LEAD",
                          entityName: lead.companyName || lead.contactName || "Lead",
                        })}
                      >
                         Log Call
                      </Button>
                      <Button size="sm" asChild className="min-h-[44px]" style={{ touchAction: "manipulation" }}>
                        <Link href={`/app/leads/${lead.id}`} className="flex items-center gap-2">
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
                {newLeads.length === 0 && (
                  <li className="p-8 text-center text-brown/40 italic">All new leads have been touched. Great job!</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* 3. Activation Pipeline */}
          <Card className="border-teal-base/30 shadow-sm overflow-hidden">
            <CardHeader className="bg-teal-base/5 border-b border-teal-base/10 py-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-teal-dark" />
                <CardTitle className="text-lg font-heading">Needs First Order (Activation)</CardTitle>
              </div>
              <Badge variant="neutral">{activationPipeline?.length || 0}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-border">
                {activationPipeline?.map((company: any) => (
                  <li key={company.id} className="p-4 hover:bg-gray-bg/30 transition-colors flex items-center justify-between group">
                    <div>
                      <p className="font-bold text-brown">{company.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-brown/60">Signed {formatDistanceToNow(company.createdAt?.toDate() || new Date())} ago</p>
                        {renderHeatIndicator(company)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="min-h-[44px] gap-2 text-teal-base hover:bg-teal-base/5"
                        style={{ touchAction: "manipulation" }}
                        onClick={() => setLogState({
                          isOpen: true,
                          entityId: company.id,
                          entityType: "COMPANY",
                          entityName: company.name,
                        })}
                      >
                         Log Touch
                      </Button>
                      <Button variant="outline" size="sm" asChild className="min-h-[44px]" style={{ touchAction: "manipulation" }}>
                        <Link href={`/app/companies/${company.id}`}>Drive Activation</Link>
                      </Button>
                    </div>
                  </li>
                ))}
                {(!activationPipeline || activationPipeline.length === 0) && (
                  <li className="p-8 text-center text-brown/40 italic">No accounts pending activation.</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* 4. Stale Leads */}
          <Card className="border-gray-border shadow-sm overflow-hidden opacity-90">
            <CardHeader className="py-4 border-b border-gray-border">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brown/40" />
                <CardTitle className="text-lg font-heading text-brown/70">Stale Leads ({'>'} 3 Days)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-border">
                {staleLeads?.map((lead: any) => (
                  <li key={lead.id} className="p-4 hover:bg-gray-bg/30 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brown">{lead.companyName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-brown/50 uppercase tracking-wider font-bold">Status: {lead.status}</p>
                        {renderHeatIndicator(lead)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/app/leads/${lead.id}`}><ChevronRight className="w-4 h-4" /></Link>
                    </Button>
                  </li>
                ))}
                {(!staleLeads || staleLeads.length === 0) && (
                  <li className="p-8 text-center text-brown/40 italic">No stale leads. Performance is high!</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 5. Sidebar Columns */}
        <div className="space-y-8">
           <TaskWidget />
           
           <Card className="bg-teal-dark text-white shadow-lg overflow-hidden border-none">
             <CardContent className="p-6">
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-6">This Month&apos;s Tracking</p>
               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-3xl font-bold font-heading">{stats?.signups || 0} Wins</span>
                     <span className="text-[10px] font-bold opacity-40 uppercase">Goal: {stats?.goal || 10}</span>
                   </div>
                   <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div 
                       className="bg-gold h-full transition-all duration-1000" 
                       style={{ width: `${Math.min(((stats?.signups || 0) / (stats?.goal || 10)) * 100, 100)}%` }}
                     />
                   </div>
                 </div>
                 <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl" asChild>
                   <Link href="/app/scorecard">View Your Scorecard</Link>
                 </Button>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>

      <QuickLogDrawer 
        {...logState}
        onClose={() => setLogState(prev => ({ ...prev, isOpen: false }))}
        currentLeadStatus={
          logState.entityType === 'LEAD' 
            ? (attentionLeads?.find((l: any) => l.id === logState.entityId) as any)?.status
            : (activationPipeline?.find((c: any) => c.id === logState.entityId) as any)?.status
        }
        onSuccess={() => {
          refetchLeads();
          refetchActivation();
          refetchStale();
          refetchBookedCalls();
        }}
      />
    </div>
  );
}
