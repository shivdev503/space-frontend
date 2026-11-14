import Link from "next/link";

import { Container } from "@/components/ui/container";
import type { AreaInsights } from "@/services/area-insights";

/**
 * "At a glance" block on locality pages: facts from the area's live listings, a few named listings,
 * and links to nearby areas. Rendered on the server so the text and links are in the page HTML.
 */
export function AreaInsightsSection({ insights }: { insights: AreaInsights | null }) {
  if (!insights) return null;
  const { heading, summary, facts, highlights, nearby } = insights;

  return (
    <section className="pb-14 sm:pb-20" aria-labelledby="area-insights-heading">
      <Container>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 id="area-insights-heading" className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {heading}
          </h2>
          {summary.map((p) => (
            <p key={p} className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-ink/85 sm:text-base">
              {p}
            </p>
          ))}

          {facts.length ? (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl bg-[#f9f8f5] px-4 py-3">
                  <dt className="text-xs text-muted">{f.label}</dt>
                  <dd className="mt-1 text-base font-semibold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {highlights.length ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((h) => (
                <div key={h.title}>
                  <h3 className="text-sm font-semibold text-ink">{h.title}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {h.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="font-medium text-[color:var(--color-brand)] hover:underline">
                          {l.name}
                        </Link>
                        {l.note ? <span className="text-muted"> · {l.note}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}

          {nearby.length ? (
            <div className="mt-8 border-t border-slate-200/80 pt-6">
              <h3 className="text-sm font-semibold text-ink">Nearby areas</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {nearby.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 px-3.5 py-1.5 text-sm text-ink transition hover:border-[color:var(--color-brand)]"
                    >
                      {n.name}
                      {n.note ? <span className="text-xs text-muted">{n.note}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
