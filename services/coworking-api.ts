/**
 * Coworking workspaces HTTP client (axios).
 * List: `GET /api/user/workSpaces` → {@link loadCoworkingWorkspacesList} (server-cached per args).
 * Detail: `GET /api/user/workSpace/:slug` → {@link loadCoworkingWorkspaceDetail} (server-cached per slug).
 *
 * **Pricing:** Every {@link CoworkingModel.WorkSpace} from list/detail loaders has `starting_price` set via
 * {@link normalizeCoworkingWorkspacePricing} (minimum eligible plan price; see `workspace-plan-pricing.ts`).
 * UI should read `workspace.starting_price` only.
 *
 * Env: `.env.example`.
 */

import axios, { type AxiosInstance } from "axios";
import { cache } from "react";

import {
  canonicalCoworkingCitySlug,
  getCatalogCityIdBySlug,
  resolveCatalogIdToSlug,
} from "@/services/catalog-city-id";
import {
  isCoworkingUserApiProxyEnabled,
  resolveCoworkingApiBaseUrl,
  resolveCoworkingApiTimeoutMs,
} from "@/services/env-config";
import { isUpstreamFailure } from "@/lib/upstream-error";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import {
  loadMicroLocationsByCitySpaceType,
  normalizeLocationSegment,
  resolveMicroLocationFromSegment,
} from "@/services/location-api";
import {
  coworkingApiWorkspaceToSpace,
  isCoworkingWorkspaceShape,
  mapSeedSpaceToCoworkingWorkspace,
  normalizeCoworkingWorkspacesPayload,
  parseCoworkingWorkspaceSinglePayload,
} from "@/services/coworking-workspace-mapper";
import {
  buildLocationPageDataFromSpaces,
  EMPTY_CITY_PAGE_FILTERS,
  getCityPageData,
  getLocationPageData,
  getSpaceBySlug,
  listSpaces,
} from "@/services/mock-db";
import {
  applyCoworkingListFiltersClient,
  COWORKING_LIST_PAGE_SIZE,
  coworkingFiltersToApiParams,
  coworkingListQueryKey,
  parseCoworkingListFiltersFromSearchParams,
} from "@/lib/coworking-list-filters";
import type { CityPageFilters, InitialCoworkingListing, Space, SpaceVertical } from "@/types";
import { CoworkingModel } from "@/types/coworking-workspace.model";
import { withResolvedStartingPrice as normalizeCoworkingWorkspacePricing } from "@/services/workspace-plan-pricing";

/** Applies eligible-plan minimum to `starting_price`. Re-exported for custom normalizers. */
export { normalizeCoworkingWorkspacePricing };
export const coworkingApiPaths = {
  workSpaces: "/api/user/workSpaces",
  workSpace: (slug: string) => `/api/user/workSpace/${encodeURIComponent(slug)}`,
} as const;

/** Minimal row for homepage / header search dropdowns. */
export type CoworkingSearchHit = {
  id: string;
  name: string;
  slug: string;
};

export type CoworkingWorkspacesListFilters = {
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  orderBy?: 1 | -1;
  /** 1-indexed page — matches upstream `?page=` when supported. */
  page?: number;
};

function isLikelyMongoObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value.trim());
}

function workspacesToSearchHits(data: CoworkingModel.WorkSpace[]): CoworkingSearchHit[] {
  return data.map((ws) => ({
    id: ws.id || ws._id,
    name: ws.name,
    slug: ws.slug,
  }));
}

export { isCoworkingUserApiProxyEnabled, resolveCoworkingApiBaseUrl } from "@/services/env-config";

let coworkingAxios: AxiosInstance | null = null;

function getCoworkingAxios(): AxiosInstance {
  const coworkingAxiosTimeoutMs = resolveCoworkingApiTimeoutMs();
  if (!coworkingAxios) {
    coworkingAxios = axios.create({
      baseURL: resolveCoworkingApiBaseUrl(),
      timeout: coworkingAxiosTimeoutMs,
      headers: buildApiClientHeaders(),
    });
  } else {
    coworkingAxios.defaults.baseURL = resolveCoworkingApiBaseUrl();
    coworkingAxios.defaults.timeout = coworkingAxiosTimeoutMs;
  }
  return coworkingAxios;
}

