import { notFound } from "next/navigation";
import { getPublicRequestById } from "@/lib/firebase/services/public.service";
import { Check, Clock, CookingPot, CreditCard, Receipt, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

import { PublicTrackApproval } from "@/components/crm/PublicTrackApproval";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: { id: string };
}

export default async function PublicTrackerPage({ params }: PageProps) {
  const request = await getPublicRequestById(params.id);

  if (!request) {
    notFound();
    return null;
  }

  async function handleRefresh() {
    "use server";
    revalidatePath(`/track/${params.id}`);
  }

  const stages = [
    { id: "Pending", label: "Inquiry Received", icon: Clock },
    { id: "Confirmed", label: "Booking Confirmed", icon: Check },
    { id: "Fulfilled", label: "Meal Delivered", icon: CookingPot },
    { id: "Invoiced", label: "Invoice Ready", icon: Receipt },
    { id: "Paid", label: "Payment Received", icon: CreditCard },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === request.fulfillmentStatus);
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="min-h-screen bg-gray-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-base/10 text-teal-base">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-4xl font-black text-teal-dark tracking-tight">Order Status</h1>
          <p className="text-lg text-brown/60">
            For <span className="font-bold text-teal-dark">{request.companyName}</span>
          </p>
        </div>

        {/* Tracker */}
        <div className="relative rounded-[32px] bg-white p-8 shadow-xl shadow-brown/5 sm:p-12">
          <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-4">
            {/* Connector Line (Mobile) */}
            <div className="absolute left-[22px] top-4 bottom-4 w-1 bg-gray-bg md:hidden" />
            
            {/* Connector Line (Desktop) */}
            <div className="absolute left-8 right-8 top-[22px] hidden h-1 bg-gray-bg md:block" />

            {stages.map((stage, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={stage.id} className="relative z-10 flex flex-1 flex-row items-center gap-6 md:flex-col md:text-center">
                  <div 
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500",
                      isPast ? "bg-teal-base text-white shadow-lg shadow-teal-base/40" : 
                      isCurrent ? "bg-teal-dark text-white shadow-xl shadow-teal-dark/30 ring-4 ring-teal-dark/10" : 
                      "bg-gray-bg text-brown/30"
                    )}
                  >
                    <stage.icon className={cn("h-6 w-6", isCurrent && "animate-pulse")} />
                  </div>

                  <div className="space-y-1">
                    <p 
                      className={cn(
                        "text-sm font-bold uppercase tracking-widest",
                        isPast || isCurrent ? "text-teal-dark" : "text-brown/30"
                      )}
                    >
                      {stage.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs font-semibold text-teal-base italic">Ongoing</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-brown/5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brown/40">Request Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-brown/60">Catering Need</span>
                <span className="text-sm font-bold text-teal-dark">{request.cateringNeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-brown/60">Group Size</span>
                <span className="text-sm font-bold text-teal-dark">{request.estimatedGroupSize} people</span>
              </div>
              {request.preferredDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-brown/60">Preferred Date</span>
                  <span className="text-sm font-bold text-teal-dark">{request.preferredDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className={cn(
            "rounded-3xl p-6 shadow-lg",
            request.fulfillmentStatus === "Pending" ? "bg-teal-dark text-white shadow-teal-dark/20" : "bg-white text-brown shadow-brown/5"
          )}>
            {request.fulfillmentStatus === "Pending" ? (
              <PublicTrackApproval 
                requestId={request.id} 
                onSuccess={handleRefresh} 
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-base/10 text-teal-base">
                  <Check className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-teal-dark">Request {request.fulfillmentStatus}</p>
                  <p className="text-xs text-brown/60">No further action needed.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-brown/30">
          Budda&apos;s Catering CRM • Premium Service Experience
        </p>
      </div>
    </div>
  );
}
