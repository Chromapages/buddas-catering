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
  X,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/shared/Card";
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
import { LeadBentoGrid } from "@/components/crm/LeadBentoGrid";
import { useEffect } from "react";

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
  const [viewMode, setViewMode] = useState<'bento' | 'classic'>('bento');

  // Persist View Mode
  useEffect(() => {
    const saved = localStorage.getItem('crm-leads-view');
    if (saved === 'classic') setViewMode('classic');
  }, []);

  const handleToggleView = (mode: 'bento' | 'classic') => {
    setViewMode(mode);
    localStorage.setItem('crm-leads-view', mode);
  };
  
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
    <div className="relative flex h-full flex-col overscroll-y-contain p-8 gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-chef-charcoal tracking-tight leading-none mb-2">Leads</h1>
          <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em]">Management & Performance Tracking</p>
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
            className="hidden sm:flex border-v-outline/20 bg-v-surface hover:bg-v-container h-12 rounded-[16px] px-6 text-[10px] font-black uppercase tracking-widest transition-all"
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
          <Button asChild className="h-12 px-8 rounded-[20px] bg-chef-charcoal text-white shadow-soft-mid border-none text-[10px] font-black uppercase tracking-widest hover:scale-10 shadow-accent-fresh/20 transition-all active:scale-95">
            <Link href="/app/leads/new">Add Lead</Link>
          </Button>
        </div>
      </div>

      {viewMode === 'bento' ? (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <LeadBentoGrid 
            leads={sortedLeads} 
            onSelect={(lead) => {
              setSelectedLead(lead);
              setIsSlideOverOpen(true);
            }} 
          />
        </div>
      ) : (
        <Card className="flex-1 flex flex-col bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Unified Header & Filters */}
        <div className="px-8 py-8 flex flex-wrap items-center justify-between gap-6 border-b border-chef-charcoal/10 bg-chef-prep/30">
          <div className="flex flex-wrap items-center gap-6 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-chef-muted group-focus-within:text-accent-fresh transition-colors" />
              <Input 
                placeholder="Search leads database..." 
                className="pl-14 h-14 text-sm border border-transparent bg-chef-prep/50 focus:bg-white focus:border-accent-fresh/20 rounded-[20px] placeholder:text-chef-muted/40 transition-all focus:ring-0 shadow-soft-low"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="h-8 w-px bg-v-outline/10 hidden sm:block" />

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: "all", label: "All" },
                { id: "New", label: "New" },
                { id: "Contacted", label: "Contacted" },
                { id: "Quote Sent", label: "Sent" },
                { id: "Approved", label: "Approved" },
                { id: "Lost", label: "Lost" },
              ].map((f) => {
                const isActive = (statusFilter === f.id || (statusFilter === "All" && f.id === "all"));
                return (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id === "all" ? "All" : f.id)}
                    className={cn(
                      "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border active:scale-95",
                      isActive
                        ? "bg-chef-charcoal text-white border-chef-charcoal shadow-soft-mid"
                        : "bg-white text-chef-muted border-chef-charcoal/5 hover:border-chef-charcoal/20 hover:text-chef-charcoal shadow-soft-low"
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="h-8 w-px bg-v-outline/10 hidden sm:block" />

            {/* Waitlist Toggle Chips */}
            <div className="flex bg-v-container p-1 rounded-xl border border-v-outline/10 text-[9px] font-black uppercase tracking-widest">
              <button 
                onClick={() => setWaitlistFilter("All")}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all",
                  waitlistFilter === "All" ? "bg-white text-v-on-surface shadow-sm" : "text-v-on-surface/40 hover:text-v-on-surface"
                )}
              >
                Everyone
              </button>
              <button 
                onClick={() => setWaitlistFilter("Active")}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all flex items-center gap-1",
                  waitlistFilter === "Active" ? "bg-white text-v-on-surface shadow-sm" : "text-v-on-surface/40 hover:text-v-on-surface"
                )}
              >
                Active
              </button>
              <button 
                onClick={() => setWaitlistFilter("Waitlist")}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all flex items-center gap-1",
                  waitlistFilter === "Waitlist" ? "bg-white text-v-secondary shadow-sm" : "text-v-on-surface/40 hover:text-v-on-surface"
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
                className="w-full sm:w-56 h-14 text-[10px] font-black border-none bg-chef-prep/50 focus:bg-white rounded-[20px] uppercase tracking-widest shadow-soft-low"
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

        {/* Table Body */}
        <CardContent className="p-0 overflow-hidden flex-1 flex flex-col bg-white">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
              <thead className="bg-chef-prep/30 border-b border-chef-charcoal/5 text-[10px] font-black uppercase tracking-[0.25em] text-chef-muted">
                <tr>
                  <th className="px-8 py-6 w-10 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">
                    <input 
                      type="checkbox" 
                      className="rounded-lg border-chef-charcoal/20 text-accent-fresh focus:ring-accent-fresh bg-white h-5 w-5"
                      checked={selectedIds.length === paginatedLeads.length && paginatedLeads.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("company")}>
                    Company <SortIcon field="company" />
                  </th>
                  <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">Contact</th>
                  <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">Source</th>
                  <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">Event Type</th>
                  <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("size")}>
                    Size <SortIcon field="size" />
                  </th>
                  <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("status")}>
                    Status <SortIcon field="status" />
                  </th>
                  <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("date")}>
                    Date Created <SortIcon field="date" />
                  </th>
                  <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">Heat</th>
                  <th className="px-8 py-6 text-right sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chef-charcoal/[0.03] text-chef-charcoal">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                         <div className="animate-spin rounded-full h-10 w-10 border-2 border-v-primary border-t-transparent shadow-lg shadow-v-primary/20"></div>
                         <span className="font-black uppercase tracking-[0.2em] text-[10px] text-v-on-surface/30">Syncing CRM Intelligence...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedLeads.length > 0 ? (
                  paginatedLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className={cn(
                        "hover:bg-v-container/40 transition-all group cursor-pointer border-l-4 border-transparent",
                        selectedIds.includes(lead.id) ? "bg-v-container border-v-primary" : ""
                      )}
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsSlideOverOpen(true);
                       }}
                    >
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                         <input 
                          type="checkbox" 
                          className="rounded border-v-outline/40 text-v-primary focus:ring-v-primary bg-white h-4 w-4"
                          checked={selectedIds.includes(lead.id)}
                          onChange={(e) => toggleSelect(lead.id, e as any)}
                         />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-3 font-black text-v-on-surface tracking-tight">
                            {lead.companyName || "N/A"}
                            {lead.isWaitlist && (
                              <Badge className="bg-v-secondary/10 text-v-secondary border-v-secondary/20 text-[9px] px-2 py-0 border font-black uppercase tracking-widest rounded-md">
                                Waitlist
                              </Badge>
                            )}
                            {lead.email && duplicateEmails.has(lead.email.toLowerCase()) && (
                              <Badge className="bg-v-primary/10 text-v-primary border-v-primary/20 text-[9px] px-2 py-0 border font-black uppercase tracking-widest rounded-md" title="Possible duplicate">
                                Duplicate
                              </Badge>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-chef-charcoal/80">{lead.contactName || "—"}</span>
                          <span className="text-[10px] text-chef-muted font-bold uppercase tracking-widest truncate max-w-[150px]">{lead.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {lead.source ? (
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] bg-v-container px-2.5 py-1 rounded-lg border border-v-outline/10 text-v-on-surface/60 cursor-help" title={lead.utm_campaign}>
                            {lead.source}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-v-on-surface/10">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-v-on-surface/60">{lead.cateringNeed || "Inquiry"}</td>
                      <td className="px-6 py-5 tabular-nums font-black text-chef-charcoal">{lead.estimatedGroupSize || 0} <span className="text-[10px] font-bold text-chef-muted uppercase tracking-widest px-1">pax</span></td>
                      <td className="px-6 py-5">
                        <Badge className={cn(
                          "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border-transparent",
                          lead.status === "New" ? "bg-v-secondary/10 text-v-secondary" : "bg-v-on-surface/5 text-v-on-surface/40"
                        )}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-chef-muted text-[10px] font-black uppercase tracking-widest">
                        {formatDate(lead.createdAt, "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-5">
                        {(() => {
                           const score = calculateLeadHeat(lead);
                           const meta = getHeatMetadata(score);
                           return (
                             <div className={cn(
                               "inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border",
                               meta.label === "Hot" ? "bg-accent-heat text-white border-accent-heat shadow-lg shadow-accent-heat/20" : "bg-chef-prep text-chef-muted border-chef-charcoal/10"
                             )}>
                               {meta.label}
                             </div>
                           );
                        })()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-4 border-v-outline/20 text-v-on-surface hover:bg-v-container transition-all font-black text-[10px] uppercase tracking-widest rounded-xl"
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
                          <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] uppercase tracking-widest font-black text-v-on-surface/40 hover:text-v-on-surface rounded-xl">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                   ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-32 text-center text-chef-muted uppercase tracking-[0.2em] font-black text-[10px]">
                      No Matching Records Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="px-8 py-6 border-t border-chef-charcoal/10 bg-chef-prep/30 flex items-center justify-between">
            <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.15em]">
              Perspective: <span className="text-chef-charcoal">{Math.max(0, (currentPage - 1) * itemsPerPage + 1)}</span> - <span className="text-chef-charcoal">{Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> <span className="mx-2 opacity-20">/</span> {filteredLeads.length} Total
            </p>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-12 p-0 border-chef-charcoal/10 bg-white hover:bg-chef-prep disabled:opacity-20 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5 text-chef-muted" />
              </Button>
              <div className="text-[11px] font-black text-chef-charcoal bg-white h-10 px-6 flex items-center rounded-xl border border-chef-charcoal/10 tracking-widest tabular-nums">
                {currentPage} <span className="mx-2 opacity-20 text-[9px]">OF</span> {totalPages || 1}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-10 w-12 p-0 border-v-outline/20 bg-white hover:bg-v-container disabled:opacity-20 rounded-xl"
              >
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-v-on-surface/95 backdrop-blur-2xl text-white px-8 py-5 rounded-[28px] shadow-ambient-heavy border border-white/10 flex items-center gap-10 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center gap-5 border-r border-white/10 pr-10">
            <div className="bg-v-primary/20 text-v-primary ring-1 ring-v-primary/40 font-black rounded-xl h-10 w-10 flex items-center justify-center text-sm shadow-lg shadow-v-primary/20">
              {selectedIds.length}
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Leads Under Control</span>
          </div>

          <div className="flex items-center gap-3">
            <Select 
              className="w-40 h-10 bg-white/5 border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-v-primary/50"
              value=""
              onChange={(e) => handleBatchStatusUpdate(e.target.value)}
              options={[
                { value: "", label: "SET STATUS...", disabled: true },
                { value: "New", label: "New" },
                { value: "Contacted", label: "Contacted" },
                { value: "Quote Sent", label: "Quote Sent" },
                { value: "Approved", label: "Approved" },
                { value: "Won", label: "Won" },
                { value: "Lost", label: "Lost" },
              ]}
            />

            <Select 
              className="w-40 h-10 bg-white/5 border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-v-primary/50"
              value=""
              onChange={(e) => handleBatchAssign(e.target.value)}
              options={[
                { value: "", label: "ASSIGN REP...", disabled: true },
                ...Object.entries(reps).map(([id, name]) => ({
                  value: id,
                  label: (name as string).toUpperCase()
                }))
              ]}
            />

            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/5 h-10 px-6 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl"
              onClick={() => setIsBulkEmailOpen(!isBulkEmailOpen)}
            >
              <MailIcon className="w-4 h-4 mr-2 text-v-primary" />
              Broadcaster
            </Button>

            <Button 
              variant="ghost" 
              className="text-v-secondary hover:bg-v-secondary/10 h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl"
              onClick={handleBatchDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Records
            </Button>
          </div>

          <button 
            onClick={() => setSelectedIds([])}
            className="ml-6 p-2.5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Bulk Email Overlay */}
          {isBulkEmailOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-6 bg-v-surface border border-v-outline/20 rounded-[24px] shadow-ambient-heavy p-8 text-v-on-surface animate-in slide-in-from-bottom-6 duration-500">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h4 className="font-black text-v-on-surface uppercase tracking-[0.15em] flex items-center gap-2">
                     <MailIcon className="h-5 w-5 text-v-primary" />
                     Omni-Channel Broadcast
                   </h4>
                   <p className="text-[10px] font-bold text-v-on-surface/30 uppercase tracking-widest mt-1">Targeting {selectedIds.length} Verified Records</p>
                 </div>
                 <button onClick={() => setIsBulkEmailOpen(false)} className="text-v-on-surface/20 hover:text-v-on-surface/60 p-2 hover:bg-v-container rounded-full transition-all">
                   <X className="h-5 w-5" />
                 </button>
               </div>
               
               <div className="space-y-6">
                 <div className="text-[10px] font-black text-v-primary uppercase tracking-[0.15em] bg-v-primary/5 p-4 rounded-xl border border-v-primary/10">
                    <span className="opacity-60">Personalization Protocol:</span> Use <code className="bg-white px-2 py-0.5 rounded shadow-sm">{"{{name}}"}</code> variable injector.
                 </div>
                 <Textarea 
                   placeholder="Enter executive dispatch content..."
                   className="min-h-[200px] border-v-outline/20 bg-white/60 focus:bg-white rounded-2xl text-[13px] font-medium placeholder:text-v-on-surface/20"
                   value={bulkEmailContent}
                   onChange={(e) => setBulkEmailContent(e.target.value)}
                 />
                 <div className="flex justify-end gap-3 pt-2">
                   <Button variant="outline" className="h-12 px-8 rounded-xl border-v-outline/20 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsBulkEmailOpen(false)}>Abort Dispatch</Button>
                   <Button 
                     className="h-12 px-8 rounded-xl bg-v-on-surface text-white shadow-lg shadow-v-on-surface/20 border-none text-[10px] font-black uppercase tracking-widest gap-2" 
                     onClick={handleSendBulkEmail}
                     disabled={isSendingBulk || !bulkEmailContent.trim()}
                   >
                     {isSendingBulk ? "Broadcasting..." : "Initialize Batch"}
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
