"use client";

import { Card, CardContent } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { 
  ShieldCheck, 
  User, 
  Calendar, 
  ShoppingBag, 
  Activity, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Company, Commitment, CommitmentStatus } from "@/types/crm";
import { format } from "date-fns";
import { useAuth } from "@/lib/firebase/context/auth";

interface AccountHealthPanelProps {
  company: Company;
  commitment: Commitment | null;
  lastActivityDate?: Date;
}

export function AccountHealthPanel({ company, commitment, lastActivityDate }: AccountHealthPanelProps) {
  const { user } = useAuth();
  const isEnrolled = !!commitment;
  const hasBooked = company.firstOrderPlaced;
  
  // SLA logic: 7 days without activity is Warning, 14 days is Danger
  const daysSinceActivity = lastActivityDate ? Math.floor((new Date().getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)) : 30;
  const slaStatus = daysSinceActivity < 7 ? 'good' : daysSinceActivity < 14 ? 'warning' : 'danger';

  return (
    <Card className="bg-white border-2 border-teal-base/10 shadow-sm overflow-hidden">
      <div className="bg-teal-base/5 px-4 py-2 border-b border-teal-base/10 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-dark flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3" />
          Enterprise Health Diagnostic
        </span>
        <Badge variant={slaStatus === 'good' ? 'success' : slaStatus === 'warning' ? 'warning' : 'danger'} className="text-[9px] h-4">
          {slaStatus === 'good' ? 'SLA PASS' : 'SLA ATTENTION'}
        </Badge>
      </div>
      
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-2">
          {/* 1. Owner Rep */}
          <div className="space-y-1 lg:border-r border-gray-border/50 lg:pr-4">
            <span className="text-[10px] font-bold text-brown/40 uppercase block">Owner Rep</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-base/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-teal-dark" />
              </div>
              <span className="text-xs font-bold text-brown">
                {!company.assignedRepId
                  ? 'Unassigned'
                  : company.assignedRepId === user?.uid
                    ? user?.displayName || 'You'
                    : 'Assigned Rep'}
              </span>
            </div>
          </div>

          {/* 2. Commitment Tier */}
          <div className="space-y-1 lg:border-r border-gray-border/50 lg:px-4">
            <span className="text-[10px] font-bold text-brown/40 uppercase block">Tier</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-teal-base">{commitment ? `Tier ${commitment.tier}` : 'None'}</span>
              {commitment?.active && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* 3. Lifecycle Status */}
          <div className="space-y-1 lg:border-r border-gray-border/50 lg:px-4">
            <span className="text-[10px] font-bold text-brown/40 uppercase block">Status</span>
            <Badge variant={isEnrolled ? 'success' : 'neutral'} className="text-[10px]">
              {isEnrolled ? 'Enrolled' : 'Prospect'}
            </Badge>
          </div>

          {/* 4. Booking State */}
          <div className="space-y-1 lg:border-r border-gray-border/50 lg:px-4">
            <span className="text-[10px] font-bold text-brown/40 uppercase block">First Order</span>
            <div className="flex items-center gap-1.5">
              {hasBooked ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange" />
              )}
              <span className={`text-[11px] font-bold ${hasBooked ? 'text-green-600' : 'text-orange'}`}>
                {hasBooked ? 'Booked' : 'Pending'}
              </span>
            </div>
          </div>

          {/* 5. Renewal State */}
          <div className="space-y-1 lg:border-r border-gray-border/50 lg:px-4">
            <span className="text-[10px] font-bold text-brown/40 uppercase block">Renewal</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-brown">
                {commitment?.endDate ? format(commitment.endDate.toDate(), 'MMM yy') : 'N/A'}
              </span>
              {commitment?.status === 'Expiring' && (
                <span className="text-[9px] font-bold text-orange uppercase tracking-tighter">Due Soon</span>
              )}
            </div>
          </div>

          {/* 6. Recent Activity */}
          <div className="space-y-1 lg:border-r border-gray-border/50 lg:px-4">
            <span className="text-[10px] font-bold text-brown/40 uppercase block">Last Touched</span>
            <div className="flex items-center gap-1.5 text-brown">
              <Clock className="w-3.5 h-3.5 text-brown/30" />
              <span className="text-[11px] font-bold">{daysSinceActivity}d ago</span>
            </div>
          </div>

          {/* 7. Next Task */}
          <div className="space-y-1 lg:pl-4">
            <span className="text-[10px] font-bold text-brown/40 uppercase block">Next Task</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-base/30" />
              <span className="text-[11px] font-bold text-brown/40 truncate">—</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
