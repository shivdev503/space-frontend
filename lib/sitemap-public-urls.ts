import type { SitemapIndexEntry, SitemapUrlEntry } from "@/lib/sitemap-xml";
import { slugifyPgName } from "@/lib/pg-slug";
import { verticalPath } from "@/lib/vertical-path";
import { NON_OPERATOR_BRAND_SLUGS } from "@/services/brand-api";
import { canonicalCoworkingCitySlug, resolveCatalogIdToSlug } from "@/services/catalog-city-id";
import { AVAILABLE_CITY_VIRTUAL_OFFICE } from "@/services/cities-data";
import { resolveAppUrl } from "@/services/env-config";
import { slugifyMicroLocationName } from "@/services/location-api";
import { EMPTY_CITY_PAGE_FILTERS, getCityPageData } from "@/services/mock-db";
import {
  type InventorySpace,
  loadColivingInventory,
  loadCoworkingInventory,
  loadManagedOfficeInventory,
  loadVirtualOfficeInventory,
} from "@/services/sitemap-inventory";
import type { SpaceVertical } from "@/types";

/** Locality pages are listed only where this many live listings exist (thin pages stay out). */
export const MIN_LISTINGS_FOR_LOCALITY_PAGE = 3;

function baseOrigin(): string {
  return resolveAppUrl().replace(/\/$/, "");
}

export function toAbsoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${baseOrigin()}${path}`;
}

/** True when `/{vertical}/{slug}` renders a city page (same check the route uses). */
function isCityPage(vertical: SpaceVertical, citySlug: string): boolean {
  return getCityPageData(vertical, citySlug, EMPTY_CITY_PAGE_FILTERS) != null;
}

/**
 * PG city names → the city page that lists them. The PG API matches `city` by substring,
 * so `/coliving/delhi` includes "New Delhi" and `/coliving/mumbai` includes "Navi Mumbai".
 */
const PG_CITY_TO_ROUTE: Record<string, string> = {
  bengaluru: "bangalore",
  "new-delhi": "delhi",
  "navi-mumbai": "mumbai",
};

/** Canonical route slug for a listing's city (e.g. catalog "gurugram" → "gurgaon"). */
function citySlugOf(item: InventorySpace): string | null {
  const fromCatalog = item.cityId ? resolveCatalogIdToSlug(item.cityId) : null;
  const raw = fromCatalog ?? (item.cityName ? slugifyPgName(item.cityName) : "");
  if (!raw) return null;
  return canonicalCoworkingCitySlug(PG_CITY_TO_ROUTE[raw] ?? raw);
}

function cityUrl(vertical: SpaceVertical, citySlug: string): string {
  return toAbsoluteUrl(`/${verticalPath(vertical)}/${encodeURIComponent(citySlug)}`);
}

/** Latest `updatedAt` among items, if any carries one. */
function latest(items: InventorySpace[]): Date | undefined {
  let best: Date | undefined;
  for (const item of items) {
    if (item.updatedAt && (!best || item.updatedAt > best)) best = item.updatedAt;
  }
  return best;
}

function sortByLoc(entries: SitemapUrlEntry[]): SitemapUrlEntry[] {
  const byLoc = new Map<string, SitemapUrlEntry>();
  for (const entry of entries) {
    const prev = byLoc.get(entry.loc);
    if (!prev || (entry.lastmod && (!prev.lastmod || entry.lastmod > prev.lastmod))) {
      byLoc.set(entry.loc, entry);
    }
  }
  return Array.from(byLoc.values()).sort((a, b) => a.loc.localeCompare(b.loc));
}

/** `/sitemap/main-pages-sitemap.xml` — homepage, vertical hubs and evergreen pages. */
export function buildMainPagesSitemapEntries(): SitemapUrlEntry[] {
  const b = baseOrigin();
  return [
    { loc: `${b}/`, changefreq: "daily", priority: 1 },
    { loc: `${b}/coworking`, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/virtual-office`, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/managed-office`, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/coliving`, changefreq: "weekly", priority: 0.8 },
    { loc: `${b}/list-your-space`, changefreq: "monthly", priority: 0.5 },
    { loc: `${b}/contact`, changefreq: "monthly", priority: 0.4 },
    { loc: `${b}/privacy-policy`, changefreq: "yearly", priority: 0.2 },
    { loc: `${b}/terms`, changefreq: "yearly", priority: 0.2 },
    { loc: `${b}/refund-policy`, changefreq: "yearly", priority: 0.2 },
  ];
}

/** Main pages plus one `/brand/{slug}` page per operator with live coworking centres. */
export async function collectMainPagesSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const byBrand = new Map<string, InventorySpace[]>();
  for (const item of await loadCoworkingInventory()) {
    const brand = item.brandSlug?.toLowerCase();
    if (!brand || NON_OPERATOR_BRAND_SLUGS.has(brand)) continue;
    const list = byBrand.get(brand) ?? [];
    list.push(item);
    byBrand.set(brand, list);
  }
  const brandEntries: SitemapUrlEntry[] = Array.from(byBrand, ([brand, list]) => ({
    loc: toAbsoluteUrl(`/brand/${encodeURIComponent(brand)}`),
    lastmod: latest(list),
  }));
  return [...buildMainPagesSitemapEntries(), ...sortByLoc(brandEntries)];
}

