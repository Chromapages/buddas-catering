"use client";

import { motion } from "framer-motion";

const TIERS = [
  { events: 2, discount: "10% Off" },
  { events: 4, discount: "15% Off" },
  { events: 6, discount: "20% Off" },
];

export function ProgramHero() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-teal-dark">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 50%, #54BFA5 0%, transparent 50%), radial-gradient(circle at 75% 20%, #E9C559 0%, transparent 40%)`,
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-teal-base inline-block" />
              Corporate Catering Program — Utah County
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6"
          >
            Buddas Corporate{" "}
            <span className="text-teal-base">Catering Program</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-lg sm:text-xl text-white/75 max-w-2xl mb-10 leading-relaxed"
          >
            Easy group meals for offices, churches, schools, teams, and events
            — with simple annual catering discounts that reward your loyalty.
          </motion.p>

          {/* Tier pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            {TIERS.map((tier) => (
              <div
                key={tier.events}
                className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5"
              >
                <span className="text-white font-medium text-sm">
                  {tier.events} Orders / Year
                </span>
                <span className="text-teal-base font-bold text-sm">=</span>
                <span className="text-teal-base font-bold text-sm">
                  {tier.discount}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 transition-colors shadow-lg text-base"
            >
              Join the Program
            </a>
            <a
              href="#signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-base"
            >
              Talk to Our Catering Team
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 text-sm text-white/40"
          >
            No signup fee · No prepayment required · 12-month commitment term ·
            $200 qualifying order minimum
          </motion.p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
    </section>
  );
}
