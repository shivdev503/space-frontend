type Faq = { question: string; answer: string };

/** FAQPage structured data for an FAQ section rendered on the same page. */
export function FaqPageJsonLd({ faqs }: { faqs: Faq[] }) {
  const items = faqs.filter((f) => f.question?.trim() && f.answer?.trim());
  if (!items.length) return null;
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
