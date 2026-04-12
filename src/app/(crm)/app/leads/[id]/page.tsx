"use client";

import { 
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { StatusTimeline } from "@/components/crm/StatusTimeline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLeadById, updateLead, updateLeadStatus, convertLeadToCompany } from "@/lib/firebase/services/lead.service";
import { getAllUsers } from "@/lib/firebase/services/user.service";
import { getRequestsByLeadId } from "@/lib/firebase/services/request.service";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/firebase/context/auth";
import { toast } from "react-hot-toast";
import { LeadStatus } from "@/types/crm";
import { ContactHeader } from "@/components/crm/details/ContactHeader";
import { ContactKPIs } from "@/components/crm/details/ContactKPIs";
import { ContactTabs } from "@/components/crm/details/ContactTabs";
import { ContactSidePanel } from "@/components/crm/details/ContactSidePanel";
import { Card, CardContent } from "@/components/shared/Card";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, role } = useAuth();
  const router = useRouter();
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editData, setEditData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    cateringNeed: "",
    estimatedGroupSize: 0,
    notes: "",
    assignedRepId: ""
  });

  const fetchData = async () => {
    try {
      const data = await getLeadById(id, user?.uid, role || undefined);
      if (data) {
        setLead(data);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const fetchAuxData = async () => {
      const [usersData, requestsData] = await Promise.all([
        getAllUsers(),
        getRequestsByLeadId(id, user?.uid, role || undefined)
      ]);
      setUsers(usersData);
      setRequests(requestsData);
    };
    fetchAuxData();
  }, [id, user?.uid, role]);

  const handleEdit = () => {
    if (!lead) return;
    setEditData({
      companyName: lead.companyName || "",
      contactName: lead.contactName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      cateringNeed: lead.cateringNeed || "",
      estimatedGroupSize: lead.estimatedGroupSize || 0,
      notes: lead.notes || "",
      assignedRepId: lead.assignedRepId || ""
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!lead || !user) return;
    setIsSubmitting(true);
    try {
      const selectedUser = users.find(u => u.id === editData.assignedRepId);
      const updatePayload: any = {
        ...editData,
        estimatedGroupSize: Number(editData.estimatedGroupSize),
      };

      if (selectedUser) {
        updatePayload.assignedRepName = selectedUser.displayName;
      }

      await updateLead(lead.id, updatePayload);
      toast.success("Lead updated successfully");
      setIsEditing(false);
      await fetchData();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToCompany = async () => {
    if (!lead || !user) return;
    if (lead.companyId) {
      router.push(`/app/companies/${lead.companyId}`);
      return;
    }
    setIsConverting(true);
    try {
      const result = await convertLeadToCompany(lead, user.uid, user.displayName || "User");
      await updateLeadStatus(lead.id, "Won", lead.status || "New", user.uid, user.displayName || "User");
      toast.success("Lead converted to company");
      router.push(`/app/companies/${result}`);
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert lead to company");
    } finally {
      setIsConverting(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || !user) return;
    setIsSubmitting(true);
    try {
      await updateLeadStatus(lead.id, newStatus, lead.status || "New", user.uid, user.displayName || "User");
      toast.success(`Status updated to ${newStatus}`);
      await fetchData();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrder = () => {
    const params = new URLSearchParams({
      leadId: lead.id,
      companyId: lead.companyId || "",
      contactId: lead.contactId || "",
      companyName: lead.companyName || "",
      contactName: lead.contactName || "",
      cateringNeed: lead.cateringNeed || "",
      estimatedGroupSize: String(lead.estimatedGroupSize || ""),
    });
    router.push(`/app/orders/new?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-chef-muted">
        <Loader2 className="w-10 h-10 animate-spin mb-6 text-accent-fresh" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Intelligence...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-16 text-center text-chef-muted bg-chef-prep/30 rounded-[40px] m-12 border border-dashed border-chef-charcoal/10 shadow-soft-low">
        <div className="flex flex-col items-center gap-6">
          <AlertCircle className="h-16 w-16 text-accent-heat/20" />
          <h2 className="text-2xl font-black text-chef-charcoal tracking-tight uppercase">Intelligence Anchor Lost</h2>
          <p className="max-w-md mx-auto text-sm font-medium leading-relaxed opacity-60">The requested record protocol could not be established. It may have been purged or relocated within the matrix.</p>
          <Button asChild className="mt-4 h-14 px-10 rounded-[20px] bg-chef-charcoal text-white text-[10px] font-black uppercase tracking-widest shadow-soft-mid">
            <Link href="/app/leads">Return to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "New": return "warning";
      case "Contacted": return "neutral";
      case "Quote Sent": return "default";
      case "Approved": return "success";
      case "Lost": return "danger";
      default: return "neutral";
    }
  };

  const metrics = {
    totalSpend: requests.reduce((sum, r) => sum + (r.quoteAmount || 0), 0),
    ordersCount: requests.filter(r => r.fulfillmentStatus === 'Fulfilled').length,
    aov: requests.length > 0 ? (requests.reduce((sum, r) => sum + (r.quoteAmount || 0), 0) / requests.length) : 0
  };

  const assignedRep = users.find(u => u.id === lead.assignedRepId) || { id: lead.assignedRepId, name: lead.assignedRepName || "Unassigned" };

  return (
    <div className="p-10 lg:p-14 flex flex-col gap-12 lg:gap-20 bg-chef-prep/10 min-h-full">
      <ContactHeader 
        name={lead.companyName || lead.contactName || "Lead Detail"}
        type="LEAD"
        status={lead.status || "New"}
        email={lead.email}
        phone={lead.phone}
        backUrl="/app/leads"
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onConvert={handleConvertToCompany}
      />

      <ContactKPIs 
        totalSpend={metrics.totalSpend}
        ordersCount={metrics.ordersCount}
        aov={metrics.aov}
      />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <ContactTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10 lg:space-y-12">
          {activeTab === "overview" && (
            <div className="space-y-10 lg:space-y-12 animate-in fade-in slide-in-from-left-6 duration-700">
              {/* Detailed Info Card */}
              <Card className="bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden">
                <div className="px-10 py-10 border-b border-chef-charcoal/[0.03] bg-chef-prep/20">
                  <h3 className="text-3xl font-black text-chef-charcoal tracking-tight leading-none">Lead Intelligence</h3>
                  <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.25em] mt-3">Foundational Data Verification</p>
                </div>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-16">
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em] block opacity-40">Decision Maker</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.contactName}
                          onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                          className="w-full bg-chef-prep/50 border border-chef-charcoal/5 rounded-[18px] px-5 py-4 text-sm font-black text-chef-charcoal focus:ring-4 focus:ring-accent-fresh/5 focus:bg-white transition-all outline-none"
                        />
                      ) : (
                        <p className="font-black text-chef-charcoal text-2xl tracking-tighter">{lead.contactName || "—"}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em] block opacity-40">Catering Perspective</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.cateringNeed}
                          onChange={(e) => setEditData({ ...editData, cateringNeed: e.target.value })}
                          className="w-full bg-chef-prep/50 border border-chef-charcoal/5 rounded-[18px] px-5 py-4 text-sm font-black text-chef-charcoal focus:ring-4 focus:ring-accent-fresh/5 focus:bg-white transition-all outline-none"
                        />
                      ) : (
                        <p className="font-black text-chef-charcoal text-2xl tracking-tighter">{lead.cateringNeed || "General Profile"}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em] block opacity-40">Engagement Scale</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.estimatedGroupSize}
                          onChange={(e) => setEditData({ ...editData, estimatedGroupSize: Number(e.target.value) })}
                          className="w-full bg-chef-prep/50 border border-chef-charcoal/5 rounded-[18px] px-5 py-4 text-sm font-black text-chef-charcoal focus:ring-4 focus:ring-accent-fresh/5 focus:bg-white transition-all outline-none"
                        />
                      ) : (
                        <p className="font-black text-chef-charcoal text-2xl tracking-tighter tabular-nums">{lead.estimatedGroupSize || 0} <span className="text-[11px] text-chef-muted uppercase tracking-widest ml-1 opacity-30">Participants</span></p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em] block opacity-40">Lifecycle Protocol</span>
                      <div className="mt-1 flex relative">
                        <select 
                          className="bg-chef-prep/50 border border-chef-charcoal/5 rounded-[18px] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-chef-charcoal cursor-pointer hover:bg-chef-charcoal hover:text-white transition-all outline-none appearance-none min-w-[200px] shadow-soft-low"
                          value={lead.status}
                          onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                          disabled={isSubmitting}
                        >
                          <option value="New">NEW INQUIRY</option>
                          <option value="Contacted">VERIFIED/CONTACTED</option>
                          <option value="Quote Sent">STRATEGY SENT</option>
                          <option value="Approved">EXECUTIVE APPROVAL</option>
                          <option value="Won">CONTRACT CLINCHED</option>
                          <option value="Lost">OPPORTUNITY DISSOLVED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity History */}
              <Card className="bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden">
                <div className="px-10 py-10 border-b border-chef-charcoal/[0.03] bg-chef-prep/20">
                  <h3 className="text-3xl font-black text-chef-charcoal tracking-tight leading-none">Event Stream</h3>
                  <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.25em] mt-3">Temporal Activity Tracking</p>
                </div>
                <CardContent className="p-10">
                  <StatusTimeline
                    entityType="LEAD"
                    entityId={lead.id}
                    seedEvents={[
                      {
                        label: `Lead Entry via ${lead.source || lead.utm_source || "Web Node"}`,
                        timestamp: lead.createdAt?.seconds ? lead.createdAt.seconds * 1000 : undefined,
                        color: "bg-accent-fresh",
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Card className="bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden p-24 text-center">
                <h3 className="text-3xl font-black text-chef-charcoal tracking-tight mb-4 uppercase">Order Perspective</h3>
                <p className="text-[11px] font-black text-chef-muted uppercase tracking-[0.25em] mb-12 max-w-md mx-auto leading-loose">Transactional history will be synthesized after record conversion to Company / CRM node.</p>
                <Button onClick={handleCreateOrder} className="h-16 px-12 rounded-[24px] bg-chef-charcoal text-white shadow-soft-mid text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.03] active:scale-[0.98]">
                  Initialize First Order
                </Button>
              </Card>
            </div>
          )}

          {activeTab === "communications" && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Card className="bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden p-24 text-center">
                <h3 className="text-3xl font-black text-chef-charcoal tracking-tight mb-4 uppercase">Communication Matrix</h3>
                <p className="text-[11px] font-black text-chef-muted uppercase tracking-[0.25em] max-w-sm mx-auto leading-loose">Omni-channel correspondence sync and telephony logs scheduled for next executive iteration.</p>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className="lg:col-span-4">
          <ContactSidePanel 
            tags={["VERIFIED LEAD", lead.source || "WEB", "EXECUTIVE STATUS"]}
            notes={lead.notes || ""}
            assignedRep={assignedRep}
            onUpdateNotes={(newNotes) => handleSave()}
          />
        </div>
      </div>
    </div>
  );
}
