"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How far in advance do I need to order?",
    answer: "We prefer 48 hours notice to guarantee your preferred delivery time and exact menu choices. However, for last-minute emergencies, please call us directly — we can almost always accommodate next-day orders for standard menus."
  },
  {
    question: "Do you provide plates, napkins, and utensils?",
    answer: "Yes! Every catering order includes premium disposable plates, heavy-duty cutlery, napkins, and serving utensils. We also offer chafing dish wire racks and Sterno fuel for a small setup fee to keep food hot for longer events."
  },
  {
    question: "Are there minimum order amounts?",
    answer: "Our catering packages start at a minimum of 10 people. For smaller groups, you are welcome to place a standard takeout order for pickup."
  },
  {
    question: "How do dietary restrictions work?",
    answer: "We take dietary needs seriously. Our standard menus include clearly labeled gluten-free and dairy-free options. If you have specific severe allergies or need vegan accommodations, please note them in the form and we will coordinate directly with you."
  },
  {
    question: "What happens if we sign up for a 6-event membership but only do 5?",
    answer: "We get it, things happen. We offer a 60-day grace period into the next year to use your final event. We focus on building long-term relationships, not catching you on technicalities."
  }
];

interface FAQProps {
  sectionData?: {
    headline?: string;
    subheadline?: string;
  };
}

export function FAQ({ sectionData }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const headline = sectionData?.headline || "Common Questions";
  const subheadline = sectionData?.subheadline || "Everything you need to know about island-inspired catering for your team.";

  return (
    <section id="faq" className="bg-cream pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-teal-dark mb-4">
            {headline}
          </h2>
          <p className="text-lg text-brown/80 max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-teal-base shadow-md bg-white' : 'border-gray-border bg-white/50 hover:bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-4 py-4 md:px-6 md:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-base focus-visible:ring-inset"
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-lg font-heading ${isOpen ? 'text-teal-dark' : 'text-brown'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-teal-base transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`px-4 md:px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-brown/80 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-brown/60 mb-2">Still have questions?</p>
          <Link href="#book" className="text-teal-base font-bold hover:underline">
            Chat with a catering specialist →
          </Link>
        </div>
      </div>
    </section>
  );
}
