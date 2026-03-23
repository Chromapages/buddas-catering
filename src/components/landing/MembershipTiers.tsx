import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Check } from "lucide-react";
import Link from "next/link";

export function MembershipTiers() {
  const tiers = [
    {
      name: "2 Events/Year",
      discount: "5%",
      description: "Perfect for quarterly planning meetings and holiday parties.",
      features: [
        "5% off all catering orders",
        "Dedicated account rep",
        "Priority delivery window",
      ],
      recommended: false,
    },
    {
      name: "4 Events/Year",
      discount: "10%",
      description: "Our most popular tier for consistent team building throughout the year.",
      features: [
        "10% off all catering orders",
        "Dedicated account rep",
        "Priority delivery window",
        "Flexible rescheduling (48hr)",
      ],
      recommended: true,
    },
    {
      name: "6+ Events/Year",
      discount: "15%",
      description: "For offices that run on Hawaiian BBQ. Maximum savings and perks.",
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

  return (
    <section id="memberships" className="bg-white py-24 border-t border-gray-border">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-16">
          <Badge variant="warning" className="mb-4">Corporate Memberships</Badge>
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-teal-dark mb-4 drop-shadow-sm">
            Commit. Save. Eat Better.
          </h2>
          <p className="text-lg text-brown/80 max-w-2xl mx-auto">
            Lock in your event dates early and save up to 15% on your total catering spend. No upfront cost — you only pay per event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, i) => (
            <Card 
              key={i} 
              className={`relative flex flex-col h-full transition-transform hover:-translate-y-1 duration-300 ${tier.recommended ? 'border-2 border-teal-base shadow-xl md:-translate-y-4 md:hover:-translate-y-6' : 'border-gray-border'}`}
            >
              {tier.recommended && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-teal-base text-white px-3 py-1 text-sm font-bold shadow-sm">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-xl text-brown/80">{tier.name}</CardTitle>
                <div className="mt-4 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-teal-dark font-heading tracking-tight">{tier.discount}</span>
                  <span className="text-sm font-medium text-brown/60 uppercase tracking-widest mt-1">Discount</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-4">
                <CardDescription className="text-center text-sm mb-6 pb-6 border-b border-gray-border/50">
                  {tier.description}
                </CardDescription>
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start text-sm text-brown/90">
                      <Check className="h-5 w-5 text-teal-base mr-3 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6 pb-8">
                <Button 
                  className="w-full shadow-sm" 
                  variant={tier.recommended ? "primary" : "outline"} 
                  asChild
                >
                  <Link href={`#book?membership=${encodeURIComponent(tier.name)}`}>
                    Select {tier.name}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
