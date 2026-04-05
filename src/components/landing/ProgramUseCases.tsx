import {
  Building2,
  Landmark,
  GraduationCap,
  Users,
  Heart,
  Sparkles,
  Trophy,
  Globe,
} from "lucide-react";

const ORGS = [
  { icon: Building2, label: "Offices" },
  { icon: Landmark, label: "Churches" },
  { icon: GraduationCap, label: "Schools" },
  { icon: Users, label: "PTAs" },
  { icon: Heart, label: "Nonprofits" },
  { icon: Sparkles, label: "Weddings" },
  { icon: Trophy, label: "Team Events" },
  { icon: Globe, label: "Community Gatherings" },
];

export function ProgramUseCases() {
  return (
    <section className="bg-cream py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-teal-base uppercase tracking-widest">
            Built For
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-teal-dark">
            Any organization that feeds a group
          </h2>
          <p className="mt-4 text-brown/65 max-w-xl mx-auto text-base">
            The program works for businesses, faith communities, schools, and
            event organizers across Utah County.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {ORGS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-border px-4 py-6 hover:border-teal-base/40 hover:shadow-sm transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-base/10 flex items-center justify-center group-hover:bg-teal-base/20 transition-colors">
                <Icon className="w-5 h-5 text-teal-dark" />
              </div>
              <span className="text-sm font-semibold text-brown text-center leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
