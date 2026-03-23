"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 600px
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-border p-4 transition-all duration-500 transform md:hidden",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-teal-dark uppercase tracking-wider">Ready to book?</span>
          <span className="text-sm text-brown/70">Quotes in &lt; 2 hours</span>
        </div>
        <Button asChild className="shadow-lg px-8">
          <Link href="#book">Book Now</Link>
        </Button>
      </div>
    </div>
  );
}
