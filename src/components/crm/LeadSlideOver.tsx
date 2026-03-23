import { X, Calendar, Users, FileText, CheckCircle2, ChevronDown, Mail, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LeadSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: Record<string, any> | null; 
}

const STATUSES = ["New", "Contacted", "Quote Sent", "Approved", "Lost"];

export function LeadSlideOver({ isOpen, onClose, lead }: LeadSlideOverProps) {
  const [currentStatus, setCurrentStatus] = useState(lead?.status || "New");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  if (!isOpen || !lead) return null;

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    setIsStatusOpen(false);
    // In a real app, this would trigger a Firestore update and Activity Log entry
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
                Created {lead.createdAt?.seconds 
                  ? format(lead.createdAt.seconds * 1000, "MMM d")
                  : "Recently"}
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

          {/* Details Section */}
          <div className="grid grid-cols-2 gap-6">
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
                <div className="flex items-start gap-3 text-sm">
                  <FileText className="h-4 w-4 text-brown/40 mt-0.5" />
                  <span className="text-brown italic line-clamp-3">&quot;{lead.notes || "No additional details provided."}&quot;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brown/70 uppercase tracking-wider border-b border-gray-border pb-2 mb-4">Activity Timeline</h3>
            <div className="space-y-6">
              {currentStatus !== "New" && (
                <div className="relative pl-6 border-l-2 border-gray-border/50 pb-2">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-teal-base border-2 border-white"></div>
                  <p className="text-sm font-medium text-brown">Status changed to {currentStatus}</p>
                  <p className="text-xs text-brown/50 mt-1">Just now by You</p>
                </div>
              )}
              <div className="relative pl-6 border-l-2 border-transparent pb-2">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-orange border-2 border-white"></div>
                <p className="text-sm font-medium text-brown">Lead Created</p>
                <p className="text-xs text-brown/50 mt-1">Attribution: {lead.utm_campaign || "Direct / Referral"}</p>
                <p className="text-xs text-brown/40 mt-1">
                  {lead.createdAt?.seconds 
                    ? format(lead.createdAt.seconds * 1000, "MMM d, h:mm a")
                    : "Recently"}
                </p>
              </div>
            </div>
            
            <div className="pt-4">
               <textarea 
                 rows={3} 
                 className="w-full text-sm rounded-lg border-gray-border focus:border-teal-base focus:ring-teal-base placeholder:text-brown/40 p-3"
                 placeholder="Add an internal note or log a call..."
               />
               <div className="mt-2 flex justify-end">
                 <Button size="sm">Log Note</Button>
               </div>
            </div>
          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="border-t border-gray-border p-4 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </>
  );
}
