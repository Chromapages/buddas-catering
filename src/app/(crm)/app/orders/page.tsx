"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  LayoutGrid,
  List,
  Trash2,
  Clock
} from "lucide-react";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { 
  getAllEnhancedOrders, 
  EnhancedOrder, 
  deleteCateringRequest 
} from "@/lib/firebase/services/crm";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";
import { Company } from "@/types/crm";
import { getAllCompanies } from "@/lib/firebase/services/crm";
import { OrderBentoGrid } from "@/components/crm/OrderBentoGrid";

type SortField = "id" | "company" | "amount" | "date";
type SortOrder = "asc" | "desc";

export default function OrdersPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [companyMap, setCompanyMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Mode Persistence
  const [viewMode, setViewMode] = useState<"bento" | "classic">("bento");

  useEffect(() => {
    const savedView = localStorage.getItem("crm-orders-view") as "bento" | "classic";
    if (savedView) setViewMode(savedView);
  }, []);

  const handleToggleView = (mode: 'bento' | 'classic') => {
    setViewMode(mode);
    localStorage.setItem("crm-orders-view", mode);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, companiesData] = await Promise.all([
          getAllEnhancedOrders(user?.uid, role || undefined),
          getAllCompanies(),
        ]);
        setOrders(ordersData);
        const map: Record<string, string> = {};
        (companiesData as Company[]).forEach((c) => {
          map[c.id] = c.name;
        });
        setCompanyMap(map);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [refreshKey, user, role]);

  const filteredOrders = orders.filter((o) => {
    const companyName = o.companyName || companyMap[o.companyId] || "";
    const matchesSearch =
      companyName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let result = 0;
    if (sortField === "id") result = a.id.localeCompare(b.id);
    if (sortField === "company") {
      const nameA = a.companyName || companyMap[a.companyId] || "";
      const nameB = b.companyName || companyMap[b.companyId] || "";
      result = nameA.localeCompare(nameB);
    }
    if (sortField === "amount") result = (a.quoteAmount || 0) - (b.quoteAmount || 0);
    if (sortField === "date") {
      const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
      const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
      result = dateA - dateB;
    }
    return sortOrder === "asc" ? result : -result;
  });

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-chef-muted opacity-30 ml-1 inline-block" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-accent-fresh ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-4 h-4 text-accent-fresh ml-1 inline-block" />
    );
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to purge this logistical record?")) {
      try {
        await deleteCateringRequest(orderId);
        setRefreshKey((prev) => prev + 1);
        toast.success("Order record purged");
      } catch (error) {
        toast.error("Failed to delete record");
      }
    }
  };

  return (
    <div className="relative flex h-full flex-col overscroll-y-contain p-8 gap-8">
      {/* Precision Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-chef-charcoal tracking-tight leading-none mb-2">Orders</h1>
          <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em]">Global Logistics Ledger & Fulfillment</p>
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
            Export Manifest
          </Button>
          <Button
            onClick={() => router.push("/app/orders/new")}
            className="h-12 px-8 rounded-[20px] bg-chef-charcoal text-white text-[10px] font-black uppercase tracking-widest shadow-soft-mid transition-all active:scale-95"
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* Intelligence Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {["All", "Pending", "Confirmed", "Fulfilled", "Cancelled"].map((f) => {
          const isActive = statusFilter === f;
          return (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
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
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[280px] rounded-[32px] bg-chef-prep/20 animate-pulse border border-dashed border-chef-charcoal/5" />
              ))}
            </div>
          ) : sortedOrders.length > 0 ? (
            <OrderBentoGrid orders={paginatedOrders} onSelect={(o) => router.push(`/app/orders/${o.id}`)} />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-chef-charcoal/10">
              <h3 className="text-3xl font-black text-chef-charcoal/10 uppercase tracking-tighter">No Active Manifests</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted/30 mt-4">Adjust filters or create a new order</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="flex-1 flex flex-col bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="px-8 py-8 flex flex-wrap items-center justify-between gap-6 border-b border-chef-charcoal/10 bg-chef-prep/30">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-chef-muted group-focus-within:text-accent-fresh transition-colors" />
              <Input
                placeholder="Search logistics data..."
                className="pl-14 h-14 text-sm border border-transparent bg-chef-prep/50 focus:bg-white focus:border-accent-fresh/20 rounded-[20px] placeholder:text-chef-muted/40 transition-all focus:ring-0 shadow-soft-low"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <CardContent className="p-0 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-chef-prep/30 border-b border-chef-charcoal/5 text-[10px] font-black uppercase tracking-[0.25em] text-chef-muted">
                  <tr>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("id")}>
                      LOG ID <SortIcon field="id" />
                    </th>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("company")}>
                      CLIENT <SortIcon field="company" />
                    </th>
                    <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">OPERATIONAL STATUS</th>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("amount")}>
                      VALUE <SortIcon field="amount" />
                    </th>
                    <th className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5" onClick={() => handleSort("date")}>
                      FULFILLMENT <SortIcon field="date" />
                    </th>
                    <th className="px-8 py-6 text-right sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chef-charcoal/[0.03]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-5">
                          <div className="h-10 w-10 border-4 border-accent-fresh/30 border-t-accent-fresh rounded-full animate-spin shadow-soft-mid" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted/50">Processing Logistics...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-chef-prep/30 transition-all cursor-pointer group"
                        onClick={() => router.push(`/app/orders/${order.id}`)}
                      >
                        <td className="px-8 py-5">
                          <span className="font-black text-chef-charcoal/60 text-xs tabular-nums group-hover:text-accent-fresh transition-colors">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[14px] bg-chef-charcoal flex items-center justify-center text-white shadow-soft-low">
                              <Package size={18} />
                            </div>
                            <span className="font-black text-chef-charcoal tracking-tight">{order.companyName || companyMap[order.companyId] || "Private Client"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <Badge
                            className={cn(
                              "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full",
                              order.fulfillmentStatus === "Fulfilled"
                                ? "bg-chef-charcoal text-white"
                                : order.fulfillmentStatus === "Confirmed"
                                  ? "bg-accent-fresh/10 text-accent-fresh border-accent-fresh/20"
                                  : "bg-accent-heat/10 text-accent-heat border-accent-heat/20"
                            )}
                          >
                            {order.fulfillmentStatus || "Pending"}
                          </Badge>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-chef-charcoal tabular-nums text-base">
                              ${(order.quoteAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-chef-muted/60 text-[11px] font-bold">
                            <Calendar size={12} className="opacity-30" />
                            {order.preferredDate ? format(new Date(order.preferredDate), "MMM dd, yyyy") : "TBD"}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order.id);
                            }}
                            className="p-2 rounded-lg text-chef-muted hover:bg-accent-heat/10 hover:text-accent-heat transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-32 text-center text-chef-muted/40 font-bold uppercase tracking-widest text-[10px]">
                        No logistics data found in this segment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Precision */}
            <div className="px-8 py-6 border-t border-chef-charcoal/10 bg-chef-prep/30 flex items-center justify-between">
              <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.15em]">
                Perspective: <span className="text-chef-charcoal">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-chef-charcoal">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> <span className="mx-2 opacity-20">/</span> {filteredOrders.length} Total
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
    </div>
  );
}

// Missing ClipboardList import in lucide-react? No, it's there. 
// Added ArrowRight for better UX.
