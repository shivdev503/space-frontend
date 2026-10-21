import Link from "next/link";

import { Container } from "@/components/ui/container";
import {
  footerBottomKeywordLinks,
  footerBottomTagline,
  footerVerticalColumns,
} from "@/components/layout/footer-data";
import { cn } from "@/utils/cn";

const FOOTER_BG = "#f9f8f5";

const linkClass =
  "block text-sm leading-snug text-slate-600 transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9f8f5]";

const groupTitleClass =
  "text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500";

function VerticalLinkList({
  items,
}: {
  items: readonly { label: string; href: string }[];
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.href + item.label}>
          <Link href={item.href} className={linkClass}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Structured SEO + navigation block — one column per space vertical, cities listed under each.
 * Renders **below** CMS `SeoFooterContentSection` and above the compact `Footer`.
 */
export function FooterMarketingSection() {
  const year = new Date().getFullYear();

  return (
    <section
      className="border-t border-slate-200/80"
      style={{ backgroundColor: FOOTER_BG }}
      aria-label="SpaceWallah workspace links"
    >
      <Container className="py-12 sm:py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-8 xl:gap-12">
          {footerVerticalColumns.map((column) => (
            <nav key={column.title} aria-label={column.ariaLabel}>
              <p className={groupTitleClass}>{column.title}</p>
              <div className="mt-4">
                <VerticalLinkList items={column.links} />
              </div>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-200/80 pt-8 sm:mt-14 sm:pt-10">
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-500 sm:gap-5 sm:text-sm">
            <p>
              <span className="text-slate-600">
                © {year} SpaceWallah. All rights reserved.
              </span>
              <span className="mx-2 text-slate-400" aria-hidden>
                |
              </span>
              <span>{footerBottomTagline}</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[0.8125rem] text-slate-500 sm:text-xs">
              {footerBottomKeywordLinks.map((kw, i) => (
                <span key={kw.href} className="inline-flex items-center gap-2">
                  {i > 0 ? (
                    <span className="text-slate-300" aria-hidden>
                      |
                    </span>
                  ) : null}
                  <Link
                    href={kw.href}
                    className={cn(
                      "font-medium text-slate-600 underline-offset-2 transition hover:text-ink hover:underline",
                    )}
                  >
                    {kw.label}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
