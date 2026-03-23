"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Utensils
} from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { getAllCateringRequests } from "@/lib/firebase/services/crm";
import Link from "next/link";

type SortField = "company" | "date" | "size" | "status" | "amount";
type SortOrder = "asc" | "desc";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getAllCateringRequests();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    const matchesSearch = (req.companyName || "").toLowerCase().includes(search.toLowerCase()) || 
                          (req.contactName || "").toLowerCase().includes(search.toLowerCase()) ||
                          (req.id || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || req.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort Logic
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let result = 0;
    if (sortField === "company") result = (a.companyName || "").localeCompare(b.companyName || "");
    if (sortField === "date") {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime();
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime();
      result = dateA - dateB;
    }
    if (sortField === "size") result = (a.estimatedGroupSize || 0) - (b.estimatedGroupSize || 0);
    if (sortField === "status") result = (a.fulfillmentStatus || "").localeCompare(b.fulfillmentStatus || "");
    if (sortField === "amount") result = (a.quoteAmount || 0) - (b.quoteAmount || 0);
    
    return sortOrder === "asc" ? result : -result;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const paginatedRequests = sortedRequests.slice(
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <Badge variant="warning">{status}</Badge>;
      case "In Progress": return <Badge variant="neutral">{status}</Badge>;
      case "Fulfilled": return <Badge variant="success">{status}</Badge>;
      case "Cancelled": return <Badge variant="danger">{status}</Badge>;
      default: return <Badge variant="neutral">{status || "Pending"}</Badge>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-brown/30 ml-1 inline-block" />;
    return sortOrder === "asc" 
      ? <ChevronUp className="w-4 h-4 text-teal-dark ml-1 inline-block" /> 
      : <ChevronDown className="w-4 h-4 text-teal-dark ml-1 inline-block" />;
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Catering Requests</h1>
          <p className="text-sm text-brown/70 mt-1">Track event fulfillment, quotes, and production status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Schedule View</Button>
          <Button asChild>
            <Link href="/app/requests/new">New Request</Link>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input 
            placeholder="Search by company or ID..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brown/60" />
          <select 
            className="text-sm border-gray-border rounded-md px-3 py-2 bg-gray-bg focus:ring-teal-base focus:border-teal-base appearance-none pr-8 relative"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-gray-border rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-bg border-b border-gray-border text-brown/70 font-medium">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("company")}>
                  Company <SortIcon field="company" />
                </th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("date")}>
                  Event Date <SortIcon field="date" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("size")}>
                  Size <SortIcon field="size" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("amount")}>
                  Quote <SortIcon field="amount" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("status")}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border text-brown">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brown/50">
                    <div className="flex items-center justify-center gap-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-base border-t-transparent"></div>
                       Loading requests...
                    </div>
                  </td>
                </tr>
              ) : paginatedRequests.length > 0 ? (
                paginatedRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="hover:bg-gray-bg/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">{req.companyName || "N/A"}</span>
                        <span className="text-xs text-brown/50">{req.contactName || "No Contact"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 text-brown/40" />
                        {req.cateringNeed || req.eventType || "General"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brown/40" />
                        {req.preferredDate ? format(new Date(req.preferredDate), "MMM d, yyyy") : "TBD"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-brown/40" />
                        {req.estimatedGroupSize || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-teal-dark">
                      {req.quoteAmount 
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(req.quoteAmount)
                        : "—"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.fulfillmentStatus)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/app/requests/${req.id}`}>Details</Link>
                      </Button>
                      <button className="p-2 text-brown/40 hover:text-brown transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brown/50">
                    No catering requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-auto px-6 py-4 border-t border-gray-border bg-gray-bg/30 flex items-center justify-between">
          <p className="text-sm text-brown/60">
            Showing <span className="font-medium text-brown">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-brown">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> of <span className="font-medium text-brown">{filteredRequests.length}</span> results
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
