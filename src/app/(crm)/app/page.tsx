"use client";

import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckSquare,
  FastForward,
  Target,
  type LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/context/auth";
import { useQuery } from "@tanstack/react-query";
import { TaskWidget } from "@/components/crm/TaskWidget";
import { RepDashboard } from "@/components/crm/RepDashboard";
import { 
  getDashboardStats, 
  getNeedsAttentionLeads,
  getPendingApprovals,
  triggerRenewalTasks,
  getUnassignedLeads,
  getCompaniesByHealthState,
  getRecentRepActivity,
  getLeadSourceStats,
  rejectCommission,
  approveCommission
} from "@/lib/firebase/services/crm";
import { useEffect, useState } from "react";
import { PipelineFunnel } from "@/components/crm/PipelineFunnel";
import { OpsMonitoring } from "@/components/crm/OpsMonitoring";
import { SourceBreakdownWidget, RepActivityWidget, ActivationPipelineWidget } from "@/components/crm/AdminWidgets";
import { getHeatMetadata } from "@/lib/utils/heat-scoring";
import { cn } from "@/lib/utils";
import type { CommissionApproval, Lead } from "@/types/crm";

type AttentionLead = Lead & { heatScore?: number };

export default function CRMDashboard() {
  const { user, role } = useAuth();
  const [rejectingApprovalId, setRejectingApprovalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  useEffect(() => {
    if (user) {
      triggerRenewalTasks();
    }
  }, [user]);

  const isAdmin = role === 'owner' || role === 'marketing' || role === 'ops';
  const isRep = role === 'rep';

  // React Query Fetching
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.uid],
    queryFn: () => getDashboardStats(user!.uid, role!),
    enabled: !!user && !!role && !isRep,
  });

  const { data: unassignedLeads } = useQuery({
    queryKey: ['unassigned-leads'],
    queryFn: () => getUnassignedLeads(),
    enabled: !!user && !!role && isAdmin,
  });

  const { data: activationPipeline } = useQuery({
    queryKey: ['activation-pipeline'],
    queryFn: () => getCompaniesByHealthState(undefined, 'no-first-order'),
    enabled: !!user && !!role && isAdmin,
  });

  const { data: repActivity } = useQuery({
    queryKey: ['rep-activity'],
    queryFn: () => getRecentRepActivity(7),
    enabled: !!user && !!role && isAdmin,
  });

  const { data: sourceBreakdown } = useQuery({
    queryKey: ['source-breakdown'],
    queryFn: () => getLeadSourceStats(user?.uid, role!),
    enabled: !!user && !!role && isAdmin,
  });

  const { data: attentionLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ['attention-leads', user?.uid],
    queryFn: () => getNeedsAttentionLeads(user!.uid, role!),
    enabled: !!user && !!role && !isRep,
  });

  const { data: pendingApprovals, isLoading: approvalsLoading, refetch: refetchApprovals } = useQuery({
    queryKey: ['pending-approvals', user?.uid],
    queryFn: () => getPendingApprovals(user!.uid, role!),
    enabled: !!user && !!role && isAdmin,
  });

  const isLoading = !isRep && (statsLoading || leadsLoading || (isAdmin && approvalsLoading));

  const handleApprove = async (id: string) => {
    if (!user) return;
    await approveCommission(id, user.uid, user.displayName || user.email || 'Admin');
    refetchApprovals();
  };

  const handleReject = async () => {
    if (!user || !rejectingApprovalId || !rejectionReason.trim()) return;
    await rejectCommission(rejectingApprovalId, user.uid, user.displayName || user.email || 'Admin', rejectionReason);
    setRejectingApprovalId(null);
    setRejectionReason("");
    refetchApprovals();
  };

  if (isRep) {
    return <RepDashboard />;
  }

  if (isLoading) {
    return <DashboardSkeleton isAdmin={isAdmin} />;
  }

  const unassignedCount = unassignedLeads?.length || 0;
  const pendingApprovalsCount = pendingApprovals?.length || 0;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

  const stats: Array<{
    name: string;
    value: string | number;
    change: string;
    icon: LucideIcon;
    subtext: string;
    href: string;
    alert: "red" | "green" | null;
  }> = isAdmin
    ? [
        {
          name: "Total Leads",
          value: statsData?.totalLeads || 0,
          change: "Open CRM Volume",
          icon: Users,
          subtext: "All active pipeline records",
          href: "/app/leads",
          alert: null,
        },
        {
          name: "Pipeline Value",
          value: formatCurrency(statsData?.pipelineValue || 0),
          change: "Booked + Pending",
          icon: DollarSign,
          subtext: "Gross value across open requests",
          href: "/app/orders",
          alert: null,
        },
        {
          name: "Weighted Pipeline",
          value: formatCurrency(statsData?.weightedPipeline || 0),
          change: "Probability Adjusted",
          icon: Target,
          subtext: `Full pipeline ${formatCurrency(statsData?.pipelineValue || 0)}`,
          href: "/app/orders",
          alert: null,
        },
        {
          name: "Sales Velocity",
          value: `${statsData?.avgSalesVelocity || 0} days`,
          change: "Lead to Won",
          icon: FastForward,
          subtext: "Average time to close",
          href: "/app/leads",
          alert: (statsData?.avgSalesVelocity || 0) <= 10 ? "green" : null,
        },
        {
          name: "Win Rate",
          value: `${statsData?.winRate || 0}%`,
          change: "Closed-Won Ratio",
          icon: TrendingUp,
          subtext: "Win rate indicator for resolved deals",
          href: "/app/performance",
          alert: (statsData?.winRate || 0) >= 40 ? "green" : null,
        },
        {
          name: "Pending Approvals",
          value: pendingApprovalsCount,
          change: pendingApprovalsCount > 0 ? "Needs Review" : "Clear",
          icon: CheckSquare,
          subtext: pendingApprovalsCount > 0 ? "Commission approvals waiting" : "No rep payouts waiting",
          href: "/app/approvals",
          alert: pendingApprovalsCount > 0 ? "red" : "green",
        },
      ]
    : [
        {
          name: "Unassigned Leads",
          value: unassignedCount,
          change: unassignedCount > 0 ? "Requires Action" : "All Assigned",
          icon: Users,
          subtext: "Assign now",
          href: "/app/leads",
          alert: unassignedCount > 0 ? "red" : null,
        },
        {
          name: "Weighted Pipeline",
          value: formatCurrency(statsData?.weightedPipeline || 0),
          change: "Revenue Probability",
          icon: Target,
          subtext: `Full pipeline ${formatCurrency(statsData?.pipelineValue || 0)}`,
          href: "/app/orders",
          alert: null,
        },
        {
          name: "Sales Velocity",
          value: `${statsData?.avgSalesVelocity || 0} days`,
          change: "Lead to Won",
          icon: FastForward,
          subtext: "Average close speed",
          href: "/app/leads",
          alert: (statsData?.avgSalesVelocity || 0) <= 10 ? "green" : null,
        },
        {
          name: "Win Rate",
          value: `${statsData?.winRate || 0}%`,
          change: "Closed-Won Ratio",
          icon: TrendingUp,
          subtext: "Win rate indicator",
          href: "/app/performance",
          alert: (statsData?.winRate || 0) >= 40 ? "green" : null,
        },
      ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Dashboard</h1>
          <p className="mt-1 text-sm text-brown/70">
            Welcome back, {user?.displayName || user?.email || "Team"}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        {!isRep && (
          <div className="mt-4 sm:mt-0 flex gap-3">
            {isAdmin && (
              <Button variant="outline" asChild>
                <Link href="/app/performance">Sales Performance</Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/app/leads/new">Add Manual Lead</Link>
            </Button>
          </div>
        )}
      </div>

      {/* 1. At-a-Glance Metrics Row */}
      <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2", isAdmin ? "xl:grid-cols-3" : "lg:grid-cols-4")}>
        {stats.map((stat, idx) => (
          <Link href={stat.href} key={idx} className="block group">
            <Card className="border-gray-border/60 shadow-sm group-hover:shadow-md group-hover:border-teal-base/30 transition-all duration-300 overflow-hidden h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-brown/50 uppercase tracking-widest">{stat.name}</p>
                      {stat.alert === 'red' && <Badge variant="danger" className="animate-pulse">Action Required</Badge>}
                    </div>
                    <p className={cn(
                      "mt-2 text-3xl font-bold font-heading text-teal-dark group-hover:scale-105 transition-transform origin-left",
                      stat.alert === 'red' && "text-orange",
                      stat.alert === 'green' && "text-teal-base"
                    )}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-teal-base/10 flex items-center justify-center shrink-0 group-hover:bg-teal-base group-hover:text-white transition-colors">
                    <stat.icon className="h-6 w-6 text-teal-dark group-hover:text-white" />
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm border-t border-gray-border/30 pt-3">
                  <span className="text-teal-dark font-bold text-xs uppercase tracking-tight">{stat.change}</span>
                  <span className="ml-2 text-brown/40 text-[10px] uppercase font-bold tracking-tight">{stat.subtext}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 2. Pipeline & Monitoring (Admin Only) */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineFunnel />
            <OpsMonitoring />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SourceBreakdownWidget data={sourceBreakdown || []} />
            <RepActivityWidget data={repActivity || []} />
            <ActivationPipelineWidget data={activationPipeline || []} />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 3. Needs Attention Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-orange/20 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-border/50 bg-orange/5 pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange" />
                <CardTitle className="text-lg text-brown font-heading font-semibold">Needs Attention</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-border">
                {attentionLeads && attentionLeads.length > 0 ? attentionLeads.map((lead: AttentionLead) => {
                  const heatMeta = typeof lead.heatScore === "number" ? getHeatMetadata(lead.heatScore) : null;

                  return (
                    <li key={lead.id} className="p-4 hover:bg-white transition-colors flex items-center justify-between group">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-brown">{lead.companyName || "Unknown Company"}</span>
                          <Badge variant={lead.status === "New" ? "warning" : "neutral"}>{lead.status}</Badge>
                          {heatMeta ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1",
                                heatMeta.bg,
                                heatMeta.color,
                                heatMeta.ring
                              )}
                            >
                              {heatMeta.label} {lead.heatScore}
                            </span>
                          ) : null}
                          {lead.status === "New" && (
                            <span className="text-xs text-orange font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Needs Response
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-brown/70">{lead.contactName}: {lead.cateringNeed} for {lead.estimatedGroupSize} people.</p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/app/leads/${lead.id}`}>View Details</Link>
                      </Button>
                    </li>
                  );
                }) : (
                  <li className="p-8 text-center text-brown/50">No leads currently need urgent attention.</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* 4. Approvals Pending (Owner Only) */}
          {isAdmin && (
            <Card className="border-gray-border/60 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-teal-base" />
                  <CardTitle className="text-lg text-brown font-heading font-semibold">Approvals Pending</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-border">
                  {pendingApprovals && pendingApprovals.length > 0 ? pendingApprovals.map((app: CommissionApproval) => (
                    <li key={app.id} className="p-4 hover:bg-white transition-colors flex items-center justify-between group">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-brown">{app.repName || "Sales Rep"}</span>
                          <span className="text-sm font-medium text-teal-dark">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(app.amount || 0)}
                          </span>
                        </div>
                        <p className="text-sm text-brown/70">Request: {app.cateringRequestId || "Commission Approval"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-orange border-orange/50 hover:bg-orange/5" onClick={() => setRejectingApprovalId(app.id)}>Reject</Button>
                        <Button size="sm" onClick={() => handleApprove(app.id)}>Approve</Button>
                      </div>
                    </li>
                  )) : (
                    <li className="p-8 text-center text-brown/50">No commission approvals pending.</li>
                  )}
                </ul>
                <div className="p-4 border-t border-gray-border text-center">
                  <Link href="/app/approvals" className="text-sm text-teal-base font-medium hover:text-teal-dark underline decoration-teal-base/30 underline-offset-4">View all approvals</Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 5. Follow-up Tasks */}
        <div className="lg:col-span-1">
          <TaskWidget />
        </div>
      </div>

      {/* Rejection Modal  */}
      {rejectingApprovalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold font-heading text-brown mb-2">Reject Commission</h3>
              <p className="text-sm text-brown/70 mb-4">Please provide a reason for rejecting this commission. This will be visible to the sales rep.</p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Invalid signed contract, missing fulfillment confirmation..."
                className="w-full min-h-[100px] p-3 rounded-lg border border-gray-border focus:border-teal-base focus:ring-1 focus:ring-teal-base outline-none resize-none"
                required
              />
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-border flexjustify-end gap-3 flex">
              <Button variant="outline" onClick={() => { setRejectingApprovalId(null); setRejectionReason(""); }}>Cancel</Button>
              <Button variant="primary" className="bg-[#D36200] hover:bg-[#D36200]/90 border-none" onClick={handleReject} disabled={!rejectionReason.trim()}>Confirm Rejection</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="p-6 lg:p-8 space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-border rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-border/50 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-gray-border rounded-lg mt-4 sm:mt-0"></div>
      </div>

      <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2", isAdmin ? "xl:grid-cols-3" : "lg:grid-cols-4")}>
        {[...Array(isAdmin ? 6 : 4)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-gray-border/40 shadow-sm p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-border/60 rounded"></div>
              <div className="h-10 w-10 bg-gray-border/40 rounded-full"></div>
            </div>
            <div className="h-8 w-20 bg-gray-border/80 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[400px] bg-white rounded-xl border border-gray-border/40 shadow-sm"></div>
          {isAdmin && <div className="h-[300px] bg-white rounded-xl border border-gray-border/40 shadow-sm"></div>}
        </div>
        <div className="lg:col-span-1">
          <div className="h-[600px] bg-white rounded-xl border border-gray-border/40 shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}
