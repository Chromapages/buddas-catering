"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  Inbox, 
  Building2, 
  CalendarDays, 
  Gem, 
  ClipboardList, 
  ShieldAlert, 
  MenuSquare, 
  Settings, 
  LogOut,
  Plus,
  Command,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";

const commands = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard, category: "Navigation" },
  { name: "Inbox", href: "/app/inbox", icon: Inbox, category: "Navigation" },
  { name: "Leads", href: "/app/leads", icon: Users, category: "Navigation" },
  { name: "Companies", href: "/app/companies", icon: Building2, category: "Navigation" },
  { name: "Orders", href: "/app/orders", icon: CalendarDays, category: "Navigation" },
  { name: "Memberships", href: "/app/memberships", icon: Gem, category: "Navigation" },
  { name: "Approvals", href: "/app/approvals", icon: ShieldAlert, category: "Navigation" },
  { name: "Menus", href: "/app/menus", icon: MenuSquare, category: "Navigation" },
  { name: "Settings", href: "/app/settings", icon: Settings, category: "System" },
  
  { name: "Create New Lead", href: "/app/leads/new", icon: Plus, category: "Quick Actions" },
  { name: "Create New Order", href: "/app/orders/new", icon: Plus, category: "Quick Actions" },
  { name: "Add New Company", href: "/app/companies?add=true", icon: Plus, category: "Quick Actions" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const { signOut } = useAuth();

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    return commands.filter(cmd => 
      cmd.name.toLowerCase().includes(query.toLowerCase()) || 
      cmd.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const toggle = useCallback((e: KeyboardEvent) => {
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", toggle);
    return () => window.removeEventListener("keydown", toggle);
  }, [toggle]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    }
    if (e.key === "Enter" && filteredCommands[activeIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[activeIndex]);
    }
  };

  const handleSelect = (cmd: typeof commands[0]) => {
    router.push(cmd.href);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        {/* Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-brown/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Palette */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-border"
          onKeyDown={handleKeyDown}
        >
          <div className="p-4 border-b border-gray-border flex items-center gap-3">
            <Search className="w-5 h-5 text-brown/40" />
            <input 
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-brown text-lg placeholder:text-brown/30"
              placeholder="Search commands, pages, or actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-bg rounded-md border border-gray-border/50">
              <span className="text-[10px] font-bold text-brown/40 uppercase tracking-widest">ESC to close</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length > 0 ? (
              <div className="space-y-2">
                {["Navigation", "Quick Actions", "System"].map(category => {
                  const categoryCmds = filteredCommands.filter(c => c.category === category);
                  if (categoryCmds.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-1">
                      <div className="px-3 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brown/40">{category}</span>
                      </div>
                      {categoryCmds.map((cmd) => {
                        const globalIndex = filteredCommands.indexOf(cmd);
                        const isActive = globalIndex === activeIndex;
                        
                        return (
                          <button
                            key={cmd.name}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group",
                              isActive 
                                ? "bg-teal-base text-white shadow-lg shadow-teal-base/20 translate-x-1" 
                                : "hover:bg-gray-bg text-brown hover:translate-x-1"
                            )}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                isActive ? "bg-white/20" : "bg-gray-bg group-hover:bg-white"
                              )}>
                                <cmd.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-brown/60")} />
                              </div>
                              <span className="font-medium">{cmd.name}</span>
                            </div>
                            {isActive && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Enter</span>
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Command className="w-12 h-12 text-brown/10 mx-auto mb-3" />
                <p className="text-brown/40 font-medium">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-bg/50 border-t border-gray-border flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brown/40">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-white border border-gray-border rounded shadow-sm">↑↓</span>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-white border border-gray-border rounded shadow-sm">↵</span>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <LogoIcon className="w-4 h-4 opacity-20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brown/20 italic">Buddas CRM v1.2</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
