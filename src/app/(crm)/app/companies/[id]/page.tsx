"use client";

import { useEffect, useState, use } from "react";
import { 
  Loader2, 
  AlertCircle,
  Target
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { 
  getCompanyById, 
  updateCompany, 
  archiveCompany,
  getContactsByCompanyId,
  getRequestsByCompanyId
} from "@/lib/firebase/services/company.service";
import { getCommitmentsByCompanyId } from "@/lib/firebase/services/commitment.service";
import { getActivitiesByEntity } from "@/lib/firebase/services/base";
import { useAuth } from "@/lib/firebase/context/auth";
import { Company, Commitment, Activity, Contact, CateringRequest } from "@/types/crm";
import toast from "react-hot-toast";

// Modular Detail Components
import { CompanyHeader } from "@/components/crm/details/CompanyHeader";
import { CompanyKPIs } from "@/components/crm/details/CompanyKPIs";
import { InteractionHistory } from "@/components/crm/details/InteractionHistory";
import { StageFunnel } from "@/components/crm/details/StageFunnel";

// Core Panels
import { AccountHealthPanel } from "@/components/crm/AccountHealthPanel";
import { CommitmentProgress } from "@/components/crm/CommitmentProgress";
import { ActivityLog } from "@/components/crm/ActivityLog";
import { ContactManager } from "@/components/crm/ContactManager";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";
import { NewCommitmentModal } from "@/components/crm/NewCommitmentModal";

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  
  // UI States
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", website: "", address: "", industry: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [companyData, commitmentData, activityData, contactData, requestData] = await Promise.all([
        getCompanyById(id),
        getCommitmentsByCompanyId(id),
        getActivitiesByEntity("COMPANY", id),
        getContactsByCompanyId(id),
        getRequestsByCompanyId(id)
      ]);

      if (!companyData) {
        setError("Corporate entity not identified in registry.");
        return;
      }

      setCompany(companyData as Company);
      setCommitments(commitmentData as Commitment[]);
      setActivities(activityData as Activity[]);
      setContacts(contactData as Contact[]);
      setRequests(requestData as CateringRequest[]);
      
      setEditForm({
        name: companyData.name || "",
        website: companyData.website || "",
        address: companyData.address || "",
        industry: companyData.companyType || "Corporate Client"
      });
    } catch (err) {
      console.error("Error loading company details:", err);
      setError("Synchronisation protocol failed. Please re-authenticate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!company || !user) return;
    setSaving(true);
    try {
      await updateCompany(id, {
        name: editForm.name,
        website: editForm.website,
        address: editForm.address,
        companyType: editForm.industry
      }, user.uid, user.displayName || "Admin");
      
      setCompany(prev => prev ? { ...prev, ...editForm, companyType: editForm.industry } : null);
      setIsEditing(false);
      toast.success("Protocol updated");
    } catch {
      toast.error("Correction failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!company || !user || !window.confirm("Archive this corporate entity and all associated protocols?")) return;
    try {
      await archiveCompany(id, user.uid, user.displayName || "Admin");
      toast.success("Entity archived");
    } catch (err) {
      toast.error("Archival failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-teal-dark/50 p-10 font-heading">
        <Loader2 className="w-12 h-12 animate-spin mb-6 text-teal-base" />
        <p className="font-black uppercase tracking-[0.3em] text-sm animate-pulse">Syncing Corporate Intelligence...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-20">
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl p-12 rounded-[2rem] border border-teal-dark/10 shadow-glass">
          <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-orange/20">
            <AlertCircle className="w-10 h-10 text-orange" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-teal-dark dark:text-brown mb-4">Registry Error</h2>
          <p className="text-teal-dark/60 dark:text-brown/60 mb-10 max-w-sm mx-auto leading-relaxed font-body">
            {error || "The requested entity could not be verified in the current lifecycle."}
          </p>
          <Button asChild className="bg-teal-dark text-white rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[11px] shadow-glass shadow-teal-dark/20 hover:scale-105 transition-all">
            <Link href="/app/companies">Back to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = requests.reduce((sum, r) => sum + (r.quoteAmount || 0), 0);
  const orderVolume = requests.filter(r => r.fulfillmentStatus === 'Fulfilled' || r.fulfillmentStatus === 'Paid').length;
  const healthScore = Math.min(100, Math.max(0, (orderVolume * 10) + (commitments.length * 20)));

  return (
    <div className="relative min-h-screen pb-20">
      <main className="p-6 lg:p-10 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000">
        
        {/* Header Protocol */}
        <div className="mb-10">
          <CompanyHeader 
            name={company.name}
            status={company.status || "Active"}
            industry={company.companyType}
            address={company.address}
            website={company.website}
            phone={company.phone}
            backUrl="/app/companies"
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
            onDelete={handleDelete}
            onAddCommitment={() => setIsCommitmentModalOpen(true)}
            isSubmitting={saving}
          />
        </div>

        {/* Intelligence Overview */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-10">
          <div className="hidden xl:block">
            <h2 className="text-xl font-heading font-black uppercase tracking-[0.3em] text-teal-dark dark:text-teal-base opacity-30">Intelligence Overview</h2>
          </div>

          <CompanyKPIs 
            totalRevenue={totalRevenue}
            orderVolume={orderVolume}
            healthScore={healthScore}
            commitmentLevel={commitments[0]?.tier?.toString() || "Standard"}
          />
        </div>

        {/* 12-Column Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Protocol Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Visual Intelligence Bento */}
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-glass border border-teal-dark/5">
              <InteractionHistory requests={requests} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Opportunities Pipeline */}
              <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-glass border border-teal-dark/5">
                <StageFunnel requests={requests} />
              </div>

              {/* Account Health Diagnostic */}
              <AccountHealthPanel 
                company={company} 
                commitment={commitments[0] || null} 
                lastActivityDate={activities[0]?.createdAt ? (activities[0].createdAt as any).toDate() : undefined}
              />
            </div>

            {/* Engagement Trace Log */}
            <ActivityLog 
              entityId={id} 
              entityType="COMPANY" 
              entityName={company.name} 
              onSuccess={fetchData} 
            />
          </div>

          {/* Strategic Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Membership Protocol */}
            {commitments[0] && <CommitmentProgress commitment={commitments[0]} />}
            
            {/* Stakeholder Registry */}
            <ContactManager companyId={id} contacts={contacts} onUpdate={fetchData} />
            
            {/* Quick Actions / Status Card */}
            <div className="bg-teal-dark dark:bg-zinc-900 p-8 rounded-[2rem] shadow-glass shadow-teal-dark/20 dark:shadow-teal-base/5 text-white border border-white/5 dark:border-teal-base/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="w-24 h-24" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-heading">Protocol Status</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Deployment Ready</h3>
                </div>
                <p className="text-xs font-medium text-white/60 leading-relaxed font-body">
                  All systems synchronized with regional catering standards. Stakeholder engagement is currently at peak capacity.
                </p>
                <Button className="w-full bg-teal-base hover:bg-teal-base/90 text-teal-dark rounded-xl font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-teal-base/20">
                  Generate Summary
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactions Layers */}
      <QuickLogDrawer 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        entityId={company.id}
        entityType="COMPANY"
        onSuccess={fetchData}
      />

      <NewCommitmentModal
        isOpen={isCommitmentModalOpen}
        onClose={() => setIsCommitmentModalOpen(false)}
        initialCompanyId={id}
        onSuccess={fetchData}
      />
    </div>
  );
}
