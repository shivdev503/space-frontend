import type { SitemapIndexEntry, SitemapUrlEntry } from "@/lib/sitemap-xml";
import { canonicalCoworkingCitySlug } from "@/services/catalog-city-id";
import { resolveAppUrl } from "@/services/env-config";
import { listHomepageCitiesFromAvailable } from "@/services/homepage-available-cities";
import { listCitiesByVertical, listSpaces } from "@/services/mock-db";
import type { SpaceVertical } from "@/types";
import { verticalPath } from "@/lib/vertical-path";

const VERTICALS: SpaceVertical[] = ["coworking", "virtual-office", "office-space", "coliving"];

function baseOrigin(): string {
  return resolveAppUrl().replace(/\/$/, "");
}

export function toAbsoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${baseOrigin()}${path}`;
}

function normalizeCitySegment(vertical: SpaceVertical, citySlug: string): string {
  if (
    vertical === "coworking" ||
    vertical === "virtual-office" ||
    vertical === "office-space" ||
    vertical === "coliving"
  ) {
    return canonicalCoworkingCitySlug(citySlug);
  }
  return citySlug.trim();
}

function citySlugSet(vertical: SpaceVertical): Set<string> {
  return new Set(
    listHomepageCitiesFromAvailable(vertical).map((c) => normalizeCitySegment(vertical, c.slug)),
  );
}

function dedupeSort(urls: string[]): string[] {
  return Array.from(new Set(urls)).sort((a, b) => a.localeCompare(b));
}

/** `/sitemap/main-pages-sitemap.xml` — homepage, vertical hubs, list-your-space. */
export function buildMainPagesSitemapEntries(lastmod: Date): SitemapUrlEntry[] {
  const b = baseOrigin();
  return [
    { loc: `${b}/`, lastmod, changefreq: "daily", priority: 1 },
    { loc: `${b}/coworking`, lastmod, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/virtual-office`, lastmod, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/managed-office`, lastmod, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/coliving`, lastmod, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/list-your-space`, lastmod, changefreq: "monthly", priority: 0.5 },
  ];
}

/** Root `/sitemap.xml` — sitemap index (child documents under `/sitemap/`). */
export function buildRootSitemapIndexEntries(lastmod: Date): SitemapIndexEntry[] {
  const b = baseOrigin();
  return [
    { loc: `${b}/sitemap/main-pages-sitemap.xml`, lastmod },
    { loc: `${b}/sitemap/city-pages-sitemap.xml`, lastmod },
    { loc: `${b}/sitemap/locality-pages-sitemap.xml`, lastmod },
    { loc: `${b}/sitemap/coworking-spaces-sitemap.xml`, lastmod },
    { loc: `${b}/sitemap/virtual-office-spaces-sitemap.xml`, lastmod },
    { loc: `${b}/sitemap/office-space-sitemap.xml`, lastmod },
    { loc: `${b}/sitemap/coliving-spaces-sitemap.xml`, lastmod },
  ];
}

/** `/{vertical}/{city}` from homepage-available city lists. */
export function collectCityPagesSitemapUrls(): string[] {
  const out: string[] = [];
  for (const vertical of VERTICALS) {
    for (const city of listHomepageCitiesFromAvailable(vertical)) {
      const seg = normalizeCitySegment(vertical, city.slug);
      out.push(toAbsoluteUrl(`/${verticalPath(vertical)}/${encodeURIComponent(seg)}`));
    }
  }
  return dedupeSort(out);
}

/** `/{vertical}/{city}/{locality}` from seed inventory (unique location labels per city). */
export function collectLocalityPagesSitemapUrls(): string[] {
  const out: string[] = [];
  for (const vertical of VERTICALS) {
    for (const city of listCitiesByVertical(vertical)) {
      const citySeg = normalizeCitySegment(vertical, city.slug);
      const locations = new Set(
        listSpaces({ vertical, city: city.slug })
          .map((s) => s.location?.trim())
          .filter((loc): loc is string => Boolean(loc)),
      );
      for (const loc of locations) {
        out.push(
          toAbsoluteUrl(`/${verticalPath(vertical)}/${encodeURIComponent(citySeg)}/${encodeURIComponent(loc)}`),
        );
      }
    }
  }
  return dedupeSort(out);
}

export function collectCoworkingSpacesSitemapUrls(): string[] {
  return collectVerticalSpaceDetailUrls("coworking");
}

export function collectVirtualOfficeSpacesSitemapUrls(): string[] {
  return collectVerticalSpaceDetailUrls("virtual-office");
}

export function collectOfficeSpaceSitemapUrls(): string[] {
  return collectVerticalSpaceDetailUrls("office-space");
}

export function collectColivingSpacesSitemapUrls(): string[] {
  return collectVerticalSpaceDetailUrls("coliving");
}

function collectVerticalSpaceDetailUrls(vertical: SpaceVertical): string[] {
  const citySlugs = citySlugSet(vertical);
  const out: string[] = [];

  for (const space of listSpaces({ vertical })) {
    const slug = space.slug?.trim();
    if (!slug) continue;
    const asCityKey = normalizeCitySegment(vertical, slug);
    if (citySlugs.has(asCityKey)) continue;
    out.push(toAbsoluteUrl(`/${verticalPath(vertical)}/${encodeURIComponent(slug)}`));
  }

  return dedupeSort(out);
}
