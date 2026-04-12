"use client";

import React from 'react';
import { 
  Building2, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Company } from "@/types/crm";
import { Badge } from "@/components/shared/Badge";

interface CompanyBentoGridProps {
  companies: Company[];
  onSelect: (company: Company) => void;
}

export function CompanyBentoGrid({ companies, onSelect }: CompanyBentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {companies.map((company) => (
        <div 
          key={company.id}
          onClick={() => onSelect(company)}
          className="group relative bg-white rounded-[40px] border border-chef-charcoal/5 shadow-soft-low hover:shadow-soft-mid transition-all duration-700 cursor-pointer overflow-hidden active:scale-[0.98] flex flex-col h-full"
        >
          {/* Subtle Accent Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-fresh/5 rounded-bl-[80px] -mr-8 -mt-8 group-hover:bg-accent-fresh/10 transition-colors" />

          {/* Header Area */}
          <div className="p-8 pb-0 relative z-10 flex items-start justify-between">
            <div className="h-16 w-16 rounded-[24px] bg-chef-charcoal flex items-center justify-center text-white shadow-soft-mid group-hover:scale-110 transition-transform duration-700">
              <Building2 size={28} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                className={cn(
                  "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-soft-low",
                  company.status === "Active" ? "bg-accent-fresh/10 text-accent-fresh border-accent-fresh/20" : "bg-chef-prep text-chef-muted border-chef-charcoal/5"
                )}
              >
                {company.status || "Lead"}
              </Badge>
              {company.firstOrderPlaced && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-heat/10 text-accent-heat rounded-full border border-accent-heat/10">
                  <TrendingUp size={10} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Converting</span>
                </div>
              )}
            </div>
          </div>

          {/* Identity Section */}
          <div className="p-8 pt-6 space-y-6 flex-1 relative z-10">
            <div className="space-y-2">
              <h3 className="font-black text-2xl text-chef-charcoal tracking-tighter leading-tight group-hover:text-accent-fresh transition-colors">
                {company.name || "Anonymous Client"}
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-black text-chef-muted uppercase tracking-[0.15em] opacity-60">
                <Layers size={14} className="text-chef-charcoal/20" />
                {(company as any).industry || "Standard Sector"}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-[20px] bg-chef-prep/30 border border-chef-charcoal/5 hover:bg-white transition-colors group/metric">
                <p className="text-[9px] font-black uppercase tracking-widest text-chef-muted mb-1 opacity-50">Total Pulse</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-chef-charcoal tabular-nums group-hover/metric:text-accent-fresh transition-colors">
                    {(company as any).totalEventsCompleted ?? 0}
                  </span>
                  <span className="text-[10px] font-black text-chef-muted uppercase opacity-30">Events</span>
                </div>
              </div>
              <div className="p-4 rounded-[20px] bg-chef-prep/30 border border-chef-charcoal/5 hover:bg-white transition-colors group/metric">
                <p className="text-[9px] font-black uppercase tracking-widest text-chef-muted mb-1 opacity-50">Onboarded</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-chef-charcoal tabular-nums">
                    {company.createdAt?.seconds ? new Date(company.createdAt.seconds * 1000).getFullYear() : '2026'}
                  </span>
                  <Calendar size={12} className="text-chef-charcoal/20" />
                </div>
              </div>
            </div>
            
            {company.website && (
              <div className="flex items-center gap-2.5 px-5 py-4 bg-chef-prep/20 rounded-2xl border border-chef-charcoal/[0.03] group-hover/link:bg-white transition-all group/link">
                <Globe size={14} className="text-chef-muted opacity-40 group-hover/link:text-accent-fresh transition-colors" />
                <span className="text-[11px] font-bold text-chef-charcoal/70 truncate tracking-tight">
                  {company.website.replace(/^https?:\/\//, "")}
                </span>
                <ArrowUpRight size={12} className="ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity text-accent-fresh" />
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-8 py-6 border-t border-chef-charcoal/[0.03] bg-chef-prep/10 flex items-center justify-between group-hover:bg-chef-prep/20 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted group-hover:text-chef-charcoal transition-colors">
              Access intelligence
            </span>
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-chef-muted group-hover:bg-chef-charcoal group-hover:text-white transition-all shadow-soft-low group-hover:shadow-soft-mid">
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
