"use client";

import { useEffect, useState, use } from "react";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { getContactById, updateContact } from "@/lib/firebase/services/contact.service";
import { getCompanyById } from "@/lib/firebase/services/company.service";
import { getRequestsByContactId } from "@/lib/firebase/services/request.service";
import { getAllUsers } from "@/lib/firebase/services/user.service";
import { useAuth } from "@/lib/firebase/context/auth";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { ContactKPIs } from "@/components/crm/details/ContactKPIs";
import { ContactSidePanel } from "@/components/crm/details/ContactSidePanel";
import { ContactHeroCard } from "@/components/crm/details/ContactHeroCard";
import { InteractionHistory } from "@/components/crm/details/InteractionHistory";
import { StageFunnel } from "@/components/crm/details/StageFunnel";
import { ContactHeader } from "@/components/crm/details/ContactHeader";
import { deleteContact } from "@/lib/firebase/services/contact.service";

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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

        const [companyData, requestsData, usersData] = await Promise.all([
          companyIdValue ? getCompanyById(companyIdValue) : Promise.resolve(null),
          getRequestsByContactId(id, user.uid, role || undefined),
          getAllUsers()
        ]);

        setContact(contactData);
        setCompany(companyData);
        setRequests(requestsData);
        setUsers(usersData);
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

  const handleDelete = async () => {
    if (!contact || !user || !window.confirm("Are you sure you want to archive this contact?")) return;
    try {
      await deleteContact(id);
      toast.success("Contact archived");
    } catch (err) {
      toast.error("Failed to archive contact");
    }
  };

  const handleConvert = () => {
    toast.success("Account conversion workflow starting...");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brown/50 font-body">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal-base" />
        <p className="font-medium tracking-tight font-heading">Loading contact profile...</p>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center font-body">
        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-3xl p-10 rounded-3xl border border-teal-dark/10 shadow-glass">
          <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-orange" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-teal-dark dark:text-brown mb-3 font-heading">Something went wrong</h2>
          <p className="text-brown/70 dark:text-brown/60 mb-8 max-w-sm mx-auto leading-relaxed font-normal">
            {error || "We couldn't find the contact you were looking for. It might have been moved or deleted."}
          </p>
          <Button asChild variant="outline" className="rounded-full px-8 font-medium font-heading border-teal-base/20 text-teal-dark dark:text-teal-base hover:bg-teal-base/5">
            <Link href="/app/contacts">Return to Contacts</Link>
          </Button>
        </div>
      </div>
    );
  }

  const metrics = {
    totalSpend: requests.reduce((sum, r) => sum + (r.quoteAmount || 0), 0),
    ordersCount: requests.filter(r => r.fulfillmentStatus === 'Fulfilled' || r.fulfillmentStatus === 'Paid').length,
    aov: requests.filter(r => r.fulfillmentStatus === 'Fulfilled' || r.fulfillmentStatus === 'Paid').length > 0 
      ? (requests.reduce((sum, r) => sum + (r.quoteAmount || 0), 0) / requests.filter(r => r.fulfillmentStatus === 'Fulfilled' || r.fulfillmentStatus === 'Paid').length)
      : 0
  };

  const upcomingEvents = [...requests]
    .filter(r => r.fulfillmentStatus === 'Confirmed' || r.fulfillmentStatus === 'Pending')
    .sort((a, b) => (a.preferredDate || "").localeCompare(b.preferredDate || ""))
    .slice(0, 3);

  const assignedRep = users.find(u => u.id === contact.assignedRepId) || { id: contact.assignedRepId, name: contact.assignedRepName || "Unassigned" };

  return (
    <div className="relative min-h-screen">
      
      <main className="p-6 lg:p-10 max-w-[1700px] mx-auto animate-in fade-in duration-1000">
        
        {/* Management Header */}
        <div className="mb-10">
          <ContactHeader 
            name={editing ? editForm.fullName : contact.fullName}
            type="CONTACT"
            status={contact.isPrimary ? "Primary Contact" : "Secondary Contact"}
            email={contact.email}
            phone={contact.phone}
            backUrl="/app/contacts"
            isEditing={editing}
            onEdit={() => setEditing(true)}
            onCancel={() => {
              setEditing(false);
              setEditForm({
                fullName: contact.fullName ?? "",
                email: contact.email ?? "",
                phone: contact.phone ?? "",
                title: contact.title ?? "",
                notes: contact.notes ?? "",
              });
            }}
            onSave={handleSave}
            onDelete={handleDelete}
            onConvert={handleConvert}
            isSubmitting={saving}
          />
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-10">
          <div className="hidden xl:block">
            <h2 className="text-xl font-heading font-black uppercase tracking-[0.3em] text-teal-dark dark:text-teal-base opacity-40">Intelligence Overview</h2>
          </div>

          <ContactKPIs 
            totalSpend={metrics.totalSpend}
            ordersCount={metrics.ordersCount}
            aov={metrics.aov}
          />
        </div>

        {/* Main 12-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Interaction History & Schedule (Left/Center Column) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bento Interactions */}
            <div className="bg-glass rounded-[24px] p-6 shadow-glass border border-white/30">
              <InteractionHistory requests={requests} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Task/Catering Schedule Component (Dynamic) */}
              <div className="bg-glass rounded-[24px] p-6 shadow-glass border border-white/30 dark:border-teal-base/10 min-h-[400px] flex flex-col justify-start items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-teal-base/10 dark:bg-teal-base/5 flex items-center justify-center text-teal-dark dark:text-teal-base mb-4 mt-6">
                   <Calendar className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-heading font-medium text-teal-dark dark:text-brown">Upcoming Schedule</h3>
                 <div className="w-full mt-6 space-y-3 px-2">
                   {upcomingEvents.length > 0 ? (
                     upcomingEvents.map((ev, i) => (
                       <div key={i} className="bg-white/40 dark:bg-white/5 p-3 rounded-xl border border-white/60 dark:border-white/5 flex items-center justify-between text-left hover:bg-white transition-colors dark:hover:bg-white/10 group/item">
                         <div>
                           <p className="text-xs font-bold text-teal-dark dark:text-brown group-hover/item:text-teal-base transition-colors">{ev.cateringNeed}</p>
                           <p className="text-[10px] text-brown/40 dark:text-white/40">{ev.preferredDate || "No Date"}</p>
                         </div>
                         <div className="px-2 py-1 rounded bg-teal-base/10 text-[8px] font-black uppercase text-teal-dark dark:text-teal-base">{ev.fulfillmentStatus}</div>
                       </div>
                     ))
                   ) : (
                     <p className="text-sm font-body text-brown/40 dark:text-white/40 mt-2">No upcoming catering events</p>
                   )}
                 </div>
                 <Button variant="outline" className="mt-auto mb-4 rounded-full border-teal-base/20 text-teal-dark dark:text-teal-base hover:bg-teal-base/5">
                   View Full Calendar
                 </Button>
              </div>

              {/* Stage Funnel Visualizer */}
              <StageFunnel requests={requests} />
            </div>
          </div>

          {/* Right Detailed Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ContactHeroCard 
              contact={contact} 
              isEditing={editing}
              editData={editForm}
              onEditChange={(data) => setEditForm(data)}
            />
            <ContactSidePanel 
              tags={["VIP", "DECISION MAKER", contact.title?.toUpperCase() || "MANAGER"]}
              notes={contact.notes || ""}
              assignedRep={assignedRep}
              onUpdateNotes={async (newNotes) => {
                if (!user) return;
                try {
                  const updatedData = { ...editForm, notes: newNotes };
                  setEditForm(updatedData);
                  await updateContact(id, { notes: newNotes }, user.uid, user.displayName || user.email || "User");
                  setContact((prev: any) => ({ ...prev, notes: newNotes }));
                  toast.success("Notes updated");
                } catch (error) {
                  toast.error("Failed to update notes");
                  console.error(error);
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
