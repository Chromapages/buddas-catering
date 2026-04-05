"use client";

import { 
  Calendar, 
  Users, 
  FileText, 
  Phone, 
  Mail, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  Clock,
  UserPlus,
  UtensilsCrossed,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { StatusTimeline } from "@/components/crm/StatusTimeline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLeadById, updateLead, updateLeadStatus, convertLeadToCompany } from "@/lib/firebase/services/lead.service";
import { getAllUsers } from "@/lib/firebase/services/user.service";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/firebase/context/auth";
import { toast } from "react-hot-toast";
import { LeadStatus } from "@/types/crm";

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
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchUsers();
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brown/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-12 text-center text-brown/50 bg-gray-bg/10 rounded-xl m-8 border border-dashed border-brown/20">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-brown/20" />
          <h2 className="text-xl font-bold text-brown font-heading">Lead Not Found</h2>
          <p className="max-w-xs mx-auto">We couldn't find the lead you were looking for. It might have been deleted or moved.</p>
          <Button asChild className="mt-2">
            <Link href="/app/leads">Back to Leads</Link>
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

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 bg-gray-bg/30 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/app/leads" 
          className="flex items-center text-sm font-medium text-brown/60 hover:text-teal-dark transition-colors w-fit"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Leads
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-border pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading text-teal-dark">
                {lead.companyName || "Lead Detail"}
              </h1>
              <Badge variant={getStatusVariant(lead.status || "New")}>
                {lead.status || "New"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-brown/70">
              <Mail className="h-4 w-4 text-brown/40" />
              <span className="font-medium">{lead.email}</span>
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
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-white border-gray-border rounded-lg px-3 py-2 text-sm focus:ring-teal-base focus:border-teal-base cursor-pointer shadow-sm"
                    value={lead.status}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    disabled={isSubmitting}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quote Sent">Quote Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Company Details */}
          <Card className="shadow-sm border-gray-border/60">
            <CardHeader className="bg-gray-bg/20 border-b border-gray-border/50">
              <CardTitle className="text-teal-dark">Contact & Lead Source</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Contact Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.contactName}
                      onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                      className="w-full bg-white border border-gray-border rounded-lg px-2 py-1 text-sm font-bold text-brown"
                    />
                  ) : (
                    <div className="font-bold text-brown">
                      {lead.contactName || "N/A"}
                    </div>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Phone Number</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full bg-white border border-gray-border rounded-lg px-2 py-1 text-sm font-bold text-brown"
                    />
                  ) : (
                    <div className="font-bold text-brown flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-teal-base/40" /> 
                      {lead.phone || "N/A"}
                    </div>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Catering Need</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.cateringNeed}
                      onChange={(e) => setEditData({ ...editData, cateringNeed: e.target.value })}
                      className="w-full bg-white border border-gray-border rounded-lg px-2 py-1 text-sm font-bold text-brown"
                    />
                  ) : (
                    <div className="font-bold text-brown flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-base/40" /> 
                      {lead.cateringNeed || "General Inquiry"}
                    </div>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Estimated Group Size</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.estimatedGroupSize}
                      onChange={(e) => setEditData({ ...editData, estimatedGroupSize: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-border rounded-lg px-2 py-1 text-sm font-bold text-brown"
                    />
                  ) : (
                    <div className="font-bold text-brown flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-base/40" /> 
                      {lead.estimatedGroupSize || 0} people
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 md:col-span-2 pt-6 border-t border-gray-border/50">
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-2">Original Inquiry Notes</span>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-4 bg-white text-brown text-sm border border-gray-border rounded-xl focus:ring-teal-base focus:border-teal-base"
                      rows={4}
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    />
                  ) : (
                    <div className="p-4 bg-teal-base/5 text-brown text-sm border border-teal-base/10 rounded-xl italic leading-relaxed">
                      {lead.notes || "No specific inquiry details provided."}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="shadow-sm border-gray-border/60">
            <CardHeader className="bg-gray-bg/20 border-b border-gray-border/50">
              <CardTitle className="text-teal-dark">Lead History</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <StatusTimeline
                entityType="LEAD"
                entityId={lead.id}
                seedEvents={[
                  {
                    label: `Lead created via ${lead.source || lead.utm_source || "Web Form"}`,
                    timestamp: lead.createdAt?.seconds ? lead.createdAt.seconds * 1000 : undefined,
                    color: "bg-orange",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Assignment Card */}
          <Card className="shadow-sm border-gray-border/60">
            <CardHeader className="bg-gray-bg/20 border-b border-gray-border/50">
              <CardTitle className="text-sm uppercase tracking-widest font-bold text-brown/60">Lead Ownership</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <span className="block text-[10px] font-bold text-brown/40 uppercase tracking-widest mb-2">Assigned Rep</span>
                {isEditing ? (
                  <select
                    value={editData.assignedRepId}
                    onChange={(e) => setEditData({ ...editData, assignedRepId: e.target.value })}
                    className="w-full bg-white border border-gray-border rounded-lg px-3 py-2 text-sm font-medium text-teal-dark"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.displayName}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-bg/50 rounded-xl border border-gray-border/50">
                    <div className="h-10 w-10 rounded-full bg-teal-base/20 flex items-center justify-center text-teal-dark font-bold">
                      {(lead.assignedRepName || "U")[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-brown">{lead.assignedRepName || "Unassigned"}</div>
                      <div className="text-[10px] text-brown/40 font-medium">Sales Representative</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-border/50">
                <div className="flex items-center gap-2 text-xs text-brown/60 bg-teal-base/5 p-3 rounded-lg border border-teal-base/10">
                  <Clock className="h-3 w-3" />
                  <span>Time in state tracked automatically</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm border-gray-border/60">
             <CardHeader className="bg-gray-bg/20 border-b border-gray-border/50">
              <CardTitle className="text-sm uppercase tracking-widest font-bold text-brown/60">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start text-xs h-9" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="w-3.5 h-3.5 mr-2" />
                  Send Email
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-9"
                onClick={handleConvertToCompany}
                disabled={isConverting}
              >
                <UserPlus className="w-3.5 h-3.5 mr-2" />
                {isConverting ? "Converting..." : lead?.companyId ? "View Company" : "Convert to Company"}
              </Button>
              {(lead.status === "Contacted" || lead.status === "Quote Sent" || lead.status === "Approved") && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs h-9"
                  onClick={handleCreateOrder}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                  Create Order
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start text-xs h-9" asChild>
                <Link href="/app/menus">
                  <UtensilsCrossed className="w-3.5 h-3.5 mr-2" />
                  View Menu Options
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
