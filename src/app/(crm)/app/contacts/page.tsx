"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  LayoutGrid,
  List,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { getAllContacts } from "@/lib/firebase/services/contact.service";
import { Contact } from "@/types/crm";
import { ContactRolodexGrid } from "@/components/crm/ContactRolodexGrid";
import { cn } from "@/lib/utils";

type SortField = "name" | "role" | "company" | "date";
type SortOrder = "asc" | "desc";

const CONTACT_ROLES = ["All", "Decision Maker", "Influencer", "Technical", "Billing", "Other"];

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [viewMode, setViewMode] = useState<'rolodex' | 'classic'>('rolodex');

  // Persist View Mode
  useEffect(() => {
    const saved = localStorage.getItem('crm-contacts-view');
    if (saved === 'classic') setViewMode('classic');
  }, []);

  const handleToggleView = (mode: 'rolodex' | 'classic') => {
    setViewMode(mode);
    localStorage.setItem('crm-contacts-view', mode);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const data = await getAllContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      (contact.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (contact.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (contact.companyName || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || contact.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let result = 0;
    if (sortField === "name") result = (a.fullName || "").localeCompare(b.fullName || "");
    if (sortField === "role") result = (a.role || "").localeCompare(b.role || "");
    if (sortField === "company") result = (a.companyName || "").localeCompare(b.companyName || "");
    if (sortField === "date") {
      const dateA = (a.createdAt as any)?.seconds ?? 0;
      const dateB = (b.createdAt as any)?.seconds ?? 0;
      result = dateA - dateB;
    }
    return sortOrder === "asc" ? result : -result;
  });

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-chef-muted opacity-30 ml-1 inline-block" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-accent-fresh ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-4 h-4 text-accent-fresh ml-1 inline-block" />
    );
  };

  return (
    <div className="relative flex h-full flex-col overscroll-y-contain p-8 gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-chef-charcoal tracking-tight leading-none mb-2">Contacts</h1>
          <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em]">Stakeholder Management & Directory</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-chef-prep/50 p-1.5 rounded-[20px] border border-chef-charcoal/5 shadow-soft-low">
            <button 
              onClick={() => handleToggleView('classic')}
              className={cn(
                "h-9 px-5 rounded-[14px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                viewMode === 'classic' 
                  ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" 
                  : "text-chef-muted hover:text-chef-charcoal"
              )}
            >
              <List size={14} /> Classic
            </button>
            <button 
              onClick={() => handleToggleView('rolodex')}
              className={cn(
                "h-9 px-5 rounded-[14px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                viewMode === 'rolodex' 
                  ? "bg-white text-chef-charcoal shadow-soft-mid border border-chef-charcoal/5" 
                  : "text-chef-muted hover:text-chef-charcoal"
              )}
            >
              <LayoutGrid size={14} /> Rolodex
            </button>
          </div>
          <Button 
            variant="outline" 
            className="hidden sm:flex border-chef-charcoal/10 bg-white hover:bg-chef-prep h-12 rounded-[16px] px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-soft-low"
          >
            Intelligence Export
          </Button>
          <Button 
            className="h-12 px-8 rounded-[20px] bg-chef-charcoal text-white text-[10px] font-black uppercase tracking-widest shadow-soft-mid transition-all active:scale-95"
          >
            Register Stakeholder
          </Button>
        </div>
      </div>

      {viewMode === 'rolodex' ? (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <ContactRolodexGrid 
             contacts={paginatedContacts}
             onSelect={(c) => router.push(`/app/contacts/${c.id}`)}
          />
        </div>
      ) : (
        <Card className="flex-1 flex flex-col bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Unified Header & Filters */}
        <div className="px-8 py-8 border-b border-chef-charcoal/10 flex flex-col sm:flex-row gap-6 items-center justify-between bg-chef-prep/30">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-chef-muted group-focus-within:text-accent-fresh transition-colors" />
            <Input
              placeholder="Search stakeholders..."
              className="pl-14 h-14 border border-transparent bg-chef-prep/50 focus:bg-white focus:border-accent-fresh/20 rounded-[20px] placeholder:text-chef-muted/40 transition-all focus:ring-0 shadow-soft-low"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white/60 p-2 rounded-2xl border border-chef-charcoal/5 shadow-soft-low">
              <Filter className="w-4 h-4 text-chef-muted ml-2" />
              <select
                className="text-[10px] font-black uppercase tracking-widest border-none rounded-xl px-4 py-2 bg-transparent focus:ring-0 text-chef-charcoal cursor-pointer"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {CONTACT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role === "All" ? "ALL ROLES" : role.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <CardContent className="p-0 overflow-hidden flex-1 flex flex-col bg-white">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
              <thead className="bg-chef-prep/30 border-b border-chef-charcoal/5 text-[10px] font-black uppercase tracking-[0.25em] text-chef-muted">
                <tr>
                  <th
                    className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5"
                    onClick={() => handleSort("name")}
                  >
                    Contact <SortIcon field="name" />
                  </th>
                  <th
                    className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5"
                    onClick={() => handleSort("company")}
                  >
                    Company <SortIcon field="company" />
                  </th>
                  <th
                    className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5"
                    onClick={() => handleSort("role")}
                  >
                    Role <SortIcon field="role" />
                  </th>
                  <th className="px-8 py-6 sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5">Status</th>
                  <th
                    className="px-8 py-6 cursor-pointer hover:bg-chef-charcoal/5 transition-colors sticky top-0 bg-chef-prep/50 backdrop-blur-md border-b border-chef-charcoal/5"
                    onClick={() => handleSort("date")}
                  >
                    Added <SortIcon field="date" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chef-charcoal/[0.03] text-chef-charcoal">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-brown/40">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-base border-t-transparent shadow-lg shadow-teal-base/20"></div>
                        <span className="font-black uppercase tracking-widest text-[10px]">Syncing Directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedContacts.length > 0 ? (
                  paginatedContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-chef-prep/40 transition-all cursor-pointer group"
                      onClick={() => router.push(`/app/contacts/${contact.id}`)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-chef-prep flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-chef-charcoal group-hover:text-white shadow-soft-low">
                            <UserIcon size={18} />
                          </div>
                          <div>
                            <div className="font-black text-chef-charcoal tracking-tight">{contact.fullName || "Unnamed Contact"}</div>
                            <div className="flex items-center gap-3 text-[10px] text-chef-muted font-bold uppercase tracking-widest mt-0.5">
                              {contact.email && (
                                <span className="flex items-center gap-1.5">
                                  <Mail size={12} className="opacity-40" /> {contact.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-chef-charcoal/70 font-bold tracking-tight">
                              <Building2 size={16} className="text-chef-muted" />
                              {contact.companyName || "—"}
                          </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-chef-muted bg-chef-prep/50 px-3 py-1.5 rounded-xl border border-chef-charcoal/5">
                          {contact.role || "—"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {contact.isPrimary ? (
                          <Badge className="font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-accent-fresh text-white border-transparent shadow-soft-low">Primary</Badge>
                        ) : (
                          <Badge className="font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-chef-prep/80 text-chef-muted border-chef-charcoal/5">Stakeholder</Badge>
                        )}
                      </td>
                      <td className="px-8 py-5 text-chef-muted text-[10px] font-black uppercase tracking-widest">
                        {(contact.createdAt as any)?.seconds
                          ? format((contact.createdAt as any).seconds * 1000, "MMM d, yyyy")
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-chef-muted uppercase tracking-[0.2em] font-black text-[10px]">
                      No stakeholders match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="px-8 py-6 border-t border-chef-charcoal/10 bg-chef-prep/30 flex items-center justify-between">
            <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.15em]">
              Perspective: <span className="text-chef-charcoal">{filteredContacts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-chef-charcoal">{Math.min(currentPage * itemsPerPage, filteredContacts.length)}</span> <span className="mx-2 opacity-20">/</span> {filteredContacts.length} Total
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-12 p-0 border-chef-charcoal/10 bg-white hover:bg-chef-prep rounded-xl transition-all"
              >
                <ChevronLeft size={20} className="text-chef-muted" />
              </Button>
              <div className="text-[11px] font-black text-chef-charcoal bg-white h-10 px-6 flex items-center rounded-xl border border-chef-charcoal/10 tracking-widest tabular-nums">
                {currentPage} <span className="mx-2 opacity-20 text-[9px]">OF</span> {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-10 w-12 p-0 border-chef-charcoal/10 bg-white hover:bg-chef-prep rounded-xl transition-all"
              >
                <ChevronRight size={20} className="text-chef-muted" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
