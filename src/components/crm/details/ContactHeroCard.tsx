"use client";

import { Contact } from "@/types/crm";
import { 
  User, 
  Edit3, 
  Mail, 
  Phone, 
  Plus, 
  Calendar, 
  Trash2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

interface ContactHeroCardProps {
  contact: Contact;
  isEditing?: boolean;
  editData?: { fullName: string; title: string; email: string; phone: string };
  onEditChange?: (data: any) => void;
}

const IconButton = ({ icon: Icon, onClick, className = "" }: { icon: any, onClick?: () => void, className?: string }) => (
  <button 
    onClick={onClick}
    className={`p-2.5 rounded-xl bg-white/50 hover:bg-white text-brown/60 hover:text-teal-dark border border-white/40 shadow-sm transition-all hover:scale-105 active:scale-95 ${className}`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export const ContactHeroCard = ({ contact, isEditing, editData, onEditChange }: ContactHeroCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center p-6 bg-glass rounded-[24px] shadow-glass border border-white/30 w-full overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2">
        <IconButton icon={ExternalLink} className="!bg-transparent !border-none !shadow-none opacity-40 hover:opacity-100" />
      </div>

      {/* Avatar Container */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full border-4 border-white/60 overflow-hidden shadow-lg bg-teal-base/10 flex items-center justify-center">
          <User className="w-12 h-12 text-teal-dark/30" />
        </div>
        <div className="absolute bottom-0 right-0 p-1.5 bg-teal-dark rounded-full border-2 border-white text-white shadow-md">
          <Plus className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Contact Identity */}
      <div className="text-center space-y-0.5 mb-6 w-full">
        {isEditing && editData ? (
          <div className="space-y-3 px-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-widest font-black text-brown/30 ml-1">Full Name</label>
              <input 
                type="text" 
                value={editData.fullName}
                onChange={(e) => onEditChange?.({ ...editData, fullName: e.target.value })}
                className="w-full bg-white/50 border border-teal-base/20 rounded-xl px-4 py-2 text-sm text-center font-heading font-medium text-teal-dark focus:ring-2 focus:ring-teal-base/20 outline-none transition-all"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-widest font-black text-brown/30 ml-1">Title / Role</label>
              <input 
                type="text" 
                value={editData.title}
                onChange={(e) => onEditChange?.({ ...editData, title: e.target.value })}
                className="w-full bg-white/50 border border-teal-base/20 rounded-xl px-4 py-2 text-sm text-center font-heading font-medium text-teal-dark focus:ring-2 focus:ring-teal-base/20 outline-none transition-all"
                placeholder="Title / Role"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-heading font-medium text-teal-dark tracking-tight">
              {contact.fullName}
            </h2>
            <p className="text-[13px] font-body text-brown/50 leading-relaxed max-w-[200px] mx-auto">
              {contact.title || "No Title"} • {contact.companyName || "No Company"}
            </p>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <IconButton icon={Edit3} className="p-2" />
        <IconButton icon={Mail} className="p-2" />
        <IconButton icon={Phone} className="p-2" />
        <IconButton icon={Plus} className="p-2" />
        <IconButton icon={Calendar} className="p-2" />
        <IconButton icon={Trash2} className="p-2 hover:text-red-500 hover:bg-red-50" />
      </div>
    </motion.div>
  );
};
