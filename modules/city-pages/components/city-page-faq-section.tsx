import { FaqPageJsonLd } from "@/components/seo/faq-page-json-ld";
import { Container } from "@/components/ui/container";
import type { FAQItem } from "@/types";

export function CityPageFaqSection({ pageTitle, faqs }: { pageTitle: string; faqs: FAQItem[] }) {
  if (!faqs.length) return null;

  return (
    <section className="pb-28 sm:pb-20">
      <FaqPageJsonLd faqs={faqs} />
      <Container>
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-brand)]">FAQs</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-[2rem]">
            Frequently asked questions about {pageTitle.toLowerCase()}
          </h2>
        </div>
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-[1.4rem] border border-slate-200/80 bg-white p-5 shadow-soft"
            >
              <summary className="cursor-pointer list-none text-lg font-semibold text-ink">{faq.question}</summary>
              <p className="mt-4 text-sm leading-7 text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
