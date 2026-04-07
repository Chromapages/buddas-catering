"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Plus, Utensils, MoveRight, Users, Clock, Flame } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

interface MenuItem {
  _id: string;
  name: string;
  category: {
    title: string;
    slug: { current: string };
    type: string;
  };
  description?: string;
  imageUrl?: string;
  priceTitle?: string;
  price?: string | number;
  inclusionsSummary?: string;
  selectionTitle?: string;
  selectionItems?: string[];
  badge?: string;
  type?: "product" | "info";
  prepTime?: string;
  servings?: string;
  spiceLevel?: "Mild" | "Medium" | "Hot";
}

interface MenuPreviewProps {
  items?: MenuItem[];
  sectionData?: {
    badge?: string;
    headline?: string;
    subheadline?: string;
  };
}

const MOCK_ITEMS: MenuItem[] = [
  {
    _id: "1",
    name: "The Luau Feast",
    category: { title: "Packages", slug: { current: "packages" }, type: "both" },
    badge: "MOST POPULAR",
    price: "$24.50",
    description: "Our comprehensive island experience including Kalua pork, huli huli chicken, and signature sides.",
    servings: "12-15",
    prepTime: "45m",
    spiceLevel: "Mild"
  },
  {
    _id: "2",
    name: "Pacific Bowl Bar",
    category: { title: "Build-Your-Own", slug: { current: "build-your-own" }, type: "both" },
    price: "$18.00",
    description: "Customizable fresh seafood and vegan options.",
    servings: "10+",
    prepTime: "30m",
    spiceLevel: "Medium"
  },
  {
    _id: "3",
    name: "Tropical Fruit Tray",
    category: { title: "Add-ons", slug: { current: "add-ons" }, type: "both" },
    price: "$65.00",
    description: "Seasonal Peak-season pineapple, papaya, mango and lychee.",
    servings: "8-10",
    prepTime: "15m",
    spiceLevel: "Mild"
  },
  {
    _id: "4",
    name: "Custom Package",
    category: { title: "Special", slug: { current: "special" }, type: "both" },
    type: "info",
    description: "Don't see what you need? Build a bespoke menu with our chefs.",
  },
];

