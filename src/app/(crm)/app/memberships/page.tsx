"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { getAllCommitments, getAllCompanies, getProgramSignups } from "@/lib/firebase/services/crm";
import { approveProgramSignup, rejectProgramSignup } from "@/lib/firebase/services/program.service";
import { syncCommitmentStatuses } from "@/lib/firebase/services/commitment.service";
import { Commitment, Company } from "@/types/crm";
import { ProgramSignup } from "@/lib/types";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";

type SortField = "company" | "tier" | "progress" | "renewal" | "date";
type SortOrder = "asc" | "desc";

const TIER_LABELS: Record<string, string> = {
  "2": "Tier 2 — 2 Events",
  "4": "Tier 4 — 4 Events",
  "6": "Tier 6 — 6 Events",
};

export default function MembershipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialTab = searchParams.get("tab") === "applications" ? "applications" : "active";
  const [activeTab, setActiveTab] = useState<"active" | "applications">(initialTab);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [signups, setSignups] = useState<ProgramSignup[]>([]);
  const [companyMap, setCompanyMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [commitmentsData, companiesData, signupsData] = await Promise.all([
          getAllCommitments(),
          getAllCompanies(),
          getProgramSignups()
        ]);
        setCommitments(commitmentsData);
        setSignups(signupsData);
        const map: Record<string, string> = {};
        (companiesData as Company[]).forEach((c) => { map[c.id] = c.name; });
        setCompanyMap(map);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCommitments = commitments.filter(m => {
    const companyName = companyMap[m.companyId] || "";
    const matchesSearch = companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && m.active && m.status !== 'Expiring') ||
      (statusFilter === "Inactive" && !m.active) ||
      (statusFilter === "Expiring" && m.status === 'Expiring') ||
      (statusFilter === "Lapsed" && m.status === 'Lapsed') ||
      (statusFilter === "First Order Pending" && !m.firstOrderPlaced);
    const matchesTier = tierFilter === "All" || String(m.tier) === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const filteredSignups = signups.filter(s => {
    const matchesSearch = 
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedCommitments = [...filteredCommitments].sort((a, b) => {
    let result = 0;
    if (sortField === "company") {
      result = (companyMap[a.companyId] || "").localeCompare(companyMap[b.companyId] || "");
    }
    if (sortField === "tier") result = Number(a.tier) - Number(b.tier);
    if (sortField === "progress") {
      const progressA = a.ordersCommitted ? a.ordersUsed / a.ordersCommitted : 0;
      const progressB = b.ordersCommitted ? b.ordersUsed / b.ordersCommitted : 0;
      result = progressA - progressB;
    }
    if (sortField === "renewal") {
      const dateA = a.renewalDate?.seconds ?? 0;
      const dateB = b.renewalDate?.seconds ?? 0;
      result = dateA - dateB;
    }
    if (sortField === "date") {
      const dateA = a.createdAt?.seconds ?? 0;
      const dateB = b.createdAt?.seconds ?? 0;
      result = dateA - dateB;
    }
    return sortOrder === "asc" ? result : -result;
  });

  const totalPages = Math.ceil(sortedCommitments.length / itemsPerPage);
  const paginatedCommitments = sortedCommitments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-brown/30 ml-1 inline-block" />;
    return sortOrder === "asc"
      ? <ChevronUp className="w-4 h-4 text-teal-dark ml-1 inline-block" />
      : <ChevronDown className="w-4 h-4 text-teal-dark ml-1 inline-block" />;
  };

  const handleApprove = async (signupId: string) => {
    if (!user) return;
    try {
      await approveProgramSignup(signupId, user.uid, user.displayName || "Owner");
      toast.success("Application approved");
      setSignups((prev) => prev.map((s) => s.id === signupId ? { ...s, status: "Active" as any } : s));
    } catch {
      toast.error("Failed to approve application");
    }
  };

  const handleReject = async (signupId: string) => {
    if (!user) return;
    try {
      await rejectProgramSignup(signupId, user.uid, user.displayName || "Owner");
      toast.success("Application declined");
      setSignups((prev) => prev.map((s) => s.id === signupId ? { ...s, status: "Declined" as any } : s));
    } catch {
      toast.error("Failed to decline application");
    }
  };

  const handleSyncRenewals = async () => {
    const loadingToast = toast.loading("Syncing commitment statuses...");
    try {
      await syncCommitmentStatuses();
      const updatedCommitments = await getAllCommitments();
      setCommitments(updatedCommitments);
      toast.success("Statuses synchronized", { id: loadingToast });
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Failed to synchronize statuses", { id: loadingToast });
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
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Commitments</h1>
          <p className="text-sm text-brown/70 mt-1">Track corporate catering commitments and order usage.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-bg p-1 rounded-lg self-start">
          <button
            onClick={() => { setActiveTab("active"); setCurrentPage(1); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "active" ? "bg-white text-teal-dark shadow-sm" : "text-brown/60 hover:text-brown"
            }`}
          >
            Active Commitments
          </button>
          <button
            onClick={() => { setActiveTab("applications"); setCurrentPage(1); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "applications" ? "bg-white text-teal-dark shadow-sm" : "text-brown/60 hover:text-brown"
            }`}
          >
            Applications
            {signups.filter(s => s.status === 'Pending').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-orange text-white text-[10px] rounded-full">
                {signups.filter(s => s.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input
            placeholder={activeTab === "active" ? "Search company..." : "Search business or contact..."}
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncRenewals}
              className="text-xs h-10 border-teal-base/30 text-teal-dark hover:bg-teal-base/5"
            >
              Sync Renewals
            </Button>
          )}
          <select
            className="text-sm border-gray-border rounded-md px-3 py-2 bg-gray-bg focus:ring-teal-base focus:border-teal-base"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Statuses</option>
            {activeTab === "active" ? (
              <>
                <option value="Active">Active</option>
                <option value="Expiring">Expiring Soon</option>
                <option value="Lapsed">Lapsed / Expired</option>
                <option value="First Order Pending">First Order Pending</option>
                <option value="Inactive">Inactive</option>
              </>
            ) : (
              <>
                <option value="Pending">Pending</option>
                <option value="Active">Approved</option>
                <option value="Declined">Declined</option>
              </>
            )}
          </select>
          {activeTab === "active" && (
            <select
              className="text-sm border-gray-border rounded-md px-3 py-2 bg-gray-bg focus:ring-teal-base focus:border-teal-base"
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Tiers</option>
              <option value="2">Tier 2</option>
              <option value="4">Tier 4</option>
              <option value="6">Tier 6</option>
            </select>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border-x border-b border-gray-border rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          {activeTab === "active" ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-bg border-b border-gray-border text-brown/70 font-medium">
                <tr>
                  <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50" onClick={() => handleSort("company")}>Company <SortIcon field="company" /></th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50" onClick={() => handleSort("tier")}>Tier <SortIcon field="tier" /></th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50" onClick={() => handleSort("progress")}>Order Usage <SortIcon field="progress" /></th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50" onClick={() => handleSort("renewal")}>Renewal <SortIcon field="renewal" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border text-brown">
                {loading ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-brown/50 italic">Loading commitments...</td></tr>
                ) : paginatedCommitments.length > 0 ? (
                  paginatedCommitments.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-bg/50 transition-colors cursor-pointer" onClick={() => router.push(`/app/companies/${m.companyId}`)}>
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0"><Award className="w-4 h-4 text-gold" /></div><span className="font-semibold">{companyMap[m.companyId] || m.companyId || "Unknown"}</span></div></td>
                      <td className="px-6 py-4 text-brown/80">{TIER_LABELS[String(m.tier)] ?? `Tier ${m.tier}`}</td>
                      <td className="px-6 py-4 font-medium">{m.discountPercent ?? 0}% off</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                             <div className="bg-teal-base h-2 rounded-full" style={{ width: `${(m.ordersUsed ?? 0) / (m.ordersCommitted ?? 1) * 100}%` }} />
                          </div>
                          <span className="text-xs text-brown/60 w-14 text-right">{m.ordersUsed}/{m.ordersCommitted}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {m.status === 'Expiring' ? (
                            <Badge variant="warning">Expiring Soon</Badge>
                          ) : m.status === 'Lapsed' ? (
                            <Badge variant="danger" className="bg-red-50 text-red-700 border-red-200">Lapsed</Badge>
                          ) : m.active ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="neutral">Inactive</Badge>
                          )}
                          {!m.firstOrderPlaced && (
                            <span className="text-[10px] font-bold text-orange uppercase tracking-wider">
                              First Order Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brown/70">{formatTimestamp(m.renewalDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-brown/50">No memberships found.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-bg border-b border-gray-border text-brown/70 font-medium">
                <tr>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Tier / Size</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border text-brown">
                {loading ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-brown/50 italic">Loading applications...</td></tr>
                ) : filteredSignups.length > 0 ? (
                  filteredSignups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((signup) => (
                    <tr key={signup.id} className="hover:bg-gray-bg/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{signup.businessName}</div>
                        <div className="text-xs text-brown/50 mt-0.5">{signup.organizationType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-teal-dark">{signup.contactName}</div>
                        <div className="text-xs text-brown/50 mt-0.5">{signup.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral" className="bg-teal-base/10 text-teal-dark border-teal-base/20">
                          {signup.programTier.replace('_', ' ')}
                        </Badge>
                        <div className="text-xs text-brown/50 mt-1">{signup.estimatedGroupSize} avg group</div>
                      </td>
                      <td className="px-6 py-4 text-brown/60">
                        {format(new Date(signup.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          signup.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                          signup.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {signup.status === 'Active' ? 'Approved' : signup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {signup.status === 'Pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-teal-dark hover:bg-teal-base"
                              onClick={() => handleApprove(signup.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs text-orange border-orange/30 hover:bg-orange/5"
                              onClick={() => handleReject(signup.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-brown/50">No applications found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-auto px-6 py-4 border-t border-gray-border bg-gray-bg/30 flex items-center justify-between">
          <p className="text-sm text-brown/60">
            Showing{" "}
            <span className="font-medium text-brown">
              {(activeTab === "active" ? filteredCommitments : filteredSignups).length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-brown">
              {Math.min(currentPage * itemsPerPage, (activeTab === "active" ? filteredCommitments : filteredSignups).length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-brown">{(activeTab === "active" ? filteredCommitments : filteredSignups).length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm font-medium text-brown px-2">
              Page {currentPage} of {Math.ceil((activeTab === "active" ? filteredCommitments : filteredSignups).length / itemsPerPage) || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil((activeTab === "active" ? filteredCommitments : filteredSignups).length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil((activeTab === "active" ? filteredCommitments : filteredSignups).length / itemsPerPage) || Math.ceil((activeTab === "active" ? filteredCommitments : filteredSignups).length / itemsPerPage) === 0}
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
