"use client";

import { 
  Building2, 
  MapPin, 
  ChevronLeft, 
  MoreHorizontal, 
  Check, 
  X, 
  Edit3, 
  Trash2,
  Share2,
  Globe,
  Phone,
  Plus
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/shared/DropdownMenu";

interface CompanyHeaderProps {
  name: string;
  status: string;
  industry?: string;
  address?: string;
  website?: string;
  phone?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddCommitment?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  backUrl: string;
}

export const CompanyHeader = ({
  name,
  status,
  industry = "Corporate Client",
  address,
  website,
  phone,
  onEdit,
  onDelete,
  onAddCommitment,
  isEditing,
  onSave,
  onCancel,
  isSubmitting,
  backUrl
}: CompanyHeaderProps) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Breadcrumb */}
      <Link 
        href={backUrl}
        className="flex items-center text-xs font-black uppercase tracking-[0.34em] text-brown/40 hover:text-teal-base transition-colors w-fit group font-heading"
      >
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
        Back to Accounts
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-teal-dark/10">
        <div className="flex items-start gap-5">
          {/* Company Icon Container */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-teal-base/10 flex items-center justify-center border border-teal-base/20 shadow-sm">
              <Building2 className="w-8 h-8 text-teal-dark" />
            </div>
            {/* Status Indicator Pulse */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cream dark:bg-zinc-900 border-2 border-white dark:border-teal-base/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-teal-base animate-pulse shadow-[0_0_8px_rgba(84,191,165,0.5)]" />
            </div>
          </div>

          <div className="space-y-1.5 font-heading">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black uppercase tracking-tight text-teal-dark">
                {name || "Unidentified Entity"}
              </h1>
              <Badge variant="neutral" className="bg-white dark:bg-white/5 border-teal-dark/10 text-[10px] font-black tracking-widest uppercase px-2 shadow-sm text-teal-dark/60 dark:text-brown/60">
                {status}
              </Badge>
              {status === "Active" && (
                <Badge variant="neutral" className="bg-teal-base/10 text-teal-dark border-teal-base/20 text-[10px] font-black tracking-widest uppercase px-2">
                  VIP PARTNER
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-black uppercase tracking-widest text-brown/40 font-body">
              <div className="flex items-center gap-1.5 text-teal-base font-black">
                <MapPin className="w-3.5 h-3.5" />
                {address || "San Francisco, CA"}
              </div>
              {website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 opacity-40 text-brown" />
                  {website.replace(/^https?:\/\//, '')}
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 opacity-40 text-brown" />
                  {phone}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brown/20" />
                {industry}
              </div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={onCancel} 
                className="h-10 rounded-xl px-5 font-black text-[10px] uppercase tracking-widest border-teal-dark/10 text-brown/40 hover:bg-teal-dark/5 transition-all font-heading"
              >
                <X className="w-3.5 h-3.5 mr-2" />
                Abort
              </Button>
              <Button 
                onClick={onSave} 
                disabled={isSubmitting}
                className="h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest bg-teal-base text-teal-dark shadow-glass hover:bg-teal-base/90 transition-all font-heading"
              >
                <Check className="w-3.5 h-3.5 mr-2" />
                {isSubmitting ? "Syncing..." : "Finalize Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onEdit} 
                className="h-10 rounded-xl px-5 font-black text-[10px] uppercase tracking-widest border-teal-base/20 hover:border-teal-base/50 hover:bg-teal-base/5 text-teal-dark transition-all font-heading"
              >
                <Edit3 className="w-3.5 h-3.5 mr-2" />
                Update Profile
              </Button>
              
              {onAddCommitment && (
                <Button 
                  onClick={onAddCommitment}
                  className="h-10 rounded-xl px-5 font-black text-[10px] uppercase tracking-widest bg-teal-dark hover:bg-teal-dark/90 text-white shadow-glass transition-all font-heading"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  Initiate Protocol
                </Button>
              )}

              <div className="h-8 w-px bg-teal-dark/10 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-teal-dark/10 text-brown/40 hover:bg-teal-dark/5">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl border-teal-dark/10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-1 shadow-glass">
                  <DropdownMenuItem className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-teal-dark/70 py-2.5 cursor-pointer">
                    <Share2 className="w-4 h-4 text-teal-dark/30" />
                    Broadcast Profile
                  </DropdownMenuItem>
                  <div className="h-px bg-teal-dark/10 my-1" />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-orange mx-1 py-2.5 cursor-pointer focus:bg-orange/5 focus:text-orange"
                  >
                    <Trash2 className="w-4 h-4 text-orange/40" />
                    Archive Entity
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
