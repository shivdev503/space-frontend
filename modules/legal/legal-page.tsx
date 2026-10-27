import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Container } from "@/components/ui/container";

export type LegalSection = {
  id: string;
  heading: string;
  body: ReactNode;
};

/** Shared layout for the privacy policy, terms and refund policy pages. */
export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: ReactNode;
  /** Human-readable "last updated" date. */
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <section className="bg-white pb-20 pt-6 sm:pb-28 sm:pt-10">
      <Container className="max-w-[880px]">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: title }]} />
        <h1 className="mt-6 font-display text-[2rem] leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
        <div className="mt-6 text-[0.975rem] leading-7 text-ink/85">{intro}</div>

        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">On this page</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-ink/80 hover:text-[color:var(--color-brand)]">
                  {index + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                {index + 1}. {section.heading}
              </h2>
              <div className="legal-body mt-3 space-y-3 text-[0.975rem] leading-7 text-ink/85 [&_a]:font-medium [&_a]:text-[color:var(--color-brand)] [&_a:hover]:underline [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}
