"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Coffee,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Leads", href: "/app/leads", icon: Users },
  { name: "Calendar", href: "/app/calendar", icon: Calendar },
  { name: "Catering Requests", href: "/app/requests", icon: Coffee },
  { name: "Companies", href: "/app/companies", icon: Building2 },
  { name: "Memberships", href: "/app/memberships", icon: FileText },
  { name: "Approvals", href: "/app/approvals", icon: CheckSquare },
  { name: "Reports", href: "/app/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-border">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-border">
        <Link href="/app" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-teal-dark">
            Buddas CRM
          </span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-teal-base/10 text-teal-dark"
                    : "text-brown/70 hover:bg-gray-bg hover:text-brown",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-teal-dark" : "text-brown/50 group-hover:text-brown/70",
                    "mr-3 h-5 w-5 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-border p-4">
        <div className="space-y-1">
          <Link
            href="/app/settings"
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-brown/70 hover:bg-gray-bg hover:text-brown transition-colors"
          >
            <Settings className="mr-3 h-5 w-5 text-brown/50 group-hover:text-brown/70" />
            Settings
          </Link>
          <button
            onClick={signOut}
            className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-brown/70 hover:bg-gray-bg hover:text-orange transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-brown/50 group-hover:text-orange" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
