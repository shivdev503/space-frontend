import type { MapCoordinates } from "@/lib/coliving-map";
import type { PgCoordinates, PgNearbyPlace } from "@/types/pg.model";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : v != null ? String(v).trim() : "";
}

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : null;
}

function pushUnique(target: PgNearbyPlace[], name: string, distance: string) {
  const n = name.trim();
  const d = distance.trim();
  if (!n || !d) return;
  if (target.some((item) => item.name.toLowerCase() === n.toLowerCase())) return;
  target.push({ name: n, dist: d });
}

function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatNearbyTravel(meters: number): string {
  const dist = formatMeters(meters);
  if (meters <= 800) {
    const walkMin = Math.max(1, Math.round(meters / 75));
    return `${dist} · ${walkMin} min walk`;
  }
  const driveMin = Math.max(1, Math.round((meters / 1000 / 28) * 60));
  return `${dist} · ${driveMin} min drive`;
}

function parseDistanceLabel(raw: unknown, metersFallback?: number | null): string {
  const text = str(raw);
  if (text) return text;
  if (metersFallback != null && metersFallback > 0) return formatNearbyTravel(metersFallback);
  return "";
}

function parsePlaceRow(row: unknown): { name: string; dist: string } | null {
  if (!isRecord(row)) return null;
  const name = str(row.name ?? row.title ?? row.landmark ?? row.lankmark ?? row.label ?? row.place);
  const dist = parseDistanceLabel(
    row.distance ?? row.dist ?? row.distanceText ?? row.distance_label,
    num(row.distanceInMeters ?? row.meters ?? row.distance_m),
  );
  if (!name || !dist) return null;
  return { name, dist };
}

function parsePlaceArray(raw: unknown, out: PgNearbyPlace[]) {
  if (!Array.isArray(raw)) return;
  for (const row of raw) {
    const place = parsePlaceRow(row);
    if (place) pushUnique(out, place.name, place.dist);
  }
}

function parseLandmarkPair(
  out: PgNearbyPlace[],
  name: unknown,
  distance: unknown,
  meters?: unknown,
) {
  const label = str(name);
  const dist = parseDistanceLabel(distance, num(meters));
  if (label && dist) pushUnique(out, label, dist);
}

function parseMetroDetail(out: PgNearbyPlace[], raw: unknown) {
  if (!isRecord(raw)) return;
  const name = str(raw.name);
  const meters = num(raw.distance);
  if (!name) return;
  const dist = meters != null && meters > 0 ? formatNearbyTravel(meters) : str(raw.distance);
  if (dist) pushUnique(out, name, dist);
}

/** Pull nearby connectivity rows from heterogeneous PG API payloads. */
export function extractPgNearbyPlaces(raw: Record<string, unknown>): PgNearbyPlace[] {
  const out: PgNearbyPlace[] = [];

  for (const key of [
    "nearByPlaces",
    "near_by_places",
    "nearbyPlaces",
    "nearby_places",
    "connectivity",
    "nearby",
  ] as const) {
    parsePlaceArray(raw[key], out);
  }

  const location = raw.location;
  if (isRecord(location)) {
    parsePlaceArray(location.near_by_places, out);
    parsePlaceArray(location.nearByPlaces, out);
    parsePlaceArray(location.nearbyPlaces, out);
    parseLandmarkPair(out, location.landmark, location.landmark_distance);
    parseLandmarkPair(out, location.bus_stop_landmark, location.bus_stop_distance);
    parseLandmarkPair(out, location.taxi_stand_landmark, location.taxi_stand_distance);
    parseLandmarkPair(out, location.tram_landmark, location.tram_distance);
    parseLandmarkPair(out, location.ferry_stop_landmark, location.ferry_stop_distance);
    parseLandmarkPair(out, location.metro_stop_landmark, location.metro_stop_distance);
    parseMetroDetail(out, location.metro_detail);
  }

  const locationIds = raw.locationIds;
  if (isRecord(locationIds)) {
    parseLandmarkPair(out, locationIds.landmark, locationIds.landmark_distance);
    parsePlaceArray(locationIds.near_by_places, out);
  }

  parseLandmarkPair(out, raw.landmark, raw.landmark_distance ?? raw.landmarkDistance);
  parseLandmarkPair(out, raw.bus_stop_landmark, raw.bus_stop_distance);
  parseLandmarkPair(out, raw.metro_stop_landmark, raw.metro_stop_distance);
  parseMetroDetail(out, raw.metro_detail);

  return out.slice(0, 8);
}