/** Root `/sitemap.xml` — sitemap index (child documents under `/sitemap/`). */
export function buildRootSitemapIndexEntries(): SitemapIndexEntry[] {
  const b = baseOrigin();
  return [
    { loc: `${b}/sitemap/main-pages-sitemap.xml` },
    { loc: `${b}/sitemap/city-pages-sitemap.xml` },
    { loc: `${b}/sitemap/locality-pages-sitemap.xml` },
    { loc: `${b}/sitemap/coworking-spaces-sitemap.xml` },
    { loc: `${b}/sitemap/virtual-office-spaces-sitemap.xml` },
    { loc: `${b}/sitemap/office-space-sitemap.xml` },
    { loc: `${b}/sitemap/coliving-spaces-sitemap.xml` },
  ];
}

/** Group listings by canonical city slug, keeping only cities that have a city page. */
function groupByCity(vertical: SpaceVertical, items: InventorySpace[]): Map<string, InventorySpace[]> {
  const byCity = new Map<string, InventorySpace[]>();
  for (const item of items) {
    const city = citySlugOf(item);
    if (!city || !isCityPage(vertical, city)) continue;
    const list = byCity.get(city) ?? [];
    list.push(item);
    byCity.set(city, list);
  }
  return byCity;
}

/**
 * `/{vertical}/{city}` — coworking, managed office and coliving cities with at least one
 * live listing; every virtual office catalog city (those pages are content pages).
 */
export async function collectCityPagesSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const [coworking, managedOffice, coliving] = await Promise.all([
    loadCoworkingInventory(),
    loadManagedOfficeInventory(),
    loadColivingInventory(),
  ]);

  const entries: SitemapUrlEntry[] = [];
  const inventoryByVertical: Array<[SpaceVertical, InventorySpace[]]> = [
    ["coworking", coworking],
    ["office-space", managedOffice],
    ["coliving", coliving],
  ];
  for (const [vertical, items] of inventoryByVertical) {
    for (const [city, list] of groupByCity(vertical, items)) {
      entries.push({ loc: cityUrl(vertical, city), lastmod: latest(list) });
    }
  }

  for (const entry of AVAILABLE_CITY_VIRTUAL_OFFICE) {
    const city = canonicalCoworkingCitySlug(slugifyPgName(String(entry.name)));
    if (city && isCityPage("virtual-office", city)) {
      entries.push({ loc: cityUrl("virtual-office", city) });
    }
  }

  return sortByLoc(entries);
}

/**
 * `/{vertical}/{city}/{locality}` — coworking and coliving localities with at least
 * {@link MIN_LISTINGS_FOR_LOCALITY_PAGE} live listings.
 */
export async function collectLocalityPagesSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const [coworking, coliving] = await Promise.all([loadCoworkingInventory(), loadColivingInventory()]);

  const entries: SitemapUrlEntry[] = [];
  const inventoryByVertical: Array<[SpaceVertical, InventorySpace[]]> = [
    ["coworking", coworking],
    ["coliving", coliving],
  ];
  for (const [vertical, items] of inventoryByVertical) {
    for (const [city, list] of groupByCity(vertical, items)) {
      const byLocality = new Map<string, InventorySpace[]>();
      for (const item of list) {
        const locality = item.localityName ? slugifyMicroLocationName(item.localityName) : "";
        if (!locality) continue;
        const group = byLocality.get(locality) ?? [];
        group.push(item);
        byLocality.set(locality, group);
      }
      for (const [locality, group] of byLocality) {
        if (group.length < MIN_LISTINGS_FOR_LOCALITY_PAGE) continue;
        entries.push({
          loc: toAbsoluteUrl(
            `/${verticalPath(vertical)}/${encodeURIComponent(city)}/${encodeURIComponent(locality)}`,
          ),
          lastmod: latest(group),
        });
      }
    }
  }

  return sortByLoc(entries);
}

/** `/{vertical}/{slug}` for each live listing; slugs that collide with a city page are skipped. */
function detailEntries(vertical: SpaceVertical, items: InventorySpace[]): SitemapUrlEntry[] {
  return sortByLoc(
    items
      .filter((item) => !isCityPage(vertical, item.slug))
      .map((item) => ({
        loc: toAbsoluteUrl(`/${verticalPath(vertical)}/${encodeURIComponent(item.slug)}`),
        lastmod: item.updatedAt,
      })),
  );
}

export async function collectCoworkingSpacesSitemapEntries(): Promise<SitemapUrlEntry[]> {
  return detailEntries("coworking", await loadCoworkingInventory());
}

export async function collectVirtualOfficeSpacesSitemapEntries(): Promise<SitemapUrlEntry[]> {
  return detailEntries("virtual-office", await loadVirtualOfficeInventory());
}

export async function collectOfficeSpaceSitemapEntries(): Promise<SitemapUrlEntry[]> {
  return detailEntries("office-space", await loadManagedOfficeInventory());
}

export async function collectColivingSpacesSitemapEntries(): Promise<SitemapUrlEntry[]> {
  return detailEntries("coliving", await loadColivingInventory());
}
