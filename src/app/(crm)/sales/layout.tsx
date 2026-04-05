"use client";

import { useState } from "react";
import { SalesSidebar } from "@/components/crm/SalesSidebar";
import { TopNav } from "@/components/crm/TopNav";
import { AuthGuard } from "@/components/crm/AuthGuard";
import { CommandPalette } from "@/components/crm/CommandPalette";
import { ErrorBoundary } from "@/components/crm/ErrorBoundary";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/context/auth";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, loading } = useAuth();
  const router = useRouter();

  // Simple role check for sales workspace
  // Reps, Owners, Ops, and Marketing are allowed
  // If we had a specific 'rep' or 'admin' check, we'd do it here
  // For now, based on strategy, we'll let team members in.

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-bg overflow-hidden relative font-body">
        <CommandPalette />
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-brown/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      {/* Mobile sidebar panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
        <SalesSidebar />
      </div>

      {/* Desktop static sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:inset-y-0">
        <SalesSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
