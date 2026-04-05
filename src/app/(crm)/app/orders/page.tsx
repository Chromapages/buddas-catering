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
  Utensils,
  Gem,
  ArrowRight,
  ClipboardList,
  X
} from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { 
  getAllEnhancedOrders, 
  EnhancedOrder, 
  completeCateringRequest,
  deleteCateringRequest
} from "@/lib/firebase/services/crm";
import Link from "next/link";
import { cn, formatDate, parseDate } from "@/lib/utils";
import { exportToCsv } from "@/lib/utils/export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/DropdownMenu";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";

type SortField = "company" | "date" | "size" | "status" | "amount";
type SortOrder = "asc" | "desc";

export default function OrdersPage() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Action state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAllEnhancedOrders(user.uid, role || undefined);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleComplete = async (order: EnhancedOrder) => {
    if (!user) return;
    try {
      await completeCateringRequest(order.id, order.companyId || "", user.uid, user.displayName || user.email || "User");
      toast.success("Order marked as fulfilled");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteCateringRequest(deleteId);
      toast.success("Order deleted");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to delete order");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.companyName || "").toLowerCase().includes(search.toLowerCase()) || 
                          (order.contactName || "").toLowerCase().includes(search.toLowerCase()) ||
                          (order.id || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.fulfillmentStatus === statusFilter;
    const matchesProgram = programFilter === "All" || 
                           (programFilter === "Program" && order.isProgramOrder) ||
                           (programFilter === "Standard" && !order.isProgramOrder);
    
    // Date Range Filter
    const orderDate = order.preferredDate ? parseDate(order.preferredDate) : null;
    let matchesDateRange = true;
    if (orderDate) {
      if (startDate && orderDate < new Date(startDate)) matchesDateRange = false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) matchesDateRange = false;
      }
    } else if (startDate || endDate) {
      matchesDateRange = false; // If no date, and filtering by date, exclude
    }

    return matchesSearch && matchesStatus && matchesProgram && matchesDateRange;
  });

  // Sort Logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let result = 0;
    if (sortField === "company") result = (a.companyName || "").localeCompare(b.companyName || "");
    if (sortField === "date") {
      const dateA = parseDate(a.createdAt)?.getTime() || 0;
      const dateB = parseDate(b.createdAt)?.getTime() || 0;
      result = dateA - dateB;
    }
    if (sortField === "size") result = (a.estimatedGroupSize || 0) - (b.estimatedGroupSize || 0);
    if (sortField === "status") result = (a.fulfillmentStatus || "").localeCompare(b.fulfillmentStatus || "");
    if (sortField === "amount") result = (a.quoteAmount || 0) - (b.quoteAmount || 0);
    
    return sortOrder === "asc" ? result : -result;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
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
      case "Invoiced": return <Badge variant="default">{status}</Badge>;
      case "Paid": return <Badge variant="success">{status}</Badge>;
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
    <div className="p-6 lg:p-8 flex flex-col h-full bg-gray-bg/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark flex items-center gap-2">
            Catering Orders
          </h1>
          <p className="text-sm text-brown/70 mt-1">Manage event fulfillment, memberships, and production flow.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
          variant="outline"
          className="hidden sm:flex"
          onClick={() =>
            exportToCsv(
              filteredOrders.map((o) => ({
                id: o.id,
                company: o.companyName ?? "",
                contact: o.contactName ?? "",
                eventType: o.cateringNeed ?? o.eventType ?? "",
                date: o.preferredDate ?? "",
                groupSize: o.estimatedGroupSize ?? 0,
                amount: o.quoteAmount ?? "",
                status: o.fulfillmentStatus ?? "",
                program: o.isProgramOrder ? "Yes" : "No",
              })),
              `orders_${new Date().toISOString().slice(0, 10)}`
            )
          }
        >
          Export CSV
        </Button>
          <Button asChild>
            <Link href="/app/orders/new">New Order</Link>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input 
            placeholder="Search orders..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brown/60" />
            <Select 
              className="w-40 h-10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "All", label: "All Statuses" },
                { value: "Pending", label: "Pending" },
                { value: "In Progress", label: "In Progress" },
                { value: "Fulfilled", label: "Fulfilled" },
                { value: "Invoiced", label: "Invoiced" },
                { value: "Paid", label: "Paid" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-orange" />
            <Select 
              className="w-40 h-10"
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              options={[
                { value: "All", label: "All Customers" },
                { value: "Program", label: "Program Members" },
                { value: "Standard", label: "Standard" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brown/40 uppercase tracking-wider">Date:</span>
            <div className="flex items-center gap-1">
              <input 
                type="date" 
                className="text-xs border-gray-border rounded-md px-2 py-1.5 bg-gray-bg focus:ring-teal-base focus:border-teal-base"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-brown/30">-</span>
              <input 
                type="date" 
                className="text-xs border-gray-border rounded-md px-2 py-1.5 bg-gray-bg focus:ring-teal-base focus:border-teal-base"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="p-1 hover:text-orange transition-colors"
                  title="Clear date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-gray-border rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-bg/50 border-b border-gray-border text-brown/70 font-medium">
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
                  Amount <SortIcon field="amount" />
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
                       Loading orders...
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-bg/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{order.companyName || "N/A"}</span>
                            {order.isProgramOrder && (
                              <Badge variant="neutral" className="bg-orange/10 text-orange border-orange/20 text-[10px] py-0 px-1.5">
                                PROGRAM
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-brown/50">{order.contactName || "No Contact"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 text-brown/40" />
                        {order.cateringNeed || order.eventType || "General"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brown/40" />
                        {order.preferredDate ? formatDate(order.preferredDate, "MMM d, yyyy") : "TBD"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-brown/40" />
                        {order.estimatedGroupSize || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-teal-dark">
                          {order.quoteAmount 
                            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.quoteAmount)
                            : "—"}
                        </span>
                        {order.potentialDiscount && order.quoteAmount && (
                          <span className="text-[10px] text-orange font-medium">
                            Incl. {order.potentialDiscount}% Discount
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.fulfillmentStatus || "Pending")}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild className="hidden md:flex h-8 px-2 text-teal-dark hover:bg-teal-base/10 group-hover:opacity-100 opacity-60">
                          <Link href={`/app/orders/${order.id}`}>
                            Details
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-brown/40 hover:text-brown transition-colors rounded-lg hover:bg-gray-bg">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/app/orders/${order.id}`} className="flex items-center">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/orders/${order.id}/edit`} className="flex items-center">
                                <Utensils className="mr-2 h-4 w-4" />
                                Edit Order
                              </Link>
                            </DropdownMenuItem>
                            {order.fulfillmentStatus !== "Fulfilled" && (
                              <DropdownMenuItem 
                                onClick={() => handleComplete(order)}
                                className="text-teal-dark focus:text-teal-dark"
                              >
                                <Badge variant="success" className="mr-2 h-2 w-2 rounded-full p-0" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {role !== 'rep' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-orange focus:text-orange"
                                  onClick={() => setDeleteId(order.id)}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Delete Order
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brown/50 bg-gray-bg/10">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 text-brown/20" />
                      <p>No catering orders found.</p>
                      {search && (
                        <Button variant="ghost" onClick={() => setSearch("")} className="text-teal-base hover:bg-teal-base/5">
                          Clear search
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-auto px-6 py-4 border-t border-gray-border bg-gray-bg/30 flex items-center justify-between">
          <p className="text-sm text-brown/60">
            Showing <span className="font-medium text-brown">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-brown">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-medium text-brown">{filteredOrders.length}</span> results
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

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Order?"
        description="Are you sure you want to delete this catering order? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Order"}
        variant="danger"
      />
    </div>
  );
}

// Missing ClipboardList import in lucide-react? No, it's there. 
// Added ArrowRight for better UX.