export function extractPgCoordinates(raw: Record<string, unknown>): PgCoordinates | undefined {
  // PgCoordinates and MapCoordinates share the same { lat, lng } shape.
  const direct = raw.coordinates;
  if (isRecord(direct)) {
    const lat = num(direct.lat ?? direct.latitude);
    const lng = num(direct.lng ?? direct.longitude ?? direct.lon);
    if (lat != null && lng != null) return { lat, lng };
  }

  const lat = num(raw.latitude ?? raw.lat);
  const lng = num(raw.longitude ?? raw.lng ?? raw.lon);
  if (lat != null && lng != null) return { lat, lng };

  const location = raw.location;
  if (isRecord(location)) {
    const lLat = num(location.latitude ?? location.lat);
    const lLng = num(location.longitude ?? location.lng ?? location.lon);
    if (lLat != null && lLng != null) return { lat: lLat, lng: lLng };
  }

  return undefined;
}

function haversineMeters(a: MapCoordinates, b: MapCoordinates): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function overpassPlaceName(tags: Record<string, string>): string {
  return (
    tags.name ??
    tags["name:en"] ??
    tags.brand ??
    tags.operator ??
    tags.shop ??
    tags.amenity ??
    tags.railway ??
    tags.public_transport ??
    "Nearby place"
  );
}

/** Public Overpass mirrors, tried in order — any single one can be down or slow. */
const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const OVERPASS_TIMEOUT_MS = 8000;

/**
 * Server-side: OpenStreetMap POIs near listing coordinates (stations, malls, markets).
 * Returns null when every mirror failed, so callers can tell "no places" from "lookup failed".
 */
export async function queryOverpassNearby(
  center: MapCoordinates,
  limit = 4,
): Promise<PgNearbyPlace[] | null> {
  const { lat, lng } = center;
  const query = `[out:json][timeout:20];
(
  node["railway"="station"](around:6000,${lat},${lng});
  node["station"="subway"](around:6000,${lat},${lng});
  node["public_transport"="station"]["subway"="yes"](around:6000,${lat},${lng});
  node["shop"="mall"](around:5000,${lat},${lng});
  node["amenity"="marketplace"](around:2500,${lat},${lng});
  node["amenity"="supermarket"](around:2000,${lat},${lng});
);
out body 24;`;
  const body = new URLSearchParams({ data: query }).toString();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "SpaceWallah/1.0 (+https://spacewallah.com)",
        },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        elements?: { lat?: number; lon?: number; tags?: Record<string, string> }[];
      };
      return rankOverpassPlaces(center, data.elements ?? [], limit);
    } catch {
      // try the next mirror
    }
  }
  return null;
}

function rankOverpassPlaces(
  center: MapCoordinates,
  elements: { lat?: number; lon?: number; tags?: Record<string, string> }[],
  limit: number,
): PgNearbyPlace[] {
  const ranked = elements
    .map((el) => {
      const elLat = num(el.lat);
      const elLng = num(el.lon);
      if (elLat == null || elLng == null || !el.tags) return null;
      const meters = haversineMeters(center, { lat: elLat, lng: elLng });
      return {
        name: overpassPlaceName(el.tags),
        dist: formatNearbyTravel(meters),
        meters,
      };
    })
    .filter((row): row is { name: string; dist: string; meters: number } => row != null)
    .sort((a, b) => a.meters - b.meters);

  const out: PgNearbyPlace[] = [];
  for (const row of ranked) {
    pushUnique(out, row.name, row.dist);
    if (out.length >= limit) break;
  }
  return out;
}

/** Browser: nearby places via our `/api/nearby` route (same origin — no CORS, cached server-side). */
export async function fetchNearbyPlacesFromOverpass(
  center: MapCoordinates,
  limit = 4,
): Promise<PgNearbyPlace[]> {
  try {
    const params = new URLSearchParams({
      lat: String(center.lat),
      lng: String(center.lng),
      limit: String(limit),
    });
    const res = await fetch(`/api/nearby?${params.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { places?: PgNearbyPlace[] };
    return Array.isArray(data.places) ? data.places : [];
  } catch {
    return [];
  }
}
