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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-teal-dark tracking-tight">Catering Intelligence</h1>
          <p className="text-sm text-brown/60 mt-1">Strategic performance insights and predictive lead analytics.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="border-teal-base/30 text-teal-dark font-bold hover:bg-teal-base/5"
            onClick={handleExport}
          >
            Snapshot Export
          </Button>
          <Button 
            className="bg-teal-dark hover:bg-teal-base shadow-teal-base/20 transition-all font-bold"
            onClick={handleCustomAudit}
          >
            Generate Custom Audit
          </Button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-teal-base/10 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-teal-base/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-teal-dark" />
              </div>
              <span className="text-[10px] font-bold text-teal-base uppercase tracking-widest bg-teal-base/5 px-2 py-1 rounded-full">Revenue</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-teal-dark">${repMetrics.reduce((a, b) => a + b.totalRevenue, 0).toLocaleString()}</h3>
              <p className="text-[10px] text-brown/50 font-bold uppercase tracking-tighter mt-1">Total Fulfilled Pipeline</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-teal-base/10 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded-full">Win Rate</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-teal-dark">
                {repMetrics.length > 0 ? Math.round(repMetrics.reduce((a, b) => a + b.closeRate, 0) / repMetrics.length) : 0}%
              </h3>
              <p className="text-[10px] text-brown/50 font-bold uppercase tracking-tighter mt-1">Avg Rep Conversion</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-teal-base/10 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-500/5 px-2 py-1 rounded-full">Deal Size</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-teal-dark">
                ${repMetrics.length > 0 ? Math.round(repMetrics.reduce((a, b) => a + b.avgDealSize, 0) / repMetrics.length).toLocaleString() : 0}
              </h3>
              <p className="text-[10px] text-brown/50 font-bold uppercase tracking-tighter mt-1">Average Order Value</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-teal-base/10 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-teal-dark/10 rounded-lg">
                <Calendar className="w-5 h-5 text-teal-dark" />
              </div>
              <span className="text-[10px] font-bold text-teal-dark uppercase tracking-widest bg-teal-dark/5 px-2 py-1 rounded-full">Velocity</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-teal-dark">
                {velocity.length > 0 ? Math.round(velocity.reduce((a, b) => a + b.avgDays, 0)) : 0}d
              </h3>
              <p className="text-[10px] text-brown/50 font-bold uppercase tracking-tighter mt-1">Avg Cycle to Close</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Performance Leaderboard */}
        <Card className="lg:col-span-2 shadow-sm border-teal-base/20 border-t-4 border-t-teal-dark">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-base" /> Sales Leaderboard
              </CardTitle>
              <div className="flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-teal-base animate-pulse"></div>
                 <span className="text-[10px] font-bold text-brown/40 uppercase tracking-widest">Performance Sync</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-bg border-y border-gray-border">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brown/50">Rep Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brown/50">Close Rate</th>
                    <th className="px-6 py-3 text-[10px) font-bold uppercase tracking-widest text-brown/50">Avg Deal</th>
                    <th className="px-6 py-3 text-[10px) font-bold uppercase tracking-widest text-brown/50 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-border">
                  {repMetrics.map((rep, idx) => (
                    <tr key={idx} className="hover:bg-teal-base/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm",
                            idx === 0 ? "bg-amber-100 text-amber-700" : "bg-teal-base/10 text-teal-dark"
                          )}>
                            {idx + 1}
                          </div>
                          <span className="font-bold text-teal-dark group-hover:text-teal-base transition-colors">{rep.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brown">{rep.closeRate}%</span>
                          <div className="w-16 h-1.5 bg-gray-border/30 rounded-full overflow-hidden">
                            <div className="bg-teal-base h-full" style={{ width: `${rep.closeRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-brown/70 text-sm">${rep.avgDealSize.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-3 py-1 bg-teal-dark text-white rounded-full text-xs font-bold shadow-sm shadow-teal-dark/10">
                          ${rep.totalRevenue.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Company Lifetime Value */}
        <Card className="shadow-sm border-teal-base/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-teal-base" /> Top Company LTV
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-6">
              {ltvStats.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-brown/70 truncate max-w-[150px] uppercase tracking-tight">{stat.name}</span>
                    <span className="font-black text-teal-dark">${stat.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-border/20 h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="bg-teal-base h-full transition-all duration-700 delay-100" 
                      style={{ width: `${(stat.value / ltvStats[0].value) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            {ltvStats.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-brown/40 italic">Data pending fulfillment...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid for Funnel Velocity & Source Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Pipeline Velocity Chart */}
         <Card className="shadow-sm border-teal-base/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-base" /> Channel Performance (Leads)
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {sourceStats.map((stat, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-brown/40 w-24 truncate text-right uppercase tracking-widest">{stat.name}</span>
                     <div className="flex-1 h-8 bg-gray-bg rounded-lg overflow-hidden border border-gray-border/10 flex items-center px-1">
                        <div 
                          className="h-6 bg-teal-dark/80 rounded-md shadow-sm transition-all duration-1000 flex items-center justify-end px-2"
                          style={{ width: `${(stat.value / Math.max(...sourceStats.map(s => s.value))) * 100}%` }}
                        >
                          <span className="text-[10px] font-bold text-white">{stat.value}</span>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
         </Card>

         <Card className="bg-teal-dark text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BarChart3 className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-white/80 text-sm flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Funnel Velocity (Avg Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
               {velocity.length > 0 ? velocity.map((v, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-black uppercase tracking-widest text-teal-light">{v.stage}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-xl font-extrabold">{v.avgDays} days</span>
                       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Time in stage</span>
                    </div>
                 </div>
               )) : (
                 <div className="py-8 text-center text-white/40 italic">
                   Velocity data requires status transition history.
                 </div>
               )}
               <Button 
                 variant="secondary" 
                 className="w-full bg-white text-teal-dark hover:bg-teal-light border-none font-bold py-6 rounded-2xl shadow-lg"
                 onClick={handleAnalyze}
               >
                 Analyze Bottlenecks <TrendingUp className="w-4 h-4 ml-2" />
               </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
