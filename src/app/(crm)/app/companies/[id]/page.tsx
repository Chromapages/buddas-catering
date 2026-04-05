"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ExternalLink,
  Calendar,
  Users,
  Coffee,
  AlertCircle,
  Loader2,
  X,
  UtensilsCrossed
} from "lucide-react";
import { useState, use } from "react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Input } from "@/components/shared/Input";
import Link from "next/link";
import { 
  getCompanyById, 
  getRequestsByCompanyId,
  getActiveCommitmentByCompanyId,
  updateCompany 
} from "@/lib/firebase/services/crm";
import { getContactsByCompany } from "@/lib/firebase/services/contact.service";
import { useAuth } from "@/lib/firebase/context/auth";
import { format } from "date-fns";
import { NewCommitmentModal } from "@/components/crm/NewCommitmentModal";
import { ActivityLog } from "@/components/crm/ActivityLog";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";
import { AccountHealthPanel } from "@/components/crm/AccountHealthPanel";
import { CommitmentProgress } from "@/components/crm/CommitmentProgress";
import { ContactManager } from "@/components/crm/ContactManager";
import { Company, Contact, CateringRequest, Commitment } from "@/types/crm";
import toast from "react-hot-toast";

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", companyType: "", website: "", address: "", phone: "", email: "" });
  
  const { user, role } = useAuth();
  
  const { data, isLoading, error, refetch } = useQuery<{ company: Company, contacts: Contact[], requests: CateringRequest[], commitment: Commitment | null }>({
    queryKey: ['company-detail', id, user?.uid],
    queryFn: async () => {
      const [company, contacts, requests, commitment] = await Promise.all([
        getCompanyById(id),
        getContactsByCompany(id),
        getRequestsByCompanyId(id, user?.uid, role || undefined),
        getActiveCommitmentByCompanyId(id)
      ]);

      if (!company) throw new Error("Company not found");

      return { company, contacts, requests, commitment };
    },
    enabled: !!user && !!role
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brown/50">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Loading company profile...</p>
      </div>
    );
  }

  if (error || !data?.company) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-orange/10 p-6 rounded-2xl border border-orange/20">
          <AlertCircle className="w-12 h-12 text-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-teal-dark mb-2">Error</h2>
          <p className="text-brown/70 mb-6">{(error as Error)?.message || "Could not find this company."}</p>
          <Button asChild variant="outline">
            <Link href="/app/leads">Return to Leads</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { company, contacts, requests, commitment } = data;
  const daysToRenewal = commitment?.renewalDate?.seconds
    ? Math.ceil((commitment.renewalDate.seconds * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const renewalBanner = commitment?.status === "Lapsed"
    ? { tone: "orange", text: "Commitment lapsed - re-engagement needed." }
    : company.firstOrderPlaced === false && commitment && company.createdAt?.seconds && Date.now() - company.createdAt.seconds * 1000 > 7 * 24 * 60 * 60 * 1000
      ? { tone: "orange", text: "No first order yet - activation priority." }
      : daysToRenewal !== null && daysToRenewal <= 30
        ? { tone: "gold", text: `Renews in ${daysToRenewal} days - start the renewal conversation.` }
        : daysToRenewal !== null && daysToRenewal <= 60
          ? { tone: "teal", text: `Renewal coming up in ${daysToRenewal} days.` }
          : null;

  const openEdit = () => {
    setEditForm({
      name: company.name ?? "",
      companyType: (company as any).companyType ?? "",
      website: company.website ?? "",
      address: company.address ?? "",
      phone: (company as any).phone ?? "",
      email: (company as any).email ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateCompany(id, editForm, user.uid, user.displayName || "Admin");
      await queryClient.invalidateQueries({ queryKey: ["company-detail", id] });
      setEditing(false);
      toast.success("Company updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-teal-dark">{company.name}</h1>
            <Badge variant="success">{commitment ? 'Active Account' : 'Lead'}</Badge>
            {company.firstOrderPlaced === false && commitment && (
              <Badge variant="warning" className="animate-pulse">Awaiting First Booking</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-brown/70">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-brown/40" /> {company.companyType || "Company"}</span>
            {company.website && (
              <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 text-teal-base hover:text-teal-dark transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> {company.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={openEdit}>Edit Account</Button>
          <Button onClick={() => setIsLogOpen(true)}>Log Activity</Button>
        </div>
      </div>

      {/* Health Diagnostic Panel */}
      <AccountHealthPanel 
        company={company} 
        commitment={commitment} 
        lastActivityDate={requests[0]?.createdAt && 'toDate' in requests[0].createdAt ? (requests[0].createdAt as any).toDate() : undefined} 
      />

      {renewalBanner && (
        <div className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
          renewalBanner.tone === "orange"
            ? "border-orange/20 bg-orange/10 text-orange"
            : renewalBanner.tone === "gold"
              ? "border-[#E9C559]/30 bg-[#E9C559]/12 text-brown"
              : "border-teal-base/20 bg-teal-base/10 text-teal-dark"
        }`}>
          {renewalBanner.text}
        </div>
      )}

      {/* Edit Panel */}
      {editing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Edit Company</CardTitle>
            <button onClick={() => setEditing(false)} className="text-brown/40 hover:text-brown transition-colors">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-brown/60">Company Name</label>
              <Input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brown/60">Company Type</label>
              <Input value={editForm.companyType} onChange={(e) => setEditForm(f => ({ ...f, companyType: e.target.value }))} placeholder="e.g. Corporate, Non-Profit" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brown/60">Email</label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brown/60">Phone</label>
              <Input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brown/60">Website</label>
              <Input value={editForm.website} onChange={(e) => setEditForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brown/60">Address</label>
              <Input value={editForm.address} onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Account Profile</CardTitle>
              {!company.activeCommitmentId && !commitment && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-teal-base"
                  onClick={() => setIsMembershipModalOpen(true)}
                >
                  Create Commitment
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="block text-brown/50 mb-1">Catering Manager</span>
                <span className="font-medium text-brown">{company.assignedRepId === 'admin_id' ? 'Admin User' : 'Service Team'}</span>
              </div>
              <div className="flex items-center justify-between">
                  <div>
                  <span className="block text-brown/50 mb-1">Commitment Status</span>
                  <div className="flex flex-col gap-1">
                    {commitment ? (
                      <>
                        <Badge 
                          variant={
                            commitment.status === 'Lapsed' ? 'danger' :
                            commitment.status === 'Expiring' ? 'warning' : 'success'
                          }
                        >
                          {commitment.status === 'Expiring' ? 'Expiring Soon' : 
                           commitment.status === 'Lapsed' ? 'Lapsed' : 'Active Account'}
                        </Badge>
                        <span className="text-[10px] text-brown/60 font-medium">
                          {commitment.ordersUsed} / {commitment.ordersCommitted} Orders Used
                        </span>
                      </>
                    ) : (
                      <Badge variant="neutral">No Active Commitment</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <span className="block text-brown/50 mb-1">Account Created</span>
                <span className="font-medium text-brown">
                  {company.createdAt?.seconds ? format(company.createdAt.seconds * 1000, 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-brown/50 mb-1">Lifetime Events</span>
                <span className="font-medium text-brown">{requests.length} events completed</span>
              </div>
              {company.address && (
                <div>
                  <span className="block text-brown/50 mb-1">Headquarters</span>
                  <span className="flex items-start gap-2 text-brown">
                    <Building2 className="w-4 h-4 text-brown/40 mt-0.5" />
                    {company.address}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <NewCommitmentModal 
            isOpen={isMembershipModalOpen} 
            onClose={() => setIsMembershipModalOpen(false)} 
            onSuccess={() => refetch()} 
            initialCompanyId={company.id}
          />

          <ContactManager 
            companyId={id} 
            contacts={contacts} 
            onUpdate={() => refetch()} 
          />
        </div>

        {/* Right Column - Activity & Requests */}
        <div className="lg:col-span-2 space-y-6">
          {commitment && (
            <CommitmentProgress commitment={commitment} />
          )}

          {!commitment && (
            <div className="rounded-2xl border border-teal-base/15 bg-teal-base/5 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-dark">No active commitment yet. Ready to sign them up?</p>
                <p className="text-xs text-brown/60 mt-1">Start the commitment flow directly from this account.</p>
              </div>
              <Button onClick={() => setIsMembershipModalOpen(true)}>Start Commitment</Button>
            </div>
          )}

          <ActivityLog 
            entityId={company.id} 
            entityType="COMPANY" 
            entityName={company.name} 
            onSuccess={() => refetch()} 
          />

          <div className="flex justify-start">
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/menus">
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                View Menu Options
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-teal-dark">Event History</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/app/requests/new?companyId=${company.id}`}>Schedule New Event</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <div className="border border-gray-border rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-bg border-b border-gray-border text-brown/70">
                      <tr>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Event Date</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Type</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Headcount</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-border">
                      {requests.map(req => (
                        <tr key={req.id} className="hover:bg-teal-base/5 transition-colors">
                          <td className="px-5 py-4 font-bold text-teal-dark">
                            <Link href={`/app/requests/${req.id}`} className="hover:underline">
                              {req.preferredDate ? format(new Date(req.preferredDate), 'MMM d, yyyy') : 'TBD'}
                            </Link>
                          </td>
                          <td className="px-5 py-4 flex items-center gap-2 text-brown font-medium">
                            <Coffee className="w-4 h-4 text-brown/30" /> {req.cateringNeed}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-brown font-medium">
                              <Users className="w-4 h-4 text-brown/30" /> {req.estimatedGroupSize}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={req.fulfillmentStatus === 'Fulfilled' ? 'neutral' : 'success'}>
                              {req.fulfillmentStatus || 'Pending'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-bg/30 rounded-xl border border-dashed border-gray-border">
                  <Calendar className="w-12 h-12 text-brown/20 mx-auto mb-4" />
                  <p className="text-brown/60 font-medium italic mb-4">No event history recorded yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/app/requests/new?companyId=${company.id}`}>Schedule New Event</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickLogDrawer
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        entityId={company.id}
        entityType="COMPANY"
        entityName={company.name}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
