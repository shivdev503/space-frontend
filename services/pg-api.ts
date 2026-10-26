/**
 * `GET /api/user/pgs` — list (+ `x-client-key`)
 * `GET /api/user/pgs/:findKey` — detail by Mongo id, pg_id, or slug
 *
 * Priority listings (featured first, then full list): set `priorityType` + `priorityCity`
 * for city/micro-location pages — see {@link buildPgColivingCityPageParams} and
 * {@link buildPgColivingLocationPageParams} in `@/lib/pg-list-priority`.
 */

import axios, { type AxiosInstance } from "axios";

import { isPgPriorityForType, withPgOverallPriority } from "@/lib/pg-list-priority";
import { resolvePgListingSlug, slugifyPgName } from "@/lib/pg-slug";
import {
  isCoworkingUserApiProxyEnabled,
  resolveCoworkingApiBaseUrl,
  resolveCoworkingApiTimeoutMs,
} from "@/services/env-config";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import {
  normalizePgDetailResponse,
  normalizePgListItems,
} from "@/services/pg-mapper";
import { listSpaces } from "@/services/mock-db";
import type { PgDetail, PgDetailResponse, PgListParams, PgListResponse } from "@/types/pg.model";
import { toTitleCase } from "@/utils/format";

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  const ms = resolveCoworkingApiTimeoutMs();
  if (!client) {
    client = axios.create({
      baseURL: resolveCoworkingApiBaseUrl(),
      timeout: ms,
      headers: buildApiClientHeaders(),
    });
  } else {
    client.defaults.baseURL = resolveCoworkingApiBaseUrl();
    client.defaults.timeout = ms;
  }
  return client;
}

function buildQuery(params: PgListParams): Record<string, string> {
  const qs: Record<string, string> = {};
  const entries: [keyof PgListParams, unknown][] = Object.entries(params) as [keyof PgListParams, unknown][];
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "boolean") {
      qs[key] = value ? "true" : "false";
    } else {
      qs[key] = String(value);
    }
  }
  return qs;
}

export async function fetchPgList(params: PgListParams = {}): Promise<PgListResponse> {
  const limit = Math.min(params.limit ?? 20, 50);
  const page = params.page ?? 1;
  const query = buildQuery({
    ...params,
    limit,
    page: params.skip != null ? undefined : page,
    skip: params.skip,
    sortBy: params.sortBy ?? "added_on",
    orderBy: params.orderBy ?? -1,
  });

  const { data } = await getClient().get<PgListResponse>("/api/user/pgs", { params: query });
  const rawRows = Array.isArray(data?.data) ? data.data : [];
  return {
    message: data?.message ?? "PG list",
    data: normalizePgListItems(rawRows as unknown[]),
    totalRecords: typeof data?.totalRecords === "number" ? data.totalRecords : 0,
  };
}

export async function fetchPgDetail(findKey: string): Promise<PgDetailResponse | null> {
  const key = findKey.trim();
  if (!key) return null;

  try {
    const { data, status } = await getClient().get<PgDetailResponse>(
      `/api/user/pgs/${encodeURIComponent(key)}`,
    );
    if (status === 404) return null;
    if (!data?.data) return null;
    return normalizePgDetailResponse(data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

/**
 * Coliving homepage featured rail — `priorityType=overall` (featured PGs first).
 * Prefers rows with `priority.overall.is_active`; falls back to the top of the sorted list.
 */
export async function loadColivingHomepageFeaturedPgs(limit = 8): Promise<PgDetail[]> {
  const cap = Math.min(Math.max(limit, 1), 20);
  if (!isCoworkingUserApiProxyEnabled()) return [];

  try {
    const res = await fetchPgList(
      withPgOverallPriority({
        limit: Math.max(cap, 12),
        page: 1,
        sortBy: "added_on",
        orderBy: -1,
      }),
    );
    const priorityRows = res.data.filter((pg) => isPgPriorityForType(pg, "overall"));
    const list = priorityRows.length > 0 ? priorityRows : res.data;
    return list.slice(0, cap);
  } catch {
    return [];
  }
}

/** Server-safe list; returns empty on failure when API disabled. */
export async function loadPgList(params: PgListParams = {}): Promise<PgListResponse> {
  if (!isCoworkingUserApiProxyEnabled()) {
    return { message: "PG list", data: [], totalRecords: 0 };
  }
  try {
    return await fetchPgList(params);
  } catch {
    return { message: "PG list", data: [], totalRecords: 0 };
  }
}

export async function loadPgDetail(findKey: string): Promise<PgDetailResponse | null> {
  if (!isCoworkingUserApiProxyEnabled()) return null;
  try {
    return await fetchPgDetail(findKey);
  } catch {
    return null;
  }
}

/** Minimal row for homepage / header search dropdowns (coliving & PG vertical). */
export type PgSearchHit = {
  id: string;
  name: string;
  slug: string;
  locality: string;
  city: string;
};

function pgDetailToSearchHit(pg: PgDetail, index: number): PgSearchHit {
  const slug = resolvePgListingSlug(pg);
  return {
    id: slug || `${slugifyPgName(pg.name)}-${slugifyPgName(pg.locality)}-${index}`,
    name: pg.name,
    slug,
    locality: pg.locality,
    city: pg.city,
  };
}

/**
 * Coliving/PG search autocomplete — `GET /api/user/pgs` with city (+ optional name) filter.
 * `cityLabel` should be the display city name (e.g. Gurugram) for the API `city` param.
 */
export async function loadPgSearchHits(
  appCitySlug: string,
  cityLabel: string,
  options: { name?: string; limit?: number } = {},
): Promise<PgSearchHit[]> {
  const limit = Math.min(options.limit ?? 48, 50);
  const nameQ = options.name?.trim().toLowerCase() ?? "";
  const citySlug = appCitySlug.trim().toLowerCase();
  const cityForApi =
    cityLabel.trim() ||
    (citySlug ? toTitleCase(citySlug.replace(/-/g, " ")) : "");

  let hits: PgSearchHit[] = [];

  if (cityForApi && isCoworkingUserApiProxyEnabled()) {
    try {
      const res = await fetchPgList({
        city: cityForApi,
        name: options.name?.trim() || undefined,
        limit,
        page: 1,
        sortBy: "rating",
        orderBy: -1,
      });
      hits = res.data.map(pgDetailToSearchHit);
    } catch {
      hits = [];
    }
  }

  if (nameQ) {
    hits = hits.filter((h) => h.name.toLowerCase().includes(nameQ));
  }
  hits = hits.slice(0, limit);

  if (hits.length > 0) {
    return hits;
  }

  if (!citySlug) return [];

  let seed = listSpaces({ vertical: "coliving", city: citySlug }).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    locality: toTitleCase(s.location.replace(/-/g, " ")),
    city: toTitleCase(s.city.replace(/-/g, " ")),
  }));
  if (nameQ) {
    seed = seed.filter((h) => h.name.toLowerCase().includes(nameQ));
  }
  return seed.slice(0, limit);
}
