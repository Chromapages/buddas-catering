"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Plus, Utensils, MoveRight } from "lucide-react";
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
    price: "$24.50/pp",
    description: "Our comprehensive island experience including Kalua pork, huli huli chicken, and signature sides.",
  },
  {
    _id: "2",
    name: "Pacific Bowl Bar",
    category: { title: "Build-Your-Own", slug: { current: "build-your-own" }, type: "both" },
    price: "$18.00/pp",
    description: "Customizable fresh seafood and vegan options.",
  },
  {
    _id: "3",
    name: "Tropical Fruit Tray",
    category: { title: "Add-ons", slug: { current: "add-ons" }, type: "both" },
    price: "$65.00 flat rate",
    description: "Seasonal Peak-season pineapple, papaya, mango and lychee.",
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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const itemWidth = scrollRef.current.offsetWidth * 0.8; // Matches the min-w-[80vw] approximate
    const newIndex = Math.round(scrollPosition / itemWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < displayItems.length) {
      setActiveIndex(newIndex);
    }
  };

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
          onScroll={handleScroll}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={cn(
            "flex overflow-x-auto pb-8 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide hide-scrollbar", // Mobile: Carousel
            "md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:auto-rows-[300px] md:overflow-visible md:px-0 md:mx-0 md:snap-none" // Desktop: Grid
          )}
        >
          {displayItems.map((item, idx) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              className={cn(
                "group relative rounded-[2rem] overflow-hidden transition-all duration-500",
                "min-w-[80vw] md:min-w-0 snap-center shrink-0 mr-4 md:mr-0", // Mobile: Card Sizing & Snap
                idx === 0 ? "lg:col-span-2 lg:row-span-2 md:h-full h-[400px] md:h-auto" : "h-[400px] md:h-auto",
                idx === 1 ? "lg:col-span-2 lg:row-span-1" : "",
                idx === 2 ? "lg:col-span-1 lg:row-span-1" : "",
                idx === 3 ? "lg:col-span-1 lg:row-span-1" : "",
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
                      {/* Subtlest watermark */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 rotate-12">
                         <Utensils className="w-96 h-96 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
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
                          
                          {item.inclusionsSummary && (
                            <p className="text-brown/40 text-xs mt-2 italic">
                              {item.inclusionsSummary}
                            </p>
                          )}

                          {item.selectionItems && item.selectionItems.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-[10px] font-bold text-orange tracking-widest uppercase mb-1">
                                {item.selectionTitle || "Choose from"}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {item.selectionItems.map((opt, i) => (
                                  <span key={i} className="text-[10px] bg-gray-100 text-brown/70 border border-gray-200 rounded-md px-2 py-0.5 whitespace-nowrap">
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
                           "font-bold text-white tracking-tight",
                           idx === 0 ? "text-2xl md:text-5xl" : "text-xl md:text-3xl"
                         )}>
                            {item.name}
                         </h3>
                         <p className={cn(
                           "text-white/70 leading-relaxed max-w-sm",
                           idx === 0 ? "text-sm md:text-lg" : "text-xs md:text-sm"
                         )}>
                            {item.description}
                         </p>
                      </div>

                       <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                          <div className="flex flex-col">
                             <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-0.5">{item.priceTitle || "Price"}</span>
                             <span className="text-white font-bold text-xl md:text-2xl tracking-tight leading-none">{item.price}</span>
                          </div>
                         
                         {idx === 0 ? (
                           <Button className="bg-white text-teal-dark hover:bg-teal-base hover:text-white rounded-full px-5 md:px-8 h-10 md:h-12 text-sm font-bold shadow-xl flex items-center gap-2 md:gap-3 shrink-0">
                              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                              Add
                           </Button>
                         ) : idx === 1 ? (
                           <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-teal-dark transition-all shrink-0">
                              <Plus className="w-5 h-5 md:w-6 md:h-6" />
                           </button>
                         ) : (
                           <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-teal-dark rounded-xl h-10 text-xs font-bold bg-white/5 backdrop-blur-sm shrink-0">
                              Quick Add
                           </Button>
                         )}
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
        <div className="mt-16 text-center">
           <Button size="lg" className="h-16 px-12 text-lg bg-teal-dark hover:bg-teal-base shadow-2xl shadow-teal-dark/10 rounded-2xl group transition-all" asChild>
             <Link href="/menu" className="flex items-center gap-3">
               EXPLORE FULL CATERING MENU
               <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
             </Link>
           </Button>
        </div>
      </div>
    </section>
  );
}
