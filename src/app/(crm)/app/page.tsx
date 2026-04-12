"use client";

import { 
  AlertCircle,
} from "lucide-react";
import CRMIntelligenceHub from "@/components/crm/CRMIntelligenceHub";
import { useAuth } from "@/lib/firebase/context/auth";
import { useQuery } from "@tanstack/react-query";
import { RepDashboard } from "@/components/crm/RepDashboard";
import { AdminMobilePulse } from "@/components/crm/AdminMobilePulse";
import { getTasksByRep } from "@/lib/firebase/services/task.service";
import { 
  getDashboardStats, 
  getNeedsAttentionLeads,
  getPendingApprovals,
  triggerRenewalTasks,
  getUnassignedLeads,
  approveCommission,
  rejectCommission
} from "@/lib/firebase/services/crm";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";

/**
 * CRMDashboard: The main entry point for the CRM application.
 * Roles: owner, admin, marketing, ops (Executive Hub) | rep (Rep Dashboard)
 */
export default function CRMDashboard() {
  const { user, role } = useAuth();
  const [rejectingApprovalId, setRejectingApprovalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const isAdmin = role === 'owner' || role === 'admin' || role === 'marketing' || role === 'ops';
  const isRep = role === 'rep';
  
  useEffect(() => {
    if (user && isAdmin) {
      triggerRenewalTasks(user.uid, role || undefined);
    }
  }, [user, isAdmin, role]);

  // Data Fetching
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats', user?.uid],
    queryFn: () => getDashboardStats(user!.uid, role!),
    enabled: !!user && !!role && !isRep,
  });

  const { data: unassignedLeads } = useQuery({
    queryKey: ['unassigned-leads'],
    queryFn: () => getUnassignedLeads(),
    enabled: !!user && !!role && isAdmin,
  });

  const { data: attentionLeads } = useQuery({
    queryKey: ['attention-leads', user?.uid],
    queryFn: () => getNeedsAttentionLeads(user!.uid, role!),
    enabled: !!user && !!role && !isRep,
  });

  const { data: pendingApprovals, refetch: refetchApprovals } = useQuery({
    queryKey: ['pending-approvals', user?.uid],
    queryFn: () => getPendingApprovals(user!.uid, role!),
    enabled: !!user && !!role && isAdmin,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks", user?.uid],
    queryFn: () => getTasksByRep(user!.uid, "Upcoming"),
    enabled: !!user && isAdmin,
  });

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

  if (isRep) return <RepDashboard />;

  if (isAdmin) {
    const unassignedCount = unassignedLeads?.length || 0;
    const pendingApprovalsCount = pendingApprovals?.length || 0;
    const tasksCount = tasks?.length || 0;
    const attentionCount = attentionLeads?.length || 0;

    const mobileStats = {
      newLeads: unassignedCount,
      followUps: pendingApprovalsCount,
      closingSoon: attentionLeads?.filter(l => l.status === 'Quote Sent' || l.status === 'Approved').length || 0,
      overdue: attentionCount,
      pipelineValue: statsData?.pipelineValue || 0,
      weightedValue: statsData?.weightedPipeline || 0,
      revenueGoal: 36000 
    };

    return (
      <div className="bg-chef-prep min-h-screen">
        {/* Mobile Pulse View */}
        <div className="md:hidden">
          <AdminMobilePulse 
            stats={mobileStats} 
            tasks={tasks || []} 
            pendingApprovals={pendingApprovals || []}
            onApprove={handleApprove}
            onReject={setRejectingApprovalId}
          />
        </div>

        {/* Desktop Intelligence Hub View */}
        <div className="hidden md:block">
          <CRMIntelligenceHub 
            user={user}
            stats={statsData}
            unassignedLeadsCount={unassignedCount}
            tasksCount={tasksCount}
            attentionLeadsCount={attentionCount}
          />
        </div>

        {/* Rejection Modal (Modernized) */}
        {rejectingApprovalId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-chef-charcoal/40 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-white rounded-[40px] shadow-soft-high border border-chef-charcoal/5 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="px-10 py-10 bg-accent-heat/5 border-b border-chef-charcoal/[0.03]">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[18px] bg-accent-heat/10 flex items-center justify-center text-accent-heat shadow-soft-low">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-chef-charcoal tracking-tight uppercase">Protocol Rejection</h3>
                </div>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em] opacity-60">Rejection Rationale</p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full min-h-[140px] p-6 rounded-[24px] border border-chef-charcoal/5 bg-chef-prep/30 outline-none text-sm font-bold text-chef-charcoal placeholder:text-chef-muted/20 focus:ring-4 focus:ring-accent-heat/5 focus:border-accent-heat/20 focus:bg-white transition-all resize-none shadow-soft-low"
                    placeholder="Document the exact cause for commission repossession..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setRejectingApprovalId(null)} 
                    className="rounded-[20px] h-14 uppercase tracking-widest text-[10px] font-black border-chef-charcoal/10 text-chef-muted hover:bg-chef-prep transition-all active:scale-95"
                  >
                    Abort Rejection
                  </Button>
                  <Button 
                    onClick={handleReject} 
                    disabled={!rejectionReason.trim()} 
                    className="bg-accent-heat hover:bg-black text-white rounded-[20px] h-14 uppercase tracking-widest text-[10px] font-black border-none shadow-soft-mid transition-all active:scale-95"
                  >
                    Confirm Purge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <RepDashboard />;
}
