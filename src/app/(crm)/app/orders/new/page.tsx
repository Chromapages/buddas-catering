"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Input } from "@/components/shared/Input";
import { useAuth } from "@/lib/firebase/context/auth";
import { createCateringRequest } from "@/lib/firebase/services/request.service";
import { updateLeadStatus } from "@/lib/firebase/services/lead.service";
import { getAllCompanies } from "@/lib/firebase/services/company.service";
import { getAllUsers } from "@/lib/firebase/services/user.service";
import { Company } from "@/types/crm";
import toast from "react-hot-toast";

export default function NewOrderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    companyId: "",
    companyName: "",
    contactName: "",
    contactId: "",
    assignedRepId: "",
    assignedRepName: "",
    eventType: "",
    cateringNeed: "Lunch" as "Breakfast" | "Lunch" | "Pastries" | "Not Sure Yet",
    estimatedGroupSize: "",
    preferredDate: "",
    quoteAmount: "",
    notes: "",
    fulfillmentStatus: "Pending" as const,
  });

  useEffect(() => {
    Promise.all([getAllCompanies(), getAllUsers()]).then(([c, u]) => {
      setCompanies(c);
      setUsers(u);
    });
  }, []);

  useEffect(() => {
    const leadId = searchParams.get("leadId");
    if (!leadId) return;

    setForm((current) => ({
      ...current,
      companyId: searchParams.get("companyId") || current.companyId,
      companyName: searchParams.get("companyName") || current.companyName,
      contactId: searchParams.get("contactId") || current.contactId,
      contactName: searchParams.get("contactName") || current.contactName,
      cateringNeed: (searchParams.get("cateringNeed") as typeof current.cateringNeed) || current.cateringNeed,
      eventType: searchParams.get("cateringNeed") || current.eventType,
      estimatedGroupSize: searchParams.get("estimatedGroupSize") || current.estimatedGroupSize,
    }));
  }, [searchParams]);

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    setForm((f) => ({
      ...f,
      companyId,
      companyName: company?.name ?? "",
    }));
  };

  const handleRepChange = (repId: string) => {
    const rep = users.find((u) => u.id === repId);
    setForm((f) => ({
      ...f,
      assignedRepId: repId,
      assignedRepName: rep?.displayName ?? "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.companyId) {
      toast.error("Please select a company");
      return;
    }
    setIsSubmitting(true);
    try {
      const leadId = searchParams.get("leadId");
      const id = await createCateringRequest(
        {
          ...form,
          estimatedGroupSize: Number(form.estimatedGroupSize) || 0,
          quoteAmount: form.quoteAmount ? Number(form.quoteAmount) : undefined,
          leadId: leadId || "",
        },
        user.uid,
        user.displayName || user.email || "User"
      );
      if (leadId) {
        await updateLeadStatus(leadId, "Quote Sent", "Contacted", user.uid, user.displayName || user.email || "User");
      }
      toast.success("Order created");
      router.push(leadId ? `/app/leads/${leadId}` : `/app/orders`);
    } catch {
      toast.error("Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold font-heading text-teal-dark">New Order</h1>
        <p className="text-sm text-brown/60 mt-1">Create a catering order manually for a walk-in or phone account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-dark">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Company *</label>
              <select
                required
                className="w-full bg-white border border-gray-border rounded-lg px-3 py-2 text-sm focus:ring-teal-base focus:border-teal-base"
                value={form.companyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
              >
                <option value="">Select a company...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Contact Name</label>
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Event Type</label>
                <Input
                  value={form.eventType}
                  onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                  placeholder="e.g. Team Lunch"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Group Size</label>
                <Input
                  type="number"
                  min="1"
                  value={form.estimatedGroupSize}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedGroupSize: e.target.value }))}
                  placeholder="25"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Preferred Date</label>
                <Input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brown/50 uppercase tracking-widest mb-1">Quote Amount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quoteAmount}
                  onChange={(e) => setForm((f) => ({ ...f, quoteAmount: e.target.value }))}
                  placeholder="0.00"
                />
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
                placeholder="Any special requests or details..."
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
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
            ) : (
              "Create Order"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