function filterSeedSpacesByMicroLocationKey(all: ReturnType<typeof listSpaces>, microKey: string) {
  const keyNorm = microKey.trim().toLowerCase().replace(/_/g, "-");
  const matched = all.filter((s) => {
    const loc = s.location.toLowerCase().replace(/_/g, "-");
    return (
      keyNorm === loc ||
      keyNorm.includes(loc) ||
      loc.includes(keyNorm) ||
      keyNorm.endsWith(`-${loc}`) ||
      keyNorm.startsWith(`${loc}-`)
    );
  });
  return matched.length ? matched : all;
}

function mockWorkspacesList(
  cityCatalogId: string,
  limit: number,
  name?: string,
  micro_location?: string,
  virtual?: boolean,
  listFilters?: CoworkingWorkspacesListFilters,
): CoworkingModel.WorkSpacesListResponse {
  const slug = resolveCatalogIdToSlug(cityCatalogId.trim());
  const page = Math.max(1, listFilters?.page ?? 1);
  if (!slug) {
    return { data: [], meta: { limit, cityId: cityCatalogId, source: "mock" } };
  }
  const vertical = virtual ? "virtual-office" : "coworking";
  let all = listSpaces({ vertical, city: slug });
  const nameFilter = name?.trim();
  if (nameFilter) {
    const q = nameFilter.toLowerCase();
    all = all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q),
    );
  }
  const microId = micro_location?.trim();
  if (microId) {
    all = filterSeedSpacesByMicroLocationKey(all, microId);
  }
  const start = (page - 1) * limit;
  const slice = all.slice(start, start + limit);
  const data = slice.map((space) => mapSeedSpaceToCoworkingWorkspace(space, cityCatalogId.trim()));
  return {
    data,
    meta: {
      limit,
      page,
      total: all.length,
      totalRecords: all.length,
      returned: data.length,
      cityId: cityCatalogId,
      citySlug: slug,
      source: "mock",
    },
  };
}

/**
 * Single HTTP entry for `GET /api/user/workSpaces` (`city`, `limit`, optional `name`, optional `micro_location`, optional `virtual`).
 * Response: `{ message, data, totalRecords, locations }` → {@link normalizeCoworkingWorkspacesPayload}.
 * On the server, deduped per request via `cache()` when arguments match.
 */
async function fetchCoworkingWorkspacesList(
  cityCatalogId: string,
  limit: number,
  name?: string,
  micro_location?: string,
  virtual?: boolean,
  listFilters?: CoworkingWorkspacesListFilters,
): Promise<CoworkingModel.WorkSpacesListResponse> {
  if (!isCoworkingUserApiProxyEnabled()) {
    return mockWorkspacesList(cityCatalogId, limit, name, micro_location, virtual, listFilters);
  }
  try {
    const page = Math.max(1, listFilters?.page ?? 1);
    const params: Record<string, string | number | boolean> = {
      city: cityCatalogId.trim(),
      limit,
      page,
    };
    const q = name?.trim();
    if (q) params.name = q;
    const micro = micro_location?.trim();
    if (micro) params.micro_location = micro;
    if (virtual) params.virtual = true;
    if (listFilters?.minPrice != null && Number.isFinite(listFilters.minPrice)) {
      params.minPrice = listFilters.minPrice;
    }
    if (listFilters?.maxPrice != null && Number.isFinite(listFilters.maxPrice)) {
      params.maxPrice = listFilters.maxPrice;
    }
    if (listFilters?.sortBy?.trim()) {
      params.sortBy = listFilters.sortBy.trim();
      params.orderBy = listFilters.orderBy ?? -1;
    }
    const { data } = await getCoworkingAxios().get<unknown>(coworkingApiPaths.workSpaces, {
      params,
    });
    return normalizeCoworkingWorkspacesPayload(data, {
      limit,
      cityId: cityCatalogId.trim(),
      source: "axios",
    });
  } catch {
    return mockWorkspacesList(cityCatalogId, limit, name, micro_location, virtual, listFilters);
  }
}

export const loadCoworkingWorkspacesList: typeof fetchCoworkingWorkspacesList =
  typeof window === "undefined" ? cache(fetchCoworkingWorkspacesList) : fetchCoworkingWorkspacesList;

