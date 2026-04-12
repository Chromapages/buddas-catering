"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Download,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/DropdownMenu";
import { RequestSlideOver } from "@/components/crm/RequestSlideOver";
import { LeadSlideOver } from "@/components/crm/LeadSlideOver";
import { useAuth } from "@/lib/firebase/context/auth";
import {
  batchDeleteCateringRequests,
  batchUpdateCateringRequests,
  deleteCateringRequest,
  getAllCateringRequests,
  getAllLeads,
} from "@/lib/firebase/services/crm";
import { exportToCsv } from "@/lib/utils/export";
import { cn, formatDate, parseDate } from "@/lib/utils";

type RequestStatus = "Pending" | "Confirmed" | "Fulfilled" | "Invoiced" | "Paid" | "Cancelled";
type SortField = "company" | "date" | "amount";
type SortOrder = "asc" | "desc";

interface RequestRecord {
  id: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  fulfillmentStatus?: RequestStatus;
  preferredDate?: string;
  quoteAmount?: number;
  estimatedGroupSize?: number;
  eventType?: string;
  cateringNeed?: string;
  leadId?: string;
}

interface LeadRecord {
  id: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  status?: string;
}

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Fulfilled", label: "Fulfilled" },
  { value: "Invoiced", label: "Invoiced" },
  { value: "Paid", label: "Paid" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function RequestsPage() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(null);
  const [linkedLead, setLinkedLead] = useState<LeadRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["catering-requests", user?.uid],
    queryFn: () => getAllCateringRequests(user!.uid, role!),
    enabled: !!user && !!role,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["request-linked-leads", user?.uid],
    queryFn: () => getAllLeads(user!.uid, role!),
    enabled: !!user && !!role,
  });

  const leadMap = useMemo(() => {
    return new Map((leads as LeadRecord[]).map((lead) => [lead.id, lead]));
  }, [leads]);

  const filteredRequests = useMemo(() => {
    return (requests as RequestRecord[]).filter((request) => {
      const haystack = [
        request.companyName,
        request.contactName,
        request.email,
        request.cateringNeed,
        request.eventType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || request.fulfillmentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      let result = 0;

      if (sortField === "company") {
        result = (a.companyName || "").localeCompare(b.companyName || "");
      }

      if (sortField === "date") {
        const dateA = parseDate(a.preferredDate)?.getTime() || parseDate((a as { createdAt?: unknown }).createdAt)?.getTime() || 0;
        const dateB = parseDate(b.preferredDate)?.getTime() || parseDate((b as { createdAt?: unknown }).createdAt)?.getTime() || 0;
        result = dateA - dateB;
      }

      if (sortField === "amount") {
        result = (a.quoteAmount || 0) - (b.quoteAmount || 0);
      }

      return sortOrder === "asc" ? result : -result;
    });
  }, [filteredRequests, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    return sortedRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedRequests, currentPage]);

  const allSelected = paginatedRequests.length > 0 && selectedIds.length === paginatedRequests.length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder("asc");
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(paginatedRequests.map((request) => request.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  };

  const refreshRequests = async () => {
    await queryClient.invalidateQueries({ queryKey: ["catering-requests"] });
  };

  const handleBatchStatusUpdate = async (status: RequestStatus) => {
    if (!user || selectedIds.length === 0) return;

    const toastId = toast.loading(`Updating ${selectedIds.length} requests...`);
    try {
      await batchUpdateCateringRequests(selectedIds, { fulfillmentStatus: status }, user.uid, user.displayName || "User", role || undefined);
      await refreshRequests();
      setSelectedIds([]);
      toast.success("Requests updated", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update requests", { id: toastId });
    }
  };

  const handleBatchDelete = async () => {
    if (!user || selectedIds.length === 0) return;

    const toastId = toast.loading(`Deleting ${selectedIds.length} requests...`);
    try {
      await batchDeleteCateringRequests(selectedIds, user.uid, role || undefined);
      await refreshRequests();
      setSelectedIds([]);
      toast.success("Requests deleted", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete requests", { id: toastId });
    }
  };

  const handleDeleteSingle = async () => {
    if (!user || !deleteId) return;

    const toastId = toast.loading("Deleting request...");
    try {
      await deleteCateringRequest(deleteId, user.uid, role || undefined);
      await refreshRequests();
      toast.success("Request deleted", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete request", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="warning">Pending</Badge>;
      case "Confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "Fulfilled":
      case "Paid":
        return <Badge variant="success">{status}</Badge>;
      case "Cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      case "Invoiced":
      default:
        return <Badge variant="neutral">{status || "Pending"}</Badge>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="ml-1 inline-block h-4 w-4 text-brown/30" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 inline-block h-4 w-4 text-teal-dark" />
    ) : (
      <ChevronDown className="ml-1 inline-block h-4 w-4 text-teal-dark" />
    );
  };

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-teal-dark">Inbound Requests</h1>
          <p className="mt-1 text-sm text-brown/70 font-medium tracking-tight">Qualify and convert incoming inquiries into realized catering events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() =>
              exportToCsv(
                sortedRequests.map((request) => ({
                  Company: request.companyName || "",
                  Contact: request.contactName || "",
                  Email: request.email || "",
                  Event: request.cateringNeed || request.eventType || "",
                  Status: request.fulfillmentStatus || "",
                  Date: request.preferredDate || "",
                  Amount: request.quoteAmount || "",
                })),
                "requests-export"
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/app/requests/new">New Request</Link>
          </Button>
        </div>
      </div>

      <Card variant="glass" className="flex-1 flex flex-col overflow-hidden border-white/20">
        {/* Search & Filters */}
        <div className="px-5 py-4 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40 group-focus-within:text-teal-base transition-colors" />
            <Input
              placeholder="Search company, contact, or email..."
              className="pl-9 h-10 border-white/20 bg-white/20 focus:bg-white/40 placeholder:text-brown/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 p-1.5 rounded-xl border border-white/10">
              <Filter className="w-3.5 h-3.5 text-brown/40 ml-1.5" />
              <select
                className="text-[10px] font-black uppercase tracking-widest border-none rounded-lg px-3 py-1.5 bg-transparent focus:ring-0 text-teal-dark cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">ALL STATUSES</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0 overflow-hidden flex-1 flex flex-col relative">
          <div className="overflow-x-auto flex-1">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-white/20 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.15em] text-brown/40">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded-md border-white/30 bg-white/10 text-teal-base focus:ring-teal-base"
                      checked={allSelected} 
                      onChange={toggleSelectAll} 
                    />
                  </th>
                  <th className="cursor-pointer px-6 py-4 hover:bg-white/30 transition-colors" onClick={() => handleSort("company")}>
                    Company <SortIcon field="company" />
                  </th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Inquiry details</th>
                  <th className="cursor-pointer px-6 py-4 hover:bg-white/30 transition-colors" onClick={() => handleSort("date")}>
                    Preferred Date <SortIcon field="date" />
                  </th>
                  <th className="cursor-pointer px-6 py-4 hover:bg-white/30 transition-colors" onClick={() => handleSort("amount")}>
                    est. Budget <SortIcon field="amount" />
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-brown">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-24 text-center text-brown/40">
                      <div className="flex flex-col items-center justify-center gap-4">
                         <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-base border-t-transparent shadow-lg shadow-teal-base/20"></div>
                         <span className="font-black uppercase tracking-widest text-[10px]">Filtering Data Stream...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request) => {
                    const requestLead = request.leadId ? leadMap.get(request.leadId) : null;

                    return (
                      <tr
                        key={request.id}
                        className={cn(
                          "group transition-all hover:bg-white/40 cursor-pointer",
                          selectedIds.includes(request.id) ? "bg-teal-base/5" : ""
                        )}
                        onClick={() => {
                          setSelectedRequest(request);
                          setLinkedLead(null);
                        }}
                      >
                        <td
                          className="px-6 py-4"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <input
                            type="checkbox"
                            className="rounded-md border-white/30 bg-teal-dark/5 text-teal-base focus:ring-teal-base"
                            checked={selectedIds.includes(request.id)}
                            onChange={() => toggleSelect(request.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange/5 group-hover:bg-orange/10 flex items-center justify-center transition-colors">
                              <ClipboardList className="w-4 h-4 text-orange" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-teal-dark leading-tight">{request.companyName || "Unknown Entity"}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-brown/20">REQ-{request.id.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-brown/80">{request.contactName || "Anonymous"}</span>
                            <span className="text-[11px] text-brown/40 font-medium">{request.email || "No direct email"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-[240px]">
                            <p className="truncate font-bold text-teal-dark/70 text-xs italic">
                              "{request.cateringNeed || request.eventType || "General Catering Request"}"
                            </p>
                            <p className="text-[10px] font-black text-brown/30 uppercase tracking-wider mt-0.5">
                              {request.estimatedGroupSize ? `${request.estimatedGroupSize} GUESTS` : "SCALE UNDEFINED"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-brown/50">
                          {request.preferredDate ? formatDate(request.preferredDate, "MMM d, yyyy") : "OPEN DATE"}
                        </td>
                        <td className="px-6 py-4 font-black tabular-nums text-teal-dark scale-105">
                          {request.quoteAmount != null
                            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(request.quoteAmount)
                            : "—"}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(request.fulfillmentStatus)}</td>
                        <td
                          className="px-6 py-4 text-right"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {requestLead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-orange bg-orange/5 hover:bg-orange/10 font-black text-[9px] uppercase tracking-widest transition-all"
                                onClick={() => setLinkedLead(requestLead)}
                              >
                                Linked lead
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded-xl p-2 text-brown/40 transition-colors hover:bg-white/40 hover:text-brown">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl p-1">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-brown/40 px-3 py-2">Management</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-brown/5" />
                                <DropdownMenuItem
                                  className="flex items-center px-3 py-2 text-sm font-semibold rounded-xl hover:bg-teal-base/5 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setLinkedLead(null);
                                  }}
                                >
                                  <ClipboardList className="mr-2 h-4 w-4 text-teal-base" />
                                  View details
                                </DropdownMenuItem>
                                {requestLead && (
                                  <DropdownMenuItem 
                                    className="flex items-center px-3 py-2 text-sm font-semibold rounded-xl hover:bg-orange/5 cursor-pointer transition-colors"
                                    onClick={() => setLinkedLead(requestLead)}
                                  >
                                    <ArrowRight className="mr-2 h-4 w-4 text-orange" />
                                    View lead record
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link href={`/app/orders/${request.id}`} className="flex items-center px-3 py-2 text-sm font-semibold rounded-xl hover:bg-teal-base/5 cursor-pointer transition-colors text-teal-dark">
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Go to Fulfillment
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-brown/5" />
                                <DropdownMenuItem 
                                  className="flex items-center px-3 py-2 text-sm font-semibold rounded-xl hover:bg-red-400/10 cursor-pointer transition-colors text-red-500"
                                  onClick={() => setDeleteId(request.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Inquiry
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-24 text-center text-brown/30 italic font-medium">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList className="h-10 w-10 opacity-20" />
                        <p>No catering requests found matching your query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Floating Batch Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card variant="glass" className="bg-teal-dark/95 border-teal-base/20 shadow-2xl py-2 px-3 flex items-center gap-4">
                <div className="flex items-center gap-2 pl-2">
                  <div className="w-5 h-5 rounded-full bg-teal-base flex items-center justify-center text-[10px] font-black text-white">
                    {selectedIds.length}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Selected</span>
                </div>
                
                <div className="h-4 w-px bg-white/10" />
                
                <div className="flex items-center gap-2">
                  <select
                    className="h-8 bg-white/10 border-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-white px-3 focus:ring-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        void handleBatchStatusUpdate(e.target.value as RequestStatus);
                      }
                    }}
                  >
                    <option value="" className="text-teal-dark">UPDATE STATUS</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="text-teal-dark">{opt.label.toUpperCase()}</option>
                    ))}
                  </select>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Archive
                  </Button>
                </div>
                
                <div className="h-4 w-px bg-white/10" />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest"
                  onClick={() => setSelectedIds([])}
                >
                  Deselect all
                </Button>
              </Card>
            </div>
          )}

          {/* Pagination bar */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between mt-auto">
            <p className="text-[11px] font-black text-brown/40 uppercase tracking-widest">
              Showing <span className="text-teal-dark">{sortedRequests.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-teal-dark">{Math.min(currentPage * itemsPerPage, sortedRequests.length)}</span> <span className="mx-1 opacity-40">/</span> {sortedRequests.length} results
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 border-white/20 bg-white/20 hover:bg-white/40"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-[10px] font-black text-teal-dark/60 bg-white/30 h-8 px-3 flex items-center rounded-lg border border-white/10">
                {currentPage} <span className="mx-1 opacity-30 text-[8px]">OF</span> {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages || 1, page + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 w-8 p-0 border-white/20 bg-white/20 hover:bg-white/40"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RequestSlideOver
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onSuccess={() => {
          void refreshRequests();
        }}
      />

      <LeadSlideOver
        isOpen={!!linkedLead}
        onClose={() => setLinkedLead(null)}
        lead={linkedLead}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["request-linked-leads"] });
          void refreshRequests();
        }}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Request?"
        description="Are you sure you want to delete this catering request? This action cannot be undone."
        confirmText="Delete Request"
        variant="danger"
      />
    </div>
  );
}
