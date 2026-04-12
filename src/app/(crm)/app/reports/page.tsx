"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Target,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/firebase/context/auth";

import {
  getLeadSourceStats,
  getRepPerformanceMetrics,
  getCompanyLTVStats,
  getPipelineVelocity
} from "@/lib/firebase/services/analytics.service";
import { exportToCsv } from "@/lib/utils/export";

export default function ReportsPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sourceStats, setSourceStats] = useState<{name: string, value: number}[]>([]);
  const [repMetrics, setRepMetrics] = useState<any[]>([]);
  const [ltvStats, setLtvStats] = useState<any[]>([]);
  const [velocity, setVelocity] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !role) return;
    
    const fetchStats = async () => {
      try {
        const [sources, reps, ltv, vel] = await Promise.all([
          getLeadSourceStats(user.uid, role),
          getRepPerformanceMetrics(user.uid, role),
          getCompanyLTVStats(user.uid, role),
          getPipelineVelocity(user.uid, role)
        ]);
        setSourceStats(sources);
        setRepMetrics(reps);
        setLtvStats(ltv);
        setVelocity(vel);
      } catch (err) {
        console.error("Error loading report stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, role]);

  const handleExport = () => {
    const rows = [
      { Metric: "Total Revenue", Value: `$${repMetrics.reduce((a, b) => a + b.totalRevenue, 0).toLocaleString()}` },
      { Metric: "Avg Win Rate", Value: repMetrics.length > 0 ? `${(repMetrics.reduce((a, b) => a + b.closeRate, 0) / repMetrics.length).toFixed(1)}%` : "0%" },
      { Metric: "Avg Deal Size", Value: repMetrics.length > 0 ? `$${Math.round(repMetrics.reduce((a, b) => a + b.avgDealSize, 0) / repMetrics.length).toLocaleString()}` : "$0" },
      { Metric: "Avg Cycle (days)", Value: velocity.length > 0 ? `${(velocity.reduce((a, b) => a + b.avgDays, 0) / velocity.length).toFixed(1)} days` : "0 days" },
    ];
    exportToCsv(rows, `catering_snapshot_${new Date().toISOString().slice(0, 10)}`);
    toast.success("Snapshot exported successfully");
  };

  const handleCustomAudit = () => {
    const rows = [
      // Rep performance section
      ...repMetrics.map((r) => ({
        Section: "Rep Performance",
        Name: r.name,
        Metric: "Close Rate / Avg Deal / Revenue",
        Value: `${r.closeRate}% | $${r.avgDealSize} | $${r.totalRevenue}`,
      })),
      // LTV section
      ...ltvStats.map((s) => ({
        Section: "Company LTV",
        Name: s.name,
        Metric: "Lifetime Value",
        Value: `$${s.value}`,
      })),
      // Source stats
      ...sourceStats.map((s) => ({
        Section: "Lead Source",
        Name: s.name,
        Metric: "Lead Count",
        Value: String(s.value),
      })),
      // Velocity
      ...velocity.map((v) => ({
        Section: "Pipeline Velocity",
        Name: v.stage,
        Metric: "Avg Days in Stage",
        Value: `${v.avgDays} days`,
      })),
    ];

    if (rows.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    exportToCsv(rows, `catering_audit_${new Date().toISOString().slice(0, 10)}`);
    toast.success("Full audit exported as CSV.");
  };

  const handleAnalyze = () => {
    if (velocity.length === 0) {
      toast("No velocity data yet — complete more requests to track stage timing.", { icon: "ℹ️" });
      return;
    }
    const bottleneck = [...velocity].sort((a, b) => b.avgDays - a.avgDays)[0];
    toast.success(
      `Bottleneck: "${bottleneck.stage}" stage averaging ${bottleneck.avgDays} days. Focus rep follow-up here to reduce cycle time.`,
      { duration: 6000 }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brown/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-medium">Synthesizing catering data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-10 overscroll-y-contain">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
        <div>
          <h1 className="text-4xl font-bold font-heading text-teal-dark tracking-tight">Intelligence</h1>
          <p className="text-sm text-brown/60 mt-1 font-medium italic">Strategic performance insights and predictive lead analytics.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="border-white/20 bg-white/40 backdrop-blur-md text-teal-dark font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl hover:bg-white/60 transition-all shadow-xl shadow-teal-dark/5"
            onClick={handleExport}
          >
            Export Snapshot
          </Button>
          <Button 
            className="bg-teal-dark hover:bg-teal-base shadow-lg shadow-teal-dark/20 transition-all font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl hover:scale-105"
            onClick={handleCustomAudit}
          >
            Generate Audit
          </Button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Revenue", value: `$${repMetrics.reduce((a, b) => a + b.totalRevenue, 0).toLocaleString()}`, icon: DollarSign, sub: "Total Fulfilled Pipeline", color: "text-teal-base" },
          { label: "Win Rate", value: `${repMetrics.length > 0 ? Math.round(repMetrics.reduce((a, b) => a + b.closeRate, 0) / repMetrics.length) : 0}%`, icon: Target, sub: "Avg Rep Conversion", color: "text-orange" },
          { label: "Deal Size", value: `$${repMetrics.length > 0 ? Math.round(repMetrics.reduce((a, b) => a + b.avgDealSize, 0) / repMetrics.length).toLocaleString() : 0}`, icon: TrendingUp, sub: "Average Order Value", color: "text-teal-dark" },
          { label: "Velocity", value: `${velocity.length > 0 ? Math.round(velocity.reduce((a, b) => a + b.avgDays, 0)) : 0}d`, icon: Calendar, sub: "Avg Cycle to Close", color: "text-teal-dark" }
        ].map((kpi, idx) => (
          <Card key={idx} variant="glass" className="border-white/20 p-6 group hover:bg-white/40 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-dark/5">
            <div className="flex justify-between items-start">
              <div className={cn("p-2.5 rounded-2xl shadow-inner", kpi.color.replace('text-', 'bg-').concat('/10'))}>
                <kpi.icon className={cn("w-5 h-5", kpi.color)} />
              </div>
              <span className="text-[9px] font-black text-teal-dark/40 uppercase tracking-[0.2em]">{kpi.label}</span>
            </div>
            <div className="mt-5">
              <h3 className="text-3xl font-bold text-teal-dark tracking-tight leading-none group-hover:text-teal-base transition-colors">{kpi.value}</h3>
              <p className="text-[10px] text-brown/40 font-black uppercase tracking-[0.1em] mt-2 leading-none">{kpi.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Performance Leaderboard */}
        <Card variant="glass" className="lg:col-span-2 border-white/20 overflow-hidden shadow-xl shadow-teal-dark/5">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-base/20 rounded-xl">
                <Users className="w-5 h-5 text-teal-dark" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-teal-dark">Sales Leaderboard</h2>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-teal-base animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.6)]"></div>
               <span className="text-[10px] font-black text-brown/40 uppercase tracking-widest leading-none">Realtime Sync</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brown/40">Rep Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brown/40 text-center">Close Rate</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brown/40 text-center">Avg Deal</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brown/40 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {repMetrics.map((rep, idx) => (
                  <tr key={idx} className="hover:bg-white/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-9 h-9 rounded-2xl flex items-center justify-center font-black text-[11px] ring-2 ring-white/50 shadow-inner",
                          idx === 0 ? "bg-orange/20 text-orange" : "bg-teal-base/20 text-teal-dark"
                        )}>
                          #{idx + 1}
                        </div>
                        <span className="font-bold text-teal-dark group-hover:text-teal-base transition-colors">{rep.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-black text-teal-dark tabular-nums">{rep.closeRate}%</span>
                        <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden shadow-inner">
                          <div className="bg-teal-base h-full shadow-[0_0_8px_rgba(45,212,191,0.4)]" style={{ width: `${rep.closeRate}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-black text-teal-dark/60 tabular-nums">${rep.avgDealSize.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="px-4 py-1.5 bg-teal-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-dark/20">
                        ${rep.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Company Lifetime Value */}
        <Card variant="glass" className="border-white/20 p-6 shadow-xl shadow-teal-dark/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange/15 rounded-xl">
              <PieChart className="w-5 h-5 text-orange" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-teal-dark">High LTV Accounts</h2>
          </div>
          <div className="space-y-8">
            {ltvStats.map((stat, idx) => (
              <div key={idx} className="group cursor-default">
                <div className="flex justify-between items-end mb-2.5">
                  <span className="text-[10px] font-black text-teal-dark/40 uppercase tracking-widest truncate max-w-[160px] group-hover:text-teal-dark transition-colors">{stat.name}</span>
                  <span className="text-sm font-black text-teal-dark tabular-nums">${stat.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden shadow-inner ring-1 ring-white/10">
                  <div 
                    className="bg-orange/70 h-full transition-all duration-1000 delay-100 shadow-[0_0_12px_rgba(249,115,22,0.3)]" 
                    style={{ width: `${(stat.value / (ltvStats[0]?.value || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          {ltvStats.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-teal-dark/20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-dark/20 leading-loose">Awaiting fulfillment<br/>conversion data</p>
            </div>
          )}
        </Card>
      </div>

      {/* Grid for Funnel Velocity & Source Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Lead Source Bar Chart */}
         <Card variant="glass" className="border-white/20 p-7 shadow-xl shadow-teal-dark/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-teal-base/20 rounded-xl">
                <BarChart3 className="w-5 h-5 text-teal-dark" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-teal-dark">Channel Efficiency</h2>
            </div>
            <div className="space-y-6">
              {sourceStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-6 group">
                  <span className="text-[10px] font-black text-teal-dark/30 w-24 truncate text-right uppercase tracking-[0.15em] group-hover:text-teal-dark transition-colors">{stat.name}</span>
                  <div className="flex-1 h-10 bg-white/10 rounded-2xl overflow-hidden border border-white/10 flex items-center px-1 shadow-inner">
                    <div 
                      className="h-8 bg-teal-dark rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-1000 flex items-center justify-end px-3 hover:bg-teal-base transition-all"
                      style={{ width: `${(stat.value / Math.max(...sourceStats.map(s => s.value), 1)) * 100}%` }}
                    >
                      <span className="text-[10px] font-black text-white tabular-nums">{stat.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         </Card>

         <Card className="bg-teal-dark text-white border-none shadow-2xl shadow-teal-dark/40 overflow-hidden relative p-8 flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 opacity-10 blur-3xl w-64 h-64 bg-teal-light rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/60">Funnel Dynamics</h2>
              </div>
              
              <div className="space-y-5 flex-1">
                {velocity.length > 0 ? velocity.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5 backdrop-blur-sm group">
                    <div className="flex flex-col gap-1">
                       <span className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-light group-hover:text-white transition-colors">{v.stage}</span>
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">Stage Residence</span>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black tabular-nums">{v.avgDays}<span className="text-sm ml-1 text-white/40">D</span></span>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center text-white/30">
                    <TrendingUp className="w-8 h-8 mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">History needed for<br/>velocity plotting</p>
                  </div>
                )}
              </div>
            </div>

            <Button 
              size="lg"
              className="mt-10 relative z-10 bg-white text-teal-dark hover:bg-teal-light hover:scale-[1.02] transition-all font-black uppercase tracking-[0.2em] text-xs h-14 rounded-[20px] shadow-2xl"
              onClick={handleAnalyze}
            >
              Run Diagnostic <TrendingUp className="w-5 h-5 ml-3" />
            </Button>
         </Card>
      </div>
    </div>
  );
}
