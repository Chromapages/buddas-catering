import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Buddas Catering. Placeholder launch copy pending legal review.",
};

const sections = [
  {
    heading: "Service Scope",
    body:
      "Buddas Catering provides corporate catering, delivery, and related event services subject to menu availability, scheduling capacity, staffing, and operational constraints.",
  },
  {
    heading: "Quotes and Orders",
    body:
      "Quotes are estimates until confirmed in writing. Orders may require approval, scheduling confirmation, minimum lead times, deposits, or final headcount confirmation before fulfillment.",
  },
  {
    heading: "Cancellations and Changes",
    body:
      "Client-requested changes, cancellations, or reschedules may be subject to cutoffs, availability, and fees depending on timing, preparation status, and vendor commitments.",
  },
  {
    heading: "Payment Terms",
    body:
      "Invoices are due according to the payment terms provided at booking. Late balances may delay future services or trigger collection procedures where permitted by law.",
  },
  {
    heading: "Dietary and Event Information",
    body:
      "Clients are responsible for providing accurate event details, guest counts, delivery instructions, and dietary information. While we aim to accommodate requests, cross-contact risks may still exist.",
  },
  {
    heading: "Liability Limits",
    body:
      "To the fullest extent permitted by law, liability should be limited to the amount paid for the affected service, excluding indirect, incidental, or consequential damages.",
  },
  {
    heading: "Website Use",
    body:
      "Users may not misuse the website, interfere with service operation, attempt unauthorized access, or submit fraudulent or misleading request information.",
  },
  {
    heading: "Updates",
    body:
      "These placeholder terms may be updated from time to time. Final production terms should state when changes become effective and how continued use is treated.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-gray-bg">
      <section className="border-b border-gray-border/60 bg-white">
        <div className="container-rig py-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-base/70">Terms of Service</p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold tracking-tight text-teal-dark sm:text-5xl">
            Placeholder service terms for final launch review.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-brown/70">
            This page is intentionally generic so we can complete launch prep. Please have legal counsel review and replace this content before public release.
          </p>
        </div>
      </section>

      <section className="container-rig py-12">
        <div className="rounded-[32px] border border-orange/20 bg-orange/5 p-6 text-sm leading-7 text-brown/80">
          Legal review required: these terms are not final legal advice and should be approved by counsel before launch.
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
