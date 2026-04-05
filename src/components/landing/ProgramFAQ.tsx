"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "Do I need to prepay or pay upfront?",
    answer:
      "No. There is no signup fee and no prepayment required. You pay per order as each catering event is booked and confirmed. The program simply locks in your discount rate for the 12-month term.",
  },
  {
    question: "What types of organizations can join?",
    answer:
      "Any business, office, church, school, PTA, nonprofit, team, or community group in Utah County is welcome to join. If you regularly feed a group of 10 or more people, this program is built for you.",
  },
  {
    question: "Can I use this program for multiple events throughout the year?",
    answer:
      "Yes — that's the whole point. You commit to a yearly catering volume (2, 4, or 6 orders), and your discount applies to each qualifying order you place throughout the 12-month term.",
  },
  {
    question: "What kinds of catering do you offer?",
    answer:
      "We offer Breakfast Catering, Lunch & Dinner Catering, and Rolls & Pastry Platters. Hawaiian-inspired comfort food that works for team meals, community events, and celebrations.",
  },
  {
    question: "What counts as a qualifying order?",
    answer:
      "Any catering order of $200 or more (before the member discount is applied) counts as a qualifying order toward your commitment. Orders below $200 are still welcome but do not count toward your annual commitment total.",
  },
  {
    question: "How far in advance should I place an order?",
    answer:
      "We recommend 48–72 hours in advance to ensure availability and accurate preparation. For large events (100+ guests) or peak days like Fridays, a week or more of lead time is ideal.",
  },
  {
    question: "Can I combine the program discount with other promotions?",
    answer:
      "No. The corporate program discount cannot be combined with other promotional offers or discount codes. The program rate is already designed to be the best consistent discount we offer.",
  },
];

export function ProgramFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-teal-base uppercase tracking-widest">
            Program Details
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-teal-dark">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "border rounded-xl overflow-hidden transition-colors",
                open === i ? "border-teal-base/40 bg-teal-base/4" : "border-gray-border"
              )}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-brown text-sm sm:text-base pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-teal-base shrink-0 transition-transform duration-200",
                    open === i && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  open === i ? "max-h-64" : "max-h-0"
                )}
              >
                <p className="px-6 pb-5 text-sm text-brown/70 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm text-brown/50">
          More questions?{" "}
          <a
            href="#signup"
            className="text-teal-base font-semibold hover:text-teal-dark underline underline-offset-4"
          >
            Talk to our catering team
          </a>
        </p>
      </div>
    </section>
  );
}