function workspacesPayloadToSpaces(
  payload: CoworkingModel.WorkSpacesListResponse,
  citySlug: string,
): Space[] | null {
  const arr = payload.data;
  if (!arr?.length) return null;
  if (!isCoworkingWorkspaceShape(arr[0])) return null;
  return arr.map((w) => coworkingApiWorkspaceToSpace(w, citySlug));
}

const DEFAULT_WORKSPACES_LIST_LIMIT = 32;

/**
 * Maps `/api/user/workSpaces` list to app `Space[]` (city page, location page, etc.).
 * Optional `microLocationId` → `micro_location` query param (document id).
 */
export async function coworkingWorkspacesAsSpaces(
  catalogCityId: string,
  appCitySlug: string,
  limit = DEFAULT_WORKSPACES_LIST_LIMIT,
  microLocationId?: string,
): Promise<Space[] | null> {
  const city = catalogCityId.trim();
  const slug = appCitySlug.trim();
  if (!city || !slug) return null;
  const payload = await loadCoworkingWorkspacesList(city, limit, undefined, microLocationId, false);
  return workspacesPayloadToSpaces(payload, slug);
}

/**
 * `/api/user/workSpaces` as {@link CoworkingModel.WorkSpace} rows (`starting_price` normalized).
 * Use with {@link CoworkingCard} instead of mapping to `Space`.
 * Pass `virtual: true` for virtual-office city listings (same endpoint, `virtual=true` query param).
 */
export async function coworkingWorkspacesListForCity(
  catalogCityId: string,
  limit = DEFAULT_WORKSPACES_LIST_LIMIT,
  microLocationId?: string,
  virtual?: boolean,
  listFilters?: CoworkingWorkspacesListFilters,
): Promise<CoworkingModel.WorkSpace[] | null> {
  const payload = await loadCoworkingWorkspacesPageForCity(
    catalogCityId,
    limit,
    listFilters?.page ?? 1,
    microLocationId,
    virtual,
    listFilters,
  );
  const arr = payload.data;
  if (!arr?.length) return null;
  if (!isCoworkingWorkspaceShape(arr[0])) return null;
  return arr;
}

/** Paginated list with `totalRecords` for city / microlocation listing UIs. */
export async function loadCoworkingWorkspacesPageForCity(
  catalogCityId: string,
  limit: number,
  page: number,
  microLocationId?: string,
  virtual?: boolean,
  listFilters?: CoworkingWorkspacesListFilters,
): Promise<CoworkingModel.WorkSpacesListResponse> {
  const city = catalogCityId.trim();
  if (!city) return { data: [], meta: { limit, page, totalRecords: 0 } };
  return loadCoworkingWorkspacesList(city, limit, undefined, microLocationId, virtual, {
    ...listFilters,
    page,
  });
}

/**
 * Page 1 of a coworking city/locality listing for server rendering, using the same filters
 * the client reads from the URL. Undefined when nothing loads, so the client fetches itself.
 */
export async function loadInitialCoworkingListing(
  catalogCityId: string,
  searchParams: Record<string, string | string[] | undefined>,
  microLocationId?: string,
): Promise<InitialCoworkingListing | undefined> {
  if (!catalogCityId.trim()) return undefined;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") sp.set(key, value);
    else if (Array.isArray(value) && value[0] != null) sp.set(key, value[0]);
  }
  const filters = parseCoworkingListFiltersFromSearchParams(sp);
  const apiFilters = coworkingFiltersToApiParams(filters, { includeSortInRequest: sp.has("sortBy") });
  const payload = await loadCoworkingWorkspacesPageForCity(
    catalogCityId,
    COWORKING_LIST_PAGE_SIZE,
    1,
    microLocationId,
    false,
    apiFilters,
  );
  const rows = applyCoworkingListFiltersClient(payload.data ?? [], filters) as CoworkingModel.WorkSpace[];
  if (rows.length === 0) return undefined;
  const total = payload.meta?.totalRecords ?? payload.meta?.total;
  return {
    rows,
    totalRecords: typeof total === "number" && Number.isFinite(total) ? total : rows.length,
    query: coworkingListQueryKey(sp),
  };
}

