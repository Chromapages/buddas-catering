import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Buddas Catering. Placeholder launch copy pending legal review.",
};

const sections = [
  {
    heading: "What We Collect",
    body:
      "We may collect contact details, company information, event details, communication preferences, and order history when you request a quote, place an order, or communicate with our team.",
  },
  {
    heading: "How We Use Information",
    body:
      "We use collected information to respond to catering inquiries, fulfill orders, improve service quality, send service-related updates, and maintain internal CRM records for customer support and sales operations.",
  },
  {
    heading: "Sharing",
    body:
      "We do not sell personal information. We may share limited data with service providers that support hosting, payments, analytics, communication, or delivery operations when needed to run the business.",
  },
  {
    heading: "Cookies and Analytics",
    body:
      "Our website may use cookies, analytics, and attribution tools to understand traffic sources, improve page performance, and measure campaign effectiveness.",
  },
  {
    heading: "Data Retention",
    body:
      "We retain information for as long as reasonably necessary to operate the business, meet legal obligations, resolve disputes, and maintain accurate account and order records.",
  },
  {
    heading: "Your Choices",
    body:
      "You may request access, correction, or deletion of your information where applicable. Marketing emails, if used, should include a clear unsubscribe path.",
  },
  {
    heading: "Contact",
    body:
      "Questions about this policy can be directed to Buddas Catering using the contact information published on the website.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-gray-bg">
      <section className="border-b border-gray-border/60 bg-white">
        <div className="container-rig py-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-base/70">Privacy Policy</p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold tracking-tight text-teal-dark sm:text-5xl">
            Placeholder privacy terms for launch preparation.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-brown/70">
            This page is a starting point for launch readiness only. Review and replace this copy with attorney-approved language before the site goes live.
          </p>
        </div>
      </section>

      <section className="container-rig py-12">
        <div className="rounded-[32px] border border-orange/20 bg-orange/5 p-6 text-sm leading-7 text-brown/80">
          Legal review required: this privacy policy is a placeholder and may not reflect all applicable state, federal, or industry-specific requirements.
        </div>
        <div className="mt-10 space-y-8 rounded-[32px] bg-white p-8 shadow-lg shadow-brown/5 sm:p-10">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-heading text-2xl font-semibold text-teal-dark">{section.heading}</h2>
              <p className="mt-3 text-base leading-7 text-brown/75">{section.body}</p>
            </div>
          ))}
          <p className="border-t border-gray-border pt-8 text-sm text-brown/50">
            Last updated: April 3, 2026
          </p>
        </div>
      </section>
    </div>
  );
}
