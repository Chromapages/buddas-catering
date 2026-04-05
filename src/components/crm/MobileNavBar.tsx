"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Users, 
  CheckSquare, 
  BarChart3,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/context/auth";
import { QuickLogDrawer } from "@/components/crm/QuickLogDrawer";

const repMobileNav = [
  { name: "Home", href: "/app", icon: Home },
  { name: "My Leads", href: "/app/leads", icon: Users },
  { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
  { name: "Log", href: "#quick-log", icon: PlusCircle, action: "log" as const },
  { name: "Scorecard", href: "/app/scorecard", icon: BarChart3 },
];

export function MobileNavBar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  
  if (role !== 'rep') return null;

  return (
    <>
      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-border bg-white lg:hidden">
        <nav className="grid h-16 grid-cols-5 px-2">
          {repMobileNav.map((item) => {
            const isLogAction = item.action === "log";
            const isActive = !isLogAction && (pathname === item.href || (item.href !== "/app" && pathname.startsWith(`${item.href}/`)));

            if (isLogAction) {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIsQuickLogOpen(true)}
                  className="flex min-h-[44px] flex-col items-center justify-center gap-1 py-1 text-brown/60"
                  style={{ touchAction: "manipulation" }}
                >
                  <item.icon className="h-5 w-5 text-teal-dark" />
                  <span className="text-[10px] font-medium uppercase tracking-tight">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex min-h-[44px] flex-col items-center justify-center gap-1 py-1 transition-colors",
                  isActive ? "text-teal-dark" : "text-brown/50"
                )}
                style={{ touchAction: "manipulation" }}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-teal-dark" : "text-brown/40")} />
                <span className="text-[10px] font-medium uppercase tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <QuickLogDrawer
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        entitySearchMode
      />
    </>
  );
}
