import { ChefHat, Scale, ClipboardList, ThumbsUp, RefreshCw } from "lucide-react";

const POINTS = [
  {
    icon: ChefHat,
    title: "Crowd-pleasing Hawaiian comfort food",
    description:
      "Bold flavors that work for every office palate — not bland catering-safe food that gets ignored.",
  },
  {
    icon: Scale,
    title: "Generous portions, every time",
    description:
      "No skimping. Enough food so your group actually gets full and you&apos;re not scrambling for pizza after.",
  },
  {
    icon: ClipboardList,
    title: "Easy group ordering",
    description:
      "One call or one form. No giant spreadsheets, no per-person customization headaches.",
  },
  {
    icon: ThumbsUp,
    title: "Warm, dependable service",
    description:
      "We show up when we say we will. Consistent quality across every order, every event.",
  },
  {
    icon: RefreshCw,
    title: "Built for repeat annual use",
    description:
      "The program is designed around real calendars — quarterly meetings, annual events, recurring gatherings.",
  },
];

export function ProgramWhyBuddas() {
  return (
    <section className="bg-teal-dark py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-bold text-teal-base uppercase tracking-widest">
            Why Buddas
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-white">
            Food your group will actually look forward to
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POINTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 bg-white/8 border border-white/10 rounded-2xl p-6 hover:bg-white/12 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-teal-base/20 flex items-center justify-center mt-0.5">
                <Icon className="w-5 h-5 text-teal-base" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-base mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}

          {/* CTA card fills the 6th spot */}
          <div className="flex flex-col items-center justify-center bg-orange/15 border border-orange/30 rounded-2xl p-6 text-center">
            <p className="text-white font-bold text-base mb-4">
              Ready to lock in your discount?
            </p>
            <a
              href="#signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 transition-colors text-sm"
            >
              Join the Program
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
