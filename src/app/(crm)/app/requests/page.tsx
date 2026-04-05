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
import { formatDate, parseDate } from "@/lib/utils";

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
          <h1 className="font-heading text-3xl font-bold text-teal-dark">Requests</h1>
          <p className="mt-1 text-sm text-brown/70">Manage incoming catering inquiries before they move into fulfillment.</p>
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

      <div className="rounded-t-xl border border-gray-border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown/40" />
            <Input
              placeholder="Search company, contact, or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-brown/60" />
              <Select
                className="w-44 h-10"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "All", label: "All Statuses" },
                  ...STATUS_OPTIONS,
                ]}
              />
            </div>

            {selectedIds.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-orange/20 bg-orange/5 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange">{selectedIds.length} selected</span>
                <Select
                  className="h-9 w-44"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      void handleBatchStatusUpdate(e.target.value as RequestStatus);
                      e.target.value = "";
                    }
                  }}
                  placeholder="Bulk status"
                  options={STATUS_OPTIONS}
                />
                <Button variant="outline" size="sm" className="border-orange/30 text-orange" onClick={handleBatchDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-b-xl border-x border-b border-gray-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-gray-border bg-gray-bg/50 font-medium text-brown/70">
              <tr>
                <th className="px-4 py-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="cursor-pointer px-6 py-4 hover:bg-gray-200/50" onClick={() => handleSort("company")}>
                  Company <SortIcon field="company" />
                </th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Request</th>
                <th className="cursor-pointer px-6 py-4 hover:bg-gray-200/50" onClick={() => handleSort("date")}>
                  Event Date <SortIcon field="date" />
                </th>
                <th className="cursor-pointer px-6 py-4 hover:bg-gray-200/50" onClick={() => handleSort("amount")}>
                  Amount <SortIcon field="amount" />
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border text-brown">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-brown/50">
                    Loading requests...
                  </td>
                </tr>
              ) : paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => {
                  const requestLead = request.leadId ? leadMap.get(request.leadId) : null;

                  return (
                    <tr
                      key={request.id}
                      className="group cursor-pointer transition-colors hover:bg-gray-bg/40"
                      onClick={() => {
                        setSelectedRequest(request);
                        setLinkedLead(null);
                      }}
                    >
                      <td
                        className="px-4 py-4"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(request.id)}
                          onChange={() => toggleSelect(request.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{request.companyName || "Unknown Company"}</span>
                          <span className="text-xs text-brown/50">#{request.id.slice(-6)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{request.contactName || "Unknown Contact"}</span>
                          <span className="text-xs text-brown/50">{request.email || "No email"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[220px]">
                          <p className="truncate font-medium">{request.cateringNeed || request.eventType || "General Inquiry"}</p>
                          <p className="text-xs text-brown/50">
                            {request.estimatedGroupSize ? `${request.estimatedGroupSize} guests` : "Guest count TBD"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {request.preferredDate ? formatDate(request.preferredDate, "MMM d, yyyy") : "TBD"}
                      </td>
                      <td className="px-6 py-4 font-medium text-teal-dark">
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
                        <div className="flex items-center justify-end gap-2">
                          {requestLead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hidden h-8 px-2 text-teal-dark opacity-70 md:flex group-hover:opacity-100"
                              onClick={() => setLinkedLead(requestLead)}
                            >
                              Linked Lead
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="hidden h-8 px-2 text-teal-dark opacity-70 md:flex group-hover:opacity-100"
                          >
                            <Link href={`/app/orders/${request.id}`}>
                              View Order
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded-lg p-2 text-brown/40 transition-colors hover:bg-gray-bg hover:text-brown">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Request Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setLinkedLead(null);
                                }}
                              >
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Open Request
                              </DropdownMenuItem>
                              {requestLead ? (
                                <DropdownMenuItem onClick={() => setLinkedLead(requestLead)}>
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Open Linked Lead
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-orange focus:text-orange" onClick={() => setDeleteId(request.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Request
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
                  <td colSpan={8} className="px-6 py-12 text-center text-brown/50">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 text-brown/20" />
                      <p>No requests found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-border bg-gray-bg/30 px-6 py-4">
          <p className="text-sm text-brown/60">
            Showing <span className="font-medium text-brown">{sortedRequests.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium text-brown">{Math.min(currentPage * itemsPerPage, sortedRequests.length)}</span> of{" "}
            <span className="font-medium text-brown">{sortedRequests.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-2 text-sm font-medium text-brown">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages || 1, page + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
