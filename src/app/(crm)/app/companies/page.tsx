"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { List, LayoutGrid, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { getAllCommitments, getAllCompanies, getCompaniesByHealthState } from "@/lib/firebase/services/crm";
import { cn } from "@/lib/utils";
import { AddCompanyModal } from "@/components/crm/AddCompanyModal";
import { CompanyBentoGrid } from "@/components/crm/CompanyBentoGrid";
import { useAuth } from "@/lib/firebase/context/auth";
import { Commitment, Company } from "@/types/crm";

type SortField = "name" | "industry" | "events" | "date";
type SortOrder = "asc" | "desc";
type HealthFilter = "All" | "Expiring Soon" | "No First Order" | "Lapsed";
type CompanyRow = Company & { industry?: string; totalEventsCompleted?: number };

const COMPANY_TYPES = ["All", "Corporate", "Non-Profit", "Government", "Education", "Other"];
const HEALTH_FILTERS: HealthFilter[] = ["All", "Expiring Soon", "No First Order", "Lapsed"];

export default function CompaniesPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 10;

  // View Mode Persistence
  const [viewMode, setViewMode] = useState<"bento" | "classic">("bento");

  useEffect(() => {
    const savedView = localStorage.getItem("crm-companies-view") as "bento" | "classic";
    if (savedView) setViewMode(savedView);

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        if (role === "rep" && user?.uid && healthFilter !== "All") {
          const state =
            healthFilter === "Expiring Soon"
              ? "expiring"
              : healthFilter === "No First Order"
                ? "no-first-order"
                : "lapsed";
          const [data, commitmentsData] = await Promise.all([
            getCompaniesByHealthState(user.uid, state),
            getAllCommitments(),
          ]);
          setCompanies(data);
          setCommitments(commitmentsData);
        } else {
          const [data, commitmentsData] = await Promise.all([
            getAllCompanies(user?.uid, role || undefined),
            getAllCommitments(),
          ]);
          setCompanies(data);
          setCommitments(commitmentsData);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [refreshKey, healthFilter, role, user?.uid]);

  const handleToggleView = (mode: "bento" | "classic") => {
    setViewMode(mode);
    localStorage.setItem("crm-companies-view", mode);
  };

  const companyMatchesHealthFilter = (company: CompanyRow) => {
    if (healthFilter === "All") return true;

    const commitment = commitments.find(
      (entry) =>
        entry.companyId === company.id &&
        (entry.active || company.activeCommitmentId === entry.id || company.activeMembershipId === entry.id)
    );

    const now = new Date();
    const renewalDate = commitment?.endDate?.toDate?.() || commitment?.renewalDate?.toDate?.();
    const createdAt = company.createdAt?.toDate?.();

    if (healthFilter === "No First Order") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return Boolean(createdAt && createdAt <= sevenDaysAgo && company.firstOrderPlaced === false);
    }

    if (!commitment || !renewalDate) return false;

    if (healthFilter === "Expiring Soon") {
      const sixtyDaysFromNow = new Date(now);
      sixtyDaysFromNow.setDate(now.getDate() + 60);
      return commitment.status !== "Lapsed" && renewalDate >= now && renewalDate <= sixtyDaysFromNow;
    }

    if (healthFilter === "Lapsed") {
      return commitment.status === "Lapsed" || renewalDate < now;
    }

    return true;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      (company.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (company.industry || "").toLowerCase().includes(search.toLowerCase()) ||
      (company.website || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || company.companyType === typeFilter;
    const matchesHealth = companyMatchesHealthFilter(company);
    return matchesSearch && matchesType && matchesHealth;
  });

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let result = 0;
    if (sortField === "name") result = (a.name || "").localeCompare(b.name || "");
    if (sortField === "industry") result = (a.industry || "").localeCompare(b.industry || "");
    if (sortField === "events") result = (a.totalEventsCompleted || 0) - (b.totalEventsCompleted || 0);
    if (sortField === "date") {
      const dateA = a.createdAt?.seconds ?? 0;
      const dateB = b.createdAt?.seconds ?? 0;
      result = dateA - dateB;
    }
    return sortOrder === "asc" ? result : -result;
  });

  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const paginatedCompanies = sortedCompanies.slice(
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
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-chef-muted opacity-30 ml-1 inline-block" />;
    return sortOrder === "asc"
      ? <ChevronUp className="w-4 h-4 text-accent-fresh ml-1 inline-block" />
      : <ChevronDown className="w-4 h-4 text-accent-fresh ml-1 inline-block" />;
  };

  const getMembershipBadge = (activeMembershipId?: string) => {
    if (!activeMembershipId) return <Badge className="bg-chef-prep text-chef-muted border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Standard</Badge>;
    return <Badge className="bg-accent-fresh/10 text-accent-fresh border border-accent-fresh/20 font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-soft-low">Active Program</Badge>;
  };

  return (
    <div className="relative flex h-full flex-col overscroll-y-contain p-8 gap-8">
      {/* Precision Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-chef-charcoal tracking-tight leading-none mb-2">Companies</h1>
          <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em]">Global Client Directory & Intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-chef-prep/50 p-1.5 rounded-[20px] border border-chef-charcoal/5 shadow-soft-low">
            <button 
              onClick={() => handleToggleView('classic')}
              className={cn(
                "h-9 px-5 rounded-[14px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                viewMode === 'classic' 
                  ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" 
                  : "text-chef-muted hover:text-chef-charcoal"
              )}
            >
              <List size={14} /> Classic
            </button>
            <button 
              onClick={() => handleToggleView('bento')}
              className={cn(
                "h-9 px-5 rounded-[14px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                viewMode === 'bento' 
                  ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" 
                  : "text-chef-muted hover:text-chef-charcoal"
              )}
            >
              <LayoutGrid size={14} /> Intelligence
            </button>
          </div>
          <Button 
            variant="outline" 
            className="hidden sm:flex border-chef-charcoal/10 bg-white hover:bg-chef-prep h-12 rounded-[16px] px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-soft-low"
          >
            Intelligence Export
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-12 px-8 rounded-[20px] bg-chef-charcoal text-white text-[10px] font-black uppercase tracking-widest shadow-soft-mid transition-all active:scale-95"
          >
            Register Client
          </Button>
        </div>
      </div>

      {/* Intelligence Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {HEALTH_FILTERS.map((f) => {
          const isActive = healthFilter === f;
          return (
            <button
              key={f}
              onClick={() => {
                setHealthFilter(f);
                setCurrentPage(1);
              }}
              className={cn(
                "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border active:scale-95",
                isActive
                  ? "bg-chef-charcoal text-white border-chef-charcoal shadow-soft-mid"
                  : "bg-white text-chef-muted border-chef-charcoal/5 hover:border-chef-charcoal/20 hover:text-chef-charcoal shadow-soft-low"
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Dynamic Results Area */}
      {viewMode === "bento" ? (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="h-[280px] rounded-[32px] bg-chef-prep/20 animate-pulse border border-dashed border-chef-charcoal/5" />
               ))}
             </div>
          ) : sortedCompanies.length > 0 ? (
            <CompanyBentoGrid 
              companies={paginatedCompanies} 
              onSelect={(c) => router.push(`/app/companies/${c.id}`)} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-chef-charcoal/10">
              <h3 className="text-3xl font-black text-chef-charcoal/10 uppercase tracking-tighter">No Client Data Found</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted/30 mt-4">Adjust filters or register new company</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="flex-1 flex flex-col bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="px-8 py-8 flex flex-wrap items-center justify-between gap-6 border-b border-chef-charcoal/10 bg-chef-prep/30">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-chef-muted group-focus-within:text-accent-fresh transition-colors" />
              <Input
                placeholder="Search institutional data..."
                className="pl-14 h-14 text-sm border border-transparent bg-chef-prep/50 focus:bg-white focus:border-accent-fresh/20 rounded-[20px] placeholder:text-chef-muted/40 transition-all focus:ring-0 shadow-soft-low"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-white/60 p-2 rounded-2xl border border-chef-charcoal/5 shadow-soft-low">
                <Filter className="w-4 h-4 text-chef-muted ml-2" />
                <select
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-chef-charcoal outline-none appearance-none px-4 py-2 cursor-pointer focus:ring-0"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {COMPANY_TYPES.map((type) => (
                    <option key={type} value={type}>{type === "All" ? "ALL TYPES" : type.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <CardContent className="p-0 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-chef-prep/30 border-b border-chef-charcoal/5 text-[10px] font-black uppercase tracking-[0.25em] text-chef-muted">
                  <tr>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("name")}>
                      IDENTITY <SortIcon field="name" />
                    </th>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("industry")}>
                      SECTOR <SortIcon field="industry" />
                    </th>
                    <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">CLASSIFICATION</th>
                    <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">CONTRACT STATUS</th>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("events")}>
                      PULSE <SortIcon field="events" />
                    </th>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("date")}>
                      RECORDED <SortIcon field="date" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chef-charcoal/[0.03]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-5">
                          <div className="h-10 w-10 border-4 border-accent-fresh/30 border-t-accent-fresh rounded-full animate-spin shadow-soft-mid" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted/50">Processing Ledger...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedCompanies.length > 0 ? (
                    paginatedCompanies.map((company) => (
                      <tr
                        key={company.id}
                        className="hover:bg-chef-prep/30 transition-all cursor-pointer group"
                        onClick={() => router.push(`/app/companies/${company.id}`)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[16px] bg-chef-charcoal flex items-center justify-center text-white shadow-soft-low group-hover:scale-110 transition-transform">
                              <Building2 size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-chef-charcoal text-base tracking-tight leading-none">{company.name}</span>
                              <span className="text-[11px] font-bold text-chef-muted tracking-tight mt-1 opacity-60">
                                {company.website?.replace(/^https?:\/\//, "") || "No Website Recorded"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-chef-muted/80 font-black text-xs uppercase tracking-widest">{company.industry || "General"}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-chef-prep text-[9px] font-black uppercase tracking-widest rounded-full border border-chef-charcoal/5">
                            {company.companyType || "Unclassified"}
                          </span>
                        </td>
                        <td className="px-8 py-5">{getMembershipBadge(company.activeMembershipId)}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-chef-charcoal text-lg tabular-nums">{(company as any).totalEventsCompleted ?? 0}</span>
                            <span className="text-[10px] font-black uppercase text-chef-muted opacity-30">ops</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-chef-muted/60 text-[11px] font-bold">
                          {company.createdAt?.seconds ? format(company.createdAt.seconds * 1000, "MMM dd, yyyy") : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-32 text-center italic text-chef-muted/40 font-bold uppercase tracking-widest text-[10px]">
                        No matching records found in the current intelligence segment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Precision */}
            <div className="px-8 py-6 border-t border-chef-charcoal/10 bg-chef-prep/30 flex items-center justify-between">
              <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.15em]">
                Perspective: <span className="text-chef-charcoal">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-chef-charcoal">{Math.min(currentPage * itemsPerPage, filteredCompanies.length)}</span> <span className="mx-2 opacity-20">/</span> {filteredCompanies.length} Total
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-12 p-0 border-chef-charcoal/10 bg-white hover:bg-chef-prep rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5 text-chef-muted" />
                </Button>
                <div className="text-[11px] font-black text-chef-charcoal bg-white h-10 px-6 flex items-center rounded-xl border border-chef-charcoal/10 tracking-widest tabular-nums">
                  {currentPage} <span className="mx-2 opacity-20 text-[9px]">OF</span> {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-10 w-12 p-0 border-chef-charcoal/10 bg-white hover:bg-chef-prep rounded-xl"
                >
                  <ChevronRight className="w-5 h-5 text-chef-muted" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AddCompanyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => setRefreshKey(prev => prev + 1)} 
      />
    </div>
  );
}
