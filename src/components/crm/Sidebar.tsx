"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldAlert,
  MenuSquare,
  Building2,
  CalendarDays,
  Gem,
  ClipboardList,
  LogOut,
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import { useState } from "react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useSidebar } from "@/context/SidebarContext";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Leads", href: "/app/leads", icon: Users },
  { name: "Contacts", href: "/app/contacts", icon: Users },
  { name: "Companies", href: "/app/companies", icon: Building2 },
  { name: "Orders", href: "/app/orders", icon: CalendarDays },
  { name: "Memberships", href: "/app/memberships", icon: Gem },
  { name: "Approvals", href: "/app/approvals", icon: ShieldAlert },
  { name: "Menus", href: "/app/menus", icon: MenuSquare },
  { name: "Scorecard", href: "/app/scorecard", icon: TrendingUp },
  { name: "Tasks", href: "/app/tasks", icon: CheckCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, role, user: authUser } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isRep = role === 'rep';

  const filteredNavigation = isRep
    ? [
        { name: "My Workspace", href: "/app", icon: LayoutDashboard },
        { name: "My Leads", href: "/app/leads", icon: Users },
        { name: "My Contacts", href: "/app/contacts", icon: Users },
        { name: "My Accounts", href: "/app/companies", icon: Building2 },
        { name: "Orders", href: "/app/orders", icon: CalendarDays },
        { name: "Requests", href: "/app/requests", icon: ClipboardList },
        { name: "Digital Catalog", href: "/app/menus", icon: MenuSquare },
        { name: "Scorecard", href: "/app/scorecard", icon: TrendingUp },
        { name: "Tasks", href: "/app/tasks", icon: CheckCircle2 },
      ]
    : navigation;

  return (
    <div className={cn(
      "flex h-full flex-col bg-v-primary/95 backdrop-blur-xl border-r border-v-outline/40 transition-all duration-500 ease-in-out shadow-[10px_0_50px_rgba(0,0,0,0.25)]",
      isCollapsed ? "w-24 items-center" : "w-72"
    )}>
      {/* 1. Branding Header */}
      <div className={cn(
        "flex h-24 shrink-0 items-center justify-between border-b border-white/10 transition-all duration-300",
        isCollapsed ? "px-0 justify-center w-full" : "px-8"
      )}>
        <Link href="/app" className="flex items-center gap-4 group">
          <div className="h-12 w-12 bg-white/10 rounded-[20px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all border border-white/20 shadow-soft-low group-hover:bg-white/15">
            <span className="text-white font-black text-2xl tracking-tighter italic">V</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[13px] font-black tracking-[0.2em] text-white uppercase leading-none">The Veranda</span>
              <span className="text-[9px] font-black text-white/30 tracking-[0.35em] uppercase mt-2">Executive CRM</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-8 custom-scrollbar">
        <nav className={cn(
          "flex-1 space-y-1 px-4",
          isCollapsed && "px-3"
        )}>
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : ""}
                className={cn(
                   "flex items-center gap-4 px-4 py-3.5 rounded-[18px] transition-all duration-300 group relative active:scale-95",
                   isActive
                     ? "bg-white/10 text-white shadow-soft-low border border-white/10" 
                     : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-v-secondary" : "text-white/20 group-hover:text-white"
                )} />
                {!isCollapsed && (
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase">
                    {item.name}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-v-secondary rounded-r-[4px] shadow-[0_0_15px_rgba(224,123,84,0.6)] animate-in slide-in-from-left duration-300" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-black/5 backdrop-blur-md">
        <div className="space-y-1">
          <Link
            href="/app/settings"
            title={isCollapsed ? "Settings" : ""}
            className={cn(
              "group flex items-center rounded-[14px] text-white/30 hover:bg-white/5 hover:text-white transition-all duration-200 active:scale-95",
              isCollapsed ? "justify-center p-3" : "px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em]"
            )}
          >
            <Settings className={cn("h-4 w-4 text-white/20 group-hover:text-white/60", !isCollapsed && "mr-4")} />
            {!isCollapsed && "Settings"}
          </Link>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? "Sign Out" : ""}
            className={cn(
              "group flex w-full items-center rounded-[14px] text-white/30 hover:bg-white/5 hover:text-v-secondary transition-all duration-200 active:scale-95",
              isCollapsed ? "justify-center p-3" : "px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em]"
            )}
          >
            <LogOut className={cn("h-4 w-4 text-white/20 group-hover:text-v-secondary", !isCollapsed && "mr-4")} />
            {!isCollapsed && "Sign Out"}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={cn(
              "mt-3 flex w-full items-center rounded-[18px] bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all duration-300 border border-white/5 active:scale-95",
              isCollapsed ? "justify-center p-2.5" : "px-4 py-3 text-[9px] font-black uppercase tracking-[0.3em]"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-white/40" />
            ) : (
              <>
                <ChevronLeft className="mr-3 h-3.5 w-3.5 text-white/40" />
                <span>Collapse Shell</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={signOut}
        title="Sign Out?"
        description="Are you sure you want to log out of the CRM dashboard? You will need to sign back in to access lead and order data."
        confirmText="Sign Out"
        cancelText="Stay Logged In"
      />
    </div>
  );
}

