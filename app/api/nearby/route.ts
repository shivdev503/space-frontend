import { type NextRequest, NextResponse } from "next/server";

import { queryOverpassNearby } from "@/lib/pg-nearby";
import type { PgNearbyPlace } from "@/types/pg.model";

export const dynamic = "force-dynamic";

const SUCCESS_TTL_MS = 24 * 60 * 60 * 1000;
/** Short memory of failed lookups so a down mirror isn't hit on every page view. */
const FAILURE_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 2000;

const cache = new Map<string, { places: PgNearbyPlace[]; expires: number }>();

function parseCoord(value: string | null, max: number): number | null {
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
}

/**
 * `GET /api/nearby?lat=&lng=&limit=` — OpenStreetMap places near a listing.
 * Proxies Overpass server-side so browsers never call it directly; always answers 200.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseCoord(searchParams.get("lat"), 90);
  const lng = parseCoord(searchParams.get("lng"), 180);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") ?? "4", 10) || 4, 1), 10);
  if (lat == null || lng == null) {
    return NextResponse.json({ places: [] }, { status: 400 });
  }

  // ~100 m grid so nearby listings share a cache entry.
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${limit}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json({ places: hit.places });
  }

  const places = await queryOverpassNearby({ lat, lng }, limit);
  if (cache.size >= MAX_ENTRIES) cache.clear();
  cache.set(key, {
    places: places ?? [],
    expires: Date.now() + (places ? SUCCESS_TTL_MS : FAILURE_TTL_MS),
  });

  return NextResponse.json(
    { places: places ?? [] },
    { headers: { "cache-control": places ? "public, max-age=3600" : "no-store" } },
  );
}
