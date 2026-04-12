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
  const { role, loading } = useAuth();
  const router = useRouter();

  // Simple role check for sales workspace
  // Reps, Owners, Ops, and Marketing are allowed
  // If we had a specific 'rep' or 'admin' check, we'd do it here
  // For now, based on strategy, we'll let team members in.

  return (
    <AuthGuard>
      <div className="flex h-screen bg-v-background overflow-hidden relative font-sans">
        <CommandPalette />
        
      {/* Desktop static sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:inset-y-0 border-r border-v-outline/10 bg-v-surface">
        <SalesSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-v-background">
        <TopNav />

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
