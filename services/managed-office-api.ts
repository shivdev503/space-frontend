/**
 * Managed office HTTP client (axios).
 * List:   `GET /api/user/managedOffices?city=&micro_location=&brand=&seat_type=&minPrice=&maxPrice=&name=&limit=&page=`
 *         → `{ message, data: ManagedOffice[], totalRecords }`
 * Detail: `GET /api/user/managedOffice/:slugOrId` → `{ message, data: ManagedOffice }`
 */

import axios, { type AxiosInstance } from "axios";
import { cache } from "react";

import { isUpstreamFailure } from "@/lib/upstream-error";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import {
  isCoworkingUserApiProxyEnabled,
  resolveCoworkingApiBaseUrl,
  resolveCoworkingApiTimeoutMs,
} from "@/services/env-config";
import type { ManagedOfficeModel } from "@/types/managed-office.model";

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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * The detail endpoint sends `city`, `micro_location`, `state` and `country` as plain names, the list
 * endpoint as objects. Normalise to `{ name }` objects so shared location helpers work for both.
 */
function normalizeLocation(location: unknown): ManagedOfficeModel.Location | undefined {
  if (!isRecord(location)) return undefined;
  const asNamed = (v: unknown) => {
    if (typeof v === "string") return v.trim() ? { name: v.trim() } : undefined;
    if (isRecord(v) && typeof v.name === "string") return { ...v, name: v.name.trim() };
    return v ?? undefined;
  };
  return {
    ...location,
    city: asNamed(location.city),
    micro_location: asNamed(location.micro_location),
    state: asNamed(location.state),
    country: asNamed(location.country),
  } as ManagedOfficeModel.Location;
}

function coerceManagedOffice(raw: unknown): ManagedOfficeModel.ManagedOffice | null {
  if (!isRecord(raw)) return null;
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const _id = typeof raw._id === "string" ? raw._id.trim() : typeof raw.id === "string" ? raw.id.trim() : "";
  if (!_id || !slug) return null;
  return {
    ...(raw as unknown as ManagedOfficeModel.ManagedOffice),
    _id,
    id: _id,
    slug,
    location: normalizeLocation(raw.location),
  };
}

export type ManagedOfficeListParams = {
  city?: string;
  microLocation?: string;
  brand?: string;
  seatType?: ManagedOfficeModel.SeatType;
  minPrice?: number;
  maxPrice?: number;
  name?: string;
  limit?: number;
  page?: number;
};

export type ManagedOfficeListResult = {
  rows: ManagedOfficeModel.ManagedOffice[];
  totalRecords: number;
};

/** Returns `null` when the API is disabled or the request fails (callers keep their fallback). */
export async function listManagedOffices(
  params: ManagedOfficeListParams = {},
): Promise<ManagedOfficeListResult | null> {
  if (!isCoworkingUserApiProxyEnabled()) return null;

  try {
    const { data } = await getClient().get<ManagedOfficeModel.ListResponse>("/api/user/managedOffices", {
      params: {
        city: params.city?.trim() || undefined,
        micro_location: params.microLocation?.trim() || undefined,
        brand: params.brand?.trim() || undefined,
        seat_type: params.seatType,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        name: params.name?.trim() || undefined,
        limit: params.limit ?? DEFAULT_LIMIT,
        page: params.page ?? 1,
      },
    });
    const rows = (Array.isArray(data?.data) ? data.data : [])
      .map(coerceManagedOffice)
      .filter((row): row is ManagedOfficeModel.ManagedOffice => row != null);
    return { rows, totalRecords: typeof data?.totalRecords === "number" ? data.totalRecords : rows.length };
  } catch {
    return null;
  }
}

/** Managed offices in a catalog city (city page, similar offices). */
export async function managedOfficesByCity(
  catalogCityId: string,
  limit = DEFAULT_LIMIT,
): Promise<ManagedOfficeModel.ManagedOffice[] | null> {
  const result = await listManagedOffices({ city: catalogCityId, limit });
  return result ? result.rows : null;
}

async function fetchManagedOfficeDetail(slugOrId: string): Promise<ManagedOfficeModel.ManagedOffice | null> {
  const key = slugOrId.trim();
  if (!key || !isCoworkingUserApiProxyEnabled()) return null;
  try {
    const { data } = await getClient().get<ManagedOfficeModel.DetailResponse>(
      `/api/user/managedOffice/${encodeURIComponent(key)}`,
    );
    return coerceManagedOffice(isRecord(data) ? data.data : null);
  } catch (error) {
    if (isUpstreamFailure(error)) throw error;
    return null;
  }
}

/** Detail by slug or id; de-duplicated per request on the server (metadata + page). */
export const loadManagedOfficeDetail: typeof fetchManagedOfficeDetail =
  typeof window === "undefined" ? cache(fetchManagedOfficeDetail) : fetchManagedOfficeDetail;

/** Minimal row for homepage / header search dropdowns (managed office vertical). */
export type ManagedOfficeSearchHit = {
  id: string;
  name: string;
  slug: string;
};

/** Managed offices in a city for search autocomplete. */
export async function loadManagedOfficeSearchHits(
  catalogCityId: string | null | undefined,
  options: { name?: string; limit?: number } = {},
): Promise<ManagedOfficeSearchHit[]> {
  const city = catalogCityId?.trim();
  if (!city) return [];
  const result = await listManagedOffices({ city, name: options.name, limit: options.limit ?? 48 });
  return (result?.rows ?? []).map((o) => ({ id: o.id, name: o.name, slug: o.slug })).filter((h) => h.name);
}
