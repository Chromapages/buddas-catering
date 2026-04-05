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
      <div className="p-12 text-center text-brown/50 bg-gray-bg/10 rounded-xl m-8 border border-dashed border-brown/20">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-brown/20" />
          <h2 className="text-xl font-bold text-brown font-heading">Order Not Found</h2>
          <p className="max-w-xs mx-auto">We couldn't find the order you were looking for. It might have been deleted or moved.</p>
          <Button asChild className="mt-2">
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
    <div className="p-6 lg:p-8 flex flex-col gap-6 bg-gray-bg/30 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/app/orders" 
          className="flex items-center text-sm font-medium text-brown/60 hover:text-teal-dark transition-colors w-fit"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Orders
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-border pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading text-teal-dark font-mono uppercase tracking-tight">
                Order #{order.id.slice(-6)}
              </h1>
              <Badge variant={
                order.fulfillmentStatus === "Fulfilled" ? "success" : 
                order.fulfillmentStatus === "Cancelled" ? "danger" : 
                order.fulfillmentStatus === "Confirmed" ? "neutral" : "warning"
              }>
                {order.fulfillmentStatus || "Pending"}
              </Badge>
              {order.isProgramOrder && (
                <Badge variant="neutral" className="bg-orange/10 text-orange border-orange/20 animate-pulse-subtle">
                  PRO MEMBER
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-brown/70">
              <Building2 className="h-4 w-4 text-brown/40" />
              <Link href={`/app/companies/${order.companyId}`} className="font-semibold text-teal-base hover:text-teal-dark">
                {order.companyName || "N/A"}
              </Link>
            </div>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit}>Edit Details</Button>
                <Button 
                  className="shadow-md bg-teal-dark hover:bg-teal-base"
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
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details Card */}
          <Card className="shadow-sm border-gray-border/60">
            <CardHeader className="bg-gray-bg/20 border-b border-gray-border/50">
              <CardTitle className="text-teal-dark">Event & Catering Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Catering Type</span>
                  <div className="flex items-center gap-2 font-bold text-brown">
                    <Utensils className="h-4 w-4 text-teal-base/40" />
                    {order.cateringNeed || order.eventType}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Date</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.preferredDate}
                      onChange={(e) => setEditData({ ...editData, preferredDate: e.target.value })}
                      className="w-full bg-white border border-gray-border rounded-lg px-2 py-1 text-sm font-bold text-brown"
                    />
                  ) : (
                    <span className="font-bold text-brown flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-teal-base/40" /> 
                      {order.preferredDate ? formatDate(order.preferredDate, "MMM d, yyyy") : "TBD"}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Headcount</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.estimatedGroupSize}
                      onChange={(e) => setEditData({ ...editData, estimatedGroupSize: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-border rounded-lg px-2 py-1 text-sm font-bold text-brown"
                    />
                  ) : (
                    <span className="font-bold text-brown flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-base/40" /> 
                      {order.estimatedGroupSize || 0} guests
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Assigned Support</span>
                  {isEditing ? (
                    <select
                      value={editData.assignedRepId}
                      onChange={(e) => setEditData({ ...editData, assignedRepId: e.target.value })}
                      className="w-full bg-white border border-gray-border rounded-lg px-2 py-1 text-sm font-bold text-teal-dark"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.displayName}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 font-bold text-brown">
                      <div className="h-6 w-6 rounded-full bg-teal-base/20 flex items-center justify-center text-[10px] text-teal-dark font-bold">
                        {(order.assignedRepName || "S")[0]}
                      </div>
                      {order.assignedRepName || "Service Team"}
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 md:col-span-2 pt-6 border-t border-gray-border/50">
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-2">Event Notes & Requirements</span>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-4 bg-white text-brown text-sm border border-gray-border rounded-xl focus:ring-teal-base focus:border-teal-base"
                      rows={4}
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    />
                  ) : (
                    <div className="p-4 bg-teal-base/5 text-brown text-sm border border-teal-base/10 rounded-xl italic leading-relaxed">
                      {order.notes || "No additional specific event notes provided."}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Program Details */}
          <Card className={cn(
            "shadow-sm border-gray-border/60 overflow-hidden",
            order.isProgramOrder && "ring-1 ring-orange/30"
          )}>
            <CardHeader className={cn(
              "border-b border-gray-border/50",
              order.isProgramOrder ? "bg-orange/5" : "bg-gray-bg/20"
            )}>
              <div className="flex items-center justify-between">
                <CardTitle className={order.isProgramOrder ? "text-orange" : "text-teal-dark"}>
                  Financial Breakdown
                </CardTitle>
                {order.isProgramOrder && (
                  <div className="flex items-center gap-1.5 text-orange text-[10px] font-bold uppercase tracking-widest">
                    <Gem className="h-3 w-3" />
                    Corporate Member
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brown/60">Base Quote Amount</span>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown font-bold">$</span>
                      <input 
                        type="number"
                        className="pl-8 pr-4 py-1.5 w-32 bg-white border border-gray-border rounded-lg text-sm font-bold text-teal-dark text-right focus:ring-teal-base"
                        value={editData.quoteAmount}
                        onChange={(e) => setEditData({ ...editData, quoteAmount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-brown">
                      ${(order.quoteAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                
                {order.isProgramOrder && (
                  <div className={cn(
                    "flex flex-col gap-2 p-3 rounded-lg border",
                    isEligibleForDiscount 
                      ? "bg-green-50 border-green-200" 
                      : "bg-orange-50 border-orange-200"
                  )}>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className={isEligibleForDiscount ? "text-green-700 font-medium" : "text-orange-700 font-medium"}>
                          Program Membership ({order.potentialDiscount}% Discount)
                        </span>
                        {!isEligibleForDiscount && (
                          <div className="group relative">
                            <AlertCircle className="h-3 w-3 text-orange-500 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-brown text-white text-[10px] p-2 rounded shadow-xl z-20">
                              Minimum $200 order required to qualify for corporate discount. Current: ${order.quoteAmount || 0}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        "font-bold",
                        isEligibleForDiscount ? "text-green-700" : "text-brown/40"
                      )}>
                        {isEligibleForDiscount ? `-$${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-border flex justify-between items-center">
                  <span className="text-lg font-bold text-teal-dark">Final Total</span>
                  <span className="text-2xl font-extrabold text-teal-dark">
                    ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Contacts */}
          <Card className="shadow-sm border-gray-border/60">
            <CardHeader className="bg-gray-bg/20 border-b border-gray-border/50">
              <CardTitle className="text-sm uppercase tracking-widest font-bold text-brown/60">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brown/10 flex items-center justify-center text-brown text-xs font-bold uppercase">
                    {(order.contactName || "C")[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brown">{order.contactName || "Primary Contact"}</div>
                    <div className="text-[10px] text-brown/50 uppercase tracking-tighter">Event Organizer</div>
                  </div>
                </div>
                
                <div className="pt-3 flex flex-col gap-2">
                  <a href={`mailto:${order.id}`} className="flex items-center gap-2 text-sm text-brown hover:text-teal-base transition-colors">
                    <Mail className="h-4 w-4 text-brown/30" />
                    contact@email.com
                  </a>
                  <div className="flex items-center gap-2 text-sm text-brown">
                    <Phone className="h-4 w-4 text-brown/30" />
                    (555) 000-0000
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-border/50">
                <Button variant="outline" className="w-full text-xs" size="sm">
                  View Full History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log - placeholder for future expansion */}
          <Card className="shadow-sm border-gray-border/60 opacity-60">
            <CardHeader className="bg-gray-bg/20 border-b border-gray-border/50">
              <CardTitle className="text-sm uppercase tracking-widest font-bold text-brown/60">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <div className="relative shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-teal-base" />
                  <div className="absolute top-2 left-[3px] w-[1.5px] h-10 bg-gray-border" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brown">Order Created</div>
                  <div className="text-[10px] text-brown/50">{order.createdAt ? formatDate(order.createdAt, "MMM d, h:mm a") : "Recently"}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brown/50 text-decoration-line: line-through">Production Pending</div>
                  <div className="text-[10px] text-brown/40 italic">Waiting for approval</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
