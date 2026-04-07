"use client";

import Image from "next/image";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { motion } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";

interface HeroProps {
  data?: {
    badge?: string;
    headline?: string;
    subheadline?: string;
    ratingText?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    backgroundImage?: { asset?: { url?: string } };
    features?: string[];
  };
}

export function Hero({ data }: HeroProps) {
  const badge = data?.badge || "Now serving Utah County";
  const headline = data?.headline || "The Lunch Your Office Will [Actually] Love.";
  const subheadline = data?.subheadline || "Premium Hawaiian catering for Utah's office managers and EAs. We show up early, handle every detail, and leave your team impressed.";
  const ratingText = data?.ratingText || "4.9 · 100+ Utah County Companies";
  const primaryCtaText = data?.primaryCtaText || "Start My Quote";
  const primaryCtaLink = data?.primaryCtaLink || "#book";
  const secondaryCtaText = data?.secondaryCtaText || "View Full Menu";
  const secondaryCtaLink = data?.secondaryCtaLink || "#menu";
  const backgroundImage = data?.backgroundImage?.asset?.url || "https://images.unsplash.com/photo-1555244162-803834f70033?w=2400&auto=format&fit=crop&q=80";
  const features = data?.features || ["Same-Day Quotes", "15-Min Early Guarantee"];

  // Helper to parse headline with [term] for teal highlight
  const renderHeadline = (text: string) => {
    const parts = text.split(/(\[.*?\])/);
    return parts.map((part, index) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        return (
          <span key={index} className="text-teal-base">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  return (
    <section className="relative min-h-[100svh] flex items-end pb-36 pt-24 md:pb-0 md:items-center overflow-hidden py-16 md:py-20 lg:py-24">
      {/* Full-Bleed Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={headline}
          fill
          priority
          className="object-cover"
        />
        {/* Advanced Overlay: Darker on bottom-left for text visibility, transparent on top-right for food */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brown/80 via-brown/40 to-transparent"></div>
        <div className="absolute inset-0 bg-teal-dark/10 mix-blend-multiply"></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div 
          className="max-w-2xl bg-white/5 backdrop-blur-md border border-white/20 p-4 sm:p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4 md:space-y-6">
            <motion.div variants={itemVariants} className="inline-flex items-center">
              <Badge variant="warning" className="bg-orange/90 text-white border-0 py-1.5 px-4 tracking-widest flex gap-2">
                <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                {badge}
              </Badge>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-heading leading-[1.1] md:leading-[1.1]">
              {renderHeadline(headline)}
            </motion.h1>

            <motion.div variants={itemVariants} className="flex items-center gap-2 py-1">
              <div className="flex text-orange">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <span className="text-lg font-bold text-white/90 ml-2">{ratingText}</span>
            </motion.div>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
              {subheadline}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild className="w-full sm:w-auto h-14 px-10 text-lg shadow-xl shadow-teal-dark/20">
                <Link href={primaryCtaLink}>{primaryCtaText}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto h-14 px-10 text-lg bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                <Link href={secondaryCtaLink}>{secondaryCtaText}</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-6 border-t border-white/10">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white/90 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-base shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
