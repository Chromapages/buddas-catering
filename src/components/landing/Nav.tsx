"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Menu, X } from "lucide-react";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Catering Menu", href: "#menu" },
    { name: "Memberships", href: "#memberships" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-border bg-gray-bg/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
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
            <Button asChild>
              <Link href="#book">Book Catering</Link>
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
      {isOpen && (
        <div className="md:hidden border-t border-gray-border bg-white p-4 space-y-4 animate-in slide-in-from-top duration-300">
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
          <div className="pt-4 border-t border-gray-border flex flex-col gap-3">
             <Button asChild className="w-full justify-center">
               <Link href="#book">Book Catering</Link>
             </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
