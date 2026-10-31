import { cache } from "react";

import { buildPgColivingLocationPageParams } from "@/lib/pg-list-priority";
import { getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import {
  loadMicroLocationsByCitySpaceType,
  normalizeLocationSegment,
  resolveMicroLocationFromSegment,
  slugifyMicroLocationName,
} from "@/services/location-api";
import {
  EMPTY_CITY_PAGE_FILTERS,
  buildLocationPageDataFromSpaces,
  getCityPageData,
  getLocationPageData,
} from "@/services/mock-db";
import { fetchPgList } from "@/services/pg-api";
import type { LocationPageData } from "@/types";
import { toTitleCase } from "@/utils/format";

function localityNameFromCityFallback(
  cityPage: NonNullable<ReturnType<typeof getCityPageData>>,
  locationSegment: string,
): string {
  const norm = normalizeLocationSegment(locationSegment).toLowerCase().replace(/_/g, "-");
  const fromPopular = cityPage.popularLocations.find((loc) => {
    const slug = loc.slug.trim().toLowerCase().replace(/_/g, "-");
    return slug === norm || slugifyMicroLocationName(loc.name) === norm;
  });
  if (fromPopular?.name) return fromPopular.name;
  return toTitleCase(norm.replace(/-/g, " "));
}

async function resolveColivingLocalityName(
  citySlug: string,
  locationSegment: string,
): Promise<{ localityName: string; locationSlug: string } | null> {
  const cityPage = getCityPageData("coliving", citySlug, EMPTY_CITY_PAGE_FILTERS);
  if (!cityPage) return null;

  const locationSlug = normalizeLocationSegment(locationSegment).toLowerCase().replace(/_/g, "-");

  if (cityPage.catalogCityId) {
    const hits = await loadMicroLocationsByCitySpaceType(cityPage.catalogCityId, "coliving");
    const hit = resolveMicroLocationFromSegment(hits, locationSegment);
    if (hit?.name?.trim()) {
      return { localityName: hit.name.trim(), locationSlug };
    }
    const { findInventoryLocality } = await import("@/services/inventory-locality");
    const fromInventory = await findInventoryLocality("coliving", citySlug, locationSegment);
    if (fromInventory) return { localityName: fromInventory.name, locationSlug };
  }

  return {
    localityName: localityNameFromCityFallback(cityPage, locationSegment),
    locationSlug,
  };
}

function applyColivingLocalityToPage(
  page: LocationPageData,
  localityName: string,
  locationSlug: string,
): LocationPageData {
  const cityName = page.city.name;
  return {
    ...page,
    locationSlug,
    locationName: localityName,
    title: `PG & Coliving in ${localityName}, ${cityName}`,
    subtitle: `Explore furnished coliving rooms and PG options with meals, WiFi, and security near ${localityName}, ${cityName}.`,
  };
}

async function fetchColivingLocationPageContent(
  citySlug: string,
  locationSegment: string,
): Promise<LocationPageData | null> {
  const resolved = await resolveColivingLocalityName(citySlug, locationSegment);
  if (!resolved) return null;

  const { localityName, locationSlug } = resolved;
  const seedSlug = locationSlug || normalizeLocationSegment(locationSegment);

  const seedPage = getLocationPageData("coliving", citySlug, seedSlug, EMPTY_CITY_PAGE_FILTERS);
  if (seedPage) {
    return applyColivingLocalityToPage(seedPage, localityName, locationSlug);
  }

  const cityPage = getCityPageData("coliving", citySlug, EMPTY_CITY_PAGE_FILTERS);
  if (!cityPage) return null;

  const built = buildLocationPageDataFromSpaces(
    "coliving",
    cityPage.city,
    citySlug,
    locationSlug,
    [],
    EMPTY_CITY_PAGE_FILTERS,
    cityPage.catalogCityId,
  );

  if (!built) return null;
  return applyColivingLocalityToPage(built, localityName, locationSlug);
}

export const getColivingLocationPageContent: typeof fetchColivingLocationPageContent =
  typeof window === "undefined"
    ? cache(fetchColivingLocationPageContent)
    : fetchColivingLocationPageContent;

/** True when the URL segment is a catalog micro-location or a popular locality of the city. */
async function isKnownColivingLocality(citySlug: string, locationSegment: string): Promise<boolean> {
  const cityPage = getCityPageData("coliving", citySlug, EMPTY_CITY_PAGE_FILTERS);
  if (!cityPage) return false;
  const norm = normalizeLocationSegment(locationSegment).toLowerCase().replace(/_/g, "-");
  if (cityPage.popularLocations.some((loc) => loc.slug.toLowerCase() === norm)) return true;
  if (!cityPage.catalogCityId) return false;
  const hits = await loadMicroLocationsByCitySpaceType(cityPage.catalogCityId, "coliving");
  return resolveMicroLocationFromSegment(hits, locationSegment) != null;
}

const fetchLocalityPgs = cache((catalogCityId: string | undefined, cityName: string, localityName: string) =>
  fetchPgList(buildPgColivingLocationPageParams(catalogCityId, cityName, localityName)),
);

/** PGs for a locality page. Throws when the API fails, so an outage never looks like an empty locality. */
export function loadColivingLocalityPgs(page: LocationPageData) {
  const catalogCityId = page.catalogCityId ?? getCatalogCityIdBySlug(page.citySlug) ?? undefined;
  return fetchLocalityPgs(catalogCityId, page.city.name, page.locationName);
}

/** A locality page exists when the catalog knows the locality or a PG is listed in it. */
export async function colivingLocalityExists(citySlug: string, locationSegment: string): Promise<boolean> {
  const page = await getColivingLocationPageContent(citySlug, locationSegment);
  if (!page) return false;
  const pgs = await loadColivingLocalityPgs(page);
  return pgs.totalRecords > 0 || isKnownColivingLocality(citySlug, locationSegment);
}

/** Locality label for `GET /api/user/pgs?locality=` on coliving microlocation routes. */
export async function resolveColivingLocalityForPgList(
  citySlug: string,
  locationSegment: string,
): Promise<string | null> {
  const resolved = await resolveColivingLocalityName(citySlug, locationSegment);
  return resolved?.localityName ?? null;
}
