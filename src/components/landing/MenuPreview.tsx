"use client";

import { useState } from "react";
import { Coffee, Utensils, Cake, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { motion, AnimatePresence } from "framer-motion";

const MENU_CATEGORIES = [
  {
    id: "breakfast",
    title: "Tropical Breakfast",
    icon: Coffee,
    description: "Start the day right — our breakfast spreads are built for morning all-hands and early kickoffs.",
    image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800&q=80",
    items: [
      { name: "Kona Coffee Cake", detail: "Spiced streusel with 100% Kona coffee swirl" },
      { name: "Tropical Fruit Platter", detail: "Fresh carved pineapple, papaya, mango & kiwi" },
      { name: "Hawaiian Sweet Sliders", detail: "Portuguese sausage, egg & cheese on sweet rolls" },
      { name: "French Press Kona Coffee", detail: "Premium high-altitude roast from the Big Island" }
    ],
    isPopular: false
  },
  {
    id: "lunch",
    title: "Signature Plate Lunch",
    icon: Utensils,
    description: "Our most-ordered lunch for a reason: savory proteins, island sides, and generous portions that keep every seat happy.",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80",
    items: [
      { name: "Island Teriyaki Chicken", detail: "Charbroiled thigh with signature house glaze" },
      { name: "Traditional Kalua Pork", detail: "Slow-roasted, succulent shredded pork" },
      { name: "Artisan Mac Salad", detail: "Ultra-creamy with finely grated carrots & onions" },
      { name: "Furikake White Rice", detail: "Perfectly steamed jasmine rice with seasoning" }
    ],
    isPopular: true
  },
  {
    id: "pastries",
    title: "Signature Sweets",
    icon: Cake,
    description: "The perfect finish to any event. Baked fresh every morning — they go fast.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    items: [
      { name: "Pink Guava Chiffon", detail: "Light as air with fresh guava nectar frosting" },
      { name: "Creamy Haupia Squares", detail: "Traditional coconut milk pudding on shortbread" },
      { name: "Lilikoi Passion Bars", detail: "Sweet-tart passionfruit curd with buttery crust" },
      { name: "Macadamia Nut Brownies", detail: "Dark chocolate with toasted local nuts" }
    ],
    isPopular: false
  }
];

export function MenuPreview() {
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[1]);

  return (
    <section className="py-24 bg-cream overflow-hidden" id="menu">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-teal-base/10 text-teal-base border-teal-base/20">Starting at $12/person</Badge>
          <p className="text-sm font-bold tracking-[0.2em] text-teal-base uppercase mb-3 px-4 py-1 inline-block border-x border-teal-base/20">
            On the Menu
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-teal-dark tracking-tight">
            Food Your Team Will Look Forward To
          </h2>
          <div className="mt-6 h-1 w-20 bg-orange mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Navigation Tabs - Left */}
          <div className="lg:col-span-4 space-y-3">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group relative overflow-hidden",
                  activeCategory.id === cat.id 
                    ? "bg-white border-teal-base shadow-md translate-x-1" 
                    : "bg-gray-bg border-transparent hover:border-teal-base/30 grayscale-[0.5] hover:grayscale-0"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300",
                  activeCategory.id === cat.id 
                    ? "bg-teal-base text-white scale-110" 
                    : "bg-white text-brown/40 group-hover:text-teal-base"
                )}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold text-lg transition-colors",
                    activeCategory.id === cat.id ? "text-teal-dark" : "text-brown/60"
                  )}>
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-brown/40 uppercase tracking-widest font-bold mt-0.5">
                    {activeCategory.id === cat.id ? "Viewing Menu" : "View Selection"}
                  </p>
                </div>
                {activeCategory.id === cat.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto"
                  >
                    <ChevronRight className="h-5 w-5 text-teal-base" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Content Area - Right */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-[2.5rem] p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch shadow-xl border border-teal-base/5"
              >
                {/* Image Container */}
                <div className="relative h-[250px] md:h-auto rounded-[2rem] overflow-hidden group shadow-lg">
                  <Image
                    src={activeCategory.image}
                    alt={activeCategory.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                     {activeCategory.isPopular && (
                       <Badge className="bg-orange text-white border-none text-[10px] tracking-widest px-3 py-1 mb-2 animate-bounce">
                        MOST POPULAR
                       </Badge>
                     )}
                     <p className="text-white font-heading font-bold text-2xl tracking-tight">
                        {activeCategory.title}
                     </p>
                  </div>
                </div>

                {/* Text/List Container */}
                <div className="flex flex-col justify-center py-2">
                  <p className="text-brown/70 leading-relaxed mb-8 text-lg font-medium">
                    {activeCategory.description}
                  </p>
                  <ul className="space-y-5">
                    {activeCategory.items.map((item, idx) => (
                      <motion.li 
                        key={idx} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                        className="flex flex-col group/item"
                      >
                        <span className="text-teal-dark font-bold text-lg flex items-center gap-2 group-hover/item:text-teal-base transition-colors">
                          <span className="h-2 w-2 rounded-sm bg-orange rotate-45 shrink-0"></span>
                          {item.name}
                        </span>
                        <span className="text-sm text-brown/50 mt-1 pl-4 leading-snug border-l border-gray-border ml-1">
                          {item.detail}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-10 pt-8 border-t border-gray-border/30">
                     <Button className="w-full h-14 text-lg shadow-lg hover:shadow-teal-base/30 transition-all active:scale-[0.98]" asChild>
                       <Link href="#book">Request This Menu</Link>
                     </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
