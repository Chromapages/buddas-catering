"use client";

import { 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Loader2, 
  CheckCircle, 
  ChevronLeft,
  Gem,
  Building2,
  Phone,
  Mail,
  MapPin,
  Utensils,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import Link from "next/link";
import { getEnhancedOrderById, EnhancedOrder } from "@/lib/firebase/services/order.service";
import { completeCateringRequest, updateCateringRequest } from "@/lib/firebase/services/request.service";
import { getAllUsers } from "@/lib/firebase/services/user.service";
import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import { useAuth } from "@/lib/firebase/context/auth";
import { toast } from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<EnhancedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editData, setEditData] = useState({
    quoteAmount: 0,
    notes: "",
    preferredDate: "",
    estimatedGroupSize: 0,
    assignedRepId: ""
  });

  const fetchData = async () => {
    try {
      const data = await getEnhancedOrderById(id);
      if (data) {
        setOrder(data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, [id]);

  const handleMarkAsFulfilled = async () => {
    if (!order || !user) return;
    setIsSubmitting(true);
    try {
      await completeCateringRequest(order.id, order.companyId || "", user.uid, user.displayName || "User");
      toast.success("Order marked as fulfilled!");
      router.push("/app/orders");
    } catch (error) {
      console.error("Fulfillment error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (!order) return;
    setEditData({
      quoteAmount: order.quoteAmount || 0,
      notes: order.notes || "",
      preferredDate: order.preferredDate || "",
      estimatedGroupSize: order.estimatedGroupSize || 0,
      assignedRepId: order.assignedRepId || ""
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!order) return;
    setIsSubmitting(true);
    try {
      const selectedUser = users.find(u => u.id === editData.assignedRepId);
      const updatePayload: any = {
        quoteAmount: Number(editData.quoteAmount),
        notes: editData.notes,
        preferredDate: editData.preferredDate,
        estimatedGroupSize: Number(editData.estimatedGroupSize),
        assignedRepId: editData.assignedRepId,
      };

      if (selectedUser) {
        updatePayload.assignedRepName = selectedUser.displayName;
      }

      await updateCateringRequest(order.id, updatePayload);
      toast.success("Order updated successfully");
      setIsEditing(false);
      await fetchData();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brown/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-white/50 bg-white/5 backdrop-blur-xl rounded-[24px] m-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-teal-base/40" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-heading uppercase tracking-[0.2em]">Order Not Found</h2>
            <p className="max-w-xs mx-auto text-[11px] font-black uppercase tracking-widest leading-loose opacity-60">We couldn't find the order you were looking for. It might have been deleted or moved.</p>
          </div>
          <Button asChild className="mt-4 bg-teal-base hover:bg-teal-base/80 h-12 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]">
            <Link href="/app/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isEligibleForDiscount = order.isProgramOrder && (order.quoteAmount || 0) >= 200;
  const discountAmount = isEligibleForDiscount ? (order.quoteAmount || 0) * (order.potentialDiscount || 0) / 100 : 0;
  const finalTotal = (order.quoteAmount || 0) - discountAmount;

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link 
          href="/app/orders" 
          className="flex items-center text-[10px] font-black text-white/40 hover:text-teal-base transition-all group w-fit uppercase tracking-[0.2em]"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[24px] shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-black text-white uppercase tracking-[0.1em]">
                Order <span className="text-teal-base">#{order.id.slice(-6).toUpperCase()}</span>
              </h1>
              <div className="flex gap-2">
                <Badge className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border backdrop-blur-md",
                  order.fulfillmentStatus === "Fulfilled" ? "bg-teal-base/10 text-teal-base border-teal-base/20" : 
                  order.fulfillmentStatus === "Cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                  "bg-orange/10 text-orange-400 border-orange/20"
                )}>
                  {order.fulfillmentStatus || "Pending"}
                </Badge>
                {order.isProgramOrder && (
                  <Badge className="bg-orange/10 text-orange-400 border-orange/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] animate-pulse-subtle">
                    PRO MEMBER
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-teal-base/10 border border-teal-base/20 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-teal-base" />
              </div>
              <Link href={`/app/companies/${order.companyId}`} className="text-sm font-black text-white/70 hover:text-teal-base uppercase tracking-widest transition-colors">
                {order.companyName || "N/A"}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-white/10 text-white/60 hover:bg-white/5 h-12 rounded-xl px-8 font-black uppercase tracking-[0.2em] text-[10px]">Cancel</Button>
                <Button onClick={handleSave} disabled={isSubmitting} className="bg-teal-base hover:bg-teal-base/80 h-12 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit} className="border-white/10 text-white/60 hover:bg-white/5 h-12 rounded-xl px-8 font-black uppercase tracking-[0.2em] text-[10px]">Edit Details</Button>
                <Button 
                  className="bg-teal-dark hover:bg-teal-base h-12 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-black/20 transition-all border border-white/5"
                  onClick={handleMarkAsFulfilled}
                  disabled={isSubmitting || order.fulfillmentStatus === "Fulfilled"}
                >
                  {isSubmitting ? "Updating..." : order.fulfillmentStatus === "Fulfilled" ? "Fulfilled" : "Mark as Fulfilled"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Details Card */}
          <Card variant="glass" className="border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 py-6 px-8">
              <CardTitle className="text-[14px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="h-6 w-1 bg-teal-base rounded-full" />
                Event & Catering Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                <div className="space-y-2">
                  <span className="block text-[10px] font-black text-teal-base uppercase tracking-[0.2em] opacity-60">Catering Type</span>
                  <div className="flex items-center gap-3 font-black text-white text-sm uppercase tracking-widest">
                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Utensils className="h-4 w-4 text-teal-base/60" />
                    </div>
                    {order.cateringNeed || order.eventType}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="block text-[10px] font-black text-teal-base uppercase tracking-[0.2em] opacity-60">Date</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.preferredDate}
                      onChange={(e) => setEditData({ ...editData, preferredDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-black text-white focus:ring-teal-base/50 focus:border-teal-base transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 font-black text-white text-sm uppercase tracking-widest">
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-teal-base/60" />
                      </div>
                      {order.preferredDate ? formatDate(order.preferredDate, "MMM d, yyyy") : "TBD"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <span className="block text-[10px] font-black text-teal-base uppercase tracking-[0.2em] opacity-60">Headcount</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.estimatedGroupSize}
                      onChange={(e) => setEditData({ ...editData, estimatedGroupSize: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-black text-white focus:ring-teal-base/50 focus:border-teal-base transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 font-black text-white text-sm uppercase tracking-widest">
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-teal-base/60" />
                      </div>
                      {order.estimatedGroupSize || 0} guests
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <span className="block text-[10px] font-black text-teal-base uppercase tracking-[0.2em] opacity-60">Assigned Support</span>
                  {isEditing ? (
                    <select
                      value={editData.assignedRepId}
                      onChange={(e) => setEditData({ ...editData, assignedRepId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-black text-white focus:ring-teal-base/50 focus:border-teal-base transition-all"
                    >
                      <option value="" className="bg-teal-dark text-white">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id} className="bg-teal-dark text-white">{u.displayName}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-3 font-black text-white text-sm uppercase tracking-widest">
                      <div className="h-8 w-8 rounded-xl bg-teal-base border border-teal-base/20 flex items-center justify-center text-[10px] text-teal-dark font-black">
                        {(order.assignedRepName || "S")[0]}
                      </div>
                      {order.assignedRepName || "Service Team"}
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 md:col-span-2 pt-8 border-t border-white/5 space-y-4">
                  <span className="block text-[10px] font-black text-teal-base uppercase tracking-[0.2em] opacity-60">Event Notes & Requirements</span>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-4 bg-white/5 text-white text-sm border border-white/10 rounded-2xl focus:ring-teal-base focus:border-teal-base transition-all font-medium leading-relaxed"
                      rows={4}
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    />
                  ) : (
                    <div className="p-6 bg-white/5 text-white/80 text-sm border border-white/5 rounded-2xl italic leading-relaxed font-medium">
                      {order.notes || "No additional specific event notes provided."}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Program Details */}
          <Card variant="glass" className={cn(
            "border-white/10 shadow-2xl overflow-hidden",
            order.isProgramOrder && "ring-2 ring-orange/30 shadow-orange/10"
          )}>
            <CardHeader className={cn(
              "border-b border-white/5 py-4 px-8",
              order.isProgramOrder ? "bg-orange-500/5" : "bg-white/5"
            )}>
              <div className="flex items-center justify-between">
                <CardTitle className={cn(
                  "text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-3",
                  order.isProgramOrder ? "text-orange-400" : "text-white"
                )}>
                  <div className={cn("h-6 w-1 rounded-full", order.isProgramOrder ? "bg-orange-400" : "bg-teal-base")} />
                  Financial Breakdown
                </CardTitle>
                {order.isProgramOrder && (
                  <div className="flex items-center gap-2 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                    <Gem className="h-3.5 w-3.5" />
                    Corporate Member
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Base Quote Amount</span>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-black">$</span>
                      <input 
                        type="number"
                        className="pl-8 pr-4 py-2 w-32 bg-white/10 border border-white/10 rounded-xl text-sm font-black text-white text-right focus:ring-teal-base transition-all"
                        value={editData.quoteAmount}
                        onChange={(e) => setEditData({ ...editData, quoteAmount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  ) : (
                    <span className="text-xl font-black text-white tracking-tight">
                      ${(order.quoteAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                
                {order.isProgramOrder && (
                  <div className={cn(
                    "flex flex-col gap-4 p-5 rounded-2xl border backdrop-blur-md transition-all",
                    isEligibleForDiscount 
                      ? "bg-teal-base/5 border-teal-base/20" 
                      : "bg-orange-500/5 border-orange-500/20"
                  )}>
                    <div className="flex justify-between items-center transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center border",
                          isEligibleForDiscount ? "bg-teal-base/10 border-teal-base/20" : "bg-orange-500/10 border-orange-500/20"
                        )}>
                          <AlertCircle className={cn("h-4 w-4", isEligibleForDiscount ? "text-teal-base" : "text-orange-400")} />
                        </div>
                        <div className="flex flex-col">
                          <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isEligibleForDiscount ? "text-teal-base" : "text-orange-400")}>
                             {order.potentialDiscount}% Membership Discount
                          </span>
                          {!isEligibleForDiscount && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-400/60 mt-0.5">
                              $200 Minimum Required
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-lg font-black tracking-tight",
                        isEligibleForDiscount ? "text-teal-base" : "text-white/20"
                      )}>
                        {isEligibleForDiscount ? `-$${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-teal-base uppercase tracking-[0.3em]">Final Total</span>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Net Amount Due</span>
                  </div>
                  <span className="text-4xl font-black text-white tracking-tighter">
                    <span className="text-teal-base text-2xl mr-1">$</span>
                    {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Contacts */}
          <Card variant="glass" className="border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 py-4 px-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-base">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-teal-base/10 border border-teal-base/20 flex items-center justify-center text-teal-base text-lg font-black uppercase shadow-inner">
                    {(order.contactName || "C")[0]}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="text-sm font-black text-white truncate uppercase tracking-widest">{order.contactName || "Primary Contact"}</div>
                    <div className="text-[9px] text-teal-base/60 font-black uppercase tracking-[0.2em] mt-0.5">Event Organizer</div>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col gap-3 border-t border-white/5">
                  <a href={`mailto:${order.companyDetails?.email || 'aloha@buddascatering.com'}`} className="flex items-center gap-3 text-[11px] font-black text-white/60 hover:text-teal-base transition-all uppercase tracking-widest group">
                    <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-teal-base/10 transition-all border border-white/5">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    {order.companyDetails?.email || "aloha@buddascatering.com"}
                  </a>
                  <div className="flex items-center gap-3 text-[11px] font-black text-white/60 uppercase tracking-widest">
                    <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    {order.companyDetails?.phone || "(808) 555-0123"}
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-[0.2em] h-10 border-white/10 hover:bg-white/5 rounded-xl" size="sm">
                  View Full History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card variant="glass" className="border-white/10 shadow-2xl opacity-80 hover:opacity-100 transition-opacity overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 py-4 px-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="flex gap-4">
                <div className="relative shrink-0 mt-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-teal-base shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                  <div className="absolute top-2.5 left-[4.5px] w-[1px] h-12 bg-white/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[11px] font-black text-white uppercase tracking-widest">Order Created</div>
                  <div className="text-[9px] font-black text-teal-base/50 uppercase tracking-widest">{order.createdAt ? formatDate(order.createdAt, "MMM d, h:mm a") : "Just Now"}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10 border border-white/5" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[11px] font-black text-white/20 uppercase tracking-widest line-through">Production Pending</div>
                  <div className="text-[9px] font-black text-white/10 uppercase tracking-widest italic tracking-[0.2em]">Waiting for approval</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
