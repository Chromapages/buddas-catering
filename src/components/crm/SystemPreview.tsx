"use client";

import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  DollarSign, 
  ChevronRight,
  Filter,
  MoreVertical,
  Layers
} from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * SystemPreview: A demonstration component for the 'Soft Precision' Design System.
 * Fuses Swiss Functionalism with Soft UI Evolution.
 */
export const SystemPreview = () => {
  return (
    <div className="min-h-screen bg-chef-prep p-8 lg:p-16 space-y-12 animate-in fade-in duration-1000">
      {/* 1. Swiss Header */}
      <header className="flex flex-col gap-2 max-w-4xl">
        <div className="flex items-center gap-3 px-3 py-1 bg-accent-fresh/10 rounded-full w-fit">
           <span className="h-2 w-2 rounded-full bg-accent-fresh animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-fresh">System Live</span>
        </div>
        <h1 className="text-6xl font-black font-heading text-chef-charcoal tracking-[-0.04em] leading-none mb-2">
          Master Design System
        </h1>
        <p className="text-chef-muted font-medium text-lg max-w-2xl tracking-tight">
          'Soft Precision': A Swiss-inspired functionalist framework with dimensional Soft UI layering for B2B QSR operations.
        </p>
      </header>

      {/* 2. Bento Dashboard (Sales Intelligence) */}
      <section className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-chef-muted">Intelligence Bento</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Primary Hero Tile (Dimensonal Layering) */}
          <div className="md:col-span-2 p-8 rounded-[32px] bg-white shadow-soft-mid border border-chef-charcoal/5 relative overflow-hidden group hover:shadow-soft-high transition-all duration-500">
            <div className="absolute -right-8 -top-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <DollarSign size={200} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted mb-4">Total Revenue / Q2</p>
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-5xl font-black font-mono text-chef-charcoal tracking-tighter">$142,500.00</h3>
              <div className="px-3 py-1 rounded-full bg-accent-fresh/10 text-accent-fresh text-[10px] font-black">+14.2%</div>
            </div>
            <div className="flex gap-2">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className="flex-1 h-32 bg-chef-prep rounded-xl relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-accent-fresh opacity-20 rounded-t-lg transition-all duration-1000" 
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                  {i === 5 && (
                    <div className="absolute bottom-0 w-full bg-accent-fresh rounded-t-lg h-[60%] shadow-[0_0_20px_rgba(13,115,119,0.3)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prep Status (Soft Transition) */}
          <div className="p-8 rounded-[32px] bg-white shadow-soft-mid border border-chef-charcoal/5 flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-chef-muted">Ready for Prep</p>
              <h4 className="text-4xl font-black text-chef-charcoal">42 <span className="text-sm font-medium text-chef-muted">Units</span></h4>
            </div>
            <div className="h-1 bg-chef-prep rounded-full overflow-hidden">
              <div className="h-full bg-accent-heat w-[75%] rounded-full shadow-[0_0_12px_rgba(224,123,84,0.4)]" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase">
              <span className="text-accent-heat">On Fire</span>
              <span className="text-chef-muted">Goal: 60</span>
            </div>
          </div>

          {/* Logistics (Minimalist) */}
          <div className="p-8 rounded-[32px] bg-chef-charcoal text-white shadow-soft-mid flex flex-col justify-between group cursor-pointer hover:bg-chef-charcoal/95 transition-all">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Package size={20} />
              </div>
              <ChevronRight size={20} className="text-white/20 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight">Active Deliveries</h4>
              <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.1em]">12 Packages OutNow</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Data Table (Swiss / Dense BI) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-chef-muted">Order Intelligence Log</h2>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-chef-charcoal/5 shadow-soft-low text-xs font-black hover:shadow-soft-mid transition-all">
               <Filter size={14} /> FILTERS
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-chef-charcoal text-white rounded-2xl shadow-soft-low text-xs font-black hover:scale-95 transition-all">
               NEW ENTRY
             </button>
          </div>
        </div>
        
        <div className="bg-white rounded-[32px] shadow-soft-mid border border-chef-charcoal/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-chef-prep/50 border-b border-chef-charcoal/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted">Account</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted">Prep Time</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted text-right">Value</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chef-charcoal/[0.03]">
              {[1,2,3,4].map((i) => (
                <tr key={i} className="group hover:bg-chef-prep/30 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-xs font-mono font-black text-chef-charcoal">#ORD-092{i}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-chef-prep flex items-center justify-center text-[10px] font-black">PH</div>
                      <span className="text-sm font-black text-chef-charcoal">Pacific Hospitality Grp.</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-soft-low",
                      i === 1 ? "bg-accent-fresh/10 text-accent-fresh" : "bg-accent-caution/10 text-accent-caution"
                    )}>
                      {i === 1 ? 'Delivered' : 'Pending Prep'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-chef-muted">
                      <Clock size={12} />
                      <span>{12 + i * 5}m left</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-chef-charcoal text-sm">
                    ${(2450.50 * i).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} className="text-chef-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-chef-prep/20 border-t border-chef-charcoal/5 flex justify-center">
            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-chef-muted hover:text-chef-charcoal transition-colors">Load Master Log</button>
          </div>
        </div>
      </section>

      {/* 4. Detail View Prototype (Dimensional Layering) */}
      <section className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-chef-muted">Dimensional Detail</h2>
        <div className="relative flex flex-col lg:flex-row gap-8">
           {/* Level 1 Card (Subtle Elevation) */}
           <aside className="lg:w-1/3 bg-white p-8 rounded-[40px] shadow-soft-mid border border-chef-charcoal/5 self-start">
             <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-accent-fresh/10 flex items-center justify-center text-accent-fresh font-black text-2xl">L</div>
                  <div>
                    <h5 className="text-xl font-black text-chef-charcoal">Lani Kai Catering</h5>
                    <p className="text-xs font-medium text-chef-muted">Enterprise Account</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-chef-charcoal/5">
                  {[
                    { label: 'Primary Contact', val: 'Leilani Smith' },
                    { label: 'Tax ID', val: '48-29201-92' },
                    { label: 'Credit Limit', val: '$50,000.00' }
                  ].map(line => (
                    <div key={line.label} className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-chef-muted">{line.label}</span>
                      <span className="text-sm font-black text-chef-charcoal">{line.val}</span>
                    </div>
                  ))}
                </div>
             </div>
           </aside>

           {/* Level 2 Card (High Elevation / Floating context) */}
           <main className="flex-1 space-y-8 relative">
              <div className="bg-white p-12 rounded-[48px] shadow-soft-high border border-chef-charcoal/10 relative z-10 overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <Layers className="text-accent-heat/20" size={120} />
                </div>
                <div className="max-w-xl space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black font-heading text-chef-charcoal tracking-tight">Catering Package Selection</h3>
                    <p className="text-chef-muted">Choose your foundational menu blocks for this account.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Executive Lunch', 'Island Night', 'Fresh Harvest', 'Custom Prep'].map(title => (
                      <div key={title} className="p-6 rounded-3xl bg-chef-prep border border-chef-charcoal/5 transition-all hover:bg-white hover:shadow-soft-mid cursor-pointer group">
                        <h6 className="font-black text-chef-charcoal group-hover:text-accent-fresh transition-colors">{title}</h6>
                        <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.1em] mt-1">Ready in 4h</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dimensional Shadow Play */}
              <div className="absolute inset-0 bg-accent-fresh/5 blur-[120px] rounded-full -z-10" />
           </main>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="pt-24 pb-8 flex justify-between items-center text-chef-muted border-t border-chef-charcoal/5">
         <span className="text-[10px] font-black uppercase tracking-[0.4em]">Soft Precision v1.0</span>
         <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Budda's Catering CRM Framework</span>
      </footer>
    </div>
  );
};
