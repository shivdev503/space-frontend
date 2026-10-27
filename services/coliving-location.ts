import { cache } from "react";

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

/** Locality label for `GET /api/user/pgs?locality=` on coliving microlocation routes. */
export async function resolveColivingLocalityForPgList(
  citySlug: string,
  locationSegment: string,
): Promise<string | null> {
  const resolved = await resolveColivingLocalityName(citySlug, locationSegment);
  return resolved?.localityName ?? null;
}
