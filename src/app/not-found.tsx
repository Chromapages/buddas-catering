import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(107,75,62,0.14),_transparent_35%)]" />
      <div className="relative w-full max-w-3xl rounded-[36px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-brown/10 backdrop-blur sm:p-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-base/10 text-teal-dark">
          <Compass className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-orange">404</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-teal-dark sm:text-5xl">
          This page fell off the catering map.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-brown/70">
          The link may be outdated, mistyped, or no longer available. Let&apos;s get you back to the pages that are ready to serve.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/corporate-program">
              <ArrowLeft className="mr-2 h-4 w-4" />
              View Corporate Program
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
