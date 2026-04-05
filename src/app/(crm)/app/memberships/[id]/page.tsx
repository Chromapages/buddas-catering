"use client";

import { useEffect, useState, use } from "react";
import { 
  Award, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Building2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import Link from "next/link";
import { getCommitmentById } from "@/lib/firebase/services/commitment.service";
import { format } from "date-fns";

// Fixed import for icons (lucide-react, not lucide-center)
import { 
  Award as AwardIcon, 
  Clock as ClockIcon, 
  DollarSign as DollarIcon, 
  CheckCircle2 as CheckIcon, 
  Building2 as BuildingIcon 
} from "lucide-react";

export default function MembershipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const data = await getCommitmentById(id);
        if (!data) {
          setError("Commitment record not found.");
          return;
        }
        setMembership(data);
      } catch (err) {
        console.error("Error loading commitment:", err);
        setError("Failed to load commitment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brown/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading commitment profile...</p>
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-orange/10 p-6 rounded-2xl border border-orange/20">
          <AlertCircle className="w-12 h-12 text-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-teal-dark mb-2">Error</h2>
          <p className="text-brown/70 mb-6">{error}</p>
          <Button asChild variant="outline">
            <Link href="/app/memberships">Back to Memberships</Link>
          </Button>
        </div>
      </div>
    );
  }

  const eventsCommitted = membership.ordersCommitted || 0;
  const eventsCompleted = membership.ordersUsed || 0;
  const progressPercent = eventsCommitted > 0 ? (eventsCompleted / eventsCommitted) * 100 : 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-teal-dark">
              Membership: {membership.companyName || 'Corporate Client'}
            </h1>
            <Badge variant={membership.active ? "success" : "neutral"}>
              {membership.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-brown/70 mt-1 flex items-center gap-2 font-medium">
            <AwardIcon className="w-4 h-4 text-orange" /> 
            {membership.tierName || 'Custom Tier'} — 
            <span className="text-teal-dark">{membership.discountPercent || 0}% Off All Orders</span>
          </p>
          {membership.companyId && (
            <Link href={`/app/companies/${membership.companyId}`} className="text-xs text-teal-base hover:underline mt-2 flex items-center gap-1">
              <BuildingIcon className="w-3 h-3" /> View Company Profile
            </Link>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edit Terms</Button>
          <Button>Renew early</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-border/60">
          <CardHeader className="bg-gray-bg/20">
            <CardTitle className="text-lg">Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-bold text-brown">{eventsCompleted} events used</span>
                <span className="text-brown/40 font-bold">{eventsCommitted} total</span>
              </div>
              <div className="w-full bg-gray-border/30 rounded-full h-3">
                <div 
                  className="bg-teal-base h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-border/50 text-sm">
              <div>
                <span className="block text-brown/40 font-bold uppercase tracking-tighter mb-1 text-[10px]">Activated</span>
                <span className="font-bold text-brown flex items-center gap-2">
                  <ClockIcon className="w-3.5 h-3.5 text-teal-base/50" /> 
                  {membership.createdAt?.seconds ? format(membership.createdAt.seconds * 1000, 'MMM d, yyyy') : 'Recent'}
                </span>
              </div>
              <div>
                <span className="block text-brown/40 font-bold uppercase tracking-tighter mb-1 text-[10px]">End Date</span>
                <span className="font-bold text-brown flex items-center gap-2 font-mono">
                  {membership.endDate || 'Ongoing'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-border/60">
          <CardHeader className="bg-gray-bg/20">
            <CardTitle className="text-lg">Tier Benefits</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2.5">
              <li className="flex items-center gap-3 text-sm text-brown p-3 bg-teal-dark/5 rounded-xl border border-teal-dark/5">
                <DollarIcon className="w-4 h-4 text-teal-dark shrink-0" />
                <span className="font-medium">{membership.discountPercent || 0}% discount on every order</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-brown p-3 bg-teal-dark/5 rounded-xl border border-teal-dark/5">
                <CheckIcon className={`w-4 h-4 shrink-0 ${membership.includesDelivery ? 'text-teal-dark' : 'text-brown/20'}`} />
                <span className={`font-medium ${!membership.includesDelivery ? "opacity-40 italic" : ""}`}>
                  {membership.includesDelivery ? "Free Delivery (In-County)" : "Delivery Fee required"}
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-brown p-3 bg-teal-dark/5 rounded-xl border border-teal-dark/5">
                <CheckIcon className={`w-4 h-4 shrink-0 ${membership.includesSetup ? 'text-teal-dark' : 'text-brown/20'}`} />
                <span className={`font-medium ${!membership.includesSetup ? "opacity-40 italic" : ""}`}>
                  {membership.includesSetup ? "Professional Table Setup" : "Drop-off only"}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Internal Admin Info */}
      <div className="bg-orange/5 border border-orange/10 rounded-2xl p-6 mt-8">
        <h3 className="text-xs font-bold text-orange uppercase tracking-widest mb-4">Internal Admin Notes</h3>
        <p className="text-sm text-brown/70 leading-relaxed italic">
          {membership.notes || "No special account handling notes provided for this commitment. Check interaction history in the company profile for more context."}
        </p>
      </div>
    </div>
  );
}
