"use client";

import React from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  TrendingUp, 
  MoreHorizontal,
  ChevronRight,
  Target,
  Clock,
  Briefcase
} from 'lucide-react';
import { cn, formatDate } from "@/lib/utils";
import { Lead } from "@/types/crm";
import { calculateLeadHeat, getHeatMetadata } from "@/lib/utils/heat-scoring";
import { Badge } from "@/components/shared/Badge";

interface LeadBentoGridProps {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

export function LeadBentoGrid({ leads, onSelect }: LeadBentoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 auto-rows-[240px]">
      {leads.map((lead) => {
        const score = calculateLeadHeat(lead);
        const meta = getHeatMetadata(score);
        const isHot = score >= 80;
        const isWarm = score >= 60 && score < 80;
        
        // Dynamic Spanning Logic
        let colSpan = "md:col-span-3"; // Default 1x1-ish
        let rowSpan = "row-span-1";
        
        if (isHot) {
          colSpan = "md:col-span-6"; // 2x2 or 2x1
          rowSpan = "row-span-2";
        } else if (isWarm) {
          colSpan = "md:col-span-4";
          rowSpan = "row-span-1";
        }

        return (
          <div 
            key={lead.id}
            onClick={() => onSelect(lead)}
            className={cn(
              "group relative flex flex-col bg-white rounded-[32px] border border-chef-charcoal/5 shadow-soft-low hover:shadow-soft-mid transition-all duration-500 cursor-pointer overflow-hidden active:scale-[0.98]",
              colSpan,
              rowSpan,
              isHot && "bg-chef-prep/30"
            )}
          >
            {/* Heat Indicator Bar */}
            <div 
              className={cn("absolute top-0 left-0 right-0 h-1.5", isHot ? "bg-accent-heat" : "bg-accent-fresh/30")} 
              style={{ width: `${score}%` }}
            />

            <div className="p-8 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "h-12 w-12 rounded-[18px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-soft-low",
                    isHot ? "bg-accent-heat text-white" : "bg-chef-prep text-chef-muted"
                  )}>
                    <Briefcase size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border-transparent",
                      lead.status === "New" ? "bg-accent-heat/10 text-accent-heat" : "bg-chef-prep text-chef-muted"
                    )}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className={cn(
                    "font-black tracking-tight leading-none truncate",
                    isHot ? "text-3xl" : "text-xl"
                  )}>
                    {lead.companyName || "N/A"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-chef-muted" />
                    <span className="text-[11px] font-bold text-chef-muted uppercase tracking-tight truncate max-w-[150px]">
                      {lead.contactName || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {isHot && (
                <div className="grid grid-cols-2 gap-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="p-4 bg-white/60 rounded-2xl border border-chef-charcoal/[0.03]">
                    <p className="text-[9px] font-black uppercase text-chef-muted tracking-widest mb-1">Potential</p>
                    <p className="text-xl font-black text-chef-charcoal tracking-tighter">
                      ${(lead.estimatedGroupSize ? lead.estimatedGroupSize * 25 : 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-2xl border border-chef-charcoal/[0.03]">
                    <p className="text-[9px] font-black uppercase text-chef-muted tracking-widest mb-1">Group Size</p>
                    <p className="text-xl font-black text-chef-charcoal tracking-tighter">
                      {lead.estimatedGroupSize || 0} pax
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-chef-charcoal/[0.03]">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-soft-low",
                    meta.bg, meta.color, meta.ring, "border"
                  )}>
                    <div className={cn("h-1 w-1 rounded-full animate-pulse", meta.color.replace('text', 'bg'))} />
                    {meta.label} Pulse
                  </div>
                  <span className="text-[10px] font-bold text-chef-muted/60 uppercase tracking-widest">
                    {formatDate(lead.createdAt, "MMM d")}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-chef-prep flex items-center justify-center text-chef-muted group-hover:bg-accent-fresh group-hover:text-white transition-all">
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
