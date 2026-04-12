"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  ShoppingCart, 
  MessageSquare, 
  Settings2 
} from "lucide-react";

interface ContactTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "communications", label: "Communications", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export const ContactTabs = ({
  activeTab,
  onTabChange
}: ContactTabsProps) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-v-surface border border-v-outline/20 rounded-full w-fit shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all
              ${isActive ? 'text-white' : 'text-v-on-surface/40 hover:text-v-on-surface hover:bg-v-container'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-v-on-surface rounded-full shadow-lg shadow-v-on-surface/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-v-on-surface/30'}`} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
