"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Zap
} from "lucide-react";
import { Commitment } from "@/types/crm";
import { format } from "date-fns";

interface CommitmentProgressProps {
  commitment: Commitment;
}

export function CommitmentProgress({ commitment }: CommitmentProgressProps) {
  const usagePercent = Math.min(Math.round((commitment.ordersUsed / commitment.ordersCommitted) * 100), 100);
  const remaining = commitment.ordersRemaining || Math.max(commitment.ordersCommitted - commitment.ordersUsed, 0);
  
  const isExpiring = commitment.status === 'Expiring';
  const isLapsed = commitment.status === 'Lapsed';

  return (
    <Card className={`border-2 ${isExpiring ? 'border-orange/20 bg-orange/5' : 'border-teal-base/20'}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange" />
          <CardTitle className="text-lg text-brown font-heading font-semibold">Commitment Progress</CardTitle>
        </div>
        <Badge variant={isExpiring ? 'warning' : isLapsed ? 'danger' : 'success'}>
          {commitment.status}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tier & Usage Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-border/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brown/40">Tier</p>
            <p className="text-2xl font-black text-teal-dark">{commitment.tier}</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-border/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brown/40">Used</p>
            <p className="text-2xl font-black text-brown">{commitment.ordersUsed}</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-orange/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange/60">Remaining</p>
            <p className="text-2xl font-black text-orange">{remaining}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-brown/60 uppercase">
            <span>Utilization</span>
            <span>{usagePercent}%</span>
          </div>
          <div className="h-4 bg-gray-bg rounded-full overflow-hidden border border-gray-border/50">
            <div 
              className={`h-full transition-all duration-1000 ${
                usagePercent > 90 ? 'bg-orange' : 'bg-teal-base'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* Key Dates & Targets */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-brown/60">
              <Calendar className="h-4 w-4" />
              <span>Term Ends</span>
            </div>
            <span className="font-bold text-brown">
              {commitment.endDate && 'toDate' in commitment.endDate ? format((commitment.endDate as any).toDate(), "MMM d, yyyy") : 
               commitment.renewalDate && 'toDate' in commitment.renewalDate ? format((commitment.renewalDate as any).toDate(), "MMM d, yyyy") : "N/A"}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-brown/60">
              <TrendingUp className="h-4 w-4" />
              <span>Qualifying Min.</span>
            </div>
            <span className="font-bold text-teal-dark">$200 / Order</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-brown/60">
              <CheckCircle2 className={`h-4 w-4 ${commitment.firstOrderPlaced ? 'text-teal-base' : 'text-gray-300'}`} />
              <span>First Booking</span>
            </div>
            <span className={`font-bold ${commitment.firstOrderPlaced ? 'text-teal-base' : 'text-brown/40'}`}>
              {commitment.firstOrderPlaced ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>

        {isExpiring && (
          <div className="p-3 bg-orange/10 rounded-lg flex items-start gap-3 border border-orange/20">
            <AlertCircle className="h-5 w-5 text-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange">Action Required: Renewal Pending</p>
              <p className="text-xs text-orange/80">Account is within its 30-day renewal window. Initiate outreach immediately to lock in next term.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
