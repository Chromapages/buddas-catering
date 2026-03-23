"use client";

import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  AlertCircle,
  Clock,
  CheckCircle2,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/context/auth";
import { useEffect, useState } from "react";
import { 
  getDashboardStats, 
  getRecentActivity, 
  getNeedsAttentionLeads,
  getPendingApprovals
} from "@/lib/firebase/services/crm";
import { formatDistanceToNow } from "date-fns";

export default function CRMDashboard() {
  const { user, role } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [attentionLeads, setAttentionLeads] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  useEffect(() => {
    // Check if user has context and data is not already being fetched
    if (!user || !role) return;

    const isAdmin = role === 'owner' || role === 'marketing' || role === 'ops';
    setIsAdmin(isAdmin);

    const fetchData = async () => {
      try {
        const [stats, activity, attention, approvals] = await Promise.all([
          getDashboardStats(user.uid, role),
          getRecentActivity(5), // Activities are currently public to authenticated users
          getNeedsAttentionLeads(user.uid, role),
          getPendingApprovals(user.uid, role)
        ]);
        setStatsData(stats);
        setRecentActivity(activity);
        setAttentionLeads(attention);
        setPendingApprovals(approvals);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role]);

  const stats = [
    { name: "Total Leads", value: statsData?.totalLeads || 0, change: "Real-time", trend: "up", icon: Users, subtext: "From Firestore" },
    { name: "Pipeline Value", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(statsData?.pipelineValue || 0), change: "Estimated", trend: "up", icon: DollarSign, subtext: "Active Quotes" },
    { name: "Win Rate", value: `${statsData?.winRate || 0}%`, change: "Target: 70%", trend: "up", icon: TrendingUp, subtext: "Conversion" },
    { name: "Active Memberships", value: statsData?.activeMemberships || 0, change: "Active", trend: "up", icon: Award, subtext: "Subscribed" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
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
          <Card key={idx} className="border-gray-border/60 shadow-sm">
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
          <Card className="border-orange/20 shadow-sm">
            <CardHeader className="border-b border-gray-border/50 bg-orange/5 pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange" />
                <CardTitle className="text-lg text-brown">Needs Attention</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-border">
                {attentionLeads.length > 0 ? attentionLeads.map((lead) => (
                  <li key={lead.id} className="p-4 hover:bg-gray-bg transition-colors flex items-center justify-between">
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
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/leads/${lead.id}`}>View</Link>
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
            <Card className="border-gray-border/60 shadow-sm">
              <CardHeader className="border-b border-gray-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-teal-base" />
                  <CardTitle className="text-lg text-brown">Approvals Pending</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-border">
                  {pendingApprovals.length > 0 ? pendingApprovals.map((app) => (
                    <li key={app.id} className="p-4 hover:bg-gray-bg transition-colors flex items-center justify-between">
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
                        <Button variant="outline" size="sm" className="text-orange border-orange/50 hover:bg-orange/10">Reject</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </li>
                  )) : (
                    <li className="p-8 text-center text-brown/50">No commission approvals pending.</li>
                  )}
                </ul>
                <div className="p-4 border-t border-gray-border text-center">
                  <Link href="/app/approvals" className="text-sm text-teal-base font-medium hover:text-teal-dark">View all approvals</Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 4. Recent Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="border-gray-border/60 shadow-sm h-full max-h-[600px] flex flex-col">
            <CardHeader className="border-b border-gray-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-base" />
                <CardTitle className="text-lg text-brown">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1">
              {/* 8. Activity Stream */}
              <div className="space-y-6">
                {recentActivity.length > 0 ? recentActivity.map((act) => (
                  <div key={act.id} className="relative pl-6 border-l-2 border-gray-border pb-6">
                    <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${
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

// Temporary icon to fix missing import from lucide-react above
function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
