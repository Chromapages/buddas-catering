"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";
import { 
  ShieldCheck, 
  User, 
  Calendar, 
  Activity, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Workflow,
  ShieldAlert,
  Zap,
  History,
  Settings2,
  UserSquare
} from "lucide-react";
import { Company, Commitment } from "@/types/crm";
import { format } from "date-fns";
import { useAuth } from "@/lib/firebase/context/auth";

interface AccountHealthPanelProps {
  company: Company;
  commitment: Commitment | null;
  lastActivityDate?: Date;
}

export function AccountHealthPanel({ company, commitment, lastActivityDate }: AccountHealthPanelProps) {
  const { user } = useAuth();
  
  const daysSinceActivity = lastActivityDate ? Math.floor((new Date().getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)) : 30;
  const slaHealth = daysSinceActivity < 7 ? 'HEALTHY' : daysSinceActivity < 14 ? 'WARNING' : 'CRITICAL';
  const slaText = `${daysSinceActivity}D TOH`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl border border-teal-dark/10 dark:border-white/5 p-8 rounded-[24px] shadow-glass relative overflow-hidden group">
      {/* Dynamic Glow Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-base/5 to-transparent opacity-0 group-hover:opacity-100 dark:group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
      
      {/* Header Diagnostic Label */}
      <div className="absolute top-4 left-6 flex items-center gap-2 pointer-events-none">
        <Activity className="w-3 h-3 text-teal-base/40" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-teal-dark/30 dark:text-teal-base/30">Protocol Diagnostic Output</span>
      </div>

      {/* 1. Owner Rep */}
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-[9px] font-black text-teal-dark/40 dark:text-teal-base/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <UserSquare className="w-3 h-3 opacity-40 shrink-0" />
          Owner Rep
        </span>
        <span className="text-[12px] font-black text-teal-dark dark:text-brown uppercase tracking-widest break-words">
          {!company.assignedRepId ? 'UNASSIGNED' : company.assignedRepId === user?.uid ? 'YOU' : 'SERVICE TEAM'}
        </span>
      </div>

      {/* 2. Tier */}
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-[9px] font-black text-teal-dark/40 dark:text-teal-base/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <ShieldAlert className="w-3 h-3 opacity-40 shrink-0" />
          Tier
        </span>
        <span className="text-[12px] font-black text-teal-base uppercase tracking-widest">
          {commitment?.tier ? `TIER ${commitment.tier}` : 'PROSPECT'}
        </span>
      </div>

      {/* 3. Lifecycle */}
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-[9px] font-black text-teal-dark/50 dark:text-teal-base/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Workflow className="w-3 h-3 opacity-40 shrink-0" />
          Lifecycle
        </span>
        <Badge variant="neutral" className={cn(
          "w-fit px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
          commitment ? "bg-teal-base/10 text-teal-base border-teal-base/20" : "bg-orange-500/5 text-orange-500 border-orange-500/10"
        )}>
          {commitment ? 'ACTIVE' : 'PROSPECT'}
        </Badge>
      </div>

      {/* 4. First Order */}
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-[9px] font-black text-teal-dark/50 dark:text-teal-base/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Zap className="w-3 h-3 opacity-40 shrink-0" />
          First Order
        </span>
        <div className="flex items-center gap-2">
          {company.firstOrderPlaced ? (
            <span className="text-[10px] font-black text-teal-base uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> VERIFIED
            </span>
          ) : (
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> PENDING
            </span>
          )}
        </div>
      </div>

      {/* 5. Renewal */}
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-[9px] font-black text-teal-dark/50 dark:text-teal-base/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Calendar className="w-3 h-3 opacity-40 shrink-0" />
          Renewal
        </span>
        <span className="text-[12px] font-black text-teal-dark dark:text-brown uppercase tracking-widest">
          {commitment?.renewalDate?.seconds ? format(commitment.renewalDate.seconds * 1000, 'MM/yy') : 'N/A'}
        </span>
      </div>

      {/* 6. SLA Clock */}
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-[9px] font-black text-teal-dark/50 dark:text-teal-base/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <History className="w-3 h-3 opacity-40 shrink-0" />
          SLA Clock
        </span>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
          slaHealth === 'CRITICAL' ? "text-red-600 animate-pulse" : 
          slaHealth === 'WARNING' ? "text-orange-600" : "text-teal-dark/70 dark:text-brown/60"
        )}>
          {slaHealth === 'HEALTHY' ? <CheckCircle2 className="w-3 h-3 text-teal-base" /> : <Clock className="w-3 h-3" />}
          {slaText}
        </span>
      </div>

      {/* 7. Directive */}
      <div className="flex flex-col gap-2 lg:border-l lg:border-teal-dark/10 dark:lg:border-white/10 lg:pl-6 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-teal-dark/50 dark:text-teal-base/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Settings2 className="w-3 h-3 opacity-40 shrink-0" />
            Directive
          </span>
          <Badge className={cn(
            "text-[8px] font-black border uppercase tracking-widest px-2 py-0.5 rounded-full scale-90",
            slaHealth === 'CRITICAL' ? "bg-red-500/10 text-red-600 border-red-500/20" : 
            "bg-teal-base/10 text-teal-base border-teal-base/20"
          )}>
            {slaHealth === 'HEALTHY' ? 'SLA PASS' : 'ACTION REQUIRED'}
          </Badge>
        </div>
        <span className="text-[10px] font-black text-teal-dark/40 dark:text-brown/40 uppercase tracking-widest italic line-clamp-1">
          {company.notes || 'NONE'}
        </span>
      </div>
    </div>
  );
}
