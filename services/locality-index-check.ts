/**
 * "Does this area page find any listings?" answered from the listing index instead of loading the
 * page's listings from the API. The checks apply the same filters the area pages' own list queries
 * use, so they give the same answer; when the index finds nothing, callers fall back to the page's
 * own loaders (rare: candidates already have 3+ listings in the index). Server only.
 */

import { pgApiCityName } from "@/lib/pg-list-priority";
import { canonicalCoworkingCitySlug, getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import { isCoworkingUserApiProxyEnabled } from "@/services/env-config";
import {
  loadMicroLocationsByCitySpaceType,
  normalizeLocationSegment,
  resolveMicroLocationFromSegment,
} from "@/services/location-api";
import { EMPTY_CITY_PAGE_FILTERS, getCityPageData } from "@/services/mock-db";
import { loadColivingIndexRows, loadCoworkingIndexRows, type RawRecord } from "@/services/sitemap-inventory";
import type { LocationPageData } from "@/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function refId(v: unknown): string {
  if (v && typeof v === "object") {
    const o = v as RawRecord;
    return str(o._id) || str(o.id);
  }
  return str(v);
}

/**
 * Coworking: the area page resolves the URL segment to a micro-location id (catalog first, then the
 * inventory), then lists `/workSpaces?city=…&micro_location=…`. True when an index row matches both ids.
 */
export async function coworkingLocalityInIndex(city: string, location: string): Promise<boolean> {
  if (!isCoworkingUserApiProxyEnabled()) return false;
  const cityRouteSlug = canonicalCoworkingCitySlug(city);
  const cityPage = getCityPageData("coworking", cityRouteSlug, EMPTY_CITY_PAGE_FILTERS);
  const cityId = cityPage?.catalogCityId?.trim();
  if (!cityId) return false;

  const microKey = normalizeLocationSegment(location);
  if (!microKey) return false;

  let microId: string | null = null;
  if (/^[a-f0-9]{24}$/i.test(microKey.trim())) {
    microId = microKey;
  } else {
    const hit = resolveMicroLocationFromSegment(await loadMicroLocationsByCitySpaceType(cityId, "coworking"), microKey);
    if (hit) {
      microId = hit.id;
    } else {
      const { findInventoryLocality } = await import("@/services/inventory-locality");
      microId = (await findInventoryLocality("coworking", cityRouteSlug, microKey))?.id ?? null;
    }
  }
  if (!microId) return false;

  return (await loadCoworkingIndexRows()).some((row) => {
    const loc = row.location && typeof row.location === "object" ? (row.location as RawRecord) : {};
    return refId(loc.city) === cityId && refId(loc.micro_location) === microId;
  });
}

/**
 * Coliving: the area page lists `/pgs?city=…&locality=…` (case-insensitive "contains" on both) and,
 * when the city is in the catalog, only PGs whose `locationIds.city` is that city.
 */
export async function colivingLocalityInIndex(page: LocationPageData): Promise<boolean> {
  const catalogCityId = (page.catalogCityId ?? getCatalogCityIdBySlug(page.citySlug) ?? "").trim();
  const city = pgApiCityName(page.city.name).toLowerCase();
  const locality = page.locationName.trim().toLowerCase();
  return (await loadColivingIndexRows()).some(
    (row) =>
      (!city || str(row.city).toLowerCase().includes(city)) &&
      (!locality || str(row.locality).toLowerCase().includes(locality)) &&
      (!catalogCityId || str(row.city_id) === catalogCityId),
  );
}
