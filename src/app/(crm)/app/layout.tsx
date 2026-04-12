"use client";

import { useState } from "react";
import { Sidebar } from "@/components/crm/Sidebar";
import { TopNav } from "@/components/crm/TopNav";
import { MobileNavBar } from "@/components/crm/MobileNavBar";
import { AuthGuard } from "@/components/crm/AuthGuard";
import { CommandPalette } from "@/components/crm/CommandPalette";
import { ErrorBoundary } from "@/components/crm/ErrorBoundary";
import { X } from "lucide-react";
import { useAuth } from "@/lib/firebase/context/auth";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function SidebarContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { role } = useAuth();
  const isRep = role === 'rep';

  return (
    <div className="flex h-screen overflow-hidden relative bg-app-gradient transition-colors duration-500">
      <CommandPalette />
      
      {/* Desktop static sidebar */}
      <div 
        className={cn(
          "hidden lg:flex lg:flex-col transition-all duration-300 ease-in-out z-40 border-r border-teal-dark/5",
          isCollapsed ? "lg:w-24" : "lg:w-72"
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative bg-white/5 dark:bg-black/10">
        <TopNav />

        <main className={cn(
          "flex-1 overflow-y-auto",
          isRep && "pb-16 lg:pb-0"
        )}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      <MobileNavBar />
    </div>
  );
}

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <SidebarContent>{children}</SidebarContent>
      </SidebarProvider>
    </AuthGuard>
  );
}
