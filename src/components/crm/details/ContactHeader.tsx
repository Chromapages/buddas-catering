"use client";

import { 
  User, 
  MapPin, 
  ChevronLeft, 
  MoreHorizontal, 
  Check, 
  X, 
  Edit3, 
  Trash2,
  Share2,
  Mail,
  Phone,
  UserPlus
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

interface ContactHeaderProps {
  name: string;
  type: "LEAD" | "CONTACT";
  status: string;
  location?: string;
  email: string;
  phone?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onConvert?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  backUrl: string;
}

export const ContactHeader = ({
  name,
  type,
  status,
  location = "San Francisco, CA",
  email,
  phone,
  onEdit,
  onDelete,
  onConvert,
  isEditing,
  onSave,
  onCancel,
  isSubmitting,
  backUrl
}: ContactHeaderProps) => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-top-6 duration-700">
      {/* Breadcrumb */}
      <Link 
        href={backUrl}
        className="flex items-center text-[10px] font-black text-chef-muted uppercase tracking-[0.25em] hover:text-accent-fresh transition-all w-fit group"
      >
        <div className="h-8 w-8 rounded-full bg-chef-prep flex items-center justify-center mr-3 group-hover:bg-accent-fresh group-hover:text-white transition-all shadow-soft-low">
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
        Back to Intelligence Directory
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-chef-charcoal/10">
        <div className="flex items-start gap-8">
          {/* Avatar / Icon Container */}
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] bg-chef-prep flex items-center justify-center border border-chef-charcoal/5 shadow-soft-mid group overflow-hidden">
              <div className="absolute inset-0 bg-accent-fresh/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <User className="w-12 h-12 text-chef-muted group-hover:text-accent-fresh transition-colors" />
            </div>
            {/* Status Indicator Dot */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-chef-charcoal/5 flex items-center justify-center shadow-soft-mid">
              <div className="w-4 h-4 rounded-full bg-accent-fresh animate-pulse shadow-[0_0_12px_rgba(13,115,119,0.4)]" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-5xl font-black text-chef-charcoal tracking-tight leading-none">
                {name || "Untitled Profile"}
              </h1>
              <div className="flex gap-2">
                <Badge className="bg-chef-prep text-chef-muted border-chef-charcoal/5 text-[10px] font-black tracking-widest uppercase px-3 py-1 shadow-soft-low rounded-lg">
                  {status}
                </Badge>
                {type === "LEAD" && (
                  <Badge className="bg-accent-heat text-white border-transparent text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg shadow-soft-mid">
                    PRIORITY LEAD
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] font-black text-chef-muted uppercase tracking-[0.15em]">
              <div className="flex items-center gap-2.5 text-accent-fresh">
                <MapPin size={14} className="opacity-70" />
                {location}
              </div>
              <div className="flex items-center gap-2.5 hover:text-chef-charcoal transition-colors cursor-pointer">
                <Mail size={14} className="opacity-40" />
                <span className="normal-case tracking-tight text-sm font-bold">{email}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2.5 hover:text-chef-charcoal transition-colors cursor-pointer">
                  <Phone size={14} className="opacity-40" />
                  <span className="normal-case tracking-tight text-sm font-bold">{phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-4">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={onCancel} 
                className="h-14 rounded-[20px] px-8 text-[10px] font-black uppercase tracking-widest border-chef-charcoal/10 text-chef-muted hover:bg-chef-prep transition-all active:scale-95"
              >
                <X className="w-4 h-4 mr-2" />
                Abort Changes
              </Button>
              <Button 
                onClick={onSave} 
                disabled={isSubmitting}
                className="h-14 rounded-[20px] px-10 text-[10px] font-black uppercase tracking-widest bg-chef-charcoal text-white shadow-soft-mid border-none transition-all active:scale-95 hover:shadow-chef-charcoal/20"
              >
                <Check className="w-4 h-4 mr-2" />
                {isSubmitting ? "Executing..." : "Confirm Protocol"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onEdit} 
                className="h-14 rounded-[20px] px-8 text-[10px] font-black uppercase tracking-widest border-chef-charcoal/10 hover:border-accent-fresh/40 hover:bg-accent-fresh/5 text-chef-charcoal transition-all shadow-soft-low active:scale-95"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Modify Record
              </Button>
              
              {type === "LEAD" && onConvert && (
                <Button 
                  onClick={onConvert}
                  className="h-14 rounded-[20px] px-8 text-[10px] font-black uppercase tracking-widest bg-accent-heat hover:bg-accent-heat/90 text-white shadow-soft-mid border-none transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convert to Account
                </Button>
              )}

              <div className="h-8 w-px bg-chef-charcoal/10 mx-2" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-chef-charcoal/10 text-chef-muted hover:bg-chef-prep transition-all shadow-soft-low active:scale-95">
                    <MoreHorizontal className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-[24px] border-chef-charcoal/10 p-2.5 shadow-soft-mid bg-white overflow-hidden">
                  <DropdownMenuItem className="rounded-[16px] gap-4 text-[11px] font-black uppercase tracking-widest text-chef-muted py-4 focus:bg-chef-prep focus:text-chef-charcoal transition-all">
                    <Share2 className="w-4 h-4 text-accent-fresh" />
                    Broadcast Profile
                  </DropdownMenuItem>
                  <div className="h-px bg-chef-charcoal/[0.03] my-1" />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="rounded-[16px] gap-4 text-[11px] font-black uppercase tracking-widest text-accent-heat py-4 focus:bg-accent-heat/5 focus:text-accent-heat transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Purge Record
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
