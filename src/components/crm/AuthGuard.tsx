"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/context/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirection is now handled server-side via proxy.ts/middleware.
  // This component remains to handle the client-side initialization state
  // and ensure the user context is populated before rendering protected UI.

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-bg">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-base border-t-transparent"></div>
          <p className="mt-4 text-brown/70 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If we are not loading and there's no user, the useEffect will redirect. 
  // We return null to prevent flashing protected content.
  if (!user) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
