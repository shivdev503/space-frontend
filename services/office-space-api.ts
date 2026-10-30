/**
 * `GET /api/user/officeSpaces?city=&limit=`
 * Response: `{ message, data: officeSpaces[], totalRecords, locations }`
 */

import axios, { type AxiosInstance } from "axios";

import {
  isCoworkingUserApiProxyEnabled,
  resolveCoworkingApiBaseUrl,
  resolveCoworkingApiTimeoutMs,
} from "@/services/env-config";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { listSpaces } from "@/services/mock-db";
import type { OfficeSpaceModel } from "@/types/office-space.model";
import { normalizeOfficeLocation } from "@/lib/office-location";

const DEFAULT_LIMIT = 36;

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

type OfficeListResponse = {
  message?: string;
  data?: unknown[];
  totalRecords?: number;
  locations?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function wireId(row: Record<string, unknown>): string {
  const a = row._id;
  const b = row.id;
  if (typeof a === "string" && a.trim()) return a.trim();
  if (typeof b === "string" && b.trim()) return b.trim();
  if (a != null && typeof a === "object" && "$oid" in a) {
    const oid = (a as { $oid?: unknown }).$oid;
    if (typeof oid === "string" && oid.trim()) return oid.trim();
  }
  return "";
}

/**
 * Client-side list for city page. Returns `null` if the API is unavailable or the request fails (caller keeps seed data).
 */
export async function officeSpacesAsSpaces(
  catalogCityId: string,
  limit = DEFAULT_LIMIT,
): Promise<OfficeSpaceModel.OfficeSpace[] | null> {
  if (!isCoworkingUserApiProxyEnabled()) return null;

  try {
    const { data } = await getClient().get<OfficeListResponse>("/api/user/officeSpaces", {
      params: { city: catalogCityId.trim(), limit },
    });

    const rows = Array.isArray(data?.data) ? data.data : [];
    const officeSpaces: OfficeSpaceModel.OfficeSpace[] = [];
    for (const row of rows) {
      if (!isRecord(row)) continue;
      const _id = wireId(row);
      const slug = typeof row.slug === "string" ? row.slug.trim() : "";
      if (!_id || !slug) continue;
      const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : _id;
      officeSpaces.push(normalizeOfficeLocation({ ...(row as any), _id, id }) as OfficeSpaceModel.OfficeSpace);
    }
    return officeSpaces;
  } catch {
    return null;
  }
}

/** Minimal row for homepage / header search dropdowns (office vertical). */
export type OfficeSpaceSearchHit = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Offices in a city for search autocomplete; uses live API when enabled, otherwise seed `mock-db`.
 */
export async function loadOfficeSpaceSearchHits(
  catalogCityId: string | null | undefined,
  appCitySlug: string,
  options: { name?: string; limit?: number } = {},
): Promise<OfficeSpaceSearchHit[]> {
  const limit = options.limit ?? 48;
  const nameQ = options.name?.trim().toLowerCase() ?? "";
  const citySlug = appCitySlug.trim().toLowerCase();

  let hits: OfficeSpaceSearchHit[] = [];

  const catalog = catalogCityId?.trim();
  if (catalog) {
    const rows = await officeSpacesAsSpaces(catalog, Math.max(limit, 60));
    if (rows?.length) {
      hits = rows
        .map((o) => ({
          id: String(o.id ?? o._id ?? ""),
          name: String(o.name ?? "").trim(),
          slug: String(o.slug ?? "").trim(),
        }))
        .filter((h) => h.id && h.slug && h.name);
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

  const seed = listSpaces({ vertical: "office-space", city: citySlug });
  let mapped = seed.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
  }));
  if (nameQ) {
    mapped = mapped.filter((h) => h.name.toLowerCase().includes(nameQ));
  }
  return mapped.slice(0, limit);
}
