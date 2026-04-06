"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Menu, X, Flower2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

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
              className="p-2 md:hidden text-brown hover:text-teal-dark transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-border bg-cream overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="block text-base font-medium text-brown hover:text-teal-dark py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
