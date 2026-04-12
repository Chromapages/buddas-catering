import { Badge } from "@/components/shared/Badge";
import { Activity, PieChart, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SourceBreakdownWidget({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 5);
  const total = sorted.reduce((acc, curr) => acc + curr.value, 0);
  
  return (
    <div className="flex flex-col h-full bg-v-surface rounded-[24px] border border-v-outline/20 shadow-ambient overflow-hidden">
      <div className="px-6 py-5 border-b border-v-outline/20 bg-v-container/30">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-v-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-v-on-surface">Source Performance</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-v-outline/20">
          {sorted.map((item, idx) => {
            const percentage = Math.round((item.value / total) * 100);
            return (
              <div key={idx} className="p-4 px-6 hover:bg-v-container/30 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-v-on-surface tracking-tight">{item.name}</span>
                  <span className="text-[11px] font-bold text-v-on-surface tabular-nums">{item.value} leads</span>
                </div>
                <div className="relative h-1 w-full bg-v-outline/10 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-v-primary rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RepActivityWidget({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="flex flex-col h-full bg-v-surface rounded-[24px] border border-v-outline/20 shadow-ambient overflow-hidden">
      <div className="px-6 py-5 border-b border-v-outline/20 bg-v-container/30">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-v-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-v-on-surface">Rep Engagement</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-v-outline/20">
          {data.map((item, idx) => (
            <div key={idx} className="p-4 px-6 hover:bg-v-container/30 transition-colors flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-v-on-surface tracking-tight">{item.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-v-on-surface/20">Last 7 Days</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-v-primary tabular-nums">{item.count}</span>
                <ChevronRight className="h-3 w-3 text-v-on-surface/20 group-hover:text-v-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivationPipelineWidget({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="flex flex-col h-full bg-v-surface rounded-[24px] border border-v-outline/20 shadow-ambient overflow-hidden">
      <div className="px-6 py-5 border-b border-v-outline/20 bg-v-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-v-secondary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-v-on-surface">Activation Pipeline</h3>
          </div>
          <Badge className="bg-v-secondary/10 text-v-secondary border-transparent text-[9px] uppercase tracking-widest px-3">{data.length} Alerts</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-v-outline/20">
          {data.map((company, idx) => (
            <div key={idx} className="p-4 px-6 hover:bg-v-container/30 transition-all flex flex-col group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-bold text-v-on-surface tracking-tight group-hover:text-v-secondary transition-colors underline-offset-4 decoration-v-secondary/30 group-hover:underline">{company.name}</span>
                <Link href={`/app/companies/${company.id}`} className="p-1 px-3 rounded-full bg-v-on-surface/5 text-[9px] font-black uppercase tracking-widest text-v-on-surface/40 hover:bg-v-secondary hover:text-white transition-all opacity-0 group-hover:opacity-100">
                  Profile
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-v-secondary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-v-on-surface/20">Enrolled, no orders</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
