"use client";

import Image from "next/image";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { motion } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";

export function Hero() {
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
    <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
      {/* Full-Bleed Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=2400&auto=format&fit=crop&q=80"
          alt="Premium Hawaiian Catering Spread"
          fill
          priority
          className="object-cover"
        />
        {/* Advanced Overlay: Darker on bottom-left for text visibility, transparent on top-right for food */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brown/80 via-brown/40 to-transparent"></div>
        <div className="absolute inset-0 bg-teal-dark/10 mix-blend-multiply"></div>
      </div>

      <div className="container-rig relative z-10 pt-20">
        <motion.div 
          className="max-w-2xl bg-white/5 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-[2.5rem] shadow-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="inline-flex items-center">
              <Badge variant="warning" className="bg-orange/90 text-white border-0 py-1.5 px-4 tracking-widest flex gap-2">
                <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                Now serving Utah County
              </Badge>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-heading leading-tight md:leading-[1.1]">
              The Lunch Your Office Will<br />
              <span className="text-teal-base">Actually</span> Love.
            </motion.h1>

            <motion.div variants={itemVariants} className="flex items-center gap-2 py-1">
              <div className="flex text-orange">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <span className="text-lg font-bold text-white/90 ml-2">4.9 · 100+ Utah County Companies</span>
            </motion.div>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
              Premium Hawaiian catering for Utah's office managers and EAs. We show up early, handle every detail, and leave your team impressed.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild className="w-full sm:w-auto h-14 px-10 text-lg shadow-xl shadow-teal-dark/20">
                <Link href="#book">Start My Quote</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto h-14 px-10 text-lg bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                <Link href="#menu">View Full Menu</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/90 font-bold">
                <CheckCircle2 className="w-6 h-6 text-teal-base" />
                <span>Same-Day Quotes</span>
              </div>
              <div className="flex items-center gap-3 text-white/90 font-bold">
                <CheckCircle2 className="w-6 h-6 text-teal-base" />
                <span>15-Min Early Guarantee</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>


    </section>
  );
}
