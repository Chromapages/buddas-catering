"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error boundary caught an error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16 text-brown">
      <div className="w-full max-w-2xl rounded-[32px] border border-teal-base/15 bg-white p-8 shadow-xl shadow-brown/5 sm:p-12">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-teal-base/70">Something Broke</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-teal-dark">
          We hit a snag while loading this page.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-brown/70">
          The page did not finish loading the way it should have. Try the request again, or head back to the homepage while we reset the kitchen.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="min-w-[180px]">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="min-w-[180px]">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-brown/35">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
