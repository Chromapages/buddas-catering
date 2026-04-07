"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flower2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export const MobileStickyCTA = () => {
  const [isOverThreshold, setIsOverThreshold] = useState(false);
  const [isFormInView, setIsFormInView] = useState(false);

  useEffect(() => {
    // 1. Scroll Threshold Logic (200px)
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsOverThreshold(true);
      } else {
        setIsOverThreshold(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // 2. Intersection Observer (Hide when #book is visible)
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormInView(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Hide when form section is 10% visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it hits the viewport fully
      }
    );

    const formElement = document.getElementById("book");
    if (formElement) {
      observer.observe(formElement);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (formElement) observer.unobserve(formElement);
    };
  }, []);

  const isVisible = isOverThreshold && !isFormInView;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-8 right-6 mb-[env(safe-area-inset-bottom)] z-[9999] md:hidden"
        >
          <Link
            href="#book"
            className="flex items-center gap-2 bg-teal-dark text-cream px-5 py-3 rounded-full shadow-xl hover:bg-teal-base transition-all duration-300 border border-teal-light/20 active:scale-95 group overflow-hidden relative"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
            
            <Flower2 className="h-4 w-4 animate-pulse" />
            <span className="font-heading text-sm font-bold tracking-tight text-cream">
              Start Quote
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
