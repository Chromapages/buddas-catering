"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Check, Star, Calculator } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MembershipTiers() {
  const tiers = [
    {
      name: "Pro",
      discount: "5%",
      subline: "Best for 3–4 events per year",
      description: "Basic savings for local businesses and community groups planning a few key events a year.",
      features: [
        "5% off all catering orders",
        "Dedicated account rep",
        "Priority delivery window",
      ],
      recommended: false,
    },
    {
      name: "Elite",
      discount: "10%",
      subline: "Best for weekly or bi-weekly teams",
      description: "Our most popular tier. Designed for high-growth teams that value consistent, quality island flavor.",
      features: [
        "10% off all catering orders",
        "Dedicated account rep",
        "Priority delivery window",
        "Flexible rescheduling (48hr)",
      ],
      recommended: true,
    },
    {
      name: "Executive",
      discount: "15%",
      subline: "For offices that run on Buddas",
      description: "Maximum savings and premium perks for organizations with frequent, large-scale catering needs.",
      features: [
        "15% off all catering orders",
        "Dedicated account rep",
        "Guaranteed availability",
        "Flexible rescheduling (24hr)",
        "Free monthly taste testing",
      ],
      recommended: false,
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="memberships" className="bg-cream py-24 border-t border-teal-base/10">
      <div className="container-rig">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-teal-base/10 text-teal-base border-teal-base/20">Corporate Memberships</Badge>
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-teal-dark mb-6 tracking-tight">
            Lock In Your Team's Favorite Caterer.
          </h2>
          <p className="text-lg text-brown/70 max-w-2xl mx-auto leading-relaxed">
            Lock in your event dates early and save up to 15% on your total catering spend. No upfront cost &mdash; you only pay per event.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {tiers.map((tier, i) => (
            <motion.div key={i} variants={cardVariants} className="h-full">
              <Card 
                className={`relative flex flex-col h-full transition-all duration-500 group overflow-hidden ${
                  tier.recommended 
                    ? 'border-2 border-teal-base shadow-2xl md:scale-105 z-10' 
                    : 'border-teal-base/10 shadow-lg hover:border-teal-base/30'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-teal-base text-white text-[10px] font-bold py-1 px-8 rotate-45 translate-x-[24px] translate-y-[12px] shadow-sm tracking-[0.2em] uppercase">
                      Popular
                    </div>
                  </div>
                )}
                <CardHeader className="text-center pb-2 pt-8">
                  <p className="text-[10px] font-bold text-orange uppercase tracking-[0.3em] mb-2">{tier.subline}</p>
                  <CardTitle className="text-2xl font-heading text-teal-dark">{tier.name}</CardTitle>
                  <div className="mt-4 flex flex-col items-center justify-center">
                    <span className="text-6xl font-extrabold text-teal-dark font-heading tracking-tighter">{tier.discount}</span>
                    <span className="text-[10px] font-bold text-brown/40 uppercase tracking-[0.2em] mt-1">Discount</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pt-4">
                  <CardDescription className="text-center text-brown/60 mb-8 pb-8 border-b border-gray-border/30 leading-relaxed font-medium">
                    {tier.description}
                  </CardDescription>
                  <ul className="space-y-4">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start text-sm text-brown/90 font-medium">
                        {i === 2 && j >= 3 ? (
                          <Star className="h-5 w-5 text-orange mr-3 shrink-0 fill-orange/20" />
                        ) : (
                          <Check className="h-5 w-5 text-teal-base mr-3 shrink-0" />
                        )}
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6 pb-8 px-8">
                  <Button 
                    className={cn(
                      "w-full h-12 shadow-lg transition-all active:scale-[0.98]",
                      tier.recommended ? "bg-teal-base hover:bg-teal-dark" : "border-teal-base/20 hover:bg-teal-base/5"
                    )}
                    variant={tier.recommended ? "primary" : "outline"} 
                    asChild
                  >
                    <Link href={`#book?membership=${encodeURIComponent(tier.name)}`}>
                      {tier.recommended ? "Claim My Discount →" : `Lock In ${tier.discount} Off`}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 bg-white border border-teal-base/10 px-8 py-10 rounded-[2.5rem] shadow-xl shadow-teal-dark/5 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-orange"></div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange/10 rounded-lg text-orange">
                <Calculator className="h-6 w-6" />
              </div>
              <p className="text-teal-dark font-bold text-xl font-heading">Member Math</p>
            </div>
            <div className="space-y-1">
              <p className="text-brown/80 font-medium text-lg leading-snug">
                 Avg. 40-person lunch = <span className="text-teal-dark font-bold">$500</span>. Save <span className="text-orange font-bold">$50/event</span> at 10% off.
              </p>
              <p className="text-sm text-brown/50 font-medium">
                Life happens. Unused events carry over for 60 days into the next year.
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-teal-base/20 hover:bg-teal-base/5 h-14 md:px-10 font-bold whitespace-nowrap" asChild>
            <Link href="#book">Custom Membership Quote</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
