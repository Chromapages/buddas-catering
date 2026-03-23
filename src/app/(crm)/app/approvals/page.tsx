"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check, X, Search, Filter } from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import {
  getAllCommissionApprovals,
  getAllCateringRequests,
  approveCommission,
  rejectCommission,
} from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";

type StatusFilter = "All" | "Pending" | "Approved" | "Rejected";

export default function ApprovalQueuePage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [requestMap, setRequestMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [approvalsData, requestsData] = await Promise.all([
        getAllCommissionApprovals(),
        getAllCateringRequests(),
      ]);
      setApprovals(approvalsData);
      const map: Record<string, any> = {};
      requestsData.forEach((r: any) => { map[r.id] = r; });
      setRequestMap(map);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getApprovalStatus = (a: any): "Pending" | "Approved" | "Rejected" => {
    if (a.approved) return "Approved";
    if (a.eligible === false && a.approvedById) return "Rejected";
    return "Pending";
  };

  const filteredApprovals = approvals.filter(a => {
    const request = requestMap[a.cateringRequestId] || {};
    const matchesSearch =
      (request.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.repId || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.cateringRequestId || "").toLowerCase().includes(search.toLowerCase());
    const status = getApprovalStatus(a);
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingTotal = approvals
    .filter(a => getApprovalStatus(a) === "Pending")
    .reduce((sum, a) => {
      const req = requestMap[a.cateringRequestId];
      return sum + (req?.quoteAmount || 0);
    }, 0);

  const handleApprove = async (approvalId: string) => {
    if (!user) return;
    setActionInProgress(approvalId);
    try {
      await approveCommission(approvalId, user.uid, user.displayName || user.email || "Owner");
      toast.success("Commission approved.");
      await fetchData();
    } catch {
      toast.error("Failed to approve commission.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    if (!user) return;
    setActionInProgress(approvalId);
    try {
      await rejectCommission(approvalId, user.uid, user.displayName || user.email || "Owner");
      toast.success("Commission rejected.");
      await fetchData();
    } catch {
      toast.error("Failed to reject commission.");
    } finally {
      setActionInProgress(null);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return "—";
    if (ts?.seconds) return format(ts.seconds * 1000, "MMM d, yyyy");
    if (typeof ts === "string") return format(new Date(ts), "MMM d, yyyy");
    return "—";
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Approval Queue</h1>
          <p className="text-sm text-brown/70 mt-1">Review and approve sales commissions (Owner access only).</p>
        </div>
        <div className="bg-teal-base/10 rounded-lg py-2 px-4 border border-teal-base/20 flex flex-col items-end shadow-sm">
          <span className="text-xs font-semibold text-teal-dark uppercase tracking-wider">Pending Payouts</span>
          <span className="text-xl font-bold text-teal-dark">
            ${pendingTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input
            placeholder="Search rep or client..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brown/60" />
          <select
            className="text-sm border-gray-border rounded-md px-3 py-2 bg-gray-bg focus:ring-teal-base focus:border-teal-base"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-gray-border rounded-b-xl shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-bg border-b border-gray-border text-brown/70 font-medium">
              <tr>
                <th className="px-6 py-4">Sales Rep</th>
                <th className="px-6 py-4">Client / Event</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Quote Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border text-brown">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown/50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-base border-t-transparent"></div>
                      Loading approvals...
                    </div>
                  </td>
                </tr>
              ) : filteredApprovals.length > 0 ? (
                filteredApprovals.map((approval) => {
                  const request = requestMap[approval.cateringRequestId] || {};
                  const status = getApprovalStatus(approval);
                  const isActing = actionInProgress === approval.id;

                  return (
                    <tr key={approval.id} className="hover:bg-gray-bg/50 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        <span className="block">{approval.repId || "—"}</span>
                        <span className="block text-xs text-brown/50 font-normal">Rep ID</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block font-medium text-brown">
                          {request.companyName || "Unknown Client"}
                        </span>
                        <span className="block text-xs text-brown/50">
                          Ref: {approval.cateringRequestId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-brown/70">
                        {formatTimestamp(approval.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-medium text-teal-dark">
                        {request.quoteAmount != null
                          ? `$${Number(request.quoteAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {status === "Pending" && <Badge variant="warning">Pending Review</Badge>}
                        {status === "Approved" && <Badge variant="success">Approved</Badge>}
                        {status === "Rejected" && <Badge variant="danger">Rejected</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {status === "Pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActing}
                              onClick={() => handleReject(approval.id)}
                              className="text-orange hover:bg-orange/10 border-orange/20 px-2"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {isActing ? "..." : "Reject"}
                            </Button>
                            <Button
                              size="sm"
                              disabled={isActing}
                              onClick={() => handleApprove(approval.id)}
                              className="px-2 bg-teal-dark hover:bg-teal-dark/90 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {isActing ? "..." : "Approve"}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-xs text-brown/50 font-medium bg-gray-bg py-1 px-3 rounded-full border border-gray-border inline-block">
                              Resolved
                            </span>
                            {approval.approvedAt && (
                              <span className="block text-xs text-brown/40 mt-1">
                                {formatTimestamp(approval.approvedAt)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown/50">
                    {statusFilter === "Pending"
                      ? "No pending approvals — all caught up!"
                      : "No approvals found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
