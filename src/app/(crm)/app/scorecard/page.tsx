"use client";

import { useAuth } from "@/lib/firebase/context/auth";
import { useQuery } from "@tanstack/react-query";
import { getActivationPipeline, getRepMonthlyStats } from "@/lib/firebase/services/crm";
import { Card, CardContent } from "@/components/shared/Card";
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  TrendingDown,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Insight = {
  type: "warning" | "success";
  text: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function ScorecardPage() {
  const { user } = useAuth();
  const repId = user?.uid || "";

  const { data: stats } = useQuery({
    queryKey: ['rep-stats-full', repId],
    queryFn: () => getRepMonthlyStats(repId),
    enabled: !!repId,
  });

  const { data: activationPipeline = [] } = useQuery({
    queryKey: ["rep-activation-pipeline", repId],
    queryFn: () => getActivationPipeline(repId),
    enabled: !!repId,
  });

  const monthLabel = format(new Date(), "MMMM yyyy");
  const goal = stats?.goal || 10;
  const wonDeals = stats?.wonDeals || 0;
  const goalProgress = goal > 0 ? Math.min((wonDeals / goal) * 100, 100) : 0;
  const onTrack = goal > 0 && goalProgress >= 75;

  const metrics = [
    {
      name: "Personal Win Rate",
      value: `${stats?.winRate || 0}%`,
      target: "75%",
      icon: TrendingUp,
      trend: (stats?.winRate || 0) >= 75 ? "up" : "down",
      status: (stats?.winRate || 0) >= 75 ? "good" : "warning",
    },
    {
      name: "Avg. Activation",
      value: stats?.avgActivationDays ? `${stats.avgActivationDays} Days` : "--",
      target: "10 Days",
      icon: Activity,
      trend: (stats?.avgActivationDays || 0) <= 10 ? "up" : "down",
      status: (stats?.avgActivationDays || 0) <= 10 ? "good" : "warning",
    },
    {
      name: "New Accounts",
      value: stats?.wonDeals || 0,
      target: goal,
      icon: Users,
      trend: wonDeals > 0 ? "up" : "down",
      status: wonDeals >= goal ? "perfect" : wonDeals > 0 ? "good" : "warning",
    },
    {
      name: "Response Time",
      value: "--",
      target: "Needs tracking",
      icon: Zap,
      trend: "up",
      status: "perfect",
    },
  ];

  const insights: Insight[] = [];

  if ((stats?.avgActivationDays || 0) > 10) {
    insights.push({
      type: "warning",
      text: `Your activation average is ${stats?.avgActivationDays} days. Push first orders on ${activationPipeline.length} accounts waiting to activate.`,
    });
  }

  if ((stats?.overdueFollowUps || 0) > 0) {
    insights.push({
      type: "warning",
      text: `You have ${stats?.overdueFollowUps} overdue follow-ups. Clearing those first should tighten your conversion pace.`,
    });
  }

  if ((stats?.winRate || 0) >= 70) {
    insights.push({
      type: "success",
      text: `Your ${stats?.winRate}% win rate is above target. Keep the outreach velocity up while momentum is strong.`,
    });
  }

  if ((stats?.wonDeals || 0) >= goal) {
    insights.push({
      type: "success",
      text: `Goal hit. You have already signed ${stats?.wonDeals} new accounts this month, so the next push is activation and renewals.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      text: `You are building from ${stats?.leadsAssigned || 0} assigned leads this month. Keep stacking touches and quotes to move the board.`,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in overscroll-y-contain p-6 duration-500 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-teal-dark">Performance Scorecard</h1>
          <p className="text-brown/60 mt-1 uppercase text-xs font-bold tracking-widest">{monthLabel} Tracking</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold",
          onTrack ? "border-gold/20 bg-gold/10 text-gold" : "border-teal-base/20 bg-teal-base/10 text-teal-dark"
        )}>
          <Trophy className="w-4 h-4" />
          {onTrack ? "On track for bonus pace" : "Needs a stronger finish"}
        </div>
      </div>

      <Card className="bg-teal-dark text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Target className="w-64 h-64" />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-teal-base font-bold uppercase tracking-widest text-xs mb-2">Monthly Sign-up Goal</p>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-bold font-heading">{wonDeals}</span>
                <span className="text-2xl opacity-40 font-heading">/ {goal}</span>
              </div>
              <div className="mt-6 space-y-2">
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold h-full transition-all duration-1000" 
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <p className="text-sm opacity-60 font-medium">
                  You need {Math.max(goal - wonDeals, 0)} more sign-ups to hit your bonus bracket.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Pipeline Value</p>
                  <p className="text-xl font-bold font-heading">{formatCurrency(stats?.pipelineValue || 0)}</p>
               </div>
               <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Closing %</p>
                  <p className="text-xl font-bold font-heading">{stats?.closingRate || 0}%</p>
               </div>
               <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Activations</p>
                  <p className="text-xl font-bold font-heading">{stats?.activationsThisMonth || 0}</p>
               </div>
               <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Est. Commission</p>
                  <p className="text-xl font-bold font-heading text-gold">{formatCurrency(stats?.commissionEstimate || 0)}</p>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <Card key={idx} className="border-gray-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-2 rounded-xl",
                  m.status === 'perfect' ? 'bg-teal-base/10 text-teal-dark' :
                  m.status === 'good' ? 'bg-blue-50 text-blue-600' :
                  'bg-orange/10 text-orange'
                )}>
                  <m.icon className="w-5 h-5" />
                </div>
                {m.trend === 'up' ? <TrendingUp className="w-4 h-4 text-teal-dark" /> : <TrendingDown className="w-4 h-4 text-orange" />}
              </div>
              <p className="text-[10px] font-bold text-brown/40 uppercase tracking-widest mb-1">{m.name}</p>
              <p className="text-2xl font-bold font-heading text-brown">{m.value}</p>
              <p className="text-xs text-brown/50 mt-2">Target: <span className="font-bold">{m.target}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-orange/20 bg-orange/5">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-orange uppercase tracking-widest mb-4">Strategic Insights</h3>
          <ul className="space-y-4">
            {insights.slice(0, 3).map((insight) => (
              <li key={insight.text} className={cn("flex items-start gap-4", insight.type === "success" ? "text-teal-dark" : "")}>
                <div
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    insight.type === "success" ? "bg-teal-base/20 text-teal-dark" : "bg-orange/20 text-orange"
                  )}
                >
                  {insight.type === "success" ? <Zap size={14} /> : <AlertCircle size={14} />}
                </div>
                <p className={cn("text-sm font-medium", insight.type === "success" ? "text-teal-dark" : "text-brown")}>
                  {insight.text}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function AlertCircle({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
