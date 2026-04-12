"use client";

import { 
  Menu,
  UserCircle2,
  TrendingUp,
  DollarSign,
  Users2,
  FileText,
  UserPlus2,
  ChevronRight,
  ShoppingBag,
  Coffee,
  Plus,
  ArrowUp
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import type { CommissionApproval } from "@/types/crm";

interface AdminMobilePulseProps {
  stats: {
    newLeads: number;
    followUps: number;
    closingSoon: number;
    overdue: number;
    pipelineValue: number;
    weightedValue: number;
    revenueGoal: number;
  };
  tasks: any[];
  pendingApprovals: CommissionApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function AdminMobilePulse({ 
  stats, 
  tasks, 
  pendingApprovals, 
  onApprove, 
  onReject 
}: AdminMobilePulseProps) {
  const { user } = useAuth();
  const userName = user?.displayName?.split(' ')[0] || "Admin";

  return (
    <div className="relative flex flex-col bg-[#FAFAF7] min-h-screen text-[#1a1c1b] font-sans pb-32 overflow-x-hidden">
      {/* 1. Header Spacer - The TopAppBar is handled by TopNav now */}
      <div className="h-0" />

      <main className="pt-6 px-6 max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* 2. Hero Greeting Section */}
        <section className="mt-4" aria-label="Greeting Header">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-[-0.04em] text-on-surface">Aloha, {userName}.</h2>
              <p className="text-v-on-surface/50 font-medium text-sm">Your operation is up 12% this week.</p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl bg-v-secondary flex items-center justify-center shadow-md shadow-v-secondary/20"
              role="img"
              aria-label="New Lead Trend"
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </section>

        {/* 3. Metrics Grid */}
        <section className="grid grid-cols-2 gap-4" aria-label="Key Performance Indicators">
          {/* Total Sales - Large Card */}
          <div 
            className="col-span-2 p-6 rounded-3xl bg-v-primary text-white relative overflow-hidden shadow-xl shadow-v-primary/10 transition-transform active:scale-[0.98]"
            role="button"
            tabIndex={0}
            aria-label={`Total Sales: $${(stats.pipelineValue / 1000).toFixed(1)}k`}
          >
            <div className="absolute -right-6 -top-6 opacity-10">
              <DollarSign className="h-32 w-32 stroke-[3]" />
            </div>
            <p className="text-[10px] font-black tracking-[0.2em] opacity-60 mb-2 uppercase">Total Sales</p>
            <h3 className="text-4xl font-black tracking-tighter">
              ${(stats.pipelineValue / 1000).toFixed(1)}k
            </h3>
            <div className="mt-5 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md" aria-label="Market Performance">
              <ArrowUp className="h-3 w-3" />
              <span className="uppercase tracking-wider">Hawai&apos;i Market +4.2%</span>
            </div>
          </div>

          {/* Small Metrics */}
          <div 
            className="p-6 rounded-3xl bg-white shadow-sm border border-v-outline/5 transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-v-primary/20"
            role="button"
            tabIndex={0}
            aria-label="Active Clients: 1,284"
          >
            <div className="h-10 w-10 rounded-2xl bg-v-primary/5 flex items-center justify-center mb-4">
              <Users2 className="h-5 w-5 text-v-primary" />
            </div>
            <p className="text-[9px] font-black text-v-on-surface/40 tracking-[0.2em] uppercase mb-1">Active Clients</p>
            <h4 className="text-xl font-black text-v-on-surface tracking-tight">1,284</h4>
          </div>

          <div 
            className="p-6 rounded-3xl bg-white shadow-sm border border-v-outline/5 transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-v-secondary/20"
            role="button"
            tabIndex={0}
            aria-label="Pending Quotes: 18"
          >
            <div className="h-10 w-10 rounded-2xl bg-v-secondary/5 flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-v-secondary" />
            </div>
            <p className="text-[9px] font-black text-v-on-surface/40 tracking-[0.2em] uppercase mb-1">Pending Quotes</p>
            <h4 className="text-xl font-black text-v-on-surface tracking-tight">18</h4>
          </div>

          {/* List Item - Leads */}
          <div 
            className="col-span-2 p-5 rounded-3xl bg-white shadow-sm border border-v-outline/5 flex items-center justify-between group active:bg-v-container/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-v-primary/20"
            role="button"
            tabIndex={0}
            aria-label="New Leads: 342 New Contacts"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-v-container/30">
                <UserPlus2 className="h-5 w-5 text-v-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-v-on-surface/30 tracking-[0.2em] uppercase leading-none">Client Leads</p>
                <h4 className="text-lg font-black text-v-on-surface tracking-tight leading-none">342 New Contacts</h4>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-v-outline/20 group-hover:text-v-primary transition-colors" />
          </div>
        </section>

        {/* 4. Revenue Analysis */}
        <section className="space-y-5" aria-label="Revenue Analysis Chart">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-v-on-surface">Revenue Analysis</h3>
            <div className="flex p-1 bg-v-container/30 rounded-full border border-v-outline/5" role="tablist">
              <button 
                role="tab"
                aria-selected="true"
                className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-white shadow-sm text-v-primary transition-all active:scale-95"
              >
                Monthly
              </button>
              <button 
                role="tab"
                aria-selected="false"
                className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full text-v-on-surface/40 transition-all active:scale-95"
              >
                Quarterly
              </button>
            </div>
          </div>
          
          <div 
            className="bg-white p-8 rounded-3xl shadow-sm border border-v-outline/5 h-56 flex items-end justify-between gap-3"
            role="img"
            aria-label="Bar chart showing monthly revenue increase"
          >
             {[
               { label: "JAN", h: "40%" },
               { label: "FEB", h: "65%" },
               { label: "MAR", h: "90%", active: true },
               { label: "APR", h: "55%" },
               { label: "MAY", h: "75%" }
             ].map((bar) => (
               <div key={bar.label} className="flex-1 flex flex-col items-center gap-4">
                 <div 
                   className={cn(
                     "w-full rounded-t-xl transition-all duration-1000", 
                     bar.active ? "bg-v-primary" : "bg-v-container/40"
                   )} 
                   style={{ height: bar.h }}
                 />
                 <span className={cn(
                   "text-[9px] font-black uppercase tracking-widest",
                   bar.active ? "text-v-primary" : "text-v-on-surface/20"
                 )}>{bar.label}</span>
               </div>
             ))}
          </div>
        </section>

        {/* 5. Category Breakdown */}
        <section className="space-y-5" aria-label="Market Categories Breakdown">
           <div className="bg-white p-8 rounded-[32px] shadow-sm border border-v-outline/5 flex items-center gap-8">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0" role="img" aria-label="Donut chart showing sales categories">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#F4F4F1" strokeWidth="4" />
                <path className="text-v-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="54, 100" strokeWidth="4" />
                <path className="text-v-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="32, 100" strokeDashoffset="-54" strokeWidth="4" />
                <path className="text-v-outline/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="14, 100" strokeDashoffset="-86" strokeWidth="4" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-v-on-surface">54%</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <h4 className="text-xs font-black text-v-on-surface uppercase tracking-[0.1em] mb-3">Sales by Category</h4>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-v-primary shadow-sm shadow-v-primary/20"></div>
                <span className="text-[10px] text-v-on-surface/60 font-black uppercase tracking-tighter">Hospitality (54%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-v-secondary shadow-sm shadow-v-secondary/20"></div>
                <span className="text-[10px] text-v-on-surface/60 font-black uppercase tracking-tighter">Retail (32%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-v-outline/20"></div>
                <span className="text-[10px] text-v-on-surface/60 font-black uppercase tracking-tighter">Corporate (14%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Recent Activity */}
        <section className="space-y-5" aria-label="Recent Operational Activity">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-on-surface">Recent Activity</h3>
            <button className="text-[10px] font-black text-v-primary uppercase tracking-widest p-4 -m-4 transition-all active:scale-95" aria-label="View all system activity">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { id: 1, title: "New Order #4829", sub: "Lani's Beach Bistro • $2,450.00", icon: ShoppingBag, time: "2m ago" },
              { id: 2, title: "New Lead: Kauai Coffee Co.", sub: "Commercial Distribution Inquiry", icon: Coffee, time: "14m ago" }
            ].map((act) => (
              <div 
                key={act.id} 
                className="flex items-center gap-5 p-5 rounded-3xl bg-white shadow-sm border border-v-outline/5 cursor-pointer active:bg-v-container/10 transition-all focus:outline-none focus:ring-2 focus:ring-v-primary/20"
                role="button"
                tabIndex={0}
                aria-label={`Activity: ${act.title}. ${act.sub}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-v-container/30 flex items-center justify-center shrink-0">
                  <act.icon className="h-6 w-6 text-v-on-surface/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-black text-v-on-surface tracking-tight truncate">{act.title}</h5>
                  <p className="text-[10px] font-medium text-v-on-surface/40 truncate mt-0.5">{act.sub}</p>
                </div>
                <span className="text-[9px] font-black text-v-on-surface/20 uppercase whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FAB: Floating Action Button (10% Accent) */}
      <button 
        className="fixed bottom-24 right-6 w-16 h-16 bg-v-secondary text-white rounded-[24px] shadow-lg shadow-v-secondary/30 flex items-center justify-center active:scale-90 active:rotate-90 duration-300 z-40 focus:outline-none focus:ring-4 focus:ring-v-secondary/40"
        aria-label="Create New Lead or Quote"
      >
        <Plus className="h-8 w-8 stroke-[3]" />
      </button>
    </div>
  );
}
