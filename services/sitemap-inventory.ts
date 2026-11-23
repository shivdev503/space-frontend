/**
 * Live listing inventory for the sitemaps — fetched from the backend API (never seed data).
 *
 * Each loader is cached in memory for an hour and shared across the sitemap routes,
 * so one crawl of all seven sitemaps costs a single fetch per vertical.
 * Loaders reject when the API is unreachable; routes turn that into a 503 so Google
 * retries later instead of seeing an empty sitemap.
 */

import { cachedLoader } from "@/lib/cached-loader";
import { resolvePgListingSlug, slugifyPgName } from "@/lib/pg-slug";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { canonicalCoworkingCitySlug, resolveCatalogIdToSlug } from "@/services/catalog-city-id";
import { isCoworkingUserApiProxyEnabled, resolveApiBaseUrl } from "@/services/env-config";
import { fetchPgList } from "@/services/pg-api";
import { normalizePgListItems } from "@/services/pg-mapper";

const REQUEST_TIMEOUT_MS = 60_000;
const WORKSPACE_PAGE_SIZE = 1000;
/** The PG API caps pages at 50 server-side. */
const PG_PAGE_SIZE = 50;
const PG_CONCURRENCY = 8;

export type InventorySpace = {
  slug: string;
  /** Listing name as shown on the site (used for directory links on city pages). */
  name?: string;
  cityId?: string;
  cityName?: string;
  localityName?: string;
  /** Micro-location id (workspaces only). */
  localityId?: string;
  /** Operator brand slug (workspaces only), e.g. "awfis". */
  brandSlug?: string;
  /** Operator brand name (workspaces only), e.g. "Awfis". */
  brandName?: string;
  /** Real last-modified time when the API provides one. */
  updatedAt?: Date;
  /** False for PG pages kept out of Google (noindex); they stay in area counts but not in the sitemap. */
  indexable?: boolean;
};

const PG_CITY_TO_ROUTE: Record<string, string> = {
  bengaluru: "bangalore",
  "new-delhi": "delhi",
  "navi-mumbai": "mumbai",
};

/** Canonical route slug for a listing's city (e.g. catalog "gurugram" → "gurgaon"). */
export function citySlugOf(item: InventorySpace): string | null {
  const fromCatalog = item.cityId ? resolveCatalogIdToSlug(item.cityId) : null;
  const raw = fromCatalog ?? (item.cityName ? slugifyPgName(item.cityName) : "");
  if (!raw) return null;
  return canonicalCoworkingCitySlug(PG_CITY_TO_ROUTE[raw] ?? raw);
}

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

/**
 * A listing Google may index: not hidden on the site and not set to `noindex` in its SEO block.
 * Sitemaps list only these, so every URL we submit is one Google is allowed to keep.
 */
function isIndexableRow(row: RawRecord): boolean {
  if (row.is_active === false) return false;
  // Same rule as the detail page (`workspaceSeo`): its robots come from `new_seo` when that block is
  // switched on and has a title; otherwise the page uses its default template, which is indexable.
  const seo = isRecord(row.new_seo) ? row.new_seo : null;
  if (!seo || seo.status === false || !str(seo.title)) return true;
  return !/noindex/i.test(str(seo.robots));
}

