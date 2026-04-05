"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { useState } from "react";

const sizes = ["10-15", "15-25", "25-40"];

interface BuildYourPlatterProps {
  sectionData?: {
    badge?: string;
    headline?: string;
    subheadline?: string;
  };
}

export function BuildYourPlatter({ sectionData }: BuildYourPlatterProps) {
  const [activeSize, setActiveSize] = useState("15-25");

  const badge = sectionData?.badge || "CUSTOM CATERING";
  const headline = sectionData?.headline || "Build Your Own Platter";
  const subheadline = sectionData?.subheadline || "Not feeling a pre-made pack? Customizing for your crew takes less than 2 minutes.";

  const steps = [
    {
      number: 1,
      title: "Pick Your Crowd Size",
      content: (
        <div className="flex flex-wrap gap-2 mt-4">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setActiveSize(size)}
              className={`h-10 px-6 rounded-xl border font-bold transition-all duration-300 ${
                activeSize === size
                  ? "bg-teal-base border-teal-base text-white shadow-lg shadow-teal-base/20"
                  : "bg-white border-gray-border text-brown hover:border-teal-base/30"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      ),
    },
    {
      number: 2,
      title: "Choose Main Proteins",
      description: "Select up to 3 options for this size.",
    },
    {
      number: 3,
      title: "Sides & Drinks",
      description: "Add extra Mac Salad or some Guava Nectar.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <section className="bg-gray-bg py-24 lg:py-32 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-cream/30 skew-x-12 -translate-x-20 pointer-events-none"></div>

      <div className="container-rig relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visual Area (Now Left) */}
          <div className="relative pt-10 lg:pt-0">
            {/* The Plate Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
              className="relative aspect-square max-w-[600px] mx-auto bg-white rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(45,35,30,0.08)] p-16 flex items-center justify-center border border-white"
            >
              <div className="relative w-full h-full group">
                <Image
                  src="/images/premium_white_plate_gold_rim.png"
                  alt="Empty premium white plate with gold rim"
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Decorative accent behind the plate */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-orange/5 to-transparent rounded-[4.5rem] -z-10"></div>
            </motion.div>

            {/* Floating Testimonial Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 20 }}
              className="absolute -bottom-8 -right-4 md:-right-8 max-w-[320px] bg-white rounded-[2rem] p-8 shadow-[0_30px_60px_-12px_rgba(45,35,30,0.15)] border border-gray-border/50 backdrop-blur-xl group hover:shadow-teal-base/5 transition-all duration-500 text-left"
            >
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex text-orange">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <span className="text-base font-bold text-brown tracking-tight">4.9/5 Rating</span>
                </div>
                <p className="text-lg italic text-brown/80 leading-relaxed font-medium">
                  {"“The easiest catering order I've ever made. The Kalua Pork was a huge hit!”"}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-8 h-[2px] bg-teal-base/30"></div>
                  <p className="text-xs font-bold text-teal-base uppercase tracking-widest">
                    Sarah K., Google HQ
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content Area (Now Right) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <Badge className="bg-teal-base/10 text-teal-base hover:bg-teal-base/15 border-0 py-1.5 px-4 text-sm font-bold tracking-wider">
                  {badge}
                </Badge>
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-teal-dark tracking-tight leading-[1.1]">
                {headline}
              </motion.h2>
              <motion.p variants={itemVariants} className="text-xl text-brown/70 leading-relaxed max-w-lg font-medium">
                {subheadline}
              </motion.p>
            </div>

            <div className="space-y-10">
              {steps.map((step, i) => (
                <motion.div key={i} variants={itemVariants} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-gray-border text-teal-base font-bold flex items-center justify-center text-xl shadow-sm group-hover:border-teal-base/50 group-hover:shadow-md transition-all duration-300">
                    {step.number}
                  </div>
                  <div className="space-y-2 pt-1">
                    <h3 className="text-2xl font-bold text-brown">{step.title}</h3>
                    {step.description && <p className="text-lg text-brown/60 font-medium">{step.description}</p>}
                    {step.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={itemVariants} className="pt-6">
              <Button size="lg" className="h-16 px-12 text-xl bg-teal-base hover:bg-teal-dark shadow-2xl shadow-teal-base/30 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                <Link href="#book">START CUSTOM ORDER</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
