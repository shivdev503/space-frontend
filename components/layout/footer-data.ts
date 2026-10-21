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

function cityLinks(
  verticalPath: string,
  labelFor: (cityName: string) => string,
): { label: string; href: string }[] {
  return siteCities.map((city) => ({
    label: labelFor(city.name),
    href: `/${toVerticalPath(verticalPath)}/${city.slug}`,
  }));
}

export const footerVerticalColumns = [
  {
    title: "Coworking",
    ariaLabel: "Coworking spaces by city",
    links: cityLinks("coworking", (city) => `Coworking Space in ${city}`),
  },
  {
    title: "Virtual Office",
    ariaLabel: "Virtual office by city",
    links: cityLinks("virtual-office", (city) => `Virtual Office in ${city}`),
  },
  {
    title: "Coliving Space",
    ariaLabel: "Coliving space by city",
    links: cityLinks("coliving", (city) => `Coliving Space in ${city}`),
  },
  {
    title: "Managed Office",
    ariaLabel: "Managed office by city",
    links: cityLinks("office-space", (city) => `Managed Office in ${city}`),
  },
] as const;

/** Kept for backwards compatibility / plain-text reuse. */
export const footerSeoKeywords =
  "Coworking Spaces in India | Virtual Office India | Managed Office | Coliving Space in India | Coworking Space Gurugram | Coworking Space Bangalore | Coworking Space Mumbai";
