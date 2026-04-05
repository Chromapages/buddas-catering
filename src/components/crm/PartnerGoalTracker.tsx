"use client";

import { Card, CardContent } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { 
  Trophy, 
  TrendingUp, 
  ChevronRight,
  Target,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PartnerGoalTrackerProps {
  companyName: string;
  currentTier: string;
  eventsCompleted: number;
  eventsGoal: number;
  totalSavings: number;
  nextTierDiscount?: string;
  className?: string;
}

export function PartnerGoalTracker({
  companyName,
  currentTier,
  eventsCompleted,
  eventsGoal,
  totalSavings,
  nextTierDiscount = "20%",
  className
}: PartnerGoalTrackerProps) {
  const progressPercent = Math.min(Math.round((eventsCompleted / eventsGoal) * 100), 100);
  const eventsRemaining = Math.max(eventsGoal - eventsCompleted, 0);

  return (
    <Card className={cn("overflow-hidden border-none shadow-xl bg-white", className)}>
      {/* Premium Header Gradient */}
      <div className="h-2 w-full bg-gradient-to-r from-teal-dark via-teal-base to-gold"></div>
      
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          
          {/* Circular Progress Section */}
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * progressPercent) / 100}
                className="text-teal-dark transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-brown">{eventsCompleted}</span>
              <span className="text-[10px] uppercase font-bold text-brown/40 tracking-widest">Events</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-grow space-y-6 text-center md:text-left w-full">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Badge className="bg-gold/10 text-gold border-gold/20 text-[10px] font-black tracking-tighter hover:bg-gold/20">
                  {currentTier} PARTNER
                </Badge>
                {progressPercent === 100 && (
                  <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-brown font-heading">{companyName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-bg/50 rounded-2xl p-4 border border-gray-border/50 transition-all hover:border-teal-base/30 group">
                <div className="flex items-center gap-2 mb-1 text-brown/40 group-hover:text-teal-dark transition-colors">
                  <Target className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Goal Progress</span>
                </div>
                <p className="text-lg font-black text-brown">
                  {progressPercent}% <span className="text-xs font-medium text-brown/50">to next tier</span>
                </p>
              </div>

              <div className="bg-teal-base/5 rounded-2xl p-4 border border-teal-base/10 transition-all hover:border-teal-base/30 group">
                <div className="flex items-center gap-2 mb-1 text-teal-dark/60">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Savings to Date</span>
                </div>
                <p className="text-lg font-black text-teal-dark">
                  ${totalSavings.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Next Milestone CTA */}
            {eventsRemaining > 0 ? (
              <div className="flex items-center justify-between p-4 bg-orange/5 rounded-2xl border border-orange/10 group cursor-pointer hover:bg-orange/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center text-orange group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brown leading-tight">Next Milestone</p>
                    <p className="text-xs text-brown/60">{eventsRemaining} more events until {nextTierDiscount} discount</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-orange/40 group-hover:translate-x-1 transition-transform" />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gold/10 rounded-2xl border border-gold/20">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brown leading-tight">Top Tier Achievement</p>
                  <p className="text-xs text-brown/60">Currently receiving maximum platform benefits.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
