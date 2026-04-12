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
  LayoutGrid,
  List,
  Clock,
  UserCheck,
  RefreshCcw,
  ArrowUpRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { getAllCommitments, getAllCompanies, getProgramSignups } from "@/lib/firebase/services/crm";
import { approveProgramSignup, rejectProgramSignup } from "@/lib/firebase/services/program.service";
import { syncCommitmentStatuses } from "@/lib/firebase/services/commitment.service";
import { Commitment, Company } from "@/types/crm";
import { ProgramSignup } from "@/lib/types";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { MembershipGrid } from "@/components/crm/MembershipGrid";

type SortField = "company" | "tier" | "progress" | "renewal" | "date";
type SortOrder = "asc" | "desc";

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 10;

  // View Mode Persistence
  const [viewMode, setViewMode] = useState<"bento" | "classic">("bento");

  useEffect(() => {
    const savedView = localStorage.getItem("crm-memberships-view") as "bento" | "classic";
    if (savedView) setViewMode(savedView);
  }, []);

  const handleToggleView = (mode: 'bento' | 'classic') => {
    setViewMode(mode);
    localStorage.setItem("crm-memberships-view", mode);
  };

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
        toast.error("Failed to load ledgers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") === "applications" ? "applications" : "active";
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleSyncStatuses = async () => {
    setIsSyncing(true);
    const loadingToast = toast.loading("Resyncing commitment logs...");
    try {
      await syncCommitmentStatuses();
      setRefreshKey(prev => prev + 1);
      toast.success("Log synchronization complete", { id: loadingToast });
    } catch (error) {
      toast.error("Sync protocol failed", { id: loadingToast });
    } finally {
      setIsSyncing(false);
    }
  };

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
      const nameA = companyMap[a.companyId] || "";
      const nameB = companyMap[b.companyId] || "";
      result = nameA.localeCompare(nameB);
    }
    if (sortField === "tier") result = a.tier - b.tier;
    if (sortField === "progress") result = (a.ordersUsed / a.ordersCommitted) - (b.ordersUsed / b.ordersCommitted);
    if (sortField === "renewal") {
      const dateA = a.renewalDate?.seconds || 0;
      const dateB = b.renewalDate?.seconds || 0;
      result = dateA - dateB;
    }
    if (sortField === "date") {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      result = dateA - dateB;
    }
    return sortOrder === "asc" ? result : -result;
  });

  const totalPages = Math.ceil((activeTab === "active" ? sortedCommitments.length : filteredSignups.length) / itemsPerPage);
  const paginatedItems = activeTab === "active" 
    ? sortedCommitments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredSignups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-chef-muted opacity-30 ml-1 inline-block" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-accent-fresh ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-4 h-4 text-accent-fresh ml-1 inline-block" />
    );
  };

  const handleApprove = async (signupId: string, businessName: string) => {
    if (!user) return;
    if (confirm(`Authorize program membership for ${businessName}?`)) {
      try {
        await approveProgramSignup(signupId, user.uid, user.displayName || user.email || "System");
        toast.success("Membership authorized");
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        toast.error("Process failed");
      }
    }
  };

  const handleReject = async (signupId: string) => {
    if (!user) return;
    const reason = prompt("Enter disqualification reason:");
    if (reason !== null) {
      try {
        await rejectProgramSignup(signupId, user.uid, user.displayName || user.email || "System", reason);
        toast.success("Application disqualified");
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        toast.error("Process failed");
      }
    }
  };

  return (
    <div className="relative flex h-full flex-col overscroll-y-contain p-8 gap-8">
      {/* Precision Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-chef-charcoal tracking-tight leading-none mb-2">Programs</h1>
          <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em]">Enterprise Loyalty Protocols & Growth</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSyncStatuses}
            disabled={isSyncing}
            variant="outline"
            className="h-12 px-6 rounded-[16px] border-chef-charcoal/10 text-chef-charcoal text-[10px] font-black uppercase tracking-widest hover:bg-chef-prep transition-all active:scale-95 shadow-soft-low flex items-center gap-3"
          >
            <RefreshCcw size={16} className={cn(isSyncing && "animate-spin")} />
            Sync Protocols
          </Button>
        </div>
      </div>

      {/* Standardized Tabbed Interface */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-1.5 p-1.5 bg-chef-prep/50 rounded-[24px] border border-chef-charcoal/5 w-fit shadow-soft-low">
          <button
            onClick={() => { setActiveTab("active"); router.push("/app/memberships?tab=active"); }}
            className={cn(
              "h-11 px-8 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 active:scale-95",
              activeTab === "active" 
                ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" 
                : "text-chef-muted hover:text-chef-charcoal"
            )}
          >
            <Award size={14} /> Active Ledgers
          </button>
          <button
            onClick={() => { setActiveTab("applications"); router.push("/app/memberships?tab=applications"); }}
            className={cn(
              "h-11 px-8 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 active:scale-95",
              activeTab === "applications" 
                ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" 
                : "text-chef-muted hover:text-chef-charcoal"
            )}
          >
            <UserCheck size={14} /> Queue Applications
            {signups.filter(s => s.status === 'Pending').length > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent-heat animate-pulse" />
            )}
          </button>
        </div>

        {/* Intelligence Filters */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(activeTab === "active" ? ["All", "Active", "Expiring", "Lapsed"] : ["All", "Pending", "Active", "Declined"]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border active:scale-95",
                  statusFilter === f
                    ? "bg-chef-charcoal text-white border-chef-charcoal shadow-soft-mid"
                    : "bg-white text-chef-muted border-chef-charcoal/5 hover:border-chef-charcoal/20 hover:text-chef-charcoal shadow-soft-low"
                )}
              >
                {f === 'Active' && activeTab === 'applications' ? 'APPROVED' : f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-chef-muted group-focus-within:text-accent-fresh transition-colors" />
              <Input
                placeholder="Search ledgers..."
                className="pl-13 h-12 w-full sm:w-64 rounded-[16px] border-chef-charcoal/5 bg-chef-prep/30 focus:bg-white transition-all text-[11px] font-bold shadow-soft-low"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {activeTab === "active" && (
              <div className="flex bg-chef-prep/50 p-1.5 rounded-[18px] border border-chef-charcoal/5 shadow-soft-low">
                <button
                  onClick={() => handleToggleView('classic')}
                  className={cn(
                    "p-2 rounded-xl transition-all active:scale-95",
                    viewMode === "classic" ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" : "text-chef-muted hover:text-chef-charcoal"
                  )}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => handleToggleView('bento')}
                  className={cn(
                    "p-2 rounded-xl transition-all active:scale-95",
                    viewMode === "bento" ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" : "text-chef-muted hover:text-chef-charcoal"
                  )}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Results Area */}
      {activeTab === "active" ? (
        viewMode === "bento" ? (
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[280px] rounded-[32px] bg-chef-prep/20 animate-pulse border border-dashed border-chef-charcoal/5" />
                ))}
              </div>
            ) : sortedCommitments.length > 0 ? (
              <MembershipGrid 
                commitments={paginatedItems as Commitment[]} 
                companyMap={companyMap} 
                onSelect={(m) => router.push(`/app/companies/${m.companyId}?tab=programs`)} 
              />
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-chef-charcoal/10">
                  <h3 className="text-3xl font-black text-chef-charcoal/10 uppercase tracking-tighter">No Active Protocols</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted/30 mt-4">Adjust filters or authorize new applications</p>
                </div>
            )}
          </div>
        ) : (
          <Card className="flex-1 flex flex-col bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
            <CardContent className="p-0 flex flex-col flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-chef-prep/30 border-b border-chef-charcoal/5 text-[10px] font-black uppercase tracking-[0.25em] text-chef-muted">
                    <tr>
                      <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("company")}>
                        CLIENT <SortIcon field="company" />
                      </th>
                      <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("tier")}>
                        PROTOCOL <SortIcon field="tier" />
                      </th>
                      <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">OPERATIONAL STATUS</th>
                      <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("progress")}>
                        UTILIZATION <SortIcon field="progress" />
                      </th>
                      <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("renewal")}>
                        RENEWAL <SortIcon field="renewal" />
                      </th>
                      <th className="px-8 py-6 text-right sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">OPERATIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-chef-charcoal/[0.03]">
                    {loading ? (
                      <tr><td colSpan={6} className="px-8 py-32 text-center text-chef-muted/50 font-black uppercase tracking-widest text-[10px]">Processing Ledgers...</td></tr>
                    ) : sortedCommitments.length > 0 ? (
                      paginatedItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-chef-prep/30 transition-all cursor-pointer group" onClick={() => router.push(`/app/companies/${item.companyId}?tab=programs`)}>
                          <td className="px-8 py-5">
                            <span className="font-black text-chef-charcoal tracking-tight text-base group-hover:text-accent-fresh transition-colors">
                              {companyMap[item.companyId] || "Loading..."}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <Badge className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-chef-charcoal/10 bg-chef-prep text-chef-muted">
                              Tier {item.tier} Protocol
                            </Badge>
                          </td>
                          <td className="px-8 py-5">
                            <Badge 
                              className={cn(
                                "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full",
                                item.active ? (item.status === 'Expiring' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-accent-fresh/10 text-accent-fresh border-accent-fresh/20') : 'bg-accent-heat/10 text-accent-heat border-accent-heat/20'
                              )}
                            >
                              {item.status === 'Expiring' ? 'Expiring' : (item.active ? 'Active Ledger' : 'Inactive')}
                            </Badge>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1.5 w-40">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-chef-muted">
                                <span>{item.ordersUsed} / {item.ordersCommitted}</span>
                                <span>{Math.round((item.ordersUsed / item.ordersCommitted) * 100)}%</span>
                              </div>
                              <div className="h-2 w-full bg-chef-prep/50 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    item.status === 'Expiring' ? 'bg-gold' : 'bg-chef-charcoal'
                                  )} 
                                  style={{ width: `${(item.ordersUsed / item.ordersCommitted) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-chef-muted/70 text-xs font-bold tabular-nums">
                            {item.renewalDate?.seconds ? format(item.renewalDate.toDate(), "MMM dd, yyyy") : "—"}
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="h-10 w-10 ml-auto rounded-full bg-chef-prep group-hover:bg-chef-charcoal group-hover:text-white flex items-center justify-center transition-all shadow-soft-low">
                               <ArrowUpRight size={18} />
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="px-8 py-32 text-center text-chef-muted/40 font-bold uppercase tracking-widest text-[10px]">No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {paginatedItems.map((signup: any) => (
            <div key={signup.id} className="bg-white p-8 rounded-[40px] border border-chef-charcoal/5 shadow-soft-low group hover:shadow-soft-mid transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[24px] bg-chef-prep flex items-center justify-center text-chef-muted group-hover:bg-chef-charcoal group-hover:text-white transition-all shadow-soft-low">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-chef-charcoal tracking-tight">{signup.businessName}</h3>
                  <p className="text-xs font-bold text-chef-muted opacity-60 uppercase tracking-widest mt-1">
                    Contacted by {signup.contactName} • {signup.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full border-chef-charcoal/10 bg-chef-prep text-chef-muted mr-4">
                  Tier {signup.programTier?.split('_')[1] || signup.programTier} Request
                </Badge>
                {signup.status === 'Pending' ? (
                  <>
                    <Button 
                      onClick={() => handleReject(signup.id)}
                      variant="outline" 
                      className="rounded-full h-12 px-8 border-chef-charcoal/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent-heat/10 hover:text-accent-heat transition-all"
                    >
                      Disqualify
                    </Button>
                    <Button 
                      onClick={() => handleApprove(signup.id, signup.businessName)}
                      className="rounded-full h-12 px-10 bg-chef-charcoal text-white text-[10px] font-black uppercase tracking-widest shadow-soft-mid hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Authorize Protocol
                    </Button>
                  </>
                ) : (
                  <Badge className={cn(
                    "font-black text-[9px] uppercase tracking-widest px-6 py-3 rounded-full",
                    signup.status === 'Active' ? 'bg-accent-fresh/10 text-accent-fresh border-accent-fresh/20' : 'bg-accent-heat/10 text-accent-heat border-accent-heat/20'
                  )}>
                    Application {signup.status === 'Active' ? 'Authorized' : signup.status}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {paginatedItems.length === 0 && !loading && (
            <div className="py-32 bg-white rounded-[40px] border border-dashed border-chef-charcoal/10 text-center space-y-6">
              <h3 className="text-3xl font-black text-chef-charcoal/20 uppercase tracking-tighter">Queue Ledger Clear</h3>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-chef-muted/30">No active applications in the current segment</p>
            </div>
          )}
        </div>
      )}

      {/* Global Pagination precision */}
      <div className="flex items-center justify-between px-8 py-6 bg-chef-prep/30 border-t border-chef-charcoal/10 mt-auto rounded-b-[40px]">
        <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.15em]">
          Perspective: <span className="text-chef-charcoal">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-chef-charcoal">{Math.min(currentPage * itemsPerPage, activeTab === "active" ? sortedCommitments.length : filteredSignups.length)}</span> <span className="mx-2 opacity-20">/</span> {activeTab === "active" ? sortedCommitments.length : filteredSignups.length} Total
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-10 w-12 p-0 border-chef-charcoal/10 bg-white hover:bg-chef-prep rounded-xl transition-all"
          >
            <ChevronLeft size={20} className="text-chef-muted" />
          </Button>
          <div className="text-[11px] font-black text-chef-charcoal bg-white h-10 px-6 flex items-center rounded-xl border border-chef-charcoal/10 tracking-widest tabular-nums">
            {currentPage} <span className="mx-2 opacity-20 text-[9px]">OF</span> {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-10 w-12 p-0 border-chef-charcoal/10 bg-white hover:bg-chef-prep rounded-xl transition-all"
          >
            <ChevronRight size={20} className="text-chef-muted" />
          </Button>
        </div>
      </div>
    </div>
  );
}