export function MenuPreview({ items = [], sectionData }: MenuPreviewProps) {
  const displayItems = items.length > 0 ? items.slice(0, 4) : MOCK_ITEMS;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.6,
      }
    );

    const cards = scrollRef.current?.querySelectorAll("[data-index]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [displayItems.length]);

  const badge = sectionData?.badge || "OUR OFFERINGS";
  const headline = sectionData?.headline || "Authentic Island Flavors";
  const subheadline = sectionData?.subheadline || "Explore our most popular packages and custom creations designed for your crew.";
  const isDefaultHeadline = headline === "Authentic Island Flavors";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <section className="py-24 bg-[#F8F7F4] relative overflow-hidden" id="menu">
      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
             <Badge className="bg-teal-base/10 text-teal-base border-teal-base/20 py-1.5 px-4 font-bold tracking-wider">
               {badge}
             </Badge>
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-teal-dark tracking-tight leading-[1.1]">
               {isDefaultHeadline ? (
                 <>Authentic Island <span className="text-teal-base italic serif">Flavors</span></>
               ) : (
                 headline
               )}
             </h2>
          </div>
          <p className="text-xl text-brown/60 max-w-md font-medium">
            {subheadline}
          </p>
        </div>

        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={cn(
            "flex overflow-x-auto pb-8 gap-4 px-4 snap-x snap-mandatory scrollbar-hide hide-scrollbar", 
            "md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:auto-rows-[300px] md:overflow-visible md:px-0 md:mx-0 md:snap-none"
          )}
        >
          {displayItems.map((item, idx) => (
            <motion.div
              key={item._id}
              data-index={idx}
              variants={itemVariants}
              className={cn(
                "group relative rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-xl",
                "w-[85vw] md:w-auto snap-start shrink-0 tracking-normal border border-white/10 backdrop-blur-[2px]", 
                idx === 0 ? "lg:col-span-2 lg:row-span-2 md:h-full h-[520px] md:h-auto" : "h-[520px] md:h-auto",
                item.type === "info" ? "bg-white border border-gray-border/50" : "bg-teal-dark"
              )}
            >
              {/* Media Context */}
              {item.type !== "info" && (
                <div className="absolute inset-0 w-full h-full">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className={cn(
                      "w-full h-full bg-gradient-to-br transition-colors duration-700",
                      idx === 0 ? "from-teal-dark to-[#0F1D1D]" : "from-teal-dark/90 to-teal-dark"
                    )}>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 rotate-12">
                         <Utensils className="w-96 h-96 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Cinematic Mobile Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity"></div>
                </div>
              )}

              {/* Card Content */}
              <div className={cn(
                "relative h-full w-full p-6 md:p-8 flex flex-col",
                item.type === "info" ? "justify-between" : "justify-end"
              )}>
                 {item.type === "info" ? (
                   <>
                     <div className="space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange">
                           <Utensils className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-2xl font-bold text-teal-dark">{item.name}</h3>
                           <p className="text-brown/60 text-sm leading-relaxed">
                              {item.description}
                          </p>
                        </div>
                     </div>
                     <Link href="/contact" className="group/link flex items-center justify-between py-2 border-t border-gray-border/50 text-teal-base font-bold transition-colors hover:text-teal-dark">
                        Inquire Now
                        <MoveRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
                     </Link>
                   </>
                 ) : (
                   <div className="space-y-6">
                      <div className="space-y-3">
                         {item.badge && (
                           <Badge className="bg-orange text-white border-none text-[9px] tracking-[0.2em] px-2.5 py-1 mb-1">
                             {item.badge}
                           </Badge>
                         )}
                         <h3 className={cn(
                           "font-bold text-white tracking-tight leading-[1.1]",
                           "text-3xl md:text-5xl" 
                         )}>
                            {item.name}
                         </h3>
                         <p className={cn(
                           "text-white/60 leading-relaxed max-w-sm",
                           "text-sm md:text-lg"
                         )}>
                            {item.description}
                         </p>
                      </div>

                      {/* Premium Metadata Row (Mobile specific style) */}
                      <div className="flex md:hidden items-center justify-between py-4 border-y border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider">
                         <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-teal-base" />
                            <span>{item.servings || "10-12"} Servings</span>
                         </div>
                         <div className="w-px h-4 bg-white/10" />
                         <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-teal-base" />
                            <span>{item.prepTime || "45m"} Prep</span>
                         </div>
                         <div className="w-px h-4 bg-white/10" />
                         <div className="flex items-center gap-2">
                            <Flame className="w-3 h-3 text-orange" />
                            <span>{item.spiceLevel || "Mild"}</span>
                         </div>
                      </div>

                      {/* Dual-Pill Action Row (Ref: Hill Guest House) */}
                      <div className="flex items-center gap-3 mt-auto">
                        {/* Price Capsule (Glassmorphic) */}
                        <div className="flex flex-col px-5 h-[3.25rem] bg-white/10 border border-white/20 backdrop-blur-md rounded-full items-center justify-center shrink-0">
                           <span className="text-white/40 text-[8px] font-bold tracking-widest uppercase leading-none mb-0.5">PER PERSON</span>
                           <span className="text-white font-bold text-lg tracking-tight leading-none">{item.price}</span>
                        </div>
                        
                        {/* Primary Action Pill */}
                        <button className="h-[3.25rem] grow bg-white text-teal-dark hover:bg-orange hover:text-white rounded-full text-base font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                           SELECT PACKAGE
                           <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Desktop Desktop Actions (Hidden on Mobile) */}
                      <div className="hidden md:flex items-center justify-between pt-5 border-t border-white/10">
                           <div className="flex flex-col gap-1">
                              <span className="text-white/40 text-[9px] font-bold tracking-[0.15em] uppercase leading-none">Starting At</span>
                              <span className="text-white font-bold text-xl md:text-2xl tracking-tight leading-none">{item.price}/pp</span>
                           </div>
                          
                           <Button className="bg-white text-teal-dark hover:bg-teal-base hover:text-white rounded-full px-5 md:px-8 h-12 md:h-12 text-sm font-bold shadow-xl flex items-center gap-2 md:gap-3 shrink-0">
                              <Plus className="w-5 h-5 md:w-5 md:h-5" />
                              Add
                           </Button>
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Pagination Dots */}
        <div className="flex md:hidden justify-center items-center gap-2 mt-4">
          {displayItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scrollRef.current) {
                  const itemWidth = scrollRef.current.offsetWidth * 0.8;
                  scrollRef.current.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
                }
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                activeIndex === idx ? "w-8 bg-teal-base shadow-sm" : "w-2 bg-teal-dark/10"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Global CTA */}
         <div className="mt-16 text-center px-4 md:px-0">
            <Button 
              size="lg" 
              className="w-auto h-14 px-10 text-base md:text-lg bg-teal-dark hover:bg-teal-base shadow-2xl shadow-teal-dark/10 rounded-2xl group transition-all" 
              asChild
            >
              <Link href="/menu" className="flex items-center justify-center gap-3">
                EXPLORE FULL MENU
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
         </div>
      </div>
    </section>
  );
}
