"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Input } from "@/components/shared/Input";
import { useAuth } from "@/lib/firebase/context/auth";
import {
  getCateringRequestById,
  updateCateringRequest,
} from "@/lib/firebase/services/request.service";
import { getAllUsers } from "@/lib/firebase/services/user.service";
import toast from "react-hot-toast";

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    eventType: "",
    cateringNeed: "Lunch" as "Breakfast" | "Lunch" | "Pastries" | "Not Sure Yet",
    estimatedGroupSize: "",
    preferredDate: "",
    quoteAmount: "",
    notes: "",
    assignedRepId: "",
    assignedRepName: "",
    fulfillmentStatus: "Pending" as "Pending" | "In Progress" | "Fulfilled" | "Invoiced" | "Cancelled",
  });

  useEffect(() => {
    Promise.all([getCateringRequestById(id), getAllUsers()]).then(([order, u]) => {
      if (!order) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setUsers(u);
      setForm({
        companyName: (order as any).companyName ?? "",
        contactName: (order as any).contactName ?? "",
        eventType: (order as any).eventType ?? "",
        cateringNeed: (order as any).cateringNeed ?? "Lunch",
        estimatedGroupSize: String((order as any).estimatedGroupSize ?? ""),
        preferredDate: (order as any).preferredDate ?? "",
        quoteAmount: (order as any).quoteAmount != null ? String((order as any).quoteAmount) : "",
        notes: (order as any).notes ?? "",
        assignedRepId: (order as any).assignedRepId ?? "",
        assignedRepName: (order as any).assignedRepName ?? "",
        fulfillmentStatus: (order as any).fulfillmentStatus ?? "Pending",
      });
      setLoading(false);
    });
  }, [id]);

  const handleRepChange = (repId: string) => {
    const rep = users.find((u) => u.id === repId);
    setForm((f) => ({ ...f, assignedRepId: repId, assignedRepName: rep?.displayName ?? "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateCateringRequest(id, {
        ...form,
        estimatedGroupSize: Number(form.estimatedGroupSize) || 0,
        quoteAmount: form.quoteAmount ? Number(form.quoteAmount) : undefined,
      } as any);
      toast.success("Order updated");
      router.push(`/app/orders`);
    } catch {
      toast.error("Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brown/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading order...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-12 text-center text-brown/50 m-8">
        <AlertCircle className="h-12 w-12 text-brown/20 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-brown font-heading mb-2">Order Not Found</h2>
        <Button asChild className="mt-4"><Link href="/app/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <Link
        href="/app/orders"
        className="flex items-center text-sm font-medium text-brown/60 hover:text-teal-dark transition-colors w-fit"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Orders
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-heading text-teal-dark">Edit Order</h1>
        <p className="text-xs font-mono text-brown/30 mt-1">{id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-dark">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Company Name</label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Contact Name</label>
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Event Type</label>
                <Input
                  value={form.eventType}
                  onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Catering Need</label>
                <select
                  className="w-full bg-white border border-gray-border rounded-lg px-3 py-2 text-sm focus:ring-teal-base focus:border-teal-base"
                  value={form.cateringNeed}
                  onChange={(e) => setForm((f) => ({ ...f, cateringNeed: e.target.value as typeof form.cateringNeed }))}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Pastries">Pastries</option>
                  <option value="Not Sure Yet">Not Sure Yet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Group Size</label>
                <Input
                  type="number"
                  min="1"
                  value={form.estimatedGroupSize}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedGroupSize: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Preferred Date</label>
                <Input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Quote Amount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quoteAmount}
                  onChange={(e) => setForm((f) => ({ ...f, quoteAmount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Status</label>
                <select
                  className="w-full bg-white border border-gray-border rounded-lg px-3 py-2 text-sm focus:ring-teal-base focus:border-teal-base"
                  value={form.fulfillmentStatus}
                  onChange={(e) => setForm((f) => ({ ...f, fulfillmentStatus: e.target.value as typeof form.fulfillmentStatus }))}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Invoiced">Invoiced</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Assigned Rep</label>
              <select
                className="w-full bg-white border border-gray-border rounded-lg px-3 py-2 text-sm focus:ring-teal-base focus:border-teal-base"
                value={form.assignedRepId}
                onChange={(e) => handleRepChange(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.displayName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Notes</label>
              <textarea
                className="w-full p-3 bg-white text-brown text-sm border border-gray-border rounded-xl focus:ring-teal-base focus:border-teal-base"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/app/orders">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
