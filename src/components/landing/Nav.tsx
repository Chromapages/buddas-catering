"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Menu, X, Flower2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <nav className="sticky top-0 z-50 w-full bg-cream/80 backdrop-blur-md border-b border-gray-border py-3 shadow-sm transition-all duration-300">
      <div className="container-rig">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <Flower2 className="h-6 w-6 text-teal-base transition-transform group-hover:rotate-12" />
              <span className="font-heading text-xl font-bold tracking-tight text-teal-dark">
                Buddas <span className="font-medium text-brown">Catering</span>
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
              className="p-3 -mr-1 md:hidden text-brown hover:text-teal-dark transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Full-Screen Modal) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-teal-dark flex flex-col md:hidden"
          >
            {/* Modal Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <Flower2 className="h-6 w-6 text-teal-base" />
                <span className="font-heading text-xl font-bold tracking-tight text-white">
                  Buddas <span className="font-medium text-cream/70">Catering</span>
                </span>
              </Link>
              <button 
                className="p-3 -mr-1 text-cream hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
                aria-label="Close Menu"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            {/* Nav Links (Staggered) */}
            <div className="flex-1 px-4 py-12 flex flex-col justify-center">
              <motion.div 
                initial="closed"
                animate="open"
                variants={{
                  open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                }}
                className="space-y-6"
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
                      className="block text-4xl md:text-5xl font-heading font-bold text-cream hover:text-teal-base transition-colors py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer / Thumb Zone CTA */}
            <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-8">
              <div className="pt-8 border-t border-white/10">
                <Button asChild size="lg" className="w-full h-16 text-lg shadow-2xl shadow-teal-base/20" onClick={() => setIsOpen(false)}>
                  <Link href="#book">Start My Free Quote</Link>
                </Button>
              </div>

              {/* Contact/Social Links */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-cream/40 font-bold mb-1">Text for Support</span>
                  <a href="tel:8011234567" className="text-cream font-medium hover:text-teal-base transition-colors">801.123.4567</a>
                </div>
                
                <div className="flex gap-4">
                  {["Instagram", "Facebook", "LinkedIn"].map((social) => (
                    <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cream/60 hover:bg-teal-base hover:text-white transition-all transform active:scale-90" aria-label={social}>
                      {/* Social Fallback Icons */}
                      <span className="text-[10px] font-bold">{social[0]}</span>
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
