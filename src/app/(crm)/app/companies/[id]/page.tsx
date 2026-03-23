"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Calendar, 
  Users, 
  Coffee,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import Link from "next/link";
import { 
  getCompanyById, 
  getContactsByCompanyId, 
  getRequestsByCompanyId 
} from "@/lib/firebase/services/crm";
import { format } from "date-fns";
import { Company, Contact, CateringRequest } from "@/types/crm";

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useQuery<{ company: Company, contacts: Contact[], requests: CateringRequest[] }>({
    queryKey: ['company-detail', params.id],
    queryFn: async () => {
      const [company, contacts, requests] = await Promise.all([
        getCompanyById(params.id),
        getContactsByCompanyId(params.id),
        getRequestsByCompanyId(params.id)
      ]);

      if (!company) throw new Error("Company not found");

      return { company, contacts, requests };
    }
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

  const { company, contacts, requests } = data;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-teal-dark">{company.name}</h1>
            <Badge variant="success">Active Client</Badge>
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
          <Button variant="outline">Edit Company</Button>
          <Button>Log Interaction</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="block text-brown/50 mb-1">Catering Manager</span>
                <span className="font-medium text-brown">{company.assignedRepId === 'admin_id' ? 'Admin User' : 'Service Team'}</span>
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
                    <MapPin className="w-4 h-4 text-brown/40 mt-0.5" />
                    {company.address}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Contacts</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-teal-base">Add</Button>
            </CardHeader>
            <CardContent>
              {contacts.length > 0 ? (
                <ul className="divide-y divide-gray-border">
                  {contacts.map(c => (
                    <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                      <Link href={`/app/contacts/${c.id}`} className="block group">
                        <span className="block font-bold text-brown group-hover:text-teal-dark transition-colors">{c.fullName}</span>
                        <span className="block text-xs text-brown/60 mb-2">{c.title || 'Contact'}</span>
                        <div className="flex flex-col gap-1.5 text-xs text-brown/70">
                          <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-brown/40" /> {c.email}</span>
                          {c.phone && <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-brown/40" /> {c.phone}</span>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-brown/40 text-center py-4 italic">No contacts found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity & Requests */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-teal-dark">Event History</CardTitle>
              <Button variant="outline" size="sm">Schedule New Event</Button>
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
                            <Badge variant={req.fulfillmentStatus === 'Completed' ? 'neutral' : 'success'}>
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
                  <p className="text-brown/60 font-medium italic">No event history recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
