import { Hero } from "@/components/landing/Hero";
import { BenefitsStrip } from "@/components/landing/BenefitsStrip";
import { CateringCards } from "@/components/landing/CateringCards";
import { MembershipTiers } from "@/components/landing/MembershipTiers";
import { SocialProof } from "@/components/landing/SocialProof";
import { FAQ } from "@/components/landing/FAQ";
import { LeadForm } from "@/components/landing/LeadForm";
import { MenuPreview } from "@/components/landing/MenuPreview";
import { Suspense } from "react";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <BenefitsStrip />
      <CateringCards />
      <MenuPreview />
      <MembershipTiers />
      <SocialProof />
      <FAQ />
      <Suspense fallback={<div className="py-20 text-center text-brown/50">Loading form...</div>}>
        <LeadForm />
      </Suspense>
    </>
  );
}
