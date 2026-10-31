/**
 * `GET /api/user/microLocationByCitySpaceType` — returns {@link CoworkingModel.MicroLocation} rows.
 */

import axios, { type AxiosInstance } from "axios";

import { cachedLoader } from "@/lib/cached-loader";
import { isUpstreamFailure } from "@/lib/upstream-error";
import { resolveCatalogIdToSlug } from "@/services/catalog-city-id";
import {
  isCoworkingUserApiProxyEnabled,
  resolveCoworkingApiBaseUrl,
  resolveCoworkingApiTimeoutMs,
} from "@/services/env-config";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { listSpaces } from "@/services/mock-db";
import { CoworkingModel } from "@/types/coworking-workspace.model";
import { toTitleCase } from "@/utils/format";

export const microLocationByCitySpaceTypePath = "/api/user/microLocationByCitySpaceType" as const;

export type MicroLocation = CoworkingModel.MicroLocation;

export type MicroLocationSpaceType = "coworking" | "coliving";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function slugifyMicroLocationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Wire: `{ message, data: microLocations[], totleRecords }`. */
function microLocationsFromWire(raw: unknown): MicroLocation[] {
  if (!isRecord(raw) || !Array.isArray(raw.data)) return [];
  const out: MicroLocation[] = [];
  for (const row of raw.data) {
    if (!isRecord(row)) continue;
    const name =
      (typeof row.name === "string" && row.name.trim()) ||
      (typeof row.microLocationName === "string" && row.microLocationName.trim()) ||
      (typeof row.label === "string" && row.label.trim()) ||
      "";
    if (!name) continue;
    const slugRaw =
      (typeof row.slug === "string" && row.slug.trim()) ||
      (typeof row.micro_location_slug === "string" && row.micro_location_slug.trim()) ||
      "";
    const slug = slugRaw || slugifyMicroLocationName(name);
    const id = String(row._id ?? row.id ?? slug);
    const key =
      (typeof row.key === "string" && row.key.trim()) ||
      (typeof row.micro_location_key === "string" && row.micro_location_key.trim()) ||
      undefined;
    const icon = typeof row.icon === "string" ? row.icon : "";
    const forCoworking =
      row.for_coWorking === true ||
      row.for_coworking === true ||
      row.forCoworking === true;
    const forColiving =
      row.for_coLiving === true ||
      row.for_coliving === true ||
      row.forColiving === true;

    out.push({
      id,
      icon,
      name,
      for_coWorking: forCoworking,
      for_office: row.for_office === true || row.for_office_space === true,
      for_coLiving: forColiving,
      slug,
      key: key || undefined,
    });
  }
  return out;
}

function mockMicroLocationsForCity(
  cityCatalogId: string,
  spaceType: MicroLocationSpaceType,
): MicroLocation[] {
  const slug = resolveCatalogIdToSlug(cityCatalogId.trim());
  if (!slug) return [];
  const vertical = spaceType === "coliving" ? "coliving" : "coworking";
  const spaces = listSpaces({ vertical, city: slug });
  const seen = new Map<string, MicroLocation>();
  for (const s of spaces) {
    const locSlug = (s.location ?? "central").trim() || "central";
    if (seen.has(locSlug)) continue;
    seen.set(locSlug, {
      id: locSlug,
      icon: "",
      name: toTitleCase(locSlug.replace(/_/g, "-")),
      for_coWorking: spaceType === "coworking",
      for_office: false,
      for_coLiving: spaceType === "coliving",
      slug: locSlug,
      key: locSlug,
    });
  }
  return Array.from(seen.values());
}

/** Decode and normalize a locality segment from the URL. */
export function normalizeLocationSegment(segment: string): string {
  let value = segment.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep trimmed segment */
  }
  return value.trim();
}

/** Match a URL locality segment to a micro-location row from the catalog API. */
export function resolveMicroLocationFromSegment(
  hits: MicroLocation[],
  segment: string,
): MicroLocation | null {
  const microKey = normalizeLocationSegment(segment);
  if (!microKey) return null;

  const norm = microKey.toLowerCase().replace(/_/g, "-");
  for (const hit of hits) {
    if (hit.id === microKey) return hit;
    const slug = hit.slug?.trim().toLowerCase().replace(/_/g, "-");
    const key = hit.key?.trim().toLowerCase().replace(/_/g, "-");
    if ((slug && slug === norm) || (key && key === norm)) return hit;
    if (slugifyMicroLocationName(hit.name) === norm) return hit;
  }
  return null;
}

let locationApiAxios: AxiosInstance | null = null;

function getLocationApiAxios(): AxiosInstance {
  const ms = resolveCoworkingApiTimeoutMs();
  if (!locationApiAxios) {
    locationApiAxios = axios.create({
      baseURL: resolveCoworkingApiBaseUrl(),
      timeout: ms,
      headers: buildApiClientHeaders(),
    });
  } else {
    locationApiAxios.defaults.baseURL = resolveCoworkingApiBaseUrl();
    locationApiAxios.defaults.timeout = ms;
  }
  return locationApiAxios;
}

async function fetchMicroLocationsByCitySpaceType(
  cityCatalogId: string,
  spaceType: MicroLocationSpaceType,
): Promise<MicroLocation[]> {
  const id = cityCatalogId.trim();
  if (!id) return [];

  if (!isCoworkingUserApiProxyEnabled()) {
    return mockMicroLocationsForCity(id, spaceType);
  }

  const params =
    spaceType === "coliving"
      ? { cityId: id, for_coliving: true }
      : { cityId: id, for_coworking: true };

  try {
    const { data } = await getLocationApiAxios().get<unknown>(microLocationByCitySpaceTypePath, {
      params,
    });
    const parsed = microLocationsFromWire(data);
    return parsed.length > 0 ? parsed : mockMicroLocationsForCity(id, spaceType);
  } catch (error) {
    if (isUpstreamFailure(error)) throw error;
    return mockMicroLocationsForCity(id, spaceType);
  }
}

const microLocationLoaders = new Map<string, () => Promise<MicroLocation[]>>();

/** A city's locality list rarely changes, so the server keeps it for an hour (failures are not kept). */
function cachedMicroLocations(cityCatalogId: string, spaceType: MicroLocationSpaceType): Promise<MicroLocation[]> {
  const key = `${cityCatalogId}|${spaceType}`;
  let loader = microLocationLoaders.get(key);
  if (!loader) {
    loader = cachedLoader(() => fetchMicroLocationsByCitySpaceType(cityCatalogId, spaceType));
    microLocationLoaders.set(key, loader);
  }
  return loader();
}

export const loadMicroLocationsByCitySpaceType: typeof fetchMicroLocationsByCitySpaceType =
  typeof window === "undefined" ? cachedMicroLocations : fetchMicroLocationsByCitySpaceType;
