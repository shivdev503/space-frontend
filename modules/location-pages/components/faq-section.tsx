import { ChevronDown } from "lucide-react";

import { FaqPageJsonLd } from "@/components/seo/faq-page-json-ld";
import { Container } from "@/components/ui/container";
import { FAQItem } from "@/types";
import { cn } from "@/utils/cn";

type FAQSectionProps = {
  faqs: FAQItem[];
  locationName: string;
  className?: string;
};

export function FAQSection({ faqs, locationName, className }: FAQSectionProps) {
  if (!faqs.length) return null;

  return (
    <section className={cn("bg-[#f9f8f5] pb-14 pt-4 sm:pb-20 sm:pt-6", className)}>
      <FaqPageJsonLd faqs={faqs} />
      <Container>
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-brand)]">
            FAQs
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
            Frequently asked questions for {locationName}
          </h2>
        </div>

        <div className="mt-8 grid max-w-4xl gap-3 sm:gap-4">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)] open:shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
            >
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5",
                  "[&::-webkit-details-marker]:hidden",
                )}
              >
                <span className="text-base font-semibold leading-snug text-ink sm:text-lg">
                  {faq.question}
                </span>
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 text-slate-600 transition group-open:rotate-180 group-open:border-[rgba(76,175,80,0.35)] group-open:bg-[rgba(76,175,80,0.1)] group-open:text-[#2E7D32]"
                  aria-hidden
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
                </span>
              </summary>
              <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                <p className="text-sm leading-7 text-muted sm:text-[0.9375rem]">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
