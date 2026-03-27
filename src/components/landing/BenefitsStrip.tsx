"use client";

import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function BenefitsStrip() {
  const benefits = [
    {
      title: "Guaranteed 15 Min Early",
      description: "We set up before your guests arrive — every time, without exception.",
      proof: "100+ events. Never once late.",
      icon: <Clock className="w-8 h-8 text-teal-base" />
    },
    {
      title: "Every Diet, Labeled Clearly",
      description: "GF, DF, and Vegan options are clearly marked on every tray.",
      proof: "Safe eating for every guest.",
      icon: <ShieldCheck className="w-8 h-8 text-teal-base" />
    },
    {
      title: "White-Glove Setup Included",
      description: "Chafing dishes, utensils, professional layout — all at no extra cost.",
      proof: "Zero hidden fees, ever.",
      icon: <CheckCircle2 className="w-8 h-8 text-teal-base" />
    }
  ];

  return (
    <section className="bg-cream py-24 border-y border-gray-border/50">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 uppercase tracking-widest text-teal-base border-teal-base/30">
            Our Promise
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-teal-dark mb-4">
            Why Groups Trust Buddas
          </h2>
          <p className="text-lg text-brown/70 max-w-2xl mx-auto">
            Three non-negotiable standards on every order.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-border/30 border-t-4 border-t-teal-base/30 flex flex-col items-center text-center group hover:shadow-md transition-shadow duration-300"
            >
              <div className="bg-teal-base/5 p-5 rounded-2xl mb-6 shadow-inner-sm group-hover:bg-teal-base/10 transition-colors duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-heading font-bold text-teal-dark mb-3">{benefit.title}</h3>
              <p className="text-brown/80 leading-relaxed mb-6">
                {benefit.description}
              </p>
              <div className="mt-auto pt-4 border-t border-gray-border/40 w-full italic text-sm text-teal-base/80 font-medium">
                {benefit.proof}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
