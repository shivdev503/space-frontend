import Link from "next/link";

import { cn } from "@/utils/cn";

/** Same origin on server and client (the browser's own origin would differ on www / preview hosts). */
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://spacewallah.com").replace(/\/+$/, "");

function absoluteUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return href === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${href}`;
}

export type BreadcrumbItem = {
  name: string;
  /** Omit for the current page (last item). */
  href?: string;
};

/** BreadcrumbList structured data; the last item without `href` is the current page. */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const list = items.filter((item) => item.name.trim());
  if (list.length < 2) return null;
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  }).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/**
 * Visible breadcrumb trail plus matching BreadcrumbList JSON-LD.
 */
export function Breadcrumbs({
  items,
  className,
  separator = "/",
}: {
  items: BreadcrumbItem[];
  className?: string;
  separator?: string;
}) {
  const list = items.filter((item) => item.name.trim());
  if (list.length < 2) return null;
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("min-w-0 text-[13px] text-muted sm:text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {list.map((item, index) => {
            const last = index === list.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex min-w-0 items-center gap-2">
                {index > 0 ? (
                  <span className="opacity-50" aria-hidden>
                    {separator}
                  </span>
                ) : null}
                {item.href && !last ? (
                  <Link href={item.href} className="transition hover:text-ink">
                    {item.name}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-ink" aria-current={last ? "page" : undefined}>
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <BreadcrumbJsonLd items={list} />
    </>
  );
}
