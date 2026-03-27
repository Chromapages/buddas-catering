"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * REPURPOSED: OccasionStrip (previously CateringCards)
 * Answers "Is this exactly for my situation?" by allowing persona self-identification.
 * Transformed into a horizontal auto-carousel with image backgrounds.
 */

const occasions = [
  { 
    label: "Staff Lunch", 
    image: "/images/occasions/staff-lunch.png",
    description: "The weekday lunch your team will actually look forward to."
  },
  { 
    label: "Training Day", 
    image: "/images/occasions/training-day.png",
    description: "Keep energy high. Setup ready before they arrive."
  },
  { 
    label: "Appreciation Event", 
    image: "/images/occasions/appreciation-event.png",
    description: "Say thank you with something they'll still be talking about."
  },
  { 
    label: "Faith Community", 
    image: "/images/occasions/faith-community.png",
    description: "Warm, generous food that brings everyone together."
  },
  { 
    label: "School Function", 
    image: "/images/occasions/school-function.png",
    description: "Reliable, crowd-pleasing catering for every seat in the room."
  },
  { 
    label: "Nonprofit Gathering", 
    image: "/images/occasions/nonprofit-gathering.png",
    description: "Elevate your event without blowing the budget."
  }
];

export function CateringCards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const visibleItems = isMobile ? 1 : 2;
  const maxIndex = occasions.length - visibleItems;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (!isPaused) {
      autoPlayRef.current = setInterval(next, 5000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [next, isPaused]);

  return (
    <section id="occasions" className="bg-teal-dark py-12 md:py-16 border-b border-teal-base/10 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-teal-base/10 to-transparent pointer-events-none" />
      
      <div className="container-rig relative z-10">
        <div className="text-center mb-8">
          <Badge variant="default" className="mb-4 text-teal-base border-teal-base/50 bg-teal-base/5 uppercase tracking-widest text-xs">Who We Help</Badge>
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-3">
            Pick Your Occasion. <span className="text-secondary">We Handle the Rest.</span>
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            10 to 500+ guests across Utah County. Tap your occasion to start a quote.
          </p>
        </div>

        <div 
          className="relative group/carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <button 
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-teal-base hover:bg-teal-base hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-teal-base hover:bg-teal-base hover:text-white transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Track */}
          <div className="overflow-visible lg:overflow-visible">
            <motion.div 
              className="flex gap-6"
              animate={{ x: `-${currentIndex * (isMobile ? 100 : 50)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {occasions.map((occ, i) => (
                <div 
                  key={i} 
                  className="min-w-full lg:min-w-[calc(50%-12px)] flex-shrink-0"
                >
                  <Link 
                    href={`#book?occasion=${encodeURIComponent(occ.label)}`}
                    className="block group relative aspect-[3/1] rounded-[1.5rem] overflow-hidden border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${occ.image}')` }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/90 via-teal-dark/40 to-transparent transition-opacity duration-500 group-hover:opacity-95" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg uppercase tracking-tight">
                        {occ.label}
                      </h3>
                      <p className="text-xs md:text-sm text-white/90 max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        {occ.description}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: occasions.length - (visibleItems - 1) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === i ? "bg-teal-base w-8" : "bg-teal-base/20 hover:bg-teal-base/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-white/50 text-sm font-medium">
          Don't see your occasion?{" "}
          <Link href="#book" className="text-teal-base font-bold hover:underline underline-offset-4 decoration-2">
            Tell us about it →
          </Link>
        </p>
      </div>
    </section>
  );
}
