"use client";

import React from 'react';
import { 
  Mail, 
  Phone, 
  Building2, 
  ChevronRight,
  User,
  Star,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Contact } from "@/types/crm";
import { Badge } from "@/components/shared/Badge";

interface ContactRolodexGridProps {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
}

export function ContactRolodexGrid({ contacts, onSelect }: ContactRolodexGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {contacts.map((contact) => (
        <div 
          key={contact.id}
          onClick={() => onSelect(contact)}
          className="group relative bg-white rounded-[32px] border border-chef-charcoal/5 shadow-soft-low hover:shadow-soft-mid transition-all duration-500 cursor-pointer overflow-hidden active:scale-[0.98] flex flex-col"
        >
          {/* Header Section */}
          <div className="p-6 pb-0 flex items-start justify-between">
            <div className="h-14 w-14 rounded-[20px] bg-chef-prep/50 flex items-center justify-center text-chef-charcoal shadow-soft-low border border-chef-charcoal/5 group-hover:scale-110 transition-transform duration-500">
              <User size={24} />
            </div>
            {contact.isPrimary && (
              <div className="h-8 w-8 rounded-full bg-accent-fresh/10 text-accent-fresh flex items-center justify-center shadow-soft-low border border-accent-fresh/20">
                <Star size={14} fill="currentColor" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 space-y-4 flex-1">
            <div className="space-y-1">
              <h3 className="font-black text-xl text-chef-charcoal tracking-tight leading-none group-hover:text-accent-fresh transition-colors">
                {contact.fullName || "Unnamed Contact"}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-chef-muted">
                {contact.role || "Stakeholder"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-chef-charcoal/70 font-bold text-[13px] tracking-tight truncate">
                <Building2 size={14} className="text-chef-muted" />
                {contact.companyName || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-chef-muted font-medium text-[12px] truncate">
                <Mail size={14} className="opacity-40" />
                {contact.email}
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-chef-muted font-medium text-[12px]">
                  <Phone size={14} className="opacity-40" />
                  {contact.phone}
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="px-6 py-5 border-t border-chef-charcoal/[0.03] bg-chef-prep/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-lg bg-white border border-chef-charcoal/5 flex items-center justify-center text-chef-muted hover:bg-accent-fresh hover:text-white transition-all shadow-soft-low">
                <MessageSquare size={14} />
              </button>
              <button className="h-8 w-8 rounded-lg bg-white border border-chef-charcoal/5 flex items-center justify-center text-chef-muted hover:bg-accent-fresh hover:text-white transition-all shadow-soft-low">
                <ExternalLink size={14} />
              </button>
            </div>
            <div className="h-10 w-10 rounded-full bg-chef-prep flex items-center justify-center text-chef-muted group-hover:bg-chef-charcoal group-hover:text-white transition-all shadow-soft-low">
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
