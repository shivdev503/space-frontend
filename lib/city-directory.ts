// Server only: used by city page server components, never from a client component.
import { collectLocalityPages, isIndexablePg } from "@/lib/sitemap-public-urls";
import { verticalPath } from "@/lib/vertical-path";
import { NON_OPERATOR_BRAND_SLUGS } from "@/services/brand-api";
import { EMPTY_CITY_PAGE_FILTERS, getCityPageData } from "@/services/mock-db";
import {
  citySlugOf,
  type InventorySpace,
  loadColivingInventory,
  loadCoworkingInventory,
  loadManagedOfficeInventory,
  loadVirtualOfficeInventory,
} from "@/services/sitemap-inventory";
import type { SpaceVertical } from "@/types";

/**
 * Plain links from a city page to every page under it, so each area page and listing is at most
 * two clicks from the city page (three from the home page). Built from the same data as the
 * sitemaps, so it links only pages that exist and Google may index.
 */
export type CityDirectory = {
  /** Area pages in the city, most listings first. */
  areas: Array<{ name: string; href: string; count: number }>;
  /** Listings not already linked from one of those area pages (all of them when there are none). */
  listings: Array<{ name: string; href: string; area?: string }>;
  /** Operators with centres in the city (coworking only), most centres first. */
  brands: Array<{ name: string; href: string; count: number }>;
};

/** Never hold a page for the directory: a cold load keeps running for later requests. */
const DIRECTORY_WAIT_MS = 2500;
const MAX_BRANDS = 16;

const INVENTORY: Record<SpaceVertical, () => Promise<InventorySpace[]>> = {
  coworking: loadCoworkingInventory,
  "virtual-office": loadVirtualOfficeInventory,
  "office-space": loadManagedOfficeInventory,
  coliving: loadColivingInventory,
};

type Built = { at: number; byCity: Map<string, CityDirectory> };

/**
 * Last good build per vertical (served while a newer one loads, so the hourly refresh never blanks
 * it) and builds in progress. Kept on `globalThis`: the server-start warm-up (instrumentation) and the
 * pages are bundled separately and would otherwise each get their own copy of this module.
 */
type DirectoryState = { lastGood: Map<SpaceVertical, Built>; inFlight: Map<SpaceVertical, Promise<Built>> };
const STATE_KEY = Symbol.for("spacewallah.cityDirectory");
const state: DirectoryState = ((globalThis as Record<symbol, DirectoryState | undefined>)[STATE_KEY] ??= {
  lastGood: new Map(),
  inFlight: new Map(),
});
const { lastGood, inFlight } = state;
const TTL_MS = 60 * 60 * 1000;

function isCityPage(vertical: SpaceVertical, slug: string): boolean {
  return getCityPageData(vertical, slug, EMPTY_CITY_PAGE_FILTERS) != null;
}

function byName<T extends { name: string }>(a: T, b: T): number {
  return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
}

async function build(vertical: SpaceVertical): Promise<Built> {
  const [items, localityPages] = await Promise.all([INVENTORY[vertical](), collectLocalityPages()]);
  const segment = verticalPath(vertical);
  const byCity = new Map<string, CityDirectory>();
  const get = (city: string) => {
    let dir = byCity.get(city);
    if (!dir) byCity.set(city, (dir = { areas: [], listings: [], brands: [] }));
    return dir;
  };

  const linkedFromArea = new Set<string>();
  for (const page of localityPages) {
    if (page.vertical !== vertical) continue;
    get(page.city).areas.push({
      name: page.name || page.locality,
      href: `/${segment}/${encodeURIComponent(page.city)}/${encodeURIComponent(page.locality)}`,
      count: page.count,
    });
    for (const slug of page.slugs) linkedFromArea.add(slug);
  }

  const brands = new Map<string, Map<string, { name: string; count: number }>>();
  const seen = new Set<string>();
  for (const item of items) {
    const city = citySlugOf(item);
    if (!city || !isCityPage(vertical, city) || seen.has(item.slug)) continue;
    seen.add(item.slug);
    // A listing whose slug is also a city slug has no page of its own (the city page wins).
    if (isCityPage(vertical, item.slug)) continue;
    if (vertical === "coliving" && !isIndexablePg(item)) continue;

    if (!linkedFromArea.has(item.slug)) {
      get(city).listings.push({
        name: item.name || item.slug,
        href: `/${segment}/${encodeURIComponent(item.slug)}`,
        area: item.localityName,
      });
    }

    const brandSlug = item.brandSlug?.trim().toLowerCase();
    if (vertical === "coworking" && brandSlug && !NON_OPERATOR_BRAND_SLUGS.has(brandSlug)) {
      const cityBrands = brands.get(city) ?? new Map<string, { name: string; count: number }>();
      const row = cityBrands.get(brandSlug) ?? { name: item.brandName || brandSlug, count: 0 };
      row.count += 1;
      cityBrands.set(brandSlug, row);
      brands.set(city, cityBrands);
    }
  }

  for (const [city, cityBrands] of brands) {
    get(city).brands = Array.from(cityBrands, ([slug, row]) => ({
      name: row.name,
      count: row.count,
      href: `/brand/${encodeURIComponent(slug)}`,
    }))
      // One-centre operators are not "top operators"; their centre is linked anyway.
      .filter((b) => b.count >= 2)
      .sort((a, b) => b.count - a.count || byName(a, b))
      .slice(0, MAX_BRANDS);
  }

  for (const dir of byCity.values()) {
    dir.areas.sort((a, b) => b.count - a.count || byName(a, b));
    dir.listings.sort((a, b) => byName(a, b) || (a.area ?? "").localeCompare(b.area ?? ""));
  }
  return { at: Date.now(), byCity };
}

function load(vertical: SpaceVertical): Promise<Built> {
  const running = inFlight.get(vertical);
  if (running) return running;
  const promise = build(vertical)
    .then((built) => {
      lastGood.set(vertical, built);
      return built;
    })
    .finally(() => inFlight.delete(vertical));
  inFlight.set(vertical, promise);
  return promise;
}

/** Directory for one city page, or null while the first build is still loading (or the API is down). */
export async function loadCityDirectory(vertical: SpaceVertical, citySlug: string): Promise<CityDirectory | null> {
  const cached = lastGood.get(vertical);
  let built: Built | null = cached ?? null;
  if (!cached || Date.now() - cached.at > TTL_MS) {
    const fresh = load(vertical).catch(() => null);
    built = await Promise.race([
      fresh.then((b) => b ?? cached ?? null),
      new Promise<Built | null>((resolve) => setTimeout(() => resolve(cached ?? null), DIRECTORY_WAIT_MS)),
    ]);
  }
  const dir = built?.byCity.get(citySlug);
  if (!dir || (dir.areas.length === 0 && dir.listings.length === 0 && dir.brands.length === 0)) return null;
  return dir;
}

/** Build every vertical's directory now (server start), so city pages have it from the first request. */
export async function warmCityDirectories(): Promise<void> {
  await Promise.allSettled((Object.keys(INVENTORY) as SpaceVertical[]).map((vertical) => load(vertical)));
}
