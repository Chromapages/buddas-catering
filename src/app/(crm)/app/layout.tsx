"use client";

import { useState } from "react";
import { Sidebar } from "@/components/crm/Sidebar";
import { TopNav } from "@/components/crm/TopNav";
import { MobileNavBar } from "@/components/crm/MobileNavBar";
import { AuthGuard } from "@/components/crm/AuthGuard";
import { CommandPalette } from "@/components/crm/CommandPalette";
import { ErrorBoundary } from "@/components/crm/ErrorBoundary";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/firebase/context/auth";
import { cn } from "@/lib/utils";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();
  const isRep = role === 'rep';

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-bg overflow-hidden relative">
        <CommandPalette />
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-brown/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      {/* Mobile sidebar panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarOpen && (
          <div className="absolute right-0 top-0 -mr-12 pt-4">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        )}
        <Sidebar />
      </div>

      {/* Desktop static sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        <main className={cn(
          "flex-1 overflow-y-auto",
          isRep && "pb-16 lg:pb-0"
        )}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      <MobileNavBar />
    </div>
    </AuthGuard>
  );
}
