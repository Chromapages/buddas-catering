"use client";

import { Calendar, Users, FileText, CheckCircle2, DollarSign, Clock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import Link from "next/link";
import { getCateringRequestById, submitForApproval } from "@/lib/firebase/services/crm";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/lib/firebase/context/auth";
import { toast } from "react-hot-toast";

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getCateringRequestById(params.id);
        setRequest(data);
      } catch (error) {
        console.error("Error fetching request:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [params.id]);

  const handleSubmitForApproval = async () => {
    if (!request || !user) return;
    
    setIsSubmitting(true);
    try {
      // Amount is 10% for MVP commission
      const amount = (request.quoteAmount || 0) * 0.1; 
      
      await submitForApproval(
        request.id,
        user.uid,
        user.email || "Sales Rep",
        amount,
        user.uid,
        user.email || "Sales Rep"
      );
      
      setHasSubmitted(true);
      toast.success("Commission request submitted to management.");
    } catch (error) {
      console.error("Error submitting for approval:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brown/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-12 text-center text-brown/50">
        <p className="text-xl font-bold text-brown">Request not found</p>
        <Button asChild className="mt-4">
          <Link href="/app/requests">Back to Requests</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-heading text-teal-dark font-mono uppercase tracking-tight">Request #{request.id.slice(-6)}</h1>
            <Badge variant={
              request.fulfillmentStatus === "Fulfilled" ? "success" : 
              request.fulfillmentStatus === "Cancelled" ? "danger" : 
              request.fulfillmentStatus === "In Progress" ? "neutral" : "warning"
            }>
              {request.fulfillmentStatus || "Pending"}
            </Badge>
          </div>
          <p className="text-brown/70 flex items-center gap-2">
            for <Link href={`/app/companies/${request.companyId}`} className="font-semibold text-teal-base hover:text-teal-dark truncate max-w-[200px]">{request.companyName || "Unknown Company"}</Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edit Request</Button>
          <Button>Process Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-border/60">
            <CardHeader className="bg-gray-bg/30">
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Event Type</span>
                  <span className="font-bold text-brown">{request.cateringNeed || request.eventType}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Date</span>
                  <span className="font-bold text-brown flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-base/40" /> 
                    {request.preferredDate ? format(new Date(request.preferredDate), "MMM d, yyyy") : "TBD"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Headcount</span>
                  <span className="font-bold text-brown flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-base/40" /> 
                    {request.estimatedGroupSize || 0} guests
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">Quote Total</span>
                  <span className="font-extrabold text-teal-dark text-xl">
                    {request.quoteAmount ? `$${request.quoteAmount.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="col-span-2 mt-2 pt-6 border-t border-gray-border/50">
                  <span className="block text-xs font-bold text-brown/40 uppercase tracking-widest mb-2">Special Instructions</span>
                  <div className="p-4 bg-teal-base/5 text-brown text-sm border border-teal-base/10 rounded-xl italic">
                    {request.notes || "No additional dietary or setup notes provided."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-gray-border/60">
            <CardHeader className="pb-3 border-b border-gray-border/50 bg-gray-bg/20">
              <CardTitle className="text-base text-brown/70 uppercase font-bold tracking-wider">Workflow</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown/60">Assigned Rep</span>
                <span className="font-bold text-teal-dark">{request.assignedRepName || "Service Team"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown/60">Commission Eligible</span>
                <Badge variant="success">Yes</Badge>
              </div>
              
              <div className="pt-4">
                {hasSubmitted ? (
                  <div className="flex flex-col items-center gap-2 p-4 bg-teal-base/10 rounded-xl text-teal-dark border border-teal-base/20">
                    <CheckCircle className="w-8 h-8" />
                    <span className="text-sm font-bold">Successfully Submitted</span>
                  </div>
                ) : (
                  <Button 
                    className="w-full shadow-md" 
                    onClick={handleSubmitForApproval}
                    disabled={isSubmitting || request.fulfillmentStatus !== 'Completed'}
                    title={request.fulfillmentStatus !== 'Completed' ? "Request must be 'Completed' to submit for commission" : ""}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                    ) : (
                      "Submit for Commission"
                    )}
                  </Button>
                )}
                {request.fulfillmentStatus !== 'Completed' && !hasSubmitted && (
                  <p className="text-[10px] text-brown/50 text-center mt-2 italic">
                    * Available after event completion
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
