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
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { getAllCommitments, getAllCompanies, getCompaniesByHealthState } from "@/lib/firebase/services/crm";
import { AddCompanyModal } from "@/components/crm/AddCompanyModal";
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

  useEffect(() => {
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

  const companyMatchesHealthFilter = (company: CompanyRow) => {
    if (healthFilter === "All") return true;

    const commitment = commitments.find(
      (entry) =>
        entry.companyId === company.id &&
        (entry.active || company.activeCommitmentId === entry.id || company.activeMembershipId === entry.id)
    );

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sixtyDaysFromNow = new Date(now);
    sixtyDaysFromNow.setDate(now.getDate() + 60);
    const renewalDate = commitment?.endDate?.toDate?.() || commitment?.renewalDate?.toDate?.();
    const createdAt = company.createdAt?.toDate?.();

    if (healthFilter === "No First Order") {
      return Boolean(createdAt && createdAt <= sevenDaysAgo && company.firstOrderPlaced === false);
    }

    if (!commitment || !renewalDate) return false;

    if (healthFilter === "Expiring Soon") {
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
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-brown/30 ml-1 inline-block" />;
    return sortOrder === "asc"
      ? <ChevronUp className="w-4 h-4 text-teal-dark ml-1 inline-block" />
      : <ChevronDown className="w-4 h-4 text-teal-dark ml-1 inline-block" />;
  };

  const getMembershipBadge = (activeMembershipId?: string) => {
    if (!activeMembershipId) return <Badge variant="neutral">No Membership</Badge>;
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <div className="flex h-full flex-col overscroll-y-contain p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Companies</h1>
          <p className="text-sm text-brown/70 mt-1">All client companies and their catering history.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Export CSV</Button>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Company</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {HEALTH_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => {
              setHealthFilter(filter);
              setCurrentPage(1);
            }}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              healthFilter === filter
                ? "border-teal-base bg-teal-base/10 text-teal-dark"
                : "border-gray-border bg-white text-brown/60 hover:border-teal-base/30"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input
            placeholder="Search name or industry..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brown/60" />
          <select
            className="text-sm border-gray-border rounded-md px-3 py-2 bg-gray-bg focus:ring-teal-base focus:border-teal-base"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          >
            {COMPANY_TYPES.map(type => (
              <option key={type} value={type}>{type === "All" ? "All Types" : type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-gray-border rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-bg border-b border-gray-border text-brown/70 font-medium">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Company <SortIcon field="name" />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("industry")}
                >
                  Industry <SortIcon field="industry" />
                </th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Membership</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("events")}
                >
                  Events <SortIcon field="events" />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("date")}
                >
                  Added <SortIcon field="date" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border text-brown">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown/50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-base border-t-transparent"></div>
                      Loading companies...
                    </div>
                  </td>
                </tr>
              ) : paginatedCompanies.length > 0 ? (
                paginatedCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-gray-bg/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/app/companies/${company.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-dark/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-teal-dark" />
                        </div>
                        <div>
                          <div className="font-semibold">{company.name || "Unnamed Company"}</div>
                          {company.website && (
                            <div className="text-xs text-brown/50">{company.website}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brown/70">{company.industry || "—"}</td>
                    <td className="px-6 py-4 text-brown/70">{company.companyType || "—"}</td>
                    <td className="px-6 py-4">
                      {healthFilter === "Expiring Soon" ? <Badge variant="warning">Renewal Soon</Badge> : getMembershipBadge(company.activeMembershipId)}
                    </td>
                    <td className="px-6 py-4 font-medium">{company.totalEventsCompleted ?? 0}</td>
                    <td className="px-6 py-4 text-brown/70">
                      {company.createdAt?.seconds
                        ? format(company.createdAt.seconds * 1000, "MMM d, yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown/50">
                    No companies found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-auto px-6 py-4 border-t border-gray-border bg-gray-bg/30 flex items-center justify-between">
          <p className="text-sm text-brown/60">
            Showing{" "}
            <span className="font-medium text-brown">
              {filteredCompanies.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-brown">
              {Math.min(currentPage * itemsPerPage, filteredCompanies.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-brown">{filteredCompanies.length}</span> results
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
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <AddCompanyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => setRefreshKey(prev => prev + 1)} 
      />
    </div>
  );
}
