"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  CheckCircle2,
  UserPlus,
  Trash2,
  X
} from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { LeadSlideOver } from "@/components/crm/LeadSlideOver";
import { getAllLeads, batchUpdateLeads } from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import { LeadStatus } from "@/types/crm";
import toast from "react-hot-toast";

type SortField = "company" | "date" | "size" | "status";
type SortOrder = "asc" | "desc";

export default function LeadsPage() {
  const { user, role } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Slide Over State
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !role) return;
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const data = await getAllLeads(user.uid, role);
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [user, role]);

  // Filter Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = (lead.companyName || "").toLowerCase().includes(search.toLowerCase()) || 
                            (lead.contactName || "").toLowerCase().includes(search.toLowerCase()) ||
                            (lead.email || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  // Sort Logic
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let result = 0;
      if (sortField === "company") result = (a.companyName || "").localeCompare(b.companyName || "");
      if (sortField === "date") {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.date || 0).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.date || 0).getTime();
        result = dateA - dateB;
      }
      if (sortField === "size") result = (a.estimatedGroupSize || 0) - (b.estimatedGroupSize || 0);
      if (sortField === "status") result = (a.status || "").localeCompare(b.status || "");
      
      return sortOrder === "asc" ? result : -result;
    });
  }, [filteredLeads, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    return sortedLeads.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedLeads, currentPage, itemsPerPage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedLeads.length && paginatedLeads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchStatusUpdate = async (selectedStatus: string) => {
    const newStatus = selectedStatus as LeadStatus;
    if (!user) return;
    const toastId = toast.loading(`Updating ${selectedIds.length} leads...`);
    try {
      await batchUpdateLeads(selectedIds, { status: newStatus }, user.uid, user.displayName || "User");
      setLeads(prev => prev.map(l => selectedIds.includes(l.id) ? { ...l, status: newStatus } : l));
      setSelectedIds([]);
      toast.success("Leads updated successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to update leads", { id: toastId });
    }
  };

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
      case "New": return <Badge variant="warning">{status}</Badge>;
      case "Contacted": return <Badge variant="neutral">{status}</Badge>;
      case "Quote Sent": return <Badge variant="default">{status}</Badge>;
      case "Lost": return <Badge variant="danger">{status}</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-brown/30 ml-1 inline-block" />;
    return sortOrder === "asc" 
      ? <ChevronUp className="w-4 h-4 text-teal-dark ml-1 inline-block" /> 
      : <ChevronDown className="w-4 h-4 text-teal-dark ml-1 inline-block" />;
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark underline-teal text-3xl">Leads</h1>
          <p className="text-sm text-brown/70 mt-1">Manage and track incoming catering inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-bg/50 p-1 rounded-lg border border-gray-border/50">
            <Button variant="secondary" size="sm" className="h-8 px-3 rounded-md shadow-sm">
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-8 px-3 rounded-md">
              <a href="/app/leads/board">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Board
              </a>
            </Button>
          </div>
          <Button variant="outline" className="hidden sm:flex">Export CSV</Button>
          <Button asChild>
            <a href="/app/leads/new">Add Lead</a>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input 
            placeholder="Search company or email..." 
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
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Quote Sent">Quote Sent</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-gray-border rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-bg border-b border-gray-border text-brown/70 font-medium">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-border text-teal-base focus:ring-teal-base h-4 w-4"
                    checked={selectedIds.length === paginatedLeads.length && paginatedLeads.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("company")}>
                  Company <SortIcon field="company" />
                </th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("size")}>
                  Size <SortIcon field="size" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("status")}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => handleSort("date")}>
                  Date Created <SortIcon field="date" />
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border text-brown">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-brown/50">
                    <div className="flex items-center justify-center gap-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-base border-t-transparent"></div>
                       Loading leads...
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={`hover:bg-gray-bg/50 transition-colors group cursor-pointer ${selectedIds.includes(lead.id) ? 'bg-teal-base/5' : ''}`}
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsSlideOverOpen(true);
                    }}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                       <input 
                        type="checkbox" 
                        className="rounded border-gray-border text-teal-base focus:ring-teal-base h-4 w-4"
                        checked={selectedIds.includes(lead.id)}
                        onChange={(e) => toggleSelect(lead.id, e as any)}
                       />
                    </td>
                    <td className="px-6 py-4 font-semibold">{lead.companyName || "N/A"}</td>
                    <td className="px-6 py-4 text-brown/70">{lead.contactName || lead.email}</td>
                    <td className="px-6 py-4">{lead.cateringNeed || "Inquiry"}</td>
                    <td className="px-6 py-4">{lead.estimatedGroupSize || 0} ppl</td>
                    <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                    <td className="px-6 py-4 text-brown/70">
                      {lead.createdAt?.seconds 
                        ? format(lead.createdAt.seconds * 1000, "MMM d, yyyy")
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                      </Button>
                      <button className="p-2 text-brown/40 hover:text-brown transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-brown/50">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="mt-auto px-6 py-4 border-t border-gray-border bg-gray-bg/30 flex items-center justify-between">
          <p className="text-sm text-brown/60">
            Showing <span className="font-medium text-brown">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-brown">{Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> of <span className="font-medium text-brown">{filteredLeads.length}</span> results
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

      {/* Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-teal-dark text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 border-r border-white/20 pr-6">
            <div className="bg-teal-base text-teal-dark font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {selectedIds.length}
            </div>
            <span className="font-medium text-sm">Leads Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <select 
              className="bg-white/10 border-white/20 rounded-lg px-3 py-1.5 text-sm focus:ring-teal-base focus:border-teal-base cursor-pointer hover:bg-white/20 transition-colors"
              onChange={(e) => handleBatchStatusUpdate(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled className="text-brown">Mark as...</option>
              <option value="New" className="text-brown">New</option>
              <option value="Contacted" className="text-brown">Contacted</option>
              <option value="Quote Sent" className="text-brown">Quote Sent</option>
              <option value="Lost" className="text-brown">Lost</option>
            </select>

            <Button variant="ghost" className="text-white hover:bg-white/10 h-9 px-3">
              <UserPlus className="w-4 h-4 mr-2" />
              Assign
            </Button>

            <Button variant="ghost" className="text-red-400 hover:bg-red-400/10 hover:text-red-300 h-9 px-3">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          <button 
            onClick={() => setSelectedIds([])}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <LeadSlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        lead={selectedLead} 
      />
    </div>
  );
}
