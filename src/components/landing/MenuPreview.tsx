"use client";

import { useState } from "react";
import { Coffee, Utensils, Cake, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";

const MENU_CATEGORIES = [
  {
    id: "breakfast",
    title: "Tropical Breakfast",
    icon: Coffee,
    description: "Start the day with the flavors of the islands. Our breakfast spreads are perfect for morning meetings and early celebrations.",
    image: "/Users/mimac/.gemini/antigravity/brain/34ff4d4c-656d-4bb6-b8e1-3ee345580f7a/tropical_breakfast_spread_1774233980916.png",
    items: [
      { name: "Kona Coffee Cake", detail: "Spiced streusel with 100% Kona coffee swirl" },
      { name: "Tropical Fruit Platter", detail: "Fresh carved pineapple, papaya, mango & kiwi" },
      { name: "Hawaiian Sweet Sliders", detail: "Portuguese sausage, egg & cheese on sweet rolls" },
      { name: "French Press Kona Coffee", detail: "Premium high-altitude roast from the Big Island" }
    ]
  },
  {
    id: "lunch",
    title: "Signature Plate Lunch",
    icon: Utensils,
    description: "Our world-famous plate lunch, elevated for corporate catering. A balanced feast of savory proteins and classic island sides.",
    image: "/Users/mimac/.gemini/antigravity/brain/34ff4d4c-656d-4bb6-b8e1-3ee345580f7a/hawaiian_plate_lunch_catering_1774233997390.png",
    items: [
      { name: "Island Teriyaki Chicken", detail: "Charbroiled thigh with signature house glaze" },
      { name: "Traditional Kalua Pork", detail: "Slow-roasted, succulent shredded pork" },
      { name: "Artisan Mac Salad", detail: "Ultra-creamy with finely grated carrots & onions" },
      { name: "Furikake White Rice", detail: "Perfectly steamed jasmine rice with seasoning" }
    ]
  },
  {
    id: "pastries",
    title: "Signature Sweets",
    icon: Cake,
    description: "The crown jewel of Buddas. Our bakery team crafts these island-inspired desserts fresh every morning.",
    image: "/Users/mimac/.gemini/antigravity/brain/34ff4d4c-656d-4bb6-b8e1-3ee345580f7a/signature_hawaiian_pastries_1774234012069.png",
    items: [
      { name: "Pink Guava Chiffon", detail: "Light as air with fresh guava nectar frosting" },
      { name: "Creamy Haupia Squares", detail: "Traditional coconut milk pudding on shortbread" },
      { name: "Lilikoi Passion Bars", detail: "Sweet-tart passionfruit curd with buttery crust" },
      { name: "Macadamia Nut Brownies", detail: "Dark chocolate with toasted local nuts" }
    ]
  }
];

export function MenuPreview() {
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[1]);

  return (
    <section className="py-24 bg-white overflow-hidden" id="menu">
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-teal-base uppercase mb-3">On the Menu</h2>
          <p className="text-4xl md:text-5xl font-bold font-heading text-teal-dark tracking-tight">Island-Inspired Catering</p>
          <div className="mt-4 h-1.5 w-24 bg-orange mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Navigation Tabs - Left */}
          <div className="lg:col-span-4 space-y-4">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group",
                  activeCategory.id === cat.id 
                    ? "bg-teal-base/5 border-teal-base shadow-sm" 
                    : "bg-gray-bg border-transparent hover:border-teal-base/30"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  activeCategory.id === cat.id ? "bg-teal-base text-white" : "bg-white text-brown/40 group-hover:text-teal-base"
                )}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold text-lg",
                    activeCategory.id === cat.id ? "text-teal-dark" : "text-brown/60"
                  )}>{cat.title}</h3>
                  <p className="text-xs text-brown/50 mt-1 uppercase tracking-wider font-semibold">Explore Items</p>
                </div>
                {activeCategory.id === cat.id && (
                  <ChevronRight className="ml-auto h-5 w-5 text-teal-base animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Content Area - Right */}
          <div className="lg:col-span-8">
            <div className="bg-gray-bg rounded-[2.5rem] p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch shadow-inner border border-gray-border/50">
              {/* Image Container */}
              <div className="relative h-[300px] md:h-auto rounded-[2rem] overflow-hidden shadow-2xl">
                <Image
                  src={activeCategory.image}
                  alt={activeCategory.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 right-6">
                   <Badge className="bg-orange text-white border-none text-[10px] tracking-widest px-3 py-1 mb-2">MOST POPULAR</Badge>
                   <p className="text-white font-heading font-bold text-xl">{activeCategory.title}</p>
                </div>
              </div>

              {/* Text/List Container */}
              <div className="flex flex-col justify-center py-4">
                <p className="text-brown/80 leading-relaxed mb-8 italic">
                  &quot;{activeCategory.description}&quot;
                </p>
                <ul className="space-y-6">
                  {activeCategory.items.map((item, idx) => (
                    <li key={idx} className="flex flex-col">
                      <span className="text-teal-dark font-bold text-lg flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange"></span>
                        {item.name}
                      </span>
                      <span className="text-sm text-brown/60 mt-1 pl-3.5 leading-snug">{item.detail}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 pt-8 border-t border-gray-border/50">
                   <Button className="w-full h-14 text-lg shadow-xl hover:shadow-teal-base/20">
                     Check Availability
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
