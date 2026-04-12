"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Users, 
  MapPin,
  Receipt,
  LayoutDashboard,
  PlusCircle,
  MoreHorizontal,
  CalendarDays,
  Building2,
  Gem,
  ShieldAlert,
  MenuSquare,
  TrendingUp,
  Settings,
  ClipboardList,
  X,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";

const repMobileNav = [
  { name: "Home", href: "/app", icon: Home },
  { name: "Leads", href: "/app/leads", icon: Users },
  { name: "Log", href: "#quick-log", icon: PlusCircle, action: "log" as const },
  { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
  { name: "More", href: "#more", icon: MoreHorizontal, action: "more" as const },
];

const adminMobileNav = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Clients", href: "/app/contacts", icon: Users },
  { name: "Orders", href: "/app/orders", icon: Receipt },
  { name: "Reps", href: "/app/reps", icon: MapPin },
];

const repExpandedNav = [
  { name: "Contacts", href: "/app/contacts", icon: Users },
  { name: "Accounts", href: "/app/companies", icon: Building2 },
  { name: "Orders", href: "/app/orders", icon: CalendarDays },
  { name: "Requests", href: "/app/requests", icon: ClipboardList },
  { name: "Catalog", href: "/app/menus", icon: MenuSquare },
  { name: "Scorecard", href: "/app/scorecard", icon: TrendingUp },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

const adminExpandedNav = [
  { name: "Dashboard", href: "/app", icon: Home },
  { name: "Leads", href: "/app/leads", icon: Users },
  { name: "Contacts", href: "/app/contacts", icon: Users },
  { name: "Companies", href: "/app/companies", icon: Building2 },
  { name: "Orders", href: "/app/orders", icon: CalendarDays },
  { name: "Memberships", href: "/app/memberships", icon: Gem },
  { name: "Approvals", href: "/app/approvals", icon: ShieldAlert },
  { name: "Menus", href: "/app/menus", icon: MenuSquare },
  { name: "Scorecard", href: "/app/scorecard", icon: TrendingUp },
  { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function MobileNavBar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const isAdmin = role === 'owner' || role === 'admin' || role === 'marketing' || role === 'ops';
  
  if (!role || (!isAdmin && role !== 'rep')) return null;

  const currentNav = isAdmin ? adminMobileNav : repMobileNav;
  const expandedNav = isAdmin ? adminExpandedNav : repExpandedNav;

  return (
    <>
      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-[60] lg:hidden">
        <nav 
          role="navigation"
          aria-label="Mobile Navigation"
          className={cn(
            "flex justify-around items-center h-16 px-4 pb-4 pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] rounded-t-[32px] border-t transition-all duration-500",
            isAdmin 
              ? "bg-white/90 backdrop-blur-2xl border-v-outline/5" 
              : "bg-v-primary/95 backdrop-blur-xl border-white/10"
          )}
        >
          {currentNav.map((item: any) => {
            const isLogAction = item.action === "log";
            const isMoreAction = item.action === "more";
            const isActive = !isLogAction && !isMoreAction && (pathname === item.href || (item.href !== "/app" && pathname.startsWith(`${item.href}/`)));

            if (isLogAction) {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIsQuickLogOpen(true)}
                  aria-label="Quick Log Activity"
                  className="flex flex-col items-center justify-center gap-1 py-1 text-white/40 hover:text-v-secondary transition-all scale-110"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-v-secondary shadow-lg shadow-v-secondary/20 active:scale-90">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </button>
              );
            }

            if (isMoreAction) {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIsMoreMenuOpen(true)}
                    aria-label="Open More Options Menu"
                    className="flex flex-col items-center justify-center gap-1 py-1 transition-all duration-200 text-white/30"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.name}</span>
                  </button>
                );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-label={isActive ? `Current Page: ${item.name}` : `Go to ${item.name}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300 relative px-3 min-w-[64px]",
                  isActive 
                    ? (isAdmin ? "text-v-secondary" : "text-v-secondary") 
                    : (isAdmin ? "text-v-on-surface/30" : "text-white/30")
                )}
              >
                <item.icon className={cn("h-5 w-5 mb-0.5 transition-all", isActive && "scale-110")} />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.1em]",
                  isActive ? "opacity-100" : "opacity-60"
                )}>{item.name}</span>
                {isActive && !isAdmin && (
                  <div className="absolute -top-1 h-0.5 w-6 bg-v-secondary rounded-full shadow-[0_0_8px_rgba(224,123,84,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Slide UP "More" Modal */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMoreMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMoreMenuOpen(false)}
      >
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-teal-dark/95 backdrop-blur-2xl rounded-t-[40px] shadow-2xl transition-transform duration-500 transform border-t border-white/10",
            isMoreMenuOpen ? "translate-y-0" : "translate-y-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 pb-16">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.25em]">Central Command</h3>
                <p className="text-[10px] font-black text-v-secondary uppercase tracking-[0.3em] mt-1 opacity-60">System Modules</p>
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-y-10 gap-x-4">
              {expandedNav.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="flex flex-col items-center justify-center space-y-3 group"
                >
                  <div className="h-16 w-16 rounded-[24px] bg-white/5 flex items-center justify-center group-active:scale-90 transition-all group-active:bg-v-secondary/20 border border-white/5 active:border-v-secondary/30 shadow-lg">
                    <item.icon className="h-7 w-7 text-white/50 group-active:text-v-secondary" />
                  </div>
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.15em] text-center">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <QuickLogDrawer
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        entitySearchMode
      />
    </>
  );
}
