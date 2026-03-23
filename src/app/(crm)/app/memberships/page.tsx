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
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { getAllMemberships, getAllCompanies } from "@/lib/firebase/services/crm";
import { Membership, Company } from "@/types/crm";

type SortField = "company" | "tier" | "progress" | "renewal" | "date";
type SortOrder = "asc" | "desc";

const TIER_LABELS: Record<string, string> = {
  "2": "Tier 2 — 2 Events",
  "4": "Tier 4 — 4 Events",
  "6": "Tier 6 — 6 Events",
};

export default function MembershipsPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
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
        const [membershipsData, companiesData] = await Promise.all([
          getAllMemberships(),
          getAllCompanies(),
        ]);
        setMemberships(membershipsData);
        const map: Record<string, string> = {};
        (companiesData as Company[]).forEach((c) => { map[c.id] = c.name; });
        setCompanyMap(map);
      } catch (error) {
        console.error("Error fetching memberships:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMemberships = memberships.filter(m => {
    const companyName = companyMap[m.companyId] || "";
    const matchesSearch = companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && m.active) ||
      (statusFilter === "Inactive" && !m.active);
    const matchesTier = tierFilter === "All" || String(m.tier) === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const sortedMemberships = [...filteredMemberships].sort((a, b) => {
    let result = 0;
    if (sortField === "company") {
      result = (companyMap[a.companyId] || "").localeCompare(companyMap[b.companyId] || "");
    }
    if (sortField === "tier") result = Number(a.tier) - Number(b.tier);
    if (sortField === "progress") {
      const progressA = a.eventsCommitted ? a.eventsCompleted / a.eventsCommitted : 0;
      const progressB = b.eventsCommitted ? b.eventsCompleted / b.eventsCommitted : 0;
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

  const totalPages = Math.ceil(sortedMemberships.length / itemsPerPage);
  const paginatedMemberships = sortedMemberships.slice(
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
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Memberships</h1>
          <p className="text-sm text-brown/70 mt-1">Track corporate catering memberships and event usage.</p>
        </div>
        <Button>New Membership</Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input
            placeholder="Search company..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brown/60 shrink-0" />
          <select
            className="text-sm border-gray-border rounded-md px-3 py-2 bg-gray-bg focus:ring-teal-base focus:border-teal-base"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
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
                  onClick={() => handleSort("company")}
                >
                  Company <SortIcon field="company" />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("tier")}
                >
                  Tier <SortIcon field="tier" />
                </th>
                <th className="px-6 py-4">Discount</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("progress")}
                >
                  Event Usage <SortIcon field="progress" />
                </th>
                <th className="px-6 py-4">Status</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("renewal")}
                >
                  Renewal <SortIcon field="renewal" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border text-brown">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown/50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-base border-t-transparent"></div>
                      Loading memberships...
                    </div>
                  </td>
                </tr>
              ) : paginatedMemberships.length > 0 ? (
                paginatedMemberships.map((m) => {
                  const companyName = companyMap[m.companyId] || m.companyId || "Unknown Company";
                  const completed = m.eventsCompleted ?? 0;
                  const committed = m.eventsCommitted ?? 0;
                  const progressPct = committed > 0 ? Math.round((completed / committed) * 100) : 0;
                  const isNearLimit = progressPct >= 80;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-gray-bg/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/app/memberships/${m.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-gold" />
                          </div>
                          <span className="font-semibold">{companyName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brown/80">
                        {TIER_LABELS[String(m.tier)] ?? `Tier ${m.tier}`}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {m.discountPercent ?? 0}% off
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${isNearLimit ? "bg-sunset-orange" : "bg-teal-base"}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-brown/60 w-14 text-right">
                            {completed}/{committed}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {m.active
                          ? <Badge variant="success">Active</Badge>
                          : <Badge variant="neutral">Inactive</Badge>}
                      </td>
                      <td className="px-6 py-4 text-brown/70">
                        {formatTimestamp(m.renewalDate)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown/50">
                    No memberships found matching your criteria.
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
              {filteredMemberships.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-brown">
              {Math.min(currentPage * itemsPerPage, filteredMemberships.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-brown">{filteredMemberships.length}</span> results
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
    </div>
  );
}
