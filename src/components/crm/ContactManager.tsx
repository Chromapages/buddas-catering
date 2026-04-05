"use client";

import { useState } from "react";
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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-bg/50">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-base" />
          <CardTitle className="text-lg">Stakeholders</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-teal-base hover:text-teal-dark"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 mr-1" />}
          {isAdding ? "Cancel" : "Add Contact"}
        </Button>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isAdding && (
          <form onSubmit={handleCreate} className="p-4 bg-teal-base/5 rounded-xl border border-teal-base/10 space-y-3 mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown/50">Full Name</label>
                <Input 
                  required 
                  placeholder="Jane Doe" 
                  value={form.fullName} 
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown/50">Title</label>
                <Input 
                  placeholder="Catering Director" 
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown/50">Email</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="jane@company.com" 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown/50">Phone</label>
                <Input 
                  placeholder="(555) 000-0000" 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brown/50">Role in Decision</label>
              <select 
                className="w-full h-9 rounded-lg border border-gray-border bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-base/20"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option>Decision Maker</option>
                <option>Influencer</option>
                <option>Billing/Finance</option>
                <option>On-site Coordinator</option>
                <option>Administrative</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Save Contact
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`group relative p-4 rounded-xl border transition-all ${
                contact.isPrimary 
                  ? "bg-teal-base/5 border-teal-base/20 shadow-sm" 
                  : "bg-white border-gray-border hover:border-brown/20"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-brown">{contact.fullName}</span>
                    {contact.isPrimary && (
                      <Badge variant="success" className="text-[9px] h-4 py-0 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Primary
                      </Badge>
                    )}
                    <span className="text-[10px] font-medium text-brown/40 bg-gray-bg px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      {contact.role || contact.title || "Contact"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-brown/60">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-brown/30 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brown/30 shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!contact.isPrimary && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-brown/40 hover:text-teal-base"
                      onClick={() => handleSetPrimary(contact.id)}
                      title="Set as Primary"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-brown/40">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {contacts.length === 0 && !isAdding && (
            <div className="text-center py-8 bg-gray-bg/30 rounded-xl border border-dashed border-gray-border">
              <UserPlus className="w-10 h-10 text-brown/20 mx-auto mb-3" />
              <p className="text-sm text-brown/50 italic">No stakeholders registered.</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-teal-base mt-2"
                onClick={() => setIsAdding(true)}
              >
                Add the first contact
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
