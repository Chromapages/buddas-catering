import { X, Calendar, Users, FileText, CheckCircle2, ChevronDown, Mail, Phone, Building2, MessageSquare, Zap, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import { updateLeadStatus, convertLeadToCompany, convertLeadToOrder, updateLead } from "@/lib/firebase/services/lead.service";
import { createNote } from "@/lib/firebase/services/note.service";
import { getActivitiesByEntity } from "@/lib/firebase/services/base";
import { toast } from "react-hot-toast";
import { Input } from "@/components/shared/Input";
import { ActivityLog } from "@/components/crm/ActivityLog";
import { sendEmail, sendSMS } from "@/lib/utils/notifications";
import { Textarea } from "@/components/shared/Textarea"; // Assuming this exists or using a raw textarea

interface LeadSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: Record<string, any> | null; 
  onSuccess?: () => void;
}

const STATUSES = ["New", "Contacted", "Quote Sent", "Approved", "Won", "Lost"];

export function LeadSlideOver({ isOpen, onClose, lead, onSuccess }: LeadSlideOverProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(lead?.status || "New");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [followUpDate, setFollowUpDate] = useState(lead?.followUpDate || "");
  const [isWaitlist, setIsWaitlist] = useState(lead?.isWaitlist || false);
  const [outreachMode, setOutreachMode] = useState<"none" | "sms" | "email">("none");
  const [outreachContent, setOutreachContent] = useState("");
  const [isSendingOutreach, setIsSendingOutreach] = useState(false);

  useEffect(() => {
    if (lead) {
      setCurrentStatus(lead.status || "New");
      setFollowUpDate(lead.followUpDate || "");
      setIsWaitlist(lead.isWaitlist || false);
      fetchActivities();
    }
  }, [lead]);

  const fetchActivities = async () => {
    if (!lead?.id) return;
    const data = await getActivitiesByEntity("LEAD", lead.id);
    setActivities(data);
  };

  if (!isOpen || !lead) return null;

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    setIsStatusOpen(false);
  };

  const handleSave = async () => {
    if (!lead || !user) return;
    
    // If no change, just close
    if (currentStatus === lead.status) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLeadStatus(
        lead.id,
        currentStatus as any,
        lead.status,
        user.uid,
        user.displayName || "User"
      );
      toast.success("Status updated!");
      onSuccess?.();
      onClose();
      // Note: The parent LeadsPage should ideally refresh its data 
      // via the query cache or a refetch callback if we wanted immediate UI update 
      // without a full page refresh outside this component.
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToCompany = async () => {
    if (!lead || !user) return;
    setIsSubmitting(true);
    try {
      await convertLeadToCompany(lead as any, user.uid, user.displayName || "User");
      toast.success("Lead converted to Account!");
      onSuccess?.();
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!lead || !user) return;
    setIsSubmitting(true);
    try {
      const orderId = await convertLeadToOrder(lead as any, user.uid, user.displayName || "User");
      toast.success("Lead converted to Order!");
      onSuccess?.();
      onClose();
      router.push(`/app/orders/${orderId}`);
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert lead to order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!lead || !user || !noteContent.trim()) return;
    setIsSubmitting(true);
    try {
      await createNote({
        entityType: "LEAD",
        entityId: lead.id,
        content: noteContent,
        authorId: user.uid,
        authorName: user.displayName || "User"
      });
      toast.success("Note added");
      setNoteContent("");
      await fetchActivities();
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpChange = async (date: string) => {
    if (!lead) return;
    setFollowUpDate(date);
    try {
      await updateLead(lead.id, { followUpDate: date });
      toast.success("Follow-up date updated");
      await fetchActivities();
    } catch (error) {
      toast.error("Failed to update follow-up date");
    }
  };

  const handleWaitlistToggle = async (checked: boolean) => {
    if (!lead) return;
    setIsWaitlist(checked);
    try {
      await updateLead(lead.id, { isWaitlist: checked });
      toast.success(checked ? "Added to waitlist" : "Removed from waitlist");
      await fetchActivities();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update waitlist status");
      setIsWaitlist(!checked); // Rollback
    }
  };

  const handleSendOutreach = async () => {
    if (!lead || !outreachContent.trim() || !user) return;
    
    setIsSendingOutreach(true);
    try {
      if (outreachMode === "sms") {
        if (!lead.phone) {
          toast.error("Lead has no phone number");
          return;
        }
        await sendSMS({ to: lead.phone, body: outreachContent });
        toast.success("SMS sent!");
      } else {
        await sendEmail({ 
          to: lead.email, 
          subject: "Follow-up: Buddas Hawaiian Catering", 
          message: outreachContent 
        });
        toast.success("Email sent!");
      }

      // Log the activity
      await createNote({
        entityType: "LEAD",
        entityId: lead.id,
        content: `Sent ${outreachMode.toUpperCase()}: ${outreachContent}`,
        authorId: user.uid,
        authorName: user.displayName || "User"
      });

      setOutreachContent("");
      setOutreachMode("none");
      await fetchActivities();
    } catch (error) {
      toast.error(`Failed to send ${outreachMode}`);
    } finally {
      setIsSendingOutreach(false);
    }
  };

  const applyTemplate = (content: string) => {
    setOutreachContent(content.replace("{{name}}", lead.contactName || "there"));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New": return <Badge variant="warning">{status}</Badge>;
      case "Contacted": return <Badge variant="neutral">{status}</Badge>;
      case "Quote Sent": return <Badge variant="default">{status}</Badge>;
      case "Approved": return <Badge variant="success">{status}</Badge>;
      case "Lost": return <Badge variant="danger">{status}</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-brown/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-xl transition-transform duration-300 ease-in-out sm:w-[500px] flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold font-heading text-teal-dark">{lead.companyName || "No Company"}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-brown/70">{lead.contactName || lead.email}</span>
              <span className="text-gray-border">•</span>
              <span className="text-sm text-brown/50">
                Created {formatDate(lead.createdAt, "MMM d")}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-brown/40 hover:bg-gray-bg hover:text-brown transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status State Machine */}
          <div className="bg-gray-bg/50 rounded-xl p-4 border border-gray-border">
            <h3 className="text-sm font-semibold text-brown/70 mb-3 uppercase tracking-wider">Pipeline Status</h3>
            <div className="relative">
              <button 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-border rounded-lg px-4 py-3 shadow-sm hover:border-teal-base/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusBadge(currentStatus)}
                  <span className="text-sm font-medium text-brown">
                    {currentStatus === "New" && "Requires immediate outreach"}
                    {currentStatus === "Contacted" && "Awaiting client response"}
                    {currentStatus === "Quote Sent" && "Pending menu approval"}
                    {currentStatus === "Approved" && "Ready for catering delivery"}
                    {currentStatus === "Lost" && "Lead disqualified or lost"}
                  </span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-brown/50 transition-transform", isStatusOpen && "rotate-180")} />
              </button>
              
              {isStatusOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-border rounded-lg shadow-lg py-2">
                  {STATUSES.map(status => (
                    <button
                      key={status}
                      className="w-full text-left px-4 py-2 hover:bg-gray-bg text-sm font-medium text-brown flex items-center justify-between"
                      onClick={() => handleStatusChange(status)}
                    >
                      {status}
                      {currentStatus === status && <CheckCircle2 className="h-4 w-4 text-teal-dark" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Outreach Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brown/70 uppercase tracking-wider">Quick Outreach</h3>
              <Zap className="h-4 w-4 text-orange animate-pulse" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn("flex-1 gap-2", outreachMode === "sms" && "bg-teal-base/10 border-teal-base text-teal-dark")}
                onClick={() => setOutreachMode(outreachMode === "sms" ? "none" : "sms")}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                SMS Lead
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn("flex-1 gap-2", outreachMode === "email" && "bg-teal-base/10 border-teal-base text-teal-dark")}
                onClick={() => setOutreachMode(outreachMode === "email" ? "none" : "email")}
              >
                <Mail className="h-3.5 w-3.5" />
                Email Lead
              </Button>
            </div>

            {outreachMode !== "none" && (
              <div className="bg-gray-bg rounded-xl p-4 border border-teal-base/20 space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="flex gap-2 pb-2 border-b border-gray-border/50">
                  <button 
                    onClick={() => applyTemplate("Aloha {{name}}! Just checking in to see if you have any questions about the 🥙 catering options we discussed. Let me know!")}
                    className="text-[10px] bg-white border border-gray-border px-2 py-1 rounded hover:border-teal-base transition-colors"
                  >
                    Quick Check-in
                  </button>
                  <button 
                    onClick={() => applyTemplate("Hi {{name}}, I've sent over your custom quote for the Buddas Catering event. Please let me know if you need any adjustments! 🌺")}
                    className="text-[10px] bg-white border border-gray-border px-2 py-1 rounded hover:border-teal-base transition-colors"
                  >
                    Quote Follow-up
                  </button>
                </div>
                <textarea
                  className="w-full bg-white border border-gray-border rounded-lg p-3 text-sm min-h-[100px] focus:ring-teal-base focus:border-teal-base outline-none resize-none"
                  placeholder={`Type your ${outreachMode} message...`}
                  value={outreachContent}
                  onChange={(e) => setOutreachContent(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOutreachMode("none")}>Cancel</Button>
                  <Button 
                    size="sm" 
                    className="gap-2" 
                    onClick={handleSendOutreach}
                    disabled={isSendingOutreach || !outreachContent.trim()}
                  >
                    {isSendingOutreach ? "Sending..." : "Send Now"}
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-brown/70 uppercase tracking-wider border-b border-gray-border pb-2">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="h-4 w-4 text-brown/40 mt-0.5" />
                  <a href={`mailto:${lead.email}`} className="text-teal-base hover:text-teal-dark font-medium">{lead.email}</a>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="h-4 w-4 text-brown/40 mt-0.5" />
                  <span className="text-brown">{lead.phone || "Not provided"}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-brown/40 mt-0.5" />
                  <span className="text-brown font-medium">{lead.companyName || "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-brown/70 uppercase tracking-wider border-b border-gray-border pb-2">Event Request</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-brown/40 mt-0.5" />
                  <span className="text-brown font-medium">{lead.cateringNeed || "General Inquiry"}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Users className="h-4 w-4 text-brown/40 mt-0.5" />
                  <span className="text-brown">{lead.estimatedGroupSize || 0} people <span className="text-brown/50">(Est. ${(lead.estimatedGroupSize || 0) * 25})</span></span>
                </div>
                <div className="flex flex-col gap-2">
                   <span className="text-xs font-bold text-brown/40 uppercase tracking-widest">Next Follow-Up</span>
                   <input 
                     type="date" 
                     className="text-sm border-gray-border rounded-lg bg-gray-bg focus:ring-teal-base focus:border-teal-base p-2"
                     value={followUpDate}
                     onChange={(e) => handleFollowUpChange(e.target.value)}
                   />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-bg rounded-lg border border-gray-border mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brown">Waitlist</span>
                    <span className="text-[10px] text-brown/50 uppercase">Mark as low priority</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-gray-border text-teal-base focus:ring-teal-base cursor-pointer"
                    checked={isWaitlist}
                    onChange={(e) => handleWaitlistToggle(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brown/70 uppercase tracking-wider border-b border-gray-border pb-2 mb-4">Activity Timeline</h3>
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div key={activity.id || idx} className="relative pl-6 border-l-2 border-gray-border/50 pb-2 last:border-l-transparent">
                    <div className={cn(
                      "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white",
                      activity.actionType === "STATUS_CHANGE" ? "bg-teal-base" :
                      activity.actionType === "LEAD_CONVERTED" ? "bg-orange" :
                      activity.actionType === "REP_ASSIGNED" ? "bg-blue-400" :
                      "bg-gray-400"
                    )}></div>
                    <p className="text-sm font-medium text-brown">
                      {activity.actionType === "STATUS_CHANGE" && `Status changed to ${activity.data?.to}`}
                      {activity.actionType === "LEAD_CONVERTED" && `Converted to ${activity.data?.requestId ? "Order" : "Account"}`}
                      {activity.actionType === "REP_ASSIGNED" && `Assigned to ${activity.data?.repName}`}
                      {activity.actionType === "BATCH_UPDATE" && "Batch updated"}
                      {activity.actionType === "CONVERTED_TO_ACCOUNT" && "Converted to Account"}
                      {activity.actionType === "NOTE" && activity.data?.content}
                    </p>
                    <p className="text-xs text-brown/50 mt-1">
                      {formatDate(activity.createdAt, "MMM d, h:mm a")} by {activity.actorName} {activity.actionType === "NOTE" && "• Note"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="relative pl-6 border-l-2 border-transparent pb-2">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-200 border-2 border-white"></div>
                  <p className="text-sm font-medium text-brown/50 italic">No activity logged yet.</p>
                  <p className="text-xs text-brown/50 mt-1">
                    Created {formatDate(lead.createdAt, "MMM d, h:mm a")}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <ActivityLog 
                entityId={lead.id} 
                entityType="LEAD" 
                entityName={lead.companyName || lead.contactName || "Lead"} 
                onSuccess={() => {
                  fetchActivities();
                  onSuccess?.();
                }} 
              />
            </div>
          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="border-t border-gray-border p-4 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {!lead.companyId && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-teal-base border-teal-base hover:bg-teal-base/5"
                onClick={handleConvertToCompany}
                disabled={isSubmitting}
              >
                Convert to Account
              </Button>
            )}
            {!lead.cateringRequestId && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-teal-base text-white hover:bg-teal-dark border-teal-base"
                onClick={handleConvertToOrder}
                disabled={isSubmitting}
              >
                Convert to Order
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>Close</Button>
            <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