/** Homepage / header search: name filter on the same workspaces list endpoint. */
export async function loadCoworkingWorkspaceSearchHits(
  catalogCityId: string,
  options: { name?: string; limit?: number } = {},
): Promise<CoworkingSearchHit[]> {
  const limit = options.limit ?? 48;
  const catalog = catalogCityId.trim();
  if (!catalog) return [];

  const payload = await loadCoworkingWorkspacesList(catalog, limit, options.name, undefined, false);
  return workspacesToSearchHits(payload.data).slice(0, limit);
}

/**
 * Single workspace: `GET /api/user/workSpace/:slug` → `{ message, data }`, then seed fallback.
 * Server: deduped per request via `cache()` for the same slug.
 */
async function fetchCoworkingWorkspaceDetail(slug: string): Promise<CoworkingModel.WorkSpace | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  if (isCoworkingUserApiProxyEnabled()) {
    try {
      const { data } = await getCoworkingAxios().get<unknown>(coworkingApiPaths.workSpace(trimmed));
      const ws = parseCoworkingWorkspaceSinglePayload(data);
      if (ws) return normalizeCoworkingWorkspacePricing(ws);
    } catch (error) {
      if (isUpstreamFailure(error)) throw error;
    }
  }

  const seed = getSpaceBySlug(trimmed, "coworking");
  if (!seed) return null;
  const catalogCityId = getCatalogCityIdBySlug(seed.city) ?? seed.city;
  return mapSeedSpaceToCoworkingWorkspace(seed, catalogCityId);
}

export const loadCoworkingWorkspaceDetail: typeof fetchCoworkingWorkspaceDetail =
  typeof window === "undefined" ? cache(fetchCoworkingWorkspaceDetail) : fetchCoworkingWorkspaceDetail;

async function fetchVerticalLocationPageContent(
  vertical: SpaceVertical,
  city: string,
  location: string,
  filters: CityPageFilters = {},
) {
  const cityRouteSlug =
    vertical === "coworking" ? canonicalCoworkingCitySlug(city) : city.trim();

  const preferCoworkingApi =
    vertical === "coworking" && isCoworkingUserApiProxyEnabled();

  if (!preferCoworkingApi) {
    const fromSeed = getLocationPageData(vertical, cityRouteSlug, location, filters);
    if (fromSeed) return fromSeed;
  }

  if (vertical !== "coworking") return null;

  const cityPage = getCityPageData(vertical, cityRouteSlug, EMPTY_CITY_PAGE_FILTERS);
  if (!cityPage?.catalogCityId) return null;

  const microKey = normalizeLocationSegment(location);
  if (!microKey) return null;

  let workspaceMicroLocationId: string | null = null;
  let isCatalogLocality = false;
  if (isLikelyMongoObjectId(microKey)) {
    workspaceMicroLocationId = microKey;
  } else {
    const hits = await loadMicroLocationsByCitySpaceType(cityPage.catalogCityId, "coworking");
    const hit = resolveMicroLocationFromSegment(hits, microKey);
    if (hit) {
      workspaceMicroLocationId = hit.id;
      isCatalogLocality = true;
    } else if (preferCoworkingApi) {
      const { findInventoryLocality } = await import("@/services/inventory-locality");
      const fromInventory = await findInventoryLocality("coworking", cityRouteSlug, microKey);
      if (fromInventory?.id) {
        workspaceMicroLocationId = fromInventory.id;
        isCatalogLocality = true;
      }
    }
  }

  let spaces: Space[] = [];
  if (workspaceMicroLocationId) {
    spaces =
      (await coworkingWorkspacesAsSpaces(
        cityPage.catalogCityId,
        cityRouteSlug,
        32,
        workspaceMicroLocationId,
      )) ?? [];
  }

  if (preferCoworkingApi && spaces.length === 0) {
    const fromSeed = getLocationPageData(vertical, cityRouteSlug, location, filters);
    if (fromSeed) return fromSeed;
    if (!isCatalogLocality) return null;
  }

  return buildLocationPageDataFromSpaces(
    vertical,
    cityPage.city,
    cityRouteSlug,
    microKey,
    spaces,
    filters,
    cityPage.catalogCityId,
    workspaceMicroLocationId ?? undefined,
  );
}

/** Vertical location pages (coworking uses catalog + workspaces + micro-locations; others seed-only). */
export const getVerticalLocationPageContent: typeof fetchVerticalLocationPageContent =
  typeof window === "undefined" ? cache(fetchVerticalLocationPageContent) : fetchVerticalLocationPageContent;
