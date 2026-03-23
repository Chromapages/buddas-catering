"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  MessageSquare, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Coffee,
  Users
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import Link from "next/link";
import { 
  getContactById, 
  getCompanyById, 
  getRequestsByContactId 
} from "@/lib/firebase/services/crm";
import { format } from "date-fns";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactData = await getContactById(params.id) as any;
        
        if (!contactData) {
          setError("Contact not found.");
          setLoading(false);
          return;
        }

        const companyIdValue = contactData.companyId;

        const [companyData, requestsData] = await Promise.all([
          companyIdValue ? getCompanyById(companyIdValue) : Promise.resolve(null),
          getRequestsByContactId(params.id)
        ]);

        setContact(contactData);
        setCompany(companyData);
        setRequests(requestsData);
      } catch (err) {
        console.error("Error loading contact details:", err);
        setError("Failed to load contact details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brown/50">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Loading contact profile...</p>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-orange/10 p-6 rounded-2xl border border-orange/20">
          <AlertCircle className="w-12 h-12 text-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-teal-dark mb-2">Error</h2>
          <p className="text-brown/70 mb-6">{error || "Could not find this contact."}</p>
          <Button asChild variant="outline">
            <Link href="/app/leads">Return to Leads</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Link href="/app/leads" className="flex items-center gap-2 text-sm text-brown/60 hover:text-teal-base transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-teal-base/10 flex items-center justify-center shrink-0 border-2 border-teal-base/20">
            <User className="h-8 w-8 text-teal-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-teal-dark">{contact.fullName}</h1>
            <p className="text-sm text-brown/70 font-medium">
              {contact.title || 'Decision Maker'} @ {company?.name || 'Independent'}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-2 text-sm text-brown/70">
                <Mail className="w-4 h-4 text-teal-base/60" /> {contact.email}
              </span>
              {contact.phone && (
                <span className="flex items-center gap-2 text-sm text-brown/70">
                  <Phone className="w-4 h-4 text-teal-base/60" /> {contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edit Profile</Button>
          <Button>Send Email</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="block text-brown/50 mb-1">Company Relationship</span>
                {company ? (
                  <Link href={`/app/companies/${company.id}`} className="font-bold text-teal-base hover:text-teal-dark flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> {company.name}
                  </Link>
                ) : (
                  <span className="text-brown/40 italic font-medium">No company linked</span>
                )}
              </div>
              <div>
                <span className="block text-brown/50 mb-1">Preferred Contact Method</span>
                <span className="font-medium text-brown">Email (High Responsiveness)</span>
              </div>
              <div>
                <span className="block text-brown/50 mb-1">Added On</span>
                <span className="font-medium text-brown">
                  {contact.createdAt?.seconds ? format(contact.createdAt.seconds * 1000, 'MMM d, yyyy') : 'Recently'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-cream/30 p-4 rounded-xl border border-gray-border/50">
                <p className="text-sm text-brown/80 italic leading-relaxed">
                  {contact.notes || "No specific communication notes recorded for this contact yet. Use the interaction logger to add updates."}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-teal-base hover:bg-teal-base/5">
                <MessageSquare className="w-4 h-4 mr-2" /> Add Private Note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Local Requests */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Requests Initiated</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="neutral">{requests.length} Total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="p-4 rounded-xl border border-gray-border hover:border-teal-base/30 hover:shadow-md transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <Badge variant={req.fulfillmentStatus === 'Completed' ? 'neutral' : 'success'}>
                               {req.fulfillmentStatus || 'Pending'}
                             </Badge>
                             <span className="text-sm font-bold text-teal-dark">
                               {req.cateringNeed} ({req.eventType})
                             </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-brown/60">
                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Event: {req.preferredDate ? format(new Date(req.preferredDate), 'MMM d, yyyy') : 'Flexible'}</span>
                             <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {req.estimatedGroupSize} guests</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild className="group-hover:bg-teal-base group-hover:text-white transition-colors">
                          <Link href={`/app/requests/${req.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-bg/30 rounded-xl border border-dashed border-gray-border">
                  <Coffee className="w-12 h-12 text-brown/20 mx-auto mb-4" />
                  <p className="text-brown/60 font-medium italic">No catering requests initiated by this contact.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
