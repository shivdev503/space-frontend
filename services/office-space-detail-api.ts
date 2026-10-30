/**
 * Office space detail HTTP client (axios).
 * Detail: `GET /api/user/officeSpaces/:slug` → `{ message, data: officeSpace }`
 *
 * Falls back to seed `getSpaceBySlug` shape when API is unavailable.
 */

import axios, { type AxiosInstance } from "axios";
import { cache } from "react";

import {
  isCoworkingUserApiProxyEnabled,
  resolveCoworkingApiBaseUrl,
  resolveCoworkingApiTimeoutMs,
} from "@/services/env-config";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { getSpaceBySlug } from "@/services/mock-db";
import type { OfficeSpaceModel } from "@/types/office-space.model";
import { normalizeOfficeLocation } from "@/lib/office-location";

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

type OfficeDetailResponse = {
  message?: string;
  data?: unknown;
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

function coerceOfficeSpace(raw: unknown): OfficeSpaceModel.OfficeSpace | null {
  if (!isRecord(raw)) return null;
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const _id = wireId(raw);
  if (!_id || !slug) return null;
  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : _id;
  return normalizeOfficeLocation({ ...(raw as any), _id, id }) as OfficeSpaceModel.OfficeSpace;
}

async function fetchOfficeSpaceDetail(slug: string): Promise<OfficeSpaceModel.OfficeSpace | null> {
  const s = slug.trim();
  if (!s) return null;

  if (isCoworkingUserApiProxyEnabled()) {
    try {
      const { data } = await getClient().get<OfficeDetailResponse>(
        `/api/user/officeSpaces/${encodeURIComponent(s)}`,
      );
      const office = isRecord(data) && isRecord(data.data) ? coerceOfficeSpace(data.data) : coerceOfficeSpace(data);
      if (office) return office;
    } catch {
      // fallback below
    }
  }

  // Seed fallback (legacy) — may not have API fields.
  const seed = getSpaceBySlug(s, "office-space") as any;
  if (!seed) return null;
  return seed as OfficeSpaceModel.OfficeSpace;
}

export const loadOfficeSpaceDetail: typeof fetchOfficeSpaceDetail =
  typeof window === "undefined" ? cache(fetchOfficeSpaceDetail) : fetchOfficeSpaceDetail;

