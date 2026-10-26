/**
 * Brand pages (`/brand/{slug}`): every coworking centre of one operator.
 *
 * Uses `GET /api/user/workSpaces?brand={slug}&limit=50&page={n}`. Until a backend with the
 * `brand` filter is deployed the API ignores it and returns all brands — detected below,
 * in which case the full (cached) coworking list is filtered by brand instead.
 */

import { cache } from "react";

import { toSpaceImageCdnUrl } from "@/lib/space-image-url";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { canonicalCoworkingCitySlug, resolveCatalogIdToSlug } from "@/services/catalog-city-id";
import { normalizeCoworkingWorkspacesPayload } from "@/services/coworking-workspace-mapper";
import { isCoworkingUserApiProxyEnabled, resolveApiBaseUrl } from "@/services/env-config";
import { type RawRecord, loadCoworkingWorkspaceRows } from "@/services/sitemap-inventory";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { SeoContent } from "@/types/seo.model";

const PAGE_SIZE = 50;
const REQUEST_TIMEOUT_MS = 30_000;

/** Catch-all bucket for independent spaces — not an operator, so it gets no brand page. */
export const NON_OPERATOR_BRAND_SLUGS: ReadonlySet<string> = new Set(["other-coworking"]);

export type BrandInfo = {
  slug: string;
  name: string;
  logo?: string;
  tagLine?: string;
  description?: string;
  seo?: SeoContent;
};

export type BrandCity = { slug: string; name: string; count: number };

export type BrandPageData = {
  brand: BrandInfo;
  workspaces: CoworkingModel.WorkSpace[];
  cities: BrandCity[];
};

function isRecord(v: unknown): v is RawRecord {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function brandSlugOf(row: RawRecord): string {
  return isRecord(row.brand) ? str(row.brand.slug).toLowerCase() : "";
}

async function fetchBrandPage(slug: string, page: number): Promise<{ rows: RawRecord[]; total: number }> {
  const query = new URLSearchParams({ brand: slug, limit: String(PAGE_SIZE), page: String(page) });
  const res = await fetch(`${resolveApiBaseUrl()}/api/user/workSpaces?${query.toString()}`, {
    headers: buildApiClientHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`workSpaces?brand responded ${res.status}`);
  const json = (await res.json()) as RawRecord;
  const rows = Array.isArray(json.data) ? json.data.filter(isRecord) : [];
  return { rows, total: typeof json.totalRecords === "number" ? json.totalRecords : rows.length };
}

/** All rows for one brand: server-side `brand` filter, or the cached full list when unsupported. */
async function loadBrandRows(slug: string): Promise<RawRecord[]> {
  const first = await fetchBrandPage(slug, 1);
  const filtered = first.rows.every((row) => brandSlugOf(row) === slug);
  if (!filtered) {
    const all = await loadCoworkingWorkspaceRows();
    return all.filter((row) => brandSlugOf(row) === slug);
  }

  const rows = [...first.rows];
  for (let page = 2; rows.length < first.total; page += 1) {
    const next = await fetchBrandPage(slug, page);
    if (next.rows.length === 0) break;
    rows.push(...next.rows);
  }
  return rows;
}

function brandInfoFrom(row: RawRecord, slug: string): BrandInfo {
  const brand = isRecord(row.brand) ? row.brand : {};
  const image = isRecord(brand.image) ? str(brand.image.s3_link) : "";
  return {
    slug,
    name: str(brand.name) || slug,
    logo: image ? toSpaceImageCdnUrl(image) : undefined,
    tagLine: str(brand.brand_tag_line) || str(brand.logo_tag_line) || undefined,
    description: str(brand.description) || undefined,
    seo: isRecord(brand.seo) && str(brand.seo.title) ? (brand.seo as unknown as SeoContent) : undefined,
  };
}

function citySlugOf(ws: CoworkingModel.WorkSpace): string {
  const id = ws.location?.city?.id?.trim();
  const fromCatalog = id ? resolveCatalogIdToSlug(id) : null;
  const name = ws.location?.city?.name?.trim().toLowerCase() ?? "";
  return canonicalCoworkingCitySlug(fromCatalog ?? name.replace(/\s+/g, "-"));
}

function citiesOf(workspaces: CoworkingModel.WorkSpace[]): BrandCity[] {
  const byCity = new Map<string, BrandCity>();
  for (const ws of workspaces) {
    const slug = citySlugOf(ws);
    const name = ws.location?.city?.name?.trim();
    if (!slug || !name) continue;
    const entry = byCity.get(slug) ?? { slug, name, count: 0 };
    entry.count += 1;
    byCity.set(slug, entry);
  }
  return Array.from(byCity.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

async function fetchBrandPageData(rawSlug: string): Promise<BrandPageData | null> {
  const slug = rawSlug.trim().toLowerCase();
  if (!slug || NON_OPERATOR_BRAND_SLUGS.has(slug) || !isCoworkingUserApiProxyEnabled()) return null;

  const rows = await loadBrandRows(slug);
  if (rows.length === 0) return null;

  const workspaces = normalizeCoworkingWorkspacesPayload({ data: rows }).data;
  return { brand: brandInfoFrom(rows[0], slug), workspaces, cities: citiesOf(workspaces) };
}

/** Deduped per request (metadata + page share one load). */
export const loadBrandPageData = cache(fetchBrandPageData);

/** Filter a brand's centres to one city (canonical city slug), or all when `city` is empty. */
export function brandWorkspacesInCity(
  data: BrandPageData,
  city: string | undefined,
): CoworkingModel.WorkSpace[] {
  const key = city ? canonicalCoworkingCitySlug(city.trim().toLowerCase()) : "";
  if (!key) return data.workspaces;
  return data.workspaces.filter((ws) => citySlugOf(ws) === key);
}
