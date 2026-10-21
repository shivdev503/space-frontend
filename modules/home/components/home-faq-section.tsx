"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/utils/cn";

const FAQS = [
  {
    question: "Do I pay SpaceWallah anything?",
    answer:
      "No. Operators and landlords pay us. Your price is the same or lower than booking direct, and we negotiate on your behalf.",
  },
  {
    question: "How fast can I move into a coworking space?",
    answer: "Usually within 48 hours of your site visit. Day passes work the same day.",
  },
  {
    question: "What is the difference between managed and leased offices?",
    answer:
      "A managed office is designed, fitted out and run by an operator for one monthly per-seat price. A leased office is your own lease with a landlord, priced per sq ft, where you handle fit-out and running costs.",
  },
  {
    question: "Is a virtual office address valid for GST registration?",
    answer:
      "Yes. Our GST plans include an NOC, rent agreement and utility bill accepted for GST registration in Delhi, Haryana and Uttar Pradesh.",
  },
  {
    question: "Which documents come with a virtual office?",
    answer:
      "An NOC from the owner, a rent agreement, a recent utility bill, plus signage and mail handling. Company registration plans also cover your MCA registered office.",
  },
  {
    question: "What lock-in and deposit should I expect on a lease?",
    answer:
      "Commercial leases usually have a 3 year lock-in with 6 to 10 months of rent as deposit. Managed offices typically need 12 to 36 months and 2 to 3 months deposit.",
  },
];

export function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f1d52]">
          FAQ
        </p>
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-normal text-ink sm:text-4xl">
          Questions,
          <br />
          answered
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-6 text-muted sm:text-base">
          Straight answers before you shortlist, visit, or sign.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          const panelId = `home-faq-panel-${index}`;
          const buttonId = `home-faq-button-${index}`;

          return (
            <article
              key={faq.question}
              className={cn(
                "rounded-[1.25rem] border border-transparent transition-all duration-300",
                isOpen
                  ? "border-[#8f1d52]/12 bg-[#fff8fb] shadow-[0_14px_36px_rgba(143,29,82,0.08)]"
                  : "hover:bg-slate-50/80",
                index > 0 && "mt-1",
              )}
            >
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#8f1d52] focus-visible:ring-offset-2 sm:px-6 sm:py-6"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className="text-base font-semibold leading-snug text-ink sm:text-lg lg:text-xl">
                  {faq.question}
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all sm:h-9 sm:w-9",
                    isOpen
                      ? "border-[#8f1d52]/20 bg-white text-[#8f1d52] shadow-sm"
                      : "border-slate-200 bg-white text-ink",
                  )}
                  aria-hidden
                >
                  {isOpen ? (
                    <X className="h-4 w-4 stroke-[2.4]" />
                  ) : (
                    <Plus className="h-4 w-4 stroke-[2.4]" />
                  )}
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0">
                  <p className="max-w-4xl px-5 pb-5 text-sm leading-7 text-muted sm:px-6 sm:pb-6 sm:text-base sm:leading-7 lg:text-[1.0625rem]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}