import fs from "node:fs";
import path from "node:path";

import type { MapCoordinates } from "@/lib/space-detail-map";
import { rankOverpassPlaces } from "@/lib/pg-nearby";
import type { PgNearbyPlace } from "@/types/pg.model";

/**
 * Nearby places from the saved OpenStreetMap snapshot (data/nearby-places.json, built by
 * scripts/build-nearby-places.mjs). Instant and independent of the public Overpass servers.
 * Returns null when the snapshot has nothing around the point (e.g. a city it doesn't cover),
 * so the caller can fall back to a live lookup.
 */
type Row = [lat: number, lng: number, name: string, kind: string];

const RADIUS_M: Record<string, number> = { station: 6000, mall: 5000, market: 2500, supermarket: 2000 };
const TAGS: Record<string, Record<string, string>> = {
  station: { railway: "station" },
  mall: { shop: "mall" },
  market: { amenity: "marketplace" },
  supermarket: { amenity: "supermarket" },
};

let rows: Row[] | null = null;

function load(): Row[] {
  if (rows) return rows;
  try {
    const file = path.join(process.cwd(), "data", "nearby-places.json");
    const json = JSON.parse(fs.readFileSync(file, "utf8")) as { places?: Row[] };
    rows = Array.isArray(json.places) ? json.places : [];
  } catch {
    rows = [];
  }
  return rows;
}

export function nearbyFromSnapshot(center: MapCoordinates, limit: number): PgNearbyPlace[] | null {
  const all = load();
  if (!all.length) return null;
  // ~6 km box first, then the exact per-kind radius.
  const dLat = 0.06;
  const dLng = 0.06 / Math.max(0.2, Math.cos((center.lat * Math.PI) / 180));
  const near = all.filter(
    ([lat, lng]) => Math.abs(lat - center.lat) <= dLat && Math.abs(lng - center.lng) <= dLng,
  );
  if (!near.length) return null;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const within = near.filter(([lat, lng, , kind]) => {
    const h =
      Math.sin(toRad(lat - center.lat) / 2) ** 2 +
      Math.cos(toRad(center.lat)) * Math.cos(toRad(lat)) * Math.sin(toRad(lng - center.lng) / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h))) <= (RADIUS_M[kind] ?? 2000);
  });
  if (!within.length) return null;
  return rankOverpassPlaces(
    center,
    within.map(([lat, lon, name, kind]) => ({ lat, lon, tags: { name, ...(TAGS[kind] ?? {}) } })),
    limit,
  );
}
