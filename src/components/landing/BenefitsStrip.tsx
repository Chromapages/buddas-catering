import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export function BenefitsStrip() {
  const benefits = [
    {
      title: "Always On Time",
      description: "We guarantee delivery 15 minutes prior to your event time. Never stress about a hungry team.",
      icon: <Clock className="w-8 h-8 text-teal-base mb-4" />
    },
    {
      title: "Dietary Safe",
      description: "Clear labeling for GF, DF, and Vegan options. We make sure everyone in the office can actually eat.",
      icon: <ShieldCheck className="w-8 h-8 text-teal-base mb-4" />
    },
    {
      title: "Full Setup Included",
      description: "We don't just drop off boxes. We set up chafing dishes, utensils, and make it look professional.",
      icon: <CheckCircle2 className="w-8 h-8 text-teal-base mb-4" />
    }
  ];

  return (
    <section className="bg-white py-16 border-y border-gray-border">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4">
              <div className="bg-teal-base/10 p-4 rounded-2xl">
                {benefit.icon}
              </div>
              <h3 className="mt-6 text-xl font-heading font-semibold text-teal-dark">{benefit.title}</h3>
              <p className="mt-3 text-brown/80 leading-relaxed max-w-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
