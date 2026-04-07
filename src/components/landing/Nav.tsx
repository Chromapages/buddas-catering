"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Menu, X, Flower2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Catering Menu", href: "#menu" },
    { name: "Reviews", href: "#reviews" },
    { name: "Memberships", href: "#memberships" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={cn(
      "w-full transition-all duration-300",
      isOpen 
        ? "fixed inset-0 z-[9999] bg-teal-dark" // High-z-index Fixed Modal State
        : "sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-gray-border py-3 shadow-sm" // Standard Sticky State
    )}>
      <div className="px-4"> {/* Standard 16px Mobile Grid Margin */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2 group" onClick={() => setIsOpen(false)}>
              <Flower2 className={cn("h-6 w-6 transition-transform group-hover:rotate-12", isOpen ? "text-teal-base" : "text-teal-base")} />
              <span className={cn("font-heading text-xl font-bold tracking-tight", isOpen ? "text-white" : "text-teal-dark")}>
                Buddas <span className={cn("font-medium", isOpen ? "text-cream/70" : "text-brown")}>Catering</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-brown hover:text-teal-dark transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button asChild className="hidden md:flex shadow-sm">
              <Link href="#book">Start My Quote</Link>
            </Button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className={cn(
                "p-3 -mr-1 md:hidden transition-colors",
                isOpen ? "text-cream hover:text-white" : "text-brown hover:text-teal-dark"
              )}
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Full-Screen Modal Content) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col pt-8 md:hidden h-[calc(100svh-64px)] overflow-hidden"
          >
            {/* Nav Links (Staggered) */}
            <div className="flex-1 px-4 flex flex-col justify-center">
              <motion.div 
                initial="closed"
                animate="open"
                variants={{
                  open: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
                  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                }}
                className="space-y-4"
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.name}
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: 20, opacity: 0 }
                    }}
                  >
                    <Link 
                      href={link.href} 
                      className="block text-4xl md:text-5xl font-heading font-bold text-cream hover:text-teal-base transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer / Thumb Zone CTA */}
            <div className="px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] space-y-6">
              <div className="pt-6 border-t border-white/10">
                <Button asChild size="lg" className="w-full h-14 text-base font-bold shadow-2xl shadow-teal-base/20" onClick={() => setIsOpen(false)}>
                  <Link href="#book">Start My Free Quote</Link>
                </Button>
              </div>

              {/* Contact/Social Links */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-cream/40 font-bold mb-1">Text for Support</span>
                  <a href="tel:8011234567" className="text-cream text-sm font-medium hover:text-teal-base transition-colors">801.123.4567</a>
                </div>
                
                <div className="flex gap-4">
                  {["I", "F", "L"].map((initial, i) => (
                    <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-cream/60 hover:bg-teal-base hover:text-white transition-all transform active:scale-90" aria-label={`Social ${initial}`}>
                      <span className="text-[10px] font-bold">{initial}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
