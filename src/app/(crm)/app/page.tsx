"use client";

import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  AlertCircle,
  Clock,
  Activity,
  CheckSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/context/auth";
import { useQuery } from "@tanstack/react-query";
import { 
  getDashboardStats, 
  getRecentActivity, 
  getNeedsAttentionLeads,
  getPendingApprovals
} from "@/lib/firebase/services/crm";
import { formatDistanceToNow } from "date-fns";

export default function CRMDashboard() {
  const { user, role } = useAuth();
  
  const isAdmin = role === 'owner' || role === 'marketing' || role === 'ops';

  // React Query Fetching
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.uid],
    queryFn: () => getDashboardStats(user!.uid, role!),
    enabled: !!user && !!role,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => getRecentActivity(5),
    enabled: !!user,
  });

  const { data: attentionLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ['attention-leads', user?.uid],
    queryFn: () => getNeedsAttentionLeads(user!.uid, role!),
    enabled: !!user && !!role,
  });

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['pending-approvals', user?.uid],
    queryFn: () => getPendingApprovals(user!.uid, role!),
    enabled: !!user && !!role && isAdmin,
  });

  const isLoading = statsLoading || activityLoading || leadsLoading || (isAdmin && approvalsLoading);

  if (isLoading) {
    return <DashboardSkeleton isAdmin={isAdmin} />;
  }

  const stats = [
    { name: "Total Leads", value: statsData?.totalLeads || 0, change: "Real-time", trend: "up", icon: Users, subtext: "From Firestore" },
    { name: "Pipeline Value", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(statsData?.pipelineValue || 0), change: "Estimated", trend: "up", icon: DollarSign, subtext: "Active Quotes" },
    { name: "Win Rate", value: `${statsData?.winRate || 0}%`, change: "Target: 70%", trend: "up", icon: TrendingUp, subtext: "Conversion" },
    { name: "Active Memberships", value: statsData?.activeMemberships || 0, change: "Active", trend: "up", icon: Award, subtext: "Subscribed" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Dashboard</h1>
          <p className="mt-1 text-sm text-brown/70">
            Welcome back, {user?.email || "Team"}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/app/leads/new">Add Manual Lead</Link>
          </Button>
        </div>
      </div>

      {/* 1. At-a-Glance Metrics Row (4 widgets) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-gray-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-brown/70">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold font-heading text-teal-dark">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-base/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-teal-dark" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-teal-dark font-medium">{stat.change}</span>
                <span className="ml-2 text-brown/50">{stat.subtext}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 2. Needs Attention Queue */}
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
                {attentionLeads && attentionLeads.length > 0 ? attentionLeads.map((lead: any) => (
                  <li key={lead.id} className="p-4 hover:bg-white transition-colors flex items-center justify-between group">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-brown">{lead.companyName || "Unknown Company"}</span>
                        <Badge variant={lead.status === "New" ? "warning" : "neutral"}>{lead.status}</Badge>
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
                )) : (
                  <li className="p-8 text-center text-brown/50">No leads currently need urgent attention.</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* 3. Approvals Pending (Owner Only) */}
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
                  {pendingApprovals && pendingApprovals.length > 0 ? pendingApprovals.map((app: any) => (
                    <li key={app.id} className="p-4 hover:bg-white transition-colors flex items-center justify-between group">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-brown">{app.repName || "Sales Rep"}</span>
                          <span className="text-sm font-medium text-teal-dark">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(app.amount || 0)}
                          </span>
                        </div>
                        <p className="text-sm text-brown/70">{app.description || "Commission Approval"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-orange border-orange/50 hover:bg-orange/5">Reject</Button>
                        <Button size="sm">Approve</Button>
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

        {/* 4. Recent Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="border-gray-border/60 shadow-sm h-full max-h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="border-b border-gray-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-base" />
                <CardTitle className="text-lg text-brown font-heading font-semibold">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 bg-gray-bg/30">
              <div className="space-y-6">
                {recentActivity && recentActivity.length > 0 ? recentActivity.map((act: any) => (
                  <div key={act.id} className="relative pl-6 border-l-2 border-gray-border/60 pb-6 last:pb-0">
                    <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                      act.actionType === "STATUS_CHANGE" ? "bg-orange" : 
                      act.actionType === "FORM_SUBMITTED" ? "bg-teal-dark" : "bg-teal-base"
                    }`}></div>
                    <p className="text-sm font-medium text-brown">
                      {act.actionType?.replace(/_/g, " ")}: {act.entityType}
                    </p>
                    <p className="text-xs text-brown/60 mt-1">
                      {act.createdAt?.seconds 
                        ? formatDistanceToNow(act.createdAt.seconds * 1000, { addSuffix: true })
                        : "just now"} by {act.actorName || "System"}
                    </p>
                  </div>
                )) : (
                  <p className="text-center text-brown/40 py-8">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
