/**
 * Office buildings (`GET /api/user/buildings`, `GET /api/user/building/:slug`): buildings that hold
 * 2+ live coworking centres and/or managed offices, each with a page at `/building/{slug}`.
 */
import axios, { type AxiosInstance } from "axios";
import { cache } from "react";

import { cachedLoader } from "@/lib/cached-loader";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import {
  isCoworkingUserApiProxyEnabled,
  resolveCoworkingApiBaseUrl,
  resolveCoworkingApiTimeoutMs,
} from "@/services/env-config";

/** Same bar as the API: a building page lists at least this many live centres. */
export const MIN_CENTRES_FOR_BUILDING_PAGE = 2;

export type Building = {
  id: string;
  name: string;
  slug: string;
  cityId?: string;
  cityName?: string;
  areaId?: string;
  areaName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  description?: string;
  coworkingSlugs: string[];
  managedOfficeSlugs: string[];
  totalCentres: number;
  updatedAt?: Date;
};

type Raw = Record<string, unknown>;
const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const slugs = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

function toBuilding(raw: unknown): Building | null {
  if (!isRecord(raw)) return null;
  const slug = str(raw.slug);
  const name = str(raw.name);
  if (!slug || !name) return null;
  const city = isRecord(raw.city) ? raw.city : null;
  const area = isRecord(raw.micro_location) ? raw.micro_location : null;
  const coworkingSlugs = slugs(raw.coworking_slugs);
  const managedOfficeSlugs = slugs(raw.managed_office_slugs);
  const updated = str(raw.updated_on);
  return {
    id: str(raw._id) || str(raw.id),
    name,
    slug,
    cityId: city ? str(city._id) : str(raw.city) || undefined,
    cityName: city ? str(city.name) : undefined,
    areaId: area ? str(area._id) : str(raw.micro_location) || undefined,
    areaName: area ? str(area.name) : undefined,
    address: str(raw.address) || undefined,
    latitude: num(raw.latitude),
    longitude: num(raw.longitude),
    image: str(raw.image) || undefined,
    description: str(raw.description) || undefined,
    coworkingSlugs,
    managedOfficeSlugs,
    totalCentres: coworkingSlugs.length + managedOfficeSlugs.length,
    updatedAt: updated && !Number.isNaN(Date.parse(updated)) ? new Date(updated) : undefined,
  };
}

let client: AxiosInstance | null = null;
function getClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: resolveCoworkingApiBaseUrl(),
      timeout: resolveCoworkingApiTimeoutMs(),
      headers: buildApiClientHeaders(),
    });
  }
  return client;
}

/**
 * Every building with a page, cached for an hour (sitemap, links from listings, area and city
 * pages). Rejects when the API is unreachable; an API without the endpoint yet (404) gives [].
 */
export const loadBuildings = cachedLoader(async (): Promise<Building[]> => {
  if (!isCoworkingUserApiProxyEnabled()) return [];
  try {
    const { data } = await getClient().get<unknown>("/api/user/buildings");
    const rows = isRecord(data) && Array.isArray(data.data) ? data.data : [];
    return rows
      .map(toBuilding)
      .filter((b): b is Building => b != null && b.totalCentres >= MIN_CENTRES_FOR_BUILDING_PAGE);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw error;
  }
});

/** Buildings, or [] when they can't be loaded: for optional links that must never break a page. */
export async function loadBuildingsOrEmpty(): Promise<Building[]> {
  try {
    return await loadBuildings();
  } catch {
    return [];
  }
}

/** One building for its page (null when unknown or below the minimum). Deduped per request. */
export const loadBuilding = cache(async (slug: string): Promise<Building | null> => {
  const key = slug.trim().toLowerCase();
  if (!key || !isCoworkingUserApiProxyEnabled()) return null;
  try {
    const { data } = await getClient().get<unknown>(`/api/user/building/${encodeURIComponent(key)}`);
    const building = toBuilding(isRecord(data) ? data.data : null);
    return building && building.totalCentres >= MIN_CENTRES_FOR_BUILDING_PAGE ? building : null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
});

/** The building a listing is in, if it has a building page. */
export async function buildingForListing(
  type: "coworking" | "managed-office",
  slug: string,
): Promise<Building | null> {
  const key = slug.trim();
  const all = await loadBuildingsOrEmpty();
  return (
    all.find((b) => (type === "coworking" ? b.coworkingSlugs : b.managedOfficeSlugs).includes(key)) ?? null
  );
}

/** Distance in metres between two buildings (for "nearby buildings"). */
export function buildingDistance(a: Building, b: Building): number {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return Infinity;
  const r = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * r;
  const dLng = (b.longitude - a.longitude) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371e3 * Math.asin(Math.sqrt(x));
}
