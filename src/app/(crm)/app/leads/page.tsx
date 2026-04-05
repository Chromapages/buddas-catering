"use client";

import { useState, useMemo } from "react";
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
  Trash2,
  X
} from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import Link from "next/link";
import { LeadSlideOver } from "@/components/crm/LeadSlideOver";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";
import { getAllLeads, batchUpdateLeads, getSalesReps, deleteLeads, assignRep } from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate, parseDate, cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/utils/export";
import { calculateLeadHeat, getHeatMetadata } from "@/lib/utils/heat-scoring";
import { LeadStatus } from "@/types/crm";
import toast from "react-hot-toast";
import { sendEmail } from "@/lib/utils/notifications";
import { Mail as MailIcon, Send } from "lucide-react";
import { Textarea } from "@/components/shared/Textarea";

type SortField = "company" | "date" | "size" | "status";
type SortOrder = "asc" | "desc";

export default function LeadsPage() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const isRep = role === "rep";
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [waitlistFilter, setWaitlistFilter] = useState<"All" | "Waitlist" | "Active">("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [repFilter, setRepFilter] = useState(() => (isRep && user?.uid ? user.uid : "All"));
  
  // React Query Fetching
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['leads', user?.uid],
    queryFn: () => getAllLeads(user!.uid, role!),
    enabled: !!user && !!role,
  });

  const { data: reps = {} } = useQuery({
    queryKey: ['sales-reps'],
    queryFn: getSalesReps,
    enabled: !!user,
  });

  const loading = leadsLoading;

  // Slide Over State
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [logState, setLogState] = useState<{
    isOpen: boolean;
    entityId: string;
    entityType: 'LEAD' | 'COMPANY';
    entityName: string;
  }>({ isOpen: false, entityId: "", entityType: "LEAD", entityName: "" });

  // Bulk Outreach State
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);
  const [bulkEmailContent, setBulkEmailContent] = useState("");
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const effectiveRepFilter = isRep && user?.uid ? user.uid : repFilter;

  // Filter Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = (lead.companyName || "").toLowerCase().includes(search.toLowerCase()) || 
                            (lead.contactName || "").toLowerCase().includes(search.toLowerCase()) ||
                            (lead.email || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const matchesRep = effectiveRepFilter === "All" || lead.assignedRepId === effectiveRepFilter;
      const matchesWaitlist = waitlistFilter === "All" || 
                              (waitlistFilter === "Waitlist" ? lead.isWaitlist === true : lead.isWaitlist !== true);
      return matchesSearch && matchesStatus && matchesRep && matchesWaitlist;
    });
  }, [effectiveRepFilter, leads, search, statusFilter, waitlistFilter]);

  // Sort Logic
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let result = 0;
      if (sortField === "company") result = (a.companyName || "").localeCompare(b.companyName || "");
      if (sortField === "date") {
        const dateA = parseDate(a.createdAt)?.getTime() || parseDate((a as any).date)?.getTime() || 0;
        const dateB = parseDate(b.createdAt)?.getTime() || parseDate((b as any).date)?.getTime() || 0;
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

  // Duplicate detection: flag leads sharing an email with another lead
  const duplicateEmails = useMemo(() => {
    const emailCount: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.email) emailCount[l.email.toLowerCase()] = (emailCount[l.email.toLowerCase()] || 0) + 1;
    });
    return new Set(Object.entries(emailCount).filter(([, c]) => c > 1).map(([e]) => e));
  }, [leads]);

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
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedIds([]);
      toast.success("Leads updated successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to update leads", { id: toastId });
    }
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return;
    const toastId = toast.loading(`Deleting ${selectedIds.length} leads...`);
    try {
      await deleteLeads(selectedIds);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedIds([]);
      toast.success("Leads deleted successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to delete leads", { id: toastId });
    }
  };

  const handleBatchAssign = async (repId: string) => {
    if (!user || !repId) return;
    const repName = reps[repId];
    const toastId = toast.loading(`Assigning ${selectedIds.length} leads to ${repName}...`);
    try {
      for (const id of selectedIds) {
        await assignRep(id, repId, repName, user.uid, user.displayName || "User");
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedIds([]);
      toast.success(`Leads assigned to ${repName}`, { id: toastId });
    } catch (err) {
      toast.error("Failed to assign leads", { id: toastId });
    }
  };

  const handleSendBulkEmail = async () => {
    if (!bulkEmailContent.trim() || selectedIds.length === 0) return;
    
    setIsSendingBulk(true);
    const toastId = toast.loading(`Sending emails to ${selectedIds.length} leads...`);
    
    try {
      const selectedLeads = leads.filter(l => selectedIds.includes(l.id));
      
      // In a real environment, we'd use a batch endpoint or Promise.allSettled
      const results = await Promise.allSettled(
        selectedLeads.map(lead => 
          sendEmail({
            to: lead.email,
            subject: "Special Offer from Buddas Hawaiian 🌺",
            message: bulkEmailContent.replace("{{name}}", lead.contactName || "there")
          })
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      toast.success(`Broadcasting complete: ${successCount}/${selectedIds.length} sent.`, { id: toastId });
      
      setBulkEmailContent("");
      setIsBulkEmailOpen(false);
      setSelectedIds([]);
    } catch (error) {
      toast.error("Bulk broadcast failed", { id: toastId });
    } finally {
      setIsSendingBulk(false);
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
      case "Approved": return <Badge variant="success">{status}</Badge>;
      case "Won": return <Badge variant="success">{status}</Badge>;
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
    <div className="relative flex h-full flex-col overscroll-y-contain p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-teal-dark">Leads</h1>
          <p className="text-sm text-brown/70 mt-1">Manage and track incoming catering inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-bg/50 p-1 rounded-lg border border-gray-border/50">
            <Button variant="secondary" size="sm" className="h-8 px-3 rounded-md shadow-sm">
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-8 px-3 rounded-md">
              <Link href="/app/leads/board">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Board
              </Link>
            </Button>
          </div>
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() =>
              exportToCsv(
                sortedLeads.map((l) => ({
                  Company: l.companyName ?? "",
                  Contact: l.contactName ?? "",
                  Email: l.email ?? "",
                  Phone: l.phone ?? "",
                  Status: l.status ?? "",
                  "Created At": l.createdAt ? formatDate(l.createdAt) : "",
                })),
                "leads-export"
              )
            }
          >
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/app/leads/new">Add Lead</Link>
          </Button>
        </div>
      </div>

      {/* Inline Filters Bar */}
      <div className="bg-white px-5 py-3.5 rounded-t-xl border border-gray-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-56 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brown/40 group-focus-within:text-teal-base transition-colors" />
            <Input 
              placeholder="Search companies, names..." 
              className="pl-9 h-9 text-sm border-gray-border bg-gray-bg/30 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="h-6 w-px bg-gray-border/60 hidden sm:block" />

          {/* Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All" },
              { id: "New", label: "New" },
              { id: "Contacted", label: "Contacted" },
              { id: "Quote Sent", label: "Sent" },
              { id: "Approved", label: "Approved" },
              { id: "Lost", label: "Lost" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id === "all" ? "All" : f.id)}
                className={cn(
                  "px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-tight rounded-full transition-all border",
                  (statusFilter === f.id || (statusFilter === "All" && f.id === "all"))
                    ? "bg-teal-base text-white border-teal-base shadow-sm"
                    : "bg-white text-brown/50 border-gray-border hover:border-brown/30"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-border/60 hidden sm:block" />

          {/* Waitlist Toggle Chips */}
          <div className="flex bg-gray-bg/60 p-0.5 rounded-lg border border-gray-border text-[11px] font-bold">
            <button 
              onClick={() => setWaitlistFilter("All")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                waitlistFilter === "All" ? "bg-white text-teal-dark shadow-sm" : "text-brown/40 hover:text-brown/60"
              )}
            >
              Everyone
            </button>
            <button 
              onClick={() => setWaitlistFilter("Active")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1",
                waitlistFilter === "Active" ? "bg-white text-teal-dark shadow-sm" : "text-brown/40 hover:text-brown/60"
              )}
            >
              Active
            </button>
            <button 
              onClick={() => setWaitlistFilter("Waitlist")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1",
                waitlistFilter === "Waitlist" ? "bg-white text-orange shadow-sm" : "text-brown/40 hover:text-brown/60"
              )}
            >
              Waitlist
            </button>
          </div>
        </div>

        {/* Rep Filter (Admin only) */}
        {!isRep && (
          <div className="w-full sm:w-auto">
            <Select 
              className="w-full sm:w-36 h-9 text-xs font-bold border-gray-border bg-gray-bg/30"
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              options={[
                { value: "All", label: "ALL REPS" },
                ...Object.entries(reps).map(([id, name]) => ({
                  value: id,
                  label: (name as string).toUpperCase()
                }))
              ]}
            />
          </div>
        )}
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
                <th className="px-6 py-4">Source</th>
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
                <th className="px-6 py-4">Heat</th>
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
                    <td className="px-6 py-4 font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-2">
                          {lead.companyName || "N/A"}
                          {lead.isWaitlist && (
                            <Badge variant="neutral" className="bg-orange/10 text-orange border-orange/20 text-[9px] px-1 py-0 uppercase">
                              Waitlist
                            </Badge>
                          )}
                          {lead.email && duplicateEmails.has(lead.email.toLowerCase()) && (
                            <Badge variant="warning" className="text-[10px] px-1.5 py-0" title="Possible duplicate — same email exists in another lead">
                              Duplicate
                            </Badge>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brown/70">{lead.contactName || lead.email}</td>
                    <td className="px-6 py-4">
                      {lead.source ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-bg px-2 py-0.5 rounded border border-gray-border/50 text-brown/50 cursor-help" title={lead.utm_campaign}>
                          {lead.source}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brown/30">Direct</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{lead.cateringNeed || "Inquiry"}</td>
                    <td className="px-6 py-4">{lead.estimatedGroupSize || 0} ppl</td>
                    <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                    <td className="px-6 py-4 text-brown/70">
                      {formatDate(lead.createdAt, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const score = calculateLeadHeat(lead);
                        const meta = getHeatMetadata(score);
                        return (
                          <div className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                            meta.bg,
                            meta.color,
                            meta.ring
                          )}>
                            {meta.label}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-teal-base hover:bg-teal-base/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogState({
                            isOpen: true,
                            entityId: lead.id,
                            entityType: "LEAD",
                            entityName: lead.companyName || lead.contactName || "Lead",
                          });
                        }}
                      >
                         Log
                      </Button>
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
            <Select 
              className="w-36 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              value=""
              onChange={(e) => handleBatchStatusUpdate(e.target.value)}
              options={[
                { value: "", label: "Mark as...", disabled: true },
                { value: "New", label: "New" },
                { value: "Contacted", label: "Contacted" },
                { value: "Quote Sent", label: "Quote Sent" },
                { value: "Approved", label: "Approved" },
                { value: "Won", label: "Won" },
                { value: "Lost", label: "Lost" },
              ]}
            />

            <Select 
              className="w-36 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              value=""
              onChange={(e) => handleBatchAssign(e.target.value)}
              options={[
                { value: "", label: "Assign to...", disabled: true },
                ...Object.entries(reps).map(([id, name]) => ({
                  value: id,
                  label: name as string
                }))
              ]}
            />

            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 h-9 px-3"
              onClick={() => setIsBulkEmailOpen(!isBulkEmailOpen)}
            >
              <MailIcon className="w-4 h-4 mr-2" />
              Bulk Outreach
            </Button>

            <Button 
              variant="ghost" 
              className="text-red-400 hover:bg-red-400/10 hover:text-red-300 h-9 px-3"
              onClick={handleBatchDelete}
            >
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
          
          {/* Bulk Email Overlay */}
          {isBulkEmailOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-4 bg-white border border-gray-border rounded-2xl shadow-2xl p-6 text-brown animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="font-bold text-teal-dark flex items-center gap-2">
                   <MailIcon className="h-4 w-4" />
                   Send Bulk Email to {selectedIds.length} Leads
                 </h4>
                 <button onClick={() => setIsBulkEmailOpen(false)} className="text-brown/40 hover:text-brown">
                   <X className="h-4 w-4" />
                 </button>
               </div>
               
               <div className="space-y-4">
                 <div className="text-xs text-brown/50 bg-gray-bg p-2 rounded border border-gray-border/50">
                    <span className="font-bold">Pro-tip:</span> Use <code className="bg-white px-1 py-0.5 rounded border">{"{{name}}"}</code> to personalize the message.
                 </div>
                 <Textarea 
                   placeholder="Type your message here..."
                   className="min-h-[150px] border-gray-border"
                   value={bulkEmailContent}
                   onChange={(e) => setBulkEmailContent(e.target.value)}
                 />
                 <div className="flex justify-end gap-3">
                   <Button variant="outline" onClick={() => setIsBulkEmailOpen(false)}>Cancel</Button>
                   <Button 
                     className="gap-2" 
                     onClick={handleSendBulkEmail}
                     disabled={isSendingBulk || !bulkEmailContent.trim()}
                   >
                     {isSendingBulk ? "Sending..." : "Send Broadcast"}
                     <Send className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}

      <LeadSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        lead={selectedLead}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
      />

      <QuickLogDrawer
        {...logState}
        onClose={() => setLogState(prev => ({ ...prev, isOpen: false }))}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
      />
    </div>
  );
}
