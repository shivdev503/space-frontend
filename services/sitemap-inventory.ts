/**
 * Live listing inventory for the sitemaps — fetched from the backend API (never seed data).
 *
 * Each loader is cached in memory for an hour and shared across the sitemap routes,
 * so one crawl of all seven sitemaps costs a single fetch per vertical.
 * Loaders reject when the API is unreachable; routes turn that into a 503 so Google
 * retries later instead of seeing an empty sitemap.
 */

import { cachedLoader } from "@/lib/cached-loader";
import { resolvePgListingSlug } from "@/lib/pg-slug";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { isCoworkingUserApiProxyEnabled, resolveApiBaseUrl } from "@/services/env-config";
import { fetchPgList } from "@/services/pg-api";

const REQUEST_TIMEOUT_MS = 60_000;
const WORKSPACE_PAGE_SIZE = 1000;
/** The PG API caps pages at 50 server-side. */
const PG_PAGE_SIZE = 50;
const PG_CONCURRENCY = 8;

export type InventorySpace = {
  slug: string;
  cityId?: string;
  cityName?: string;
  localityName?: string;
  /** Operator brand slug (workspaces only), e.g. "awfis". */
  brandSlug?: string;
  /** Real last-modified time when the API provides one. */
  updatedAt?: Date;
};

export type RawRecord = Record<string, unknown>;

function isRecord(v: unknown): v is RawRecord {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function parseDate(...values: unknown[]): Date | undefined {
  for (const v of values) {
    if (typeof v !== "string" && typeof v !== "number") continue;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return undefined;
}

async function getJson(path: string, params: Record<string, string | number | boolean>): Promise<RawRecord> {
  if (!isCoworkingUserApiProxyEnabled()) {
    throw new Error("API base URL is not configured");
  }
  const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const res = await fetch(`${resolveApiBaseUrl()}${path}?${query.toString()}`, {
    headers: buildApiClientHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  const json = (await res.json()) as unknown;
  if (!isRecord(json)) throw new Error(`${path} returned an unexpected payload`);
  return json;
}

/** `location.city` / `location.micro_location` arrive populated (objects) or as ids. */
function refName(v: unknown): string {
  return isRecord(v) ? str(v.name) : "";
}

function refId(v: unknown): string {
  if (isRecord(v)) return str(v._id) || str(v.id);
  return str(v);
}

function workspaceToInventory(row: RawRecord): InventorySpace | null {
  const slug = str(row.slug);
  if (!slug) return null;
  const location = isRecord(row.location) ? row.location : {};
  return {
    slug,
    cityId: refId(location.city) || undefined,
    cityName: refName(location.city) || undefined,
    localityName: refName(location.micro_location) || undefined,
    brandSlug: (isRecord(row.brand) ? str(row.brand.slug) : "") || undefined,
    updatedAt: parseDate(row.updated_on, row.updatedAt),
  };
}

/** Every workspace row (fully populated), paging with the backend's `page` param. */
async function fetchAllWorkspaceRows(extra: Record<string, string | boolean>): Promise<RawRecord[]> {
  const out: RawRecord[] = [];
  for (let page = 1; ; page += 1) {
    const json = await getJson("/api/user/workSpaces", { ...extra, limit: WORKSPACE_PAGE_SIZE, page });
    const rows = Array.isArray(json.data) ? json.data.filter(isRecord) : [];
    out.push(...rows);
    const total = typeof json.totalRecords === "number" ? json.totalRecords : rows.length;
    if (rows.length < WORKSPACE_PAGE_SIZE || out.length >= total) break;
  }
  return out;
}

function toInventory(rows: RawRecord[]): InventorySpace[] {
  return rows.map(workspaceToInventory).filter((item): item is InventorySpace => item != null);
}

/** All approved coworking workspace rows — shared by the sitemaps and brand pages. */
export const loadCoworkingWorkspaceRows = cachedLoader(() => fetchAllWorkspaceRows({}));

/** All approved coworking workspaces. */
export const loadCoworkingInventory = cachedLoader(async () => toInventory(await loadCoworkingWorkspaceRows()));

/** Workspaces that sell virtual office plans (`/virtual-office/{slug}` detail pages). */
export const loadVirtualOfficeInventory = cachedLoader(async () =>
  toInventory(await fetchAllWorkspaceRows({ virtual: true })),
);

/** Managed office listings (`/managed-office/{slug}`); rows without a slug have no page. */
export const loadManagedOfficeInventory = cachedLoader(async () => {
  const json = await getJson("/api/user/officeSpaces", { limit: 1000 });
  const rows = Array.isArray(json.data) ? json.data.filter(isRecord) : [];
  return rows
    .filter((row) => str(row.status) === "" || str(row.status) === "approve")
    .map((row) => workspaceToInventory(row))
    .filter((item): item is InventorySpace => item != null);
});

/**
 * Every PG / coliving listing, paged 50 at a time with limited concurrency.
 * Sorted by name: many PGs share one `added_on` (bulk imports), and paging on a tied sort
 * returns overlapping pages — by `added_on` only 1,829 of 4,191 PGs came back.
 */
export const loadColivingInventory = cachedLoader(async () => {
  const pageQuery = { limit: PG_PAGE_SIZE, sortBy: "name", orderBy: 1 } as const;
  const first = await fetchPgList({ ...pageQuery, page: 1 });
  const totalPages = Math.max(1, Math.ceil(first.totalRecords / PG_PAGE_SIZE));
  const pages = [first.data];

  for (let start = 2; start <= totalPages; start += PG_CONCURRENCY) {
    const batch = Array.from(
      { length: Math.min(PG_CONCURRENCY, totalPages - start + 1) },
      (_, i) => fetchPgList({ ...pageQuery, page: start + i }).then((res) => res.data),
    );
    pages.push(...(await Promise.all(batch)));
  }

  const seen = new Set<string>();
  const out: InventorySpace[] = [];
  for (const pg of pages.flat()) {
    const slug = resolvePgListingSlug(pg);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      slug,
      cityName: pg.city?.trim() || undefined,
      localityName: pg.locality?.trim() || undefined,
    });
  }
  return out;
});
