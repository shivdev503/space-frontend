import type { PgDetail, PgListParams, PgPriorityType } from "@/types/pg.model";

/** Featured PGs for a city, then remaining active PGs in that city (default API behavior). */
export function withPgCityPriority(catalogCityId: string, params: PgListParams = {}): PgListParams {
  const id = catalogCityId.trim();
  if (!id) return params;
  return {
    ...params,
    priorityType: "location",
    priorityCity: id,
  };
}

/** Featured PGs for a micro-location, scoped to city via `priorityCity` + `locality`. */
export function withPgMicroLocationPriority(
  catalogCityId: string,
  params: PgListParams = {},
): PgListParams {
  const id = catalogCityId.trim();
  if (!id) return params;
  return {
    ...params,
    priorityType: "micro_location",
    priorityCity: id,
  };
}

/** Homepage / hub: featured PGs first, then other approved PGs. */
export function withPgOverallPriority(params: PgListParams = {}): PgListParams {
  return {
    ...params,
    priorityType: "overall",
  };
}

/** Carousel-only: return only active priority PGs for the given type. */
export function withPgPriorityOnly(params: PgListParams): PgListParams {
  return {
    ...params,
    priorityOnly: true,
  };
}

/**
 * City names as stored on PG records. The PG API matches `city` by substring, so a page
 * label like "Bangalore" finds nothing when listings say "Bengaluru".
 */
const PG_API_CITY_NAMES: Record<string, string> = {
  bangalore: "Bengaluru",
  gurgaon: "Gurugram",
};

/** City value to send to `GET /api/user/pgs` for a city page's display name. */
export function pgApiCityName(cityDisplayName: string): string {
  const name = cityDisplayName.trim();
  return PG_API_CITY_NAMES[name.toLowerCase()] ?? name;
}

export function buildPgColivingCityPageParams(
  catalogCityId: string | undefined,
  cityDisplayName: string,
  listParams: PgListParams = {},
): PgListParams {
  const base: PgListParams = {
    ...listParams,
    city: pgApiCityName(cityDisplayName) || listParams.city,
    sortBy: listParams.sortBy ?? "added_on",
    orderBy: listParams.orderBy ?? -1,
  };
  if (catalogCityId?.trim()) {
    return withPgCityPriority(catalogCityId, base);
  }
  return base;
}

export function buildPgColivingLocationPageParams(
  catalogCityId: string | undefined,
  cityDisplayName: string,
  localityName: string,
  overrides: PgListParams = {},
): PgListParams {
  const base: PgListParams = {
    limit: 50,
    page: 1,
    sortBy: "added_on",
    orderBy: -1,
    ...overrides,
    city: pgApiCityName(cityDisplayName),
    locality: localityName.trim(),
  };
  if (catalogCityId?.trim()) {
    return withPgMicroLocationPriority(catalogCityId, base);
  }
  return base;
}

export function isPgPriorityForType(pg: PgDetail, type: PgPriorityType): boolean {
  const slot = pg.priority?.[type];
  return slot?.is_active === true;
}
