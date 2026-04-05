import type { Metadata } from "next";
import { Suspense } from "react";
import { Sunrise, Sun, Coffee } from "lucide-react";
import { ProgramHero } from "@/components/landing/ProgramHero";
import { ProgramHowItWorks } from "@/components/landing/ProgramHowItWorks";
import { ProgramTiers } from "@/components/landing/ProgramTiers";
import { ProgramUseCases } from "@/components/landing/ProgramUseCases";
import { ProgramWhyBuddas } from "@/components/landing/ProgramWhyBuddas";
import { ProgramFAQ } from "@/components/landing/ProgramFAQ";
import { ProgramCTA } from "@/components/landing/ProgramCTA";
import { ProgramSignupWizard } from "@/components/landing/ProgramSignupWizard";

export const metadata: Metadata = {
  title: "Corporate Catering Program | Buddas Catering",
  description:
    "Join the Buddas Corporate Catering Program. Commit to 2, 4, or 6 annual catering orders and get 10–20% off every qualifying group meal. Offices, churches, schools, and teams in Utah County.",
  openGraph: {
    title: "Buddas Corporate Catering Program",
    description:
      "Simple annual catering discounts for offices, churches, schools, and teams across Utah County. 10–20% off qualifying orders.",
  },
};

const FOOD_OPTIONS = [
  {
    icon: Sunrise,
    label: "Breakfast Catering",
    description: "Hot breakfast spreads, pastry platters, and coffee boxes for morning meetings and early events.",
  },
  {
    icon: Sun,
    label: "Lunch & Dinner Catering",
    description: "Hawaiian-style plate lunches, taco bars, sandwich platters, and salad bowls for any size group.",
  },
  {
    icon: Coffee,
    label: "Rolls & Pastries",
    description: "Fresh-baked rolls, sweet pastries, and dessert trays perfect for celebrations and staff appreciation.",
  },
];

export default function CorporateProgramPage() {
  return (
    <main>
      {/* 1. Hero */}
      <ProgramHero />

      {/* 2. How It Works */}
      <ProgramHowItWorks />

      {/* 3. Tiers */}
      <ProgramTiers />

      {/* 4. What You Can Order */}
      <section className="bg-gray-bg py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-teal-base uppercase tracking-widest">
              What You Can Order
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-teal-dark">
              Hawaiian comfort food for every occasion
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FOOD_OPTIONS.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-gray-border p-7 hover:shadow-md hover:border-teal-base/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-orange" />
                </div>
                <h3 className="font-heading font-bold text-brown text-lg mb-2">
                  {label}
                </h3>
                <p className="text-sm text-brown/65 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Perfect For */}
      <ProgramUseCases />

      {/* 6. Why Buddas */}
      <ProgramWhyBuddas />

      {/* 7. FAQ */}
      <ProgramFAQ />

      {/* 8. Signup Form */}
      <section id="signup" className="bg-cream py-4 scroll-mt-8">
        <Suspense>
          <ProgramSignupWizard />
        </Suspense>
      </section>

      {/* 9. Final CTA */}
      <ProgramCTA />
    </main>
  );
}
