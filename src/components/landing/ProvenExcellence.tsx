"use client";

import Image from "next/image";
import { Star, Quote, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Testimonial {
  content: string;
  author: string;
  role: string;
  rating: number;
}

interface ProvenExcellenceProps {
  testimonials?: Testimonial[];
  sectionData?: {
    badge?: string;
    headline?: string;
  };
}

export function ProvenExcellence({ 
  testimonials: fetchedTestimonials,
  sectionData 
}: ProvenExcellenceProps) {
  const badge = sectionData?.badge || "The Budda's Standard";
  const headline = sectionData?.headline || "Built on Promises, Proven by Results";
  const defaultTestimonials: Testimonial[] = [
    {
      content: "Budda's Hawaiian isn't just catering; they are an extension of our brand experience. Their attention to organic sourcing and presentation has set a new benchmark for our summits.",
      author: "Marcus Chen",
      role: "Operations Director, TechIsland Global",
      rating: 5
    },
    {
      content: "I used to stress about catering arriving late. With Buddas, they are literally setting up 20 minutes early every single time. Total lifesavers for our board meetings.",
      author: "Sarah J.",
      role: "Office Manager, Podium",
      rating: 5
    },
    {
      content: "GF, DF, and Vegan options are always clearly marked. It's the first time I've ever had zero complaints from my team about food allergies or preferences.",
      author: "Michael T.",
      role: "EA to CEO, Entrata",
      rating: 5
    }
  ];

  const benefits = [
    {
      title: "Guaranteed 15 Min Early",
      description: "We set up before your guests arrive — every time, without exception.",
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: "Every Diet, Labeled Clearly",
      description: "Organic, GF, and Vegan options are meticulously marked and separated.",
      icon: <ShieldCheck className="w-5 h-5" />
    },
    {
      title: "White-Glove Setup Included",
      description: "Professional equipment, layout, and cleanup are part of the Budda's standard.",
      icon: <CheckCircle2 className="w-5 h-5" />
    }
  ];

  const testimonials = fetchedTestimonials && fetchedTestimonials.length > 0 
    ? fetchedTestimonials 
    : defaultTestimonials;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="bg-cream py-16 md:py-20 lg:py-24 border-y border-teal-base/10 overflow-hidden" id="trust">
      <div className="container-rig px-4 md:px-6">
        <div className="text-right mb-10 md:mb-16 lg:mb-20 px-4 md:px-0">
          <p className="text-xs font-bold text-orange uppercase tracking-[0.3em] mb-4">{badge}</p>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-heading text-teal-dark tracking-tighter">
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          
          {/* Main Block (Testimonials & Imagery) - 2 Columns wide */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-white/40 backdrop-blur-sm rounded-[3rem] p-4 sm:p-5 md:p-8 lg:p-12 border border-white/60 shadow-xl shadow-teal-dark/5">
            
            {/* Left side of block: Carousel */}
            <div className="relative flex flex-col justify-center min-h-[300px]">
              <Quote className="absolute -top-6 -left-6 h-24 w-24 text-teal-dark/5 -z-10" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <p className="text-xl md:text-2xl text-brown/90 leading-relaxed italic font-medium">
                    &ldquo;{testimonials[activeIndex].content}&rdquo;
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="h-1 w-8 bg-orange/40 rounded-full" /> {/* Decorative accent instead of avatar */}
                    <div>
                      <h4 className="font-bold text-teal-dark font-heading leading-tight">{testimonials[activeIndex].author}</h4>
                      <p className="text-xs text-brown/60 font-medium uppercase tracking-wider">{testimonials[activeIndex].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Indicators */}
              <div className="flex gap-2 mt-10">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1 transition-all duration-300 rounded-full ${
                      activeIndex === i ? "w-8 bg-teal-dark" : "w-2 bg-teal-dark/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right side of block: Framed Meta Image */}
            <div className="relative h-[300px] md:h-full w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white shadow-teal-dark/10 group">
              <Image
                src="/images/social-proof.png" // Using the premium image from the previous step
                alt="Budda's Catering Excellence"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
                    <div className="flex text-orange">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                    <span className="text-[10px] font-bold text-teal-dark uppercase tracking-tight">Verified Event</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Block (The Promises) - 1 Column wide */}
          <div className="flex flex-col gap-6">
            <div className="p-4 sm:p-5 md:p-6 pb-2">
                <h3 className="text-sm font-bold text-teal-dark uppercase tracking-[0.2em] opacity-80 border-l-2 border-orange pl-4">
                    Our Promises
                </h3>
            </div>
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 bg-white rounded-3xl border border-teal-base/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Spotlight/Glow effect */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-base/5 rounded-full -mr-12 -mt-12 group-hover:bg-teal-base/10 transition-colors duration-300" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-teal-base group-hover:text-orange transition-colors duration-300">
                            {benefit.icon}
                        </div>
                        <h4 className="font-heading font-bold text-teal-dark text-lg leading-tight">
                            {benefit.title}
                        </h4>
                    </div>
                    <p className="text-sm text-brown/70 leading-relaxed pl-8">
                        {benefit.description}
                    </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Corporate Trust Strip: Static on Desktop, Infinite Marquee on Mobile */}
        <div className="mt-20 lg:mt-24 pt-12 border-t border-teal-base/10 px-4 md:px-0">
          <p className="text-[9px] font-bold text-brown/40 uppercase tracking-[0.4em] mb-12 text-center">
            The Choice of Utah's Top Engineering and HR Teams
          </p>
          
          {/* DESKTOP: Static Grid */}
          <div className="hidden md:flex flex-wrap justify-between items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-700 max-w-5xl mx-auto">
            {["PODIUM", "ENTRATA", "DOMO", "VIVINT", "QUALTRICS"].map((logo) => (
              <div key={logo} className="text-xl font-bold font-heading tracking-tighter text-teal-dark">
                {logo}
              </div>
            ))}
          </div>

          {/* MOBILE: Infinite Marquee */}
          <div className="md:hidden relative w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cream to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream to-transparent z-10" />
            
            <motion.div 
              className="flex items-center gap-12 w-max opacity-20 grayscale"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {/* Double the logos for seamless loop */}
              {[...["PODIUM", "ENTRATA", "DOMO", "VIVINT", "QUALTRICS"], ...["PODIUM", "ENTRATA", "DOMO", "VIVINT", "QUALTRICS"]].map((logo, i) => (
                <div key={`${logo}-${i}`} className="text-xl font-bold font-heading tracking-tighter text-teal-dark whitespace-nowrap">
                  {logo}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
