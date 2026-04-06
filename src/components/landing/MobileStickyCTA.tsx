"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flower2, Send } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export const MobileStickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 200px
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 md:hidden"
        >
          <Link
            href="#book"
            className="flex items-center gap-2 bg-teal-dark text-cream px-5 py-3 rounded-full shadow-xl hover:bg-teal-base transition-all duration-300 border border-teal-light/20 active:scale-95 group overflow-hidden relative"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
            
            <Flower2 className="h-4 w-4 animate-pulse" />
            <span className="font-heading text-sm font-bold tracking-tight">
              Start Quote
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
