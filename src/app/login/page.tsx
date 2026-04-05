import { Suspense } from "react";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

function LoginPageFallback() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-border">
      <div className="animate-pulse space-y-4">
        <div className="mx-auto h-6 w-40 rounded bg-gray-border/60" />
        <div className="mx-auto h-4 w-56 rounded bg-gray-border/40" />
        <div className="mt-8 h-12 rounded-xl bg-gray-border/30" />
        <div className="h-12 rounded-xl bg-gray-border/30" />
        <div className="h-11 rounded-xl bg-gray-border/40" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}
