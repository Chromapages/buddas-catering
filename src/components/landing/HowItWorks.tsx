"use client";

import { MessageSquare, ClipboardList, Truck } from "lucide-react";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/shared/Badge";

const steps = [
  {
    title: "Share Your Details — 2 Minutes",
    description: "Fill out our quick form — group size, date, dietary needs. Takes under 2 minutes.",
    icon: ClipboardList,
  },
  {
    title: "Receive a Quote in 2 Hours",
    description: "We send a detailed custom quote within 2 hours. No obligation, no pressure — just clarity.",
    icon: MessageSquare,
  },
  {
    title: "We Show Up Early",
    description: "We arrive 20 minutes early, set everything up, label all dietary items, and clean up after.",
    icon: Truck,
  },
];

interface HowItWorksProps {
  sectionData?: {
    badge?: string;
    headline?: string;
    subheadline?: string;
  };
}

export function HowItWorks({ sectionData }: HowItWorksProps) {
  const badge = sectionData?.badge || "3 Easy Steps";
  const headline = sectionData?.headline || "From Quote to Setup in 3 Steps";
  const subheadline = sectionData?.subheadline || "You focus on the meeting. We handle the feast.";

  return (
    <section id="how-it-works" className="bg-cream py-24 relative overflow-hidden transition-colors duration-500">
      <div className="container-rig relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-x-12 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-4 max-w-3xl">
            <Badge variant="default" className="uppercase tracking-widest text-teal-base border-teal-base/30 bg-teal-base/5">
              {badge}
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold font-heading text-teal-dark tracking-tight leading-[1.1]">
              {headline}
            </h2>
          </div>
          <p className="text-lg md:text-xl text-brown/70 max-w-xs md:text-right pb-1 leading-tight font-medium">
            {subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12 relative">
          {/* Desktop Horizontal Timeline Connector */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 bg-teal-base/10 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-base/20 to-transparent" />
          </div>
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="flex flex-col md:items-center text-center relative z-10 group"
            >
              {/* Mobile Vertical Connector */}
              {i < steps.length - 1 && (
                <div className="md:hidden absolute left-10 top-20 bottom-[-48px] w-0.5 bg-gradient-to-b from-teal-base/20 via-teal-base/10 to-transparent z-0" />
              )}

              <div className="flex flex-row md:flex-col items-start md:items-center gap-6 md:gap-0">
                <div className="relative mb-6">
                  <div className="bg-white p-6 rounded-3xl shadow-lg border-4 border-teal-base/5 group-hover:border-teal-base/20 transition-all duration-300 relative z-10">
                    <step.icon className="w-10 h-10 text-teal-base group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-teal-dark text-white w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm border-2 border-white shadow-md z-20">
                    {i + 1}
                  </div>
                </div>

                <div className="text-left md:text-center mt-2 md:mt-0">
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-teal-dark mb-3 group-hover:text-teal-base transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-brown/70 leading-relaxed max-w-[320px] md:mx-auto text-base md:text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <Button size="lg" asChild className="rounded-2xl px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-teal-base hover:bg-teal-dark">
            <Link href="#book">Get My Free Quote</Link>
          </Button>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm font-bold text-teal-dark/50 tracking-wide uppercase">
            <span>No deposit required</span>
            <span className="w-1 h-1 rounded-full bg-teal-base/30" />
            <span>Response within 2 hours</span>
          </div>
        </div>
      </div>
    </section>
  );
}
