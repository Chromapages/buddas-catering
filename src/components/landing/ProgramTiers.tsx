import { Check } from "lucide-react";

const TIERS = [
  {
    events: 2,
    discount: "10%",
    label: "2 Orders / Year",
    tag: null,
    forWho: "Occasional use",
    description:
      "For organizations that host a few group meals or events per year and want to lock in savings without a big commitment.",
    useCases: [
      "Seasonal team lunches",
      "Annual appreciation events",
      "Holiday or end-of-year gatherings",
    ],
    tierParam: "10",
  },
  {
    events: 4,
    discount: "15%",
    label: "4 Orders / Year",
    tag: "Most Popular",
    forWho: "Quarterly gatherings",
    description:
      "The sweet spot for offices, churches, and schools that gather for meals on a regular quarterly schedule.",
    useCases: [
      "Quarterly staff meetings",
      "Church community events",
      "PTA fundraisers and school functions",
    ],
    tierParam: "15",
  },
  {
    events: 6,
    discount: "20%",
    label: "6 Orders / Year",
    tag: "Best Value",
    forWho: "Regular group meals",
    description:
      "Built for organizations that feed groups consistently and want the best possible discount on every qualifying order.",
    useCases: [
      "Bi-monthly staff meals",
      "Recurring nonprofit events",
      "Frequent team celebrations",
    ],
    tierParam: "20",
  },
];

export function ProgramTiers() {
  return (
    <section id="tiers" className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-bold text-teal-base uppercase tracking-widest">
            Program Tiers
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-teal-dark">
            Choose the commitment that fits your year
          </h2>
          <p className="mt-4 text-brown/70 max-w-xl mx-auto text-base">
            Every tier unlocks a flat discount on all qualifying catering orders
            of $200 or more, for the full 12-month term.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TIERS.map((tier) => {
            const isFeatured = tier.tag === "Most Popular";
            return (
              <div
                key={tier.events}
                className={`relative flex flex-col rounded-2xl border-2 p-8 transition-shadow ${
                  isFeatured
                    ? "border-teal-dark shadow-xl shadow-teal-dark/10 md:scale-105 md:-translate-y-1"
                    : "border-gray-border hover:border-teal-base/40 hover:shadow-md"
                }`}
              >
                {tier.tag && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      isFeatured
                        ? "bg-orange text-white"
                        : "bg-teal-dark text-white"
                    }`}
                  >
                    {tier.tag}
                  </span>
                )}

                <div className="mb-6">
                  <p className="text-xs font-bold text-brown/40 uppercase tracking-widest mb-1">
                    {tier.forWho}
                  </p>
                  <h3 className="text-xl font-heading font-bold text-brown">
                    {tier.label}
                  </h3>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-heading font-black text-teal-dark">
                    {tier.discount}
                  </span>
                  <span className="text-brown/60 text-sm ml-2">
                    off every qualifying order
                  </span>
                </div>

                <p className="text-sm text-brown/70 leading-relaxed mb-6">
                  {tier.description}
                </p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.useCases.map((uc) => (
                    <li key={uc} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-base mt-0.5 shrink-0" />
                      <span className="text-sm text-brown/80">{uc}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`#signup`}
                  className={`w-full flex items-center justify-center py-3.5 rounded-xl font-bold text-sm transition-colors ${
                    isFeatured
                      ? "bg-teal-dark text-white hover:bg-teal-dark/90"
                      : "bg-gray-bg text-brown hover:bg-teal-base/10 hover:text-teal-dark"
                  }`}
                >
                  Join at {tier.discount} Off
                </a>
              </div>
            );
          })}
        </div>

        {/* Member Math callout */}
        <div className="mt-12 bg-teal-base/8 border border-teal-base/20 rounded-2xl p-8 max-w-3xl mx-auto text-center">
          <p className="text-sm font-bold text-teal-dark uppercase tracking-widest mb-2">
            Member Math
          </p>
          <p className="text-brown/80 text-base leading-relaxed">
            A team lunch for 40 people at{" "}
            <span className="font-bold text-brown">$18/person = $720</span>.
            With the 4-order tier, you save{" "}
            <span className="font-bold text-teal-dark">$108 per order</span> —
            that&apos;s{" "}
            <span className="font-bold text-teal-dark">$432 saved</span> over
            the year on four orders alone.
          </p>
        </div>
      </div>
    </section>
  );
}
