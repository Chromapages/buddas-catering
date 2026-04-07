"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import { Instagram, Facebook, Linkedin, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteSettings {
  phoneNumber?: string;
}

export function Footer() {
  const [phone, setPhone] = useState<string | null>(null);
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    // Client-side only data fetching & year synchronization
    const fetchData = async () => {
      try {
        const settings = await client.fetch<SiteSettings>(siteSettingsQuery);
        setPhone(settings?.phoneNumber ?? null);
      } catch (error) {
        console.error("Footer fetch error:", error);
      }
    };
    fetchData();
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-cream text-brown border-t border-gray-border/40">
      <div className="container-rig py-0 md:py-16">
        
        {/* DESKTOP FOOTER (4-Column Grid) */}
        <div className="hidden md:grid grid-cols-4 gap-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-6">
              <Flower2 className="h-6 w-6 text-teal-base transition-transform group-hover:rotate-12" />
              <span className="font-heading text-2xl font-bold tracking-tight text-teal-dark">
                Buddas <span className="text-brown">Catering</span>
              </span>
            </Link>
            <p className="text-brown/70 max-w-sm text-sm leading-relaxed mb-6">
              Premium Hawaiian corporate catering serving Utah County. 
              Zero stress, reliable delivery, and food your team actually wants to eat.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/50 border border-gray-border/20 flex items-center justify-center text-brown/60 hover:bg-teal-base hover:text-white hover:border-teal-base transition-all transform active:scale-90" aria-label={`Social ${i}`}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-5 text-teal-dark uppercase tracking-widest text-[10px]">Menu</h4>
            <ul className="space-y-3 text-sm text-brown/80 font-medium">
              <li><Link href="#menu" className="hover:text-teal-base transition-colors">Breakfast & Meetings</Link></li>
              <li><Link href="#menu" className="hover:text-teal-base transition-colors">All-Hands Lunch</Link></li>
              <li><Link href="#menu" className="hover:text-teal-base transition-colors">Pastries & Rolls</Link></li>
              <li><Link href="#memberships" className="hover:text-gold transition-colors">Corporate Memberships</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-5 text-teal-dark uppercase tracking-widest text-[10px]">Company</h4>
            <ul className="space-y-3 text-sm text-brown/80 font-medium">
              <li><Link href="#faq" className="hover:text-teal-base transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-base transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-base transition-colors">Terms of Service</Link></li>
              <li><Link href="/login" className="hover:text-teal-base transition-colors underline decoration-teal-base/20 underline-offset-4">Team Login</Link></li>
              {phone && (
                <li className="pt-2">
                  <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-teal-dark font-bold hover:text-teal-base transition-colors text-base tracking-tight">
                    {phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* MOBILE FOOTER (Ultra-Minimal Slim) */}
        <div className="md:hidden flex flex-col items-center text-center space-y-4 pt-10 pb-2 px-4">
          {/* Logo & Slogan Condensed */}
          <div className="flex flex-col items-center">
            <Link href="/" className="flex items-center space-x-2 group mb-0.5">
              <Flower2 className="h-6 w-6 text-teal-base transition-transform group-hover:rotate-12" />
              <span className="font-heading text-xl font-bold tracking-tight text-teal-dark">
                Buddas <span className="text-brown">Catering</span>
              </span>
            </Link>
            <p className="text-brown/40 text-[9px] uppercase tracking-[0.2em] font-bold">Pleasant Grove, Utah</p>
          </div>

          {/* Quick Links Horizontal (Condesned Gaps) */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {["Menu", "How It Works", "FAQ", "Memberships"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs font-bold text-brown/90 hover:text-teal-base transition-colors tracking-tight"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Contact & Socials (Condensed) */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-brown/30 font-bold mb-0.5">Text for Support</span>
              <a href={phone ? `tel:${phone.replace(/\D/g, '')}` : "#"} className="text-lg font-heading font-bold text-teal-dark tracking-tight">
                {phone || "801.123.4567"}
              </a>
            </div>
            
            <div className="flex gap-5">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-1 text-brown/40 hover:text-teal-base transition-colors" aria-label={`Social ${i}`}>
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright & Safe-Area Header Reduced */}
          <div className="pt-3 border-t border-gray-border/20 w-full flex flex-col items-center space-y-1 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <p className="text-[9px] text-brown/40 font-medium tracking-tight">
              © {year} Buddas Hawaiian Bakery & Grill.
            </p>
            <div className="flex gap-4 text-[9px] text-brown/40 font-bold uppercase tracking-wider">
              <Link href="/privacy">Privacy</Link>
              <span>•</span>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
