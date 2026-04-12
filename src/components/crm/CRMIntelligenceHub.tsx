"use client";

import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  DollarSign, 
  ChevronRight,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * CRMIntelligenceHub: The core 'Executive' dashboard for Budda's Catering.
 * Architecture: Bento Box Grid (#21)
 * Strategy: Sales Intelligence Dashboard (#BI 10)
 * Aesthetic: Soft UI Evolution
 */
export default function CRMIntelligenceHub({ 
  user, 
  stats, 
  unassignedLeadsCount, 
  tasksCount,
  attentionLeadsCount 
}: { 
  user: any; 
  stats: any; 
  unassignedLeadsCount: number;
  tasksCount: number;
  attentionLeadsCount: number;
}) {
  return (
    <div className="container-rig py-8 lg:py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Executive Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-fresh/10 rounded-full w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-fresh animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-fresh">Live Operations Hub</span>
          </div>
          <h1 className="text-5xl font-black font-heading tracking-tight text-chef-charcoal">
            Aloha, <span className="text-chef-muted font-light">{user?.displayName?.split(' ')[0] || "Admin"}</span>
          </h1>
          <p className="text-chef-muted font-medium text-sm tracking-tight">
            Here is what&apos;s happening at Pacific Hospitality today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right mr-4">
             <span className="text-[10px] font-black uppercase text-chef-muted">Success Rate</span>
             <span className="text-lg font-black text-accent-fresh">92%</span>
          </div>
          <button className="px-6 py-3 bg-white text-chef-charcoal border border-chef-charcoal/5 rounded-2xl shadow-soft-low hover:shadow-soft-mid transition-all font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <Filter size={14} /> Filters
          </button>
        </div>
      </header>

      {/* Bento Grid Architecture (12-col) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* WIDGET 1: Today's Prep (Operational Core) */}
        <section className="md:col-span-8 bg-white rounded-[40px] shadow-soft-mid border border-chef-charcoal/5 overflow-hidden flex flex-col group hover:shadow-soft-high transition-all duration-500">
          <div className="p-8 border-b border-chef-charcoal/5 flex justify-between items-center bg-chef-prep/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-heat/10 text-accent-heat rounded-2xl">
                <Clock size={20} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-chef-charcoal tracking-tight">Needs Attention</h2>
                <p className="text-[10px] font-bold text-chef-muted uppercase tracking-widest">{attentionLeadsCount} Leads Require Action</p>
              </div>
            </div>
            <button className="text-xs font-black text-chef-muted hover:text-accent-fresh transition-colors flex items-center gap-1 group">
              View All Leads <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { label: 'Unassigned Leads', value: unassignedLeadsCount, color: 'text-accent-fresh', bg: 'bg-accent-fresh/10' },
                 { label: 'Active Tasks', value: tasksCount, color: 'text-chef-charcoal', bg: 'bg-chef-prep/50' },
                 { label: 'Pipeline Value', value: `$${(stats?.pipelineValue || 142850).toLocaleString()}`, color: 'text-chef-charcoal', bg: 'bg-chef-prep/50' },
                 { label: 'Avg Sale', value: '$2,850', color: 'text-chef-charcoal', bg: 'bg-chef-prep/50' }
               ].map((item, i) => (
                 <div key={i} className="p-6 rounded-[32px] bg-chef-prep/10 border border-chef-charcoal/[0.03] hover:bg-white hover:shadow-soft-mid transition-all cursor-pointer group/item">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted mb-2">{item.label}</p>
                    <p className={cn("text-3xl font-black font-mono tracking-tighter", item.color)}>{item.value}</p>
                    <div className="mt-4 h-1 w-12 bg-chef-charcoal/10 rounded-full group-hover/item:w-full transition-all duration-500" />
                 </div>
               ))}
          </div>
        </section>

        {/* WIDGET 2: Sales Metrics (Intelligence Cluster) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Pending Quotes (Sales Focus) */}
          <div className="h-64 bg-chef-charcoal text-white rounded-[40px] shadow-soft-mid p-8 flex flex-col justify-between group cursor-pointer hover:shadow-soft-high transition-all">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                 <DollarSign size={20} />
               </div>
               <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Monthly Revenue Goal</span>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-black font-mono tracking-tighter">$142,850</h3>
                  <span className="text-xl font-black text-accent-fresh">105%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-fresh w-full shadow-[0_0_20px_rgba(13,115,119,0.5)]" />
                </div>
             </div>
             
             <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-40">
               <span>Target: $135,000</span>
               <TrendingUp size={14} />
             </div>
          </div>

          {/* Lead Conversion (1x1 Equivalent - BI Visualization) */}
          <div className="flex-1 bg-white rounded-[40px] shadow-soft-mid border border-chef-charcoal/5 p-8 flex flex-col justify-between group hover:shadow-soft-high transition-all">
            <div className="flex justify-between items-start">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted">Lead Conversion</p>
               <div className="flex items-center gap-1 text-accent-fresh text-xs font-black">
                 <TrendingUp size={14} /> +2.4%
               </div>
            </div>
            
            <div className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16">
                 {/* Svg Circle Chart */}
                 <svg className="h-full w-full -rotate-90">
                   <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-chef-prep" />
                   <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="176" strokeDashoffset="44" className="text-accent-fresh" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-chef-charcoal">75%</div>
              </div>
              <div className="space-y-0.5">
                 <p className="text-2xl font-black text-chef-charcoal">1,420</p>
                 <p className="text-[10px] font-bold text-chef-muted uppercase">Total Conversions</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <div className="p-3 bg-chef-prep/50 rounded-2xl space-y-1">
                 <p className="text-[9px] font-black uppercase text-chef-muted">Funnel Entry</p>
                 <p className="text-sm font-black text-chef-charcoal">12.5k</p>
               </div>
               <div className="p-3 bg-chef-prep/50 rounded-2xl space-y-1">
                 <p className="text-[9px] font-black uppercase text-chef-muted">Retention</p>
                 <p className="text-sm font-black text-accent-fresh">92%</p>
               </div>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Active Deliveries (Logistics Cluster - 4x1) */}
        <section className="grid md:col-span-12 grid-cols-1 md:grid-cols-4 gap-6">
           <div className="md:col-span-3 bg-white rounded-[40px] shadow-soft-mid border border-chef-charcoal/5 p-8 group hover:shadow-soft-high transition-all">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent-fresh/10 text-accent-fresh rounded-2xl">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-xl font-black text-chef-charcoal tracking-tight">Active Deliveries</h2>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-chef-prep rounded-full text-[10px] font-black uppercase text-chef-muted">2 Delayed</div>
                  <div className="px-3 py-1 bg-accent-fresh/10 rounded-full text-[10px] font-black uppercase text-accent-fresh">10 On Track</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { courier: 'Budda Delivery #1', zone: 'SoMa / Mission', eta: '4 min', status: 'Delivering' },
                  { courier: 'Uber Direct', zone: 'Palo Alto', eta: '18 min', status: 'Picked Up' },
                  { courier: 'Budda Delivery #4', zone: 'Oakland Tech', eta: '12 min', status: 'En Route' }
                ].map((shipment, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-3xl bg-chef-prep/30 hover:bg-chef-prep/50 transition-colors cursor-pointer group/ship">
                    <div className="h-10 w-10 rounded-2xl bg-white shadow-soft-low flex items-center justify-center text-chef-muted group-hover/ship:text-accent-fresh transition-colors">
                      <Package size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-chef-charcoal">{shipment.zone}</h4>
                      <p className="text-[10px] font-bold text-chef-muted uppercase">{shipment.courier}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-accent-fresh uppercase italic tracking-wider">ETA: {shipment.eta}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Quick Intelligence Cards */}
           <div className="bg-accent-fresh p-8 rounded-[40px] shadow-soft-mid text-white flex flex-col justify-between">
              <div className="space-y-2">
                <Users size={24} className="opacity-40" />
                <h3 className="text-lg font-black leading-tight">Staff Dispatch</h3>
              </div>
              <div>
                <p className="text-4xl font-black font-mono">14/15</p>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest mt-1">Drivers Online</p>
              </div>
           </div>
        </section>

      </div>

      {/* Footer System Status */}
      <footer className="pt-12 flex items-center justify-between border-t border-chef-charcoal/[0.03]">
        <div className="flex gap-8">
           <div className="flex items-center gap-2">
             <CheckCircle2 size={12} className="text-accent-fresh" />
             <span className="text-[10px] font-black uppercase tracking-widest text-chef-muted">Kitchen Sync Ready</span>
           </div>
           <div className="flex items-center gap-2">
             <AlertCircle size={12} className="text-accent-heat" />
             <span className="text-[10px] font-black uppercase tracking-widest text-chef-muted">2 Low Stock Alerts</span>
           </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted/40">Budda's Catering © 2026</p>
      </footer>
    </div>
  );
}
