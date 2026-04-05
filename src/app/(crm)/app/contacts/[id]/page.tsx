"use client";

import { useEffect, useState, use } from "react";
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
  Users,
  X,
  Briefcase,
  ExternalLink,
  History,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Input } from "@/components/shared/Input";
import Link from "next/link";
import { getContactById } from "@/lib/firebase/services/contact.service";
import { getCompanyById } from "@/lib/firebase/services/company.service";
import { getRequestsByContactId } from "@/lib/firebase/services/request.service";
import { updateContact } from "@/lib/firebase/services/contact.service";
import { useAuth } from "@/lib/firebase/context/auth";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "", title: "", notes: "" });

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchData = async () => {
      try {
        const contactData = await getContactById(id) as any;
        
        if (!contactData) {
          setError("Contact not found.");
          setLoading(false);
          return;
        }

        const companyIdValue = contactData.companyId;

        const [companyData, requestsData] = await Promise.all([
          companyIdValue ? getCompanyById(companyIdValue) : Promise.resolve(null),
          getRequestsByContactId(id, user.uid, role || undefined)
        ]);

        setContact(contactData);
        setCompany(companyData);
        setRequests(requestsData);
        setEditForm({
          fullName: contactData.fullName ?? "",
          email: contactData.email ?? "",
          phone: contactData.phone ?? "",
          title: contactData.title ?? "",
          notes: contactData.notes ?? "",
        });
      } catch (err) {
        console.error("Error loading contact details:", err);
        setError("Failed to load contact details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, role]);

  const handleSave = async () => {
    if (!contact || !user) return;
    setSaving(true);
    try {
      await updateContact(id, editForm, user.uid, user.displayName || user.email || "User");
      setContact((prev: any) => ({ ...prev, ...editForm }));
      setEditing(false);
      toast.success("Contact updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brown/50 font-fira">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal-base" />
        <p className="font-medium tracking-tight">Loading contact profile...</p>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center font-fira">
        <div className="bg-white p-10 rounded-3xl border border-gray-border shadow-sm">
          <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-orange" />
          </div>
          <h2 className="text-2xl font-bold text-teal-dark mb-3">Something went wrong</h2>
          <p className="text-brown/70 mb-8 max-w-sm mx-auto leading-relaxed">
            {error || "We couldn't find the contact you were looking for. It might have been moved or deleted."}
          </p>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/app/contacts">Return to Contacts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 font-fira animate-in fade-in duration-500">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link 
          href="/app/contacts" 
          className="group flex items-center gap-2.5 text-sm font-medium text-brown/50 hover:text-teal-base transition-all w-fit"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-border flex items-center justify-center group-hover:border-teal-base/30 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Directory
        </Link>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setEditing(true)}
            className="rounded-full px-6 border-gray-border hover:bg-white hover:border-teal-base/30 transition-all cursor-pointer"
          >
            Edit Profile
          </Button>
          <Button className="rounded-full px-8 shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all cursor-pointer">
            Send Message
          </Button>
        </div>
      </div>

      {/* Hero Profile Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-base/5 to-transparent rounded-[2.5rem] -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 p-2">
          <div className="relative group">
            <div className="h-28 w-28 rounded-[2rem] bg-white shadow-sm border border-gray-border flex items-center justify-center overflow-hidden shrink-0 transition-transform group-hover:scale-[1.02] duration-300">
              <User className="h-12 w-12 text-teal-dark/40" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-teal-base border-4 border-cream flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-teal-dark">{contact.fullName}</h1>
              <Badge variant="neutral" className="bg-white border-gray-border text-[10px] uppercase tracking-widest px-2 py-0.5">
                PRO ACTIVE
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-brown/80">
                <Briefcase className="w-4 h-4 text-teal-base" />
                <span className="font-semibold">{contact.title || 'Decision Maker'}</span>
                <span className="text-brown/40">at</span>
                {company ? (
                  <Link href={`/app/companies/${company.id}`} className="font-bold text-teal-base hover:underline flex items-center gap-1 group">
                    {company.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ) : (
                  <span className="text-brown/40 italic">Independent</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-brown/60 hover:text-teal-base transition-colors group">
                  <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100" /> {contact.email}
                </a>
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-brown/60 hover:text-teal-base transition-colors group">
                    <Phone className="w-4 h-4 opacity-50 group-hover:opacity-100" /> {contact.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Panel Overlay */}
      {editing && (
        <div className="fixed inset-0 bg-teal-dark/10 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-border/50 px-8 py-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-teal-dark">Edit Professional Profile</CardTitle>
                <p className="text-xs text-brown/50 mt-1">Update contact information and internal notes.</p>
              </div>
              <button onClick={() => setEditing(false)} className="w-10 h-10 rounded-full hover:bg-gray-bg flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-brown/40" />
              </button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brown/40 ml-1">Full Name</label>
                  <Input 
                    value={editForm.fullName} 
                    onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                    className="rounded-xl border-gray-border/60 focus:border-teal-base/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brown/40 ml-1">Title / Role</label>
                  <Input 
                    value={editForm.title} 
                    onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="rounded-xl border-gray-border/60 focus:border-teal-base/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brown/40 ml-1">Email Address</label>
                  <Input 
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                    className="rounded-xl border-gray-border/60 focus:border-teal-base/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brown/40 ml-1">Phone Number</label>
                  <Input 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="rounded-xl border-gray-border/60 focus:border-teal-base/50 transition-all"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brown/40 ml-1">Internal Notes</label>
                  <textarea
                    className="w-full rounded-2xl border border-gray-border/60 bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-teal-base/20 focus:border-teal-base/50 transition-all resize-none min-h-[120px]"
                    value={editForm.notes}
                    onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Add relationship details, preferences, or history..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-border/30">
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving} className="rounded-full px-6">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-full px-10 shadow-md">
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <div className="bg-teal-dark/5 px-6 py-4 border-b border-gray-border/30">
              <h3 className="text-sm font-bold text-teal-dark flex items-center gap-2">
                <History className="w-4 h-4" /> Contact Metadata
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brown/30">Relationship ID</span>
                <code className="block font-mono text-xs text-teal-dark bg-teal-base/5 p-2 rounded-lg border border-teal-base/10">
                  {id.substring(0, 12)}...
                </code>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brown/30">Affiliated Company</span>
                {company ? (
                  <Link href={`/app/companies/${company.id}`} className="flex items-center justify-between p-3 rounded-xl border border-gray-border hover:border-teal-base/30 hover:bg-teal-base/5 transition-all group">
                    <span className="font-bold text-sm text-brown truncate">{company.name}</span>
                    <Building2 className="w-4 h-4 text-brown/20 group-hover:text-teal-base transition-colors" />
                  </Link>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-gray-border text-xs text-brown/40 text-center uppercase tracking-wider">
                    No active company link
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brown/30">Added On</span>
                  <p className="text-sm font-semibold text-brown">
                    {contact.createdAt?.seconds ? format(contact.createdAt.seconds * 1000, 'MMM d, yyyy') : 'Recent'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brown/30">Responsiveness</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1.5 w-full bg-gray-bg rounded-full overflow-hidden">
                      <div className="h-full bg-teal-base w-4/5" />
                    </div>
                    <span className="text-[10px] font-bold text-teal-dark">HIGH</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-cream/40">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-brown/70 flex items-center gap-2 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" /> Personal Notes
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-teal-base">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <div className="p-5 rounded-2xl bg-white border border-gray-border/50 shadow-sm leading-relaxed text-sm text-brown/80 italic min-h-[100px]">
                  {contact.notes || "Add internal notes to track preferences, dietary restrictions, or specific meeting history for this contact."}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4 text-[11px] uppercase tracking-widest font-bold text-teal-base hover:bg-white hover:border-teal-base/20 transition-all border border-transparent">
                  Update Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Activity Feed */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-border shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-8 border-b border-gray-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-teal-dark tracking-tight">Catering Requests</h2>
                <p className="text-xs text-brown/50 mt-1 uppercase tracking-widest font-bold">Event History & Pipeline</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 mr-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-bg flex items-center justify-center text-[10px] font-bold text-brown/40">
                      U{i}
                    </div>
                  ))}
                </div>
                <Badge variant="neutral" className="bg-teal-base/10 text-teal-dark border-none font-bold px-3 capitalize">
                  {requests.length} Requests
                </Badge>
              </div>
            </div>

            <div className="p-8">
              {requests.length > 0 ? (
                <div className="space-y-5">
                  {requests.map((req) => (
                    <div key={req.id} className="group relative p-6 rounded-3xl border border-gray-border hover:border-teal-base/30 hover:shadow-xl hover:shadow-teal-dark/5 transition-all duration-300 bg-white hover:translate-y-[-2px] cursor-pointer">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                               req.fulfillmentStatus === 'Fulfilled' 
                               ? 'bg-teal-dark/10 text-teal-dark' 
                               : 'bg-gold/10 text-orange'
                             }`}>
                               {req.fulfillmentStatus || 'Pending'}
                             </div>
                             <span className="text-lg font-bold text-teal-dark group-hover:text-teal-base transition-colors">
                               {req.cateringNeed}
                             </span>
                             <span className="text-sm text-brown/30 font-medium">/ {req.eventType}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                             <div className="flex items-center gap-2 text-xs font-medium text-brown/60 bg-gray-bg/50 px-3 py-1.5 rounded-full">
                               <Calendar className="w-3.5 h-3.5 text-teal-base" /> 
                               {req.preferredDate ? format(new Date(req.preferredDate), 'MMM d, yyyy') : 'Date TBD'}
                             </div>
                             <div className="flex items-center gap-2 text-xs font-medium text-brown/60 bg-gray-bg/50 px-3 py-1.5 rounded-full">
                               <Users className="w-3.5 h-3.5 text-teal-base" /> 
                               {req.estimatedGroupSize} Guests
                             </div>
                             <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-dark/40">
                               #{req.id.substring(0, 8)}
                             </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          asChild 
                          className="rounded-full px-6 border-gray-border group-hover:bg-teal-base group-hover:text-white group-hover:border-teal-base group-hover:shadow-lg group-hover:shadow-teal-base/20 transition-all font-bold text-[11px] uppercase tracking-widest"
                        >
                          <Link href={`/app/requests/${req.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-bg/20 rounded-[2.5rem] border-2 border-dashed border-gray-border/50">
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                    <Coffee className="w-8 h-8 text-brown/20" />
                  </div>
                  <h4 className="text-lg font-bold text-teal-dark/40 mb-2">No Active Pipeline</h4>
                  <p className="text-sm text-brown/40 max-w-xs mx-auto italic font-medium">
                    This contact hasn't initiated any catering requests yet. Ready to start a new event plan?
                  </p>
                  <Button className="mt-8 rounded-full px-10 shadow-md">Create Request</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
