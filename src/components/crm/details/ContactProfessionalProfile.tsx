"use client";

import { 
  User, 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Instagram, 
  Star, 
  Award, 
  ExternalLink,
  Camera,
  Layers,
  Laptop
} from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { format } from "date-fns";
import Link from "next/link";

interface ContactProfessionalProfileProps {
  contact: any;
  company?: any;
  editing?: boolean;
  onEditChange?: (field: string, value: any) => void;
}

export const ContactProfessionalProfile = ({ 
  contact, 
  company, 
  editing, 
  onEditChange 
}: ContactProfessionalProfileProps) => {
  const joinedDate = contact.createdAt?.seconds 
    ? format(contact.createdAt.seconds * 1000, "MMM d, yyyy") 
    : "Jan 15, 2022";

  return (
    <Card className="border-none shadow-none bg-transparent overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-body">
        
        {/* Pod 1: Profile Photo (3 cols) */}
        <div className="md:col-span-3 md:row-span-2 bg-white rounded-[2rem] border border-gray-border/50 p-6 flex flex-col items-center justify-center min-h-[220px] shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-28 h-28 rounded-3xl bg-teal-base/5 border border-teal-base/10 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-[1.02] duration-300">
             <User className="w-14 h-14 text-teal-dark/40" />
             <div className="absolute inset-0 bg-gradient-to-tr from-teal-base/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="mt-4 text-[10px] font-medium text-brown/30 uppercase tracking-[0.2em] font-heading">Profile Photo</p>
        </div>

        {/* Pod 2: Name & Meta (6 cols) */}
        <div className="md:col-span-6 bg-white rounded-[2rem] border border-gray-border/50 p-8 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-brown/30 uppercase tracking-widest font-heading">Full Name</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl font-medium text-teal-dark tracking-tight">
                {editing ? (
                  <input 
                    className="bg-transparent border-b border-gray-border focus:border-teal-base outline-none w-full"
                    value={contact.fullName}
                    onChange={(e) => onEditChange?.("fullName", e.target.value)}
                  />
                ) : (
                  contact.fullName || "Alexander Thorne"
                )}
              </h2>
              <span className="text-xs font-normal text-brown/40 italic">(test.test Account User)</span>
            </div>
            <p className="text-xs font-normal text-brown/50">Joined: {joinedDate}</p>
          </div>
        </div>

        {/* Pod 3: Relationship Tier (3 cols) */}
        <div className="md:col-span-3 bg-white rounded-[2rem] border border-gray-border/50 p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-2 right-4">
             <Award className="w-8 h-8 text-teal-base/10" />
          </div>
          <p className="text-[10px] font-medium text-brown/30 uppercase tracking-widest mb-2 font-heading">Relationship Tier</p>
          <h3 className="text-xl font-medium text-teal-dark tracking-tighter uppercase mb-2">Premium Client</h3>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 fill-teal-base text-teal-base" />
            ))}
          </div>
        </div>

        {/* Pod 4: Primary Organization (3 cols) */}
        <div className="md:col-span-3 bg-white rounded-[2rem] border border-gray-border/50 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow relative">
          <div className="absolute top-5 right-5 opacity-20">
             <Camera className="w-5 h-5 text-teal-dark" />
          </div>
          <div className="flex items-center gap-2 mb-3">
             <Building2 className="w-4 h-4 text-teal-base" />
             <p className="text-[10px] font-medium text-brown/30 uppercase tracking-widest font-heading">Primary Organization</p>
          </div>
          <p className="text-lg font-medium text-teal-dark group-hover:text-teal-base transition-colors truncate">
            {company?.name || "L. Denise Photography"}
          </p>
          <p className="text-xs font-normal text-brown/50">{company?.companyType || "Commercial Studio, NY"}</p>
        </div>

        {/* Pod 5: Official Title (3 cols) */}
        <div className="md:col-span-3 bg-white rounded-[2rem] border border-gray-border/50 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow relative">
          <div className="absolute top-5 right-5 opacity-20">
             <Layers className="w-5 h-5 text-teal-dark" />
          </div>
          <div className="flex items-center gap-2 mb-3">
             <Briefcase className="w-4 h-4 text-teal-base" />
             <p className="text-[10px] font-medium text-brown/30 uppercase tracking-widest font-heading">Official Title</p>
          </div>
          <p className="text-lg font-medium text-teal-dark truncate">
            {editing ? (
              <input 
                className="bg-transparent border-b border-gray-border focus:border-teal-base outline-none w-full text-lg font-medium"
                value={contact.title}
                onChange={(e) => onEditChange?.("title", e.target.value)}
              />
            ) : (
              contact.title || "Owner"
            )}
          </p>
          <p className="text-xs font-normal text-brown/50">{contact.role || "Key Decision Maker"}</p>
        </div>

        {/* Pod 6: Specialties (3 cols vertical) */}
        <div className="md:col-span-3 bg-white rounded-[2rem] border border-gray-border/50 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow h-full font-heading">
           <p className="text-[10px] font-medium text-brown/30 uppercase tracking-widest mb-4">Specializations & Projects</p>
           <div className="flex flex-wrap gap-2">
              <Badge variant="neutral" className="bg-gray-bg/50 border-none rounded-xl py-1.5 px-3 flex items-center gap-2 group hover:bg-teal-base/10 transition-colors">
                <span className="text-[9px] font-medium text-teal-dark">Portraiture</span>
                <Camera className="w-3 h-3 text-teal-dark/30 group-hover:text-teal-dark" />
              </Badge>
              <Badge variant="neutral" className="bg-gray-bg/50 border-none rounded-xl py-1.5 px-3 flex items-center gap-2 group hover:bg-teal-base/10 transition-colors">
                <span className="text-[9px] font-medium text-teal-dark">Commercial</span>
                <Camera className="w-3 h-3 text-teal-dark/30 group-hover:text-teal-dark transition-colors" />
              </Badge>
              <Badge variant="neutral" className="bg-gray-bg/50 border-none rounded-xl py-1.5 px-3 flex items-center gap-2 group hover:bg-teal-base/10 transition-colors">
                <span className="text-[9px] font-medium text-teal-dark">Editing</span>
                <Laptop className="w-3 h-3 text-teal-dark/30 group-hover:text-teal-dark transition-colors" />
              </Badge>
           </div>
        </div>

        {/* Pod 7: Contact Information (9 cols) */}
        <div className="md:col-span-9 bg-white rounded-[2.5rem] border border-gray-border/50 p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
             <p className="text-[10px] font-medium text-brown/30 uppercase tracking-widest font-heading">Contact Information</p>
             <div className="flex items-center gap-10 mt-2">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-teal-base/5 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-teal-dark" />
                   </div>
                   <p className="text-sm font-normal text-brown truncate max-w-[180px]">{contact.email}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-teal-base/5 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-teal-dark" />
                   </div>
                   <p className="text-sm font-normal text-brown whitespace-nowrap">{contact.phone || "+1 (555) ***-0120"}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-teal-base/5 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-teal-dark" />
                   </div>
                   <p className="text-sm font-normal text-brown truncate max-w-[180px]">{company?.website || "Idenisephoto.com"}</p>
                </div>
             </div>
          </div>
          {/* Social Icons Pod nested visually if I wanted but let's keep it in the row */}
          <div className="flex gap-2.5">
             <div className="w-10 h-10 rounded-2xl bg-gray-bg/50 border border-gray-border/50 flex items-center justify-center hover:bg-teal-base/10 hover:border-teal-base/30 transition-all cursor-pointer">
                <Linkedin className="w-4 h-4 text-teal-dark/50" />
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gray-bg/50 border border-gray-border/50 flex items-center justify-center hover:bg-teal-base/10 hover:border-teal-base/30 transition-all cursor-pointer">
                <Instagram className="w-4 h-4 text-teal-dark/50" />
             </div>
          </div>
        </div>

        {/* Pod 8: Portfolio (3 cols) */}
        <div className="md:col-span-3 bg-white rounded-[2.5rem] border border-gray-border/50 p-6 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-bg/20">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-base border border-teal-base flex items-center justify-center shadow-lg shadow-teal-base/20 font-heading">
                 <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                 <p className="text-sm font-medium text-teal-dark tracking-tight font-heading">Portfolio & Website</p>
                 <Link href="#" className="text-[10px] font-normal text-brown/40 hover:text-teal-base flex items-center gap-1 transition-colors">
                    View Full Portfolio <ExternalLink className="w-2.5 h-2.5" />
                 </Link>
              </div>
           </div>
        </div>

      </div>
    </Card>
  );
};