function workspaceToInventory(row: RawRecord): InventorySpace | null {
  const slug = str(row.slug);
  if (!slug || !isIndexableRow(row)) return null;
  const location = isRecord(row.location) ? row.location : {};
  return {
    slug,
    name: str(row.name) || undefined,
    cityId: refId(location.city) || undefined,
    cityName: refName(location.city) || undefined,
    localityName: refName(location.micro_location) || str(location.micro_location_string) || undefined,
    localityId: refId(location.micro_location) || undefined,
    brandSlug: (isRecord(row.brand) ? str(row.brand.slug) : "") || undefined,
    brandName: (isRecord(row.brand) ? str(row.brand.name) : "") || undefined,
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

/**
 * Every public listing from `GET /api/user/listing-index`: the same rows, filters and order as the
 * full list endpoints, but only the fields the sitemaps and link directories read (about 1 MB
 * instead of about 37 MB). Loaded once an hour for the whole server.
 */
export type ListingIndex = {
  coworking: RawRecord[];
  virtualOffice: RawRecord[];
  managedOffices: RawRecord[];
  pgs: RawRecord[];
};

const records = (v: unknown): RawRecord[] => (Array.isArray(v) ? v.filter(isRecord) : []);

/** PG rows as the PG list returns them: sorted by name, 50 a page, a few pages at a time. */
async function fetchAllPgRows(): Promise<RawRecord[]> {
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
  return pages.flat() as unknown as RawRecord[];
}

/** The old way: full list endpoints. Only used while a backend without `/listing-index` is live. */
async function fetchListingIndexFromFullLists(): Promise<ListingIndex> {
  const [coworking, virtualOffice, managed, pgs] = await Promise.all([
    fetchAllWorkspaceRows({}),
    fetchAllWorkspaceRows({ virtual: true }),
    getJson("/api/user/managedOffices", { limit: 1000 }),
    fetchAllPgRows(),
  ]);
  return { coworking, virtualOffice, managedOffices: records(managed.data), pgs };
}

export const loadListingIndex = cachedLoader(
  async (): Promise<ListingIndex> => {
    let json: RawRecord;
    try {
      json = await getJson("/api/user/listing-index", {});
    } catch (error) {
      if (error instanceof Error && / responded 404$/.test(error.message)) return fetchListingIndexFromFullLists();
      throw error;
    }
    const data = isRecord(json.data) ? json.data : {};
    const coworking = records(data.coworking);
    const bySlug = new Map(coworking.map((row) => [str(row.slug), row]));
    const virtualSlugs = Array.isArray(data.virtual_office_slugs) ? data.virtual_office_slugs.map(str) : [];
    return {
      coworking,
      virtualOffice: virtualSlugs.map((slug) => bySlug.get(slug)).filter((row): row is RawRecord => row != null),
      managedOffices: records(data.managed_offices),
      pgs: records(data.pgs),
    };
  },
  undefined,
  "listing-index",
);

/**
 * All approved coworking workspace rows, fully populated (images, SEO…). Heavy: only for the brand
 * page fallback when the API ignores `?brand=`. Everything else uses {@link loadListingIndex}.
 */
export const loadCoworkingWorkspaceRows = cachedLoader(() => fetchAllWorkspaceRows({}), undefined, "coworking-rows-full");

/** Approved coworking rows with only the listing fields (name, slug, city, area, brand, plans). */
export const loadCoworkingIndexRows = async () => (await loadListingIndex()).coworking;

/** A list derived from the index, rebuilt only when the index itself is reloaded. */
export function fromIndex<T>(derive: (index: ListingIndex) => T): () => Promise<T> {
  const memo = new WeakMap<ListingIndex, T>();
  return async () => {
    const index = await loadListingIndex();
    let value = memo.get(index);
    if (value === undefined) {
      value = derive(index);
      memo.set(index, value);
    }
    return value;
  };
}

/** All approved coworking workspaces. */
export const loadCoworkingInventory = fromIndex((index) => toInventory(index.coworking));

/** Workspaces that sell virtual office plans (`/virtual-office/{slug}` detail pages). */
export const loadVirtualOfficeInventory = fromIndex((index) => toInventory(index.virtualOffice));

/** Managed office listings (`/managed-office/{slug}`); rows without a slug have no page. */
export const loadManagedOfficeInventory = fromIndex((index) =>
  index.managedOffices
    .filter((row) => str(row.status) === "" || str(row.status) === "approve")
    .map((row) => workspaceToInventory(row))
    .filter((item): item is InventorySpace => item != null),
);

/** PG rows from the index, for area checks that need the city id (`locationIds.city`). */
export const loadColivingIndexRows = async () => (await loadListingIndex()).pgs;

/**
 * Every PG / coliving listing, sorted by name (many PGs share one `added_on`, so a tied sort would
 * page unreliably). The first row wins when two share a slug.
 */
export const loadColivingInventory = fromIndex((index) => {
  const seen = new Set<string>();
  const out: InventorySpace[] = [];
  for (const pg of normalizePgListItems(index.pgs)) {
    const slug = resolvePgListingSlug(pg);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const raw = pg as unknown as RawRecord;
    out.push({
      slug,
      name: pg.name?.trim() || undefined,
      cityName: pg.city?.trim() || undefined,
      localityName: pg.locality?.trim() || undefined,
      updatedAt: parseDate(raw.updated_on, raw.updatedAt, raw.added_on),
      indexable: raw.index_in_google !== false,
    });
  }
  return out;
});
