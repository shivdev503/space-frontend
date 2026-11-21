/** Internal links and copy for the global footer (SEO + navigation). */

import { verticalPath as toVerticalPath } from "@/lib/vertical-path";
import { siteCities } from "@/utils/constants";

/** Bottom bar: keyword phrases split for semantic links (SEO signals). */
export const footerBottomKeywordLinks = [
  { label: "Coworking Spaces in India", href: "/coworking" },
  { label: "Virtual Office India", href: "/virtual-office" },
  { label: "Managed Office", href: "/managed-office" },
  { label: "Coliving Space in India", href: "/coliving" },
  { label: "Coworking Space Gurugram", href: "/coworking/gurgaon" },
  { label: "Coworking Space Bangalore", href: "/coworking/bangalore" },
  { label: "Coworking Space Mumbai", href: "/coworking/mumbai" },
] as const;

export const footerBottomTagline =
  "India's Premium Coworking & Managed Office Discovery Platform";

type FooterLink = { label: string; href: string };

/**
 * City links for one column. `cityPages` (URL segment → city slugs with an indexable page, from
 * the city sitemap) keeps out pages Google is told not to index. When it is unknown, columns marked
 * `alwaysIndexable` list every site city and the others show only their hub link.
 */
function cityLinks(
  vertical: string,
  labelFor: (cityName: string) => string,
  hub: FooterLink,
  cityPages: Record<string, string[]> | null,
  alwaysIndexable: boolean,
): FooterLink[] {
  const segment = toVerticalPath(vertical);
  const live = cityPages ? new Set(cityPages[segment] ?? []) : null;
  const cities = live ? siteCities.filter((city) => live.has(city.slug)) : alwaysIndexable ? siteCities : [];
  const links = cities.map((city) => ({ label: labelFor(city.name), href: `/${segment}/${city.slug}` }));
  return links.length ? links : [hub];
}

/** One column per space vertical, cities listed under each — only city pages Google may index. */
export function footerVerticalColumns(cityPages: Record<string, string[]> | null) {
  return [
    {
      title: "Coworking",
      ariaLabel: "Coworking spaces by city",
      links: cityLinks("coworking", (city) => `Coworking Space in ${city}`, { label: "Coworking Spaces in India", href: "/coworking" }, cityPages, true),
    },
    {
      title: "Virtual Office",
      ariaLabel: "Virtual office by city",
      links: cityLinks("virtual-office", (city) => `Virtual Office in ${city}`, { label: "Virtual Office India", href: "/virtual-office" }, cityPages, true),
    },
    {
      title: "Coliving Space",
      ariaLabel: "Coliving space by city",
      links: cityLinks("coliving", (city) => `Coliving Space in ${city}`, { label: "Coliving Space in India", href: "/coliving" }, cityPages, true),
    },
    {
      // Most cities have no managed offices yet; those city pages are noindex.
      title: "Managed Office",
      ariaLabel: "Managed office by city",
      links: cityLinks("office-space", (city) => `Managed Office in ${city}`, { label: "Managed Office", href: "/managed-office" }, cityPages, false),
    },
  ];
}

/** Kept for backwards compatibility / plain-text reuse. */
export const footerSeoKeywords =
  "Coworking Spaces in India | Virtual Office India | Managed Office | Coliving Space in India | Coworking Space Gurugram | Coworking Space Bangalore | Coworking Space Mumbai";
