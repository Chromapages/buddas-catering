"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  BarChart3,
  CalendarDays,
  ClipboardList,
  MenuSquare,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import { useState } from "react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

const navigation = [
  { name: "Dashboard", href: "/sales", icon: LayoutDashboard },
  { name: "Leads", href: "/app/leads", icon: Users },
  { name: "Accounts", href: "/app/companies", icon: Building2 },
  { name: "Orders", href: "/app/orders", icon: CalendarDays },
  { name: "Requests", href: "/app/requests", icon: ClipboardList },
  { name: "Digital Catalog", href: "/app/menus", icon: MenuSquare },
  { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
  { name: "Scorecard", href: "/sales/performance", icon: BarChart3 },
];

export function SalesSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-border">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-border justify-between">
        <Link href="/sales" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-teal-dark">
            Buddas Sales
          </span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <div className="px-6 mb-6">
           <p className="text-xs font-semibold text-brown/40 uppercase tracking-wider mb-2">Workspace</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/sales" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-teal-base/10 text-teal-dark shadow-sm"
                    : "text-brown/70 hover:bg-gray-bg hover:text-brown",
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-teal-dark" : "text-brown/50 group-hover:text-brown/70",
                    "mr-3 h-5 w-5 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-border p-4 bg-gray-bg/30">
        <div className="flex items-center gap-3 px-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-teal-base/20 flex items-center justify-center text-teal-dark font-bold text-xs">
                {user?.email?.[0].toUpperCase() || 'S'}
            </div>
            <div className="flex flex-col min-w-0">
                <p className="text-xs font-semibold text-brown truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-brown/50 uppercase tracking-tighter font-bold">Field Rep</p>
            </div>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-brown/70 hover:bg-white hover:text-orange transition-all duration-200 border border-transparent hover:border-gray-border shadow-none hover:shadow-sm"
          >
            <LogOut className="mr-3 h-5 w-5 text-brown/50 group-hover:text-orange" />
            Sign Out
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={signOut}
        title="Sign Out?"
        description="Ready to call it a day? Make sure your final activities are logged before signing out."
        confirmText="Sign Out"
        cancelText="Stay Active"
      />
    </div>
  );
}
