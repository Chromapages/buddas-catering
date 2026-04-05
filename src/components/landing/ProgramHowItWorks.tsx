import { ClipboardCheck, Tag, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardCheck,
    number: "01",
    title: "Choose Your Annual Commitment",
    description:
      "Select a catering tier based on how many qualifying orders you expect to place in the next 12 months.",
  },
  {
    icon: Tag,
    number: "02",
    title: "Get a Discount on Every Qualifying Order",
    description:
      "Your discount applies automatically to every qualifying catering order of $200 or more placed during the year.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Use Buddas All Year Long",
    description:
      "Book breakfast, lunch, pastries, and more for meetings, events, and gatherings — Buddas handles the rest.",
  },
];

export function ProgramHowItWorks() {
  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-bold text-teal-base uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-teal-dark">
            Simple by design
          </h2>
          <p className="mt-4 text-brown/70 max-w-xl mx-auto text-base">
            No complicated contracts. No up-front payments. Just commit to a
            catering volume and save every time you order.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-9 left-[16.7%] right-[16.7%] h-0.5 bg-teal-base/20" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-18 h-18 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-2xl bg-teal-base/10" />
                <step.icon className="relative z-10 w-8 h-8 text-teal-dark" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-teal-dark text-white text-[10px] font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-brown mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-brown/65 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
