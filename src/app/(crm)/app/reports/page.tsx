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
import { getLeadSourceStats } from "@/lib/firebase/services/crm";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [sourceStats, setSourceStats] = useState<{name: string, value: number}[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getLeadSourceStats();
        setSourceStats(stats);
      } catch (err) {
        console.error("Error loading report stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const reports = [
    { title: "Total Revenue by Rep", icon: DollarSign, desc: "Pipeline and closed-won grouped by sales representative.", priority: "High" },
    { title: "Win Rate by Rep", icon: Target, desc: "Conversion percentages from New Lead to Approved.", priority: "Med" },
    { title: "Event Type Breakdown", icon: BarChart3, desc: "Volume of Breakfast vs Lunch vs Pastries.", priority: "Low" },
    { title: "Lost Reasons", icon: TrendingUp, desc: "Analysis of disqualified or lost CRM entries.", priority: "Med" },
    { title: "Upcoming Events (30 Days)", icon: Calendar, desc: "Schedule density and capacity planning view.", priority: "High" },
    { title: "Commission Payouts Due", icon: Users, desc: "Approved commissions pending payroll processing.", priority: "Med" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brown/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Generating analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Reports & Analytics</h1>
          <p className="text-sm text-brown/70 mt-1 italic">Real-time catering performance and ROI tracking.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export All Data</Button>
          <Button className="bg-teal-dark">Custom Report</Button>
        </div>
      </div>

      {/* Snapshot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-teal-base/20 overflow-hidden">
          <CardHeader className="bg-teal-dark/5 border-b border-teal-base/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-base" /> Leads by Acquisition Source
              </CardTitle>
              <span className="text-[10px] font-bold text-teal-dark/50 uppercase tracking-widest">Live Data</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-border">
              {sourceStats.length > 0 ? sourceStats.map((stat, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-bg/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-base shadow-sm"></div>
                    <span className="text-sm font-bold text-brown uppercase tracking-tight">{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-teal-dark">{stat.value} leads</span>
                    <div className="w-24 bg-gray-border/20 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div 
                        className="bg-teal-base h-full" 
                        style={{ width: `${(stat.value / sourceStats.reduce((a,b) => a + b.value, 0)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-brown/40 italic">
                  No lead source data available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insight */}
        <Card className="bg-teal-dark text-white border-none shadow-lg">
          <CardHeader>
             <CardTitle className="text-white/80 text-sm flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Growth Insights
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
             <div>
               <p className="text-3xl font-extrabold font-heading">+24%</p>
               <p className="text-xs text-white/60">Lead volume vs previous month</p>
             </div>
             <div className="space-y-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-light mb-1">Top Channel</p>
                  <p className="text-sm font-bold">Google Organic Search</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-light mb-1">Target ROI</p>
                  <p className="text-sm font-bold">12.4x Ad Spend</p>
                </div>
             </div>
             <Button variant="secondary" className="w-full bg-white text-teal-dark hover:bg-teal-light border-none">
               Run Full Audit <ArrowUpRight className="w-4 h-4 ml-2" />
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Standard Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <Card key={idx} className="hover:border-teal-base/50 transition-all cursor-pointer group hover:shadow-md">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-base/10 group-hover:bg-teal-base/20 transition-colors flex items-center justify-center">
                <report.icon className="w-7 h-7 text-teal-dark" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                   <h3 className="text-lg font-bold text-brown">{report.title}</h3>
                </div>
                <p className="text-xs text-brown/60 leading-relaxed max-w-[20ch] mx-auto">
                  {report.desc}
                </p>
              </div>
              <Button variant="ghost" className="w-full mt-2 text-teal-base group-hover:bg-teal-base group-hover:text-white transition-all text-sm font-bold">
                Launch Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
