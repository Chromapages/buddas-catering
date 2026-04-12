"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Contact } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Badge } from "@/components/shared/Badge";
import { 
  Users, 
  Mail, 
  Phone, 
  Plus, 
  UserPlus, 
  Star, 
  MoreVertical,
  X,
  Loader2,
  Check
} from "lucide-react";
import { createContact, setPrimaryContact, updateContact } from "@/lib/firebase/services/contact.service";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";

interface ContactManagerProps {
  companyId: string;
  contacts: Contact[];
  onUpdate: () => void;
}

export function ContactManager({ companyId, contacts, onUpdate }: ContactManagerProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    title: "",
    role: "Decision Maker"
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createContact(
        { ...form, companyId },
        user.uid,
        user.displayName || "Admin"
      );
      toast.success("Contact added");
      setIsAdding(false);
      setForm({ fullName: "", email: "", phone: "", title: "", role: "Decision Maker" });
      onUpdate();
    } catch (error) {
      toast.error("Failed to add contact");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (contactId: string) => {
    if (!user) return;
    try {
      await setPrimaryContact(companyId, contactId, user.uid, user.displayName || "Admin");
      toast.success("Primary contact updated");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update primary contact");
    }
  };

  return (
    <Card className="border border-teal-dark/10 shadow-glass backdrop-blur-3xl overflow-hidden rounded-[24px] bg-white/40">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-teal-dark/10 bg-white/5 p-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-base/10 border border-teal-base/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-teal-base" />
          </div>
          <CardTitle className="text-[12px] font-black uppercase tracking-[0.3em] text-teal-dark">Stakeholder Protocol</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-teal-base hover:bg-teal-base/10 rounded-xl transition-all"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? "Abort" : "Add Stakeholder"}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {isAdding && (
          <form onSubmit={handleCreate} className="p-6 bg-teal-dark/5 rounded-2xl border border-teal-dark/10 space-y-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500 shadow-glass">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Registry Name</label>
                <Input 
                  required 
                  placeholder="Jane Doe" 
                  value={form.fullName} 
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
                  className="bg-white/5 border-teal-dark/10 text-teal-dark rounded-xl h-11 focus:border-teal-base text-xs font-black uppercase tracking-widest placeholder:text-teal-dark/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Designation</label>
                <Input 
                  placeholder="Catering Director" 
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="bg-white/5 border-teal-dark/10 text-teal-dark rounded-xl h-11 focus:border-teal-base text-xs font-black uppercase tracking-widest placeholder:text-teal-dark/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Comms Email</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="jane@company.com" 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="bg-white/5 border-teal-dark/10 text-teal-dark rounded-xl h-11 focus:border-teal-base text-xs font-black uppercase tracking-widest placeholder:text-teal-dark/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Contact Line</label>
                <Input 
                  placeholder="(555) 000-0000" 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="bg-white/5 border-teal-dark/10 text-teal-dark rounded-xl h-11 focus:border-teal-base text-xs font-black uppercase tracking-widest placeholder:text-teal-dark/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Protocol Role</label>
              <select 
                className="w-full h-11 rounded-xl border border-teal-dark/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-teal-dark focus:outline-none focus:ring-2 focus:ring-teal-base/20 transition-all appearance-none cursor-pointer"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option className="bg-white text-teal-dark">Decision Maker</option>
                <option className="bg-white text-teal-dark">Influencer</option>
                <option className="bg-white text-teal-dark">Billing/Finance</option>
                <option className="bg-white text-teal-dark">On-site Coordinator</option>
                <option className="bg-white text-teal-dark">Administrative</option>
              </select>
            </div>
            <div className="flex justify-end pt-4 border-t border-teal-dark/10">
              <Button type="submit" size="sm" disabled={loading} className="bg-teal-base hover:bg-teal-base/80 text-teal-dark h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Sync Stakeholder
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={cn(
                "group relative p-6 rounded-2xl border backdrop-blur-md transition-all duration-300",
                contact.isPrimary 
                  ? "bg-teal-base/10 border-teal-base/20 shadow-glass" 
                  : "bg-teal-dark/5 border-teal-dark/5 hover:bg-teal-dark/10 hover:border-teal-dark/10"
              )}
            >
              <div className="flex justify-between items-center gap-6">
                <div className="flex-1 flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-teal-dark/5 border border-teal-dark/10 flex items-center justify-center shrink-0">
                    <Star className={cn("h-5 w-5", contact.isPrimary ? "text-teal-base fill-teal-base" : "text-teal-dark/10")} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-black text-teal-dark uppercase tracking-widest">{contact.fullName}</span>
                      <Badge variant="neutral" className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border backdrop-blur-md",
                        contact.role === 'Decision Maker' ? 'bg-teal-base/10 text-teal-base border-teal-base/20' : 'bg-teal-dark/5 text-teal-dark/30 border-teal-dark/10'
                      )}>
                        {contact.role || contact.title || "OPERATIVE"}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-teal-dark/40">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-teal-dark/40">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  {!contact.isPrimary && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-teal-dark/30 hover:text-teal-base hover:bg-teal-base/10 rounded-xl"
                      onClick={() => handleSetPrimary(contact.id)}
                      title="Promote to Primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-teal-dark/30 hover:text-teal-dark hover:bg-teal-dark/5 rounded-xl">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {contacts.length === 0 && !isAdding && (
            <div className="text-center py-20 bg-teal-dark/5 rounded-[24px] border border-dashed border-teal-dark/10">
              <UserPlus className="w-16 h-16 text-teal-dark/5 mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-dark/30 mb-8 italic">No registered stakeholders detected</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-teal-base h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-teal-base/5 hover:bg-teal-base/10 transition-all border border-teal-base/10"
                onClick={() => setIsAdding(true)}
              >
                Initiate New Registry
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
