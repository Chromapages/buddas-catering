import { Hero } from "@/components/landing/Hero";
import { BuildYourPlatter } from "@/components/landing/BuildYourPlatter";
import { CateringCards } from "@/components/landing/CateringCards";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProvenExcellence } from "@/components/landing/ProvenExcellence";
import { FAQ } from "@/components/landing/FAQ";
import { LeadForm } from "@/components/landing/LeadForm";
import { MenuPreview } from "@/components/landing/MenuPreview";
import { Suspense } from "react";
import { client } from "@/sanity/lib/client";
import { testimonialsQuery, landingPageQuery, menuItemsQuery } from "@/sanity/lib/queries";

export default async function LandingPage() {
  const [testimonials, landingPage, menuItems] = await Promise.all([
    client.fetch(testimonialsQuery),
    client.fetch(landingPageQuery),
    client.fetch(menuItemsQuery),
  ]);

  return (
    <>
      <Hero data={landingPage?.hero} />
      <MenuPreview items={menuItems} sectionData={landingPage?.menuPreview} />
      <CateringCards sectionData={landingPage?.occasions} />
      <HowItWorks sectionData={landingPage?.howItWorks} />
      <BuildYourPlatter sectionData={landingPage?.buildYourPlatter} />
      <ProvenExcellence testimonials={testimonials} sectionData={landingPage?.trust} />
      <FAQ sectionData={landingPage?.faq} />
      <Suspense fallback={<div className="py-20 text-center text-brown/50">Loading form...</div>}>
        <LeadForm sectionData={landingPage?.leadForm} />
      </Suspense>
    </>
  );
}
