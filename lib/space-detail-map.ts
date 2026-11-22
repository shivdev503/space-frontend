import { isPlaceholderPin } from "@/lib/listing-pin";

export type MapCoordinates = {
  lat: number;
  lng: number;
};

/** Approximate city centers for map fallback when API coords / geocoding are unavailable. */
const CITY_CENTERS: Record<string, MapCoordinates> = {
  gurugram: { lat: 28.4595, lng: 77.0266 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  "new-delhi": { lat: 28.6139, lng: 77.209 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  noida: { lat: 28.5355, lng: 77.391 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

const DEFAULT_CENTER: MapCoordinates = { lat: 28.4595, lng: 77.0266 };

export function cityMapCenter(city: string): MapCoordinates {
  const key = city.trim().toLowerCase().replace(/\s+/g, "-");
  return CITY_CENTERS[key] ?? DEFAULT_CENTER;
}

export function normalizeMapCoordinates(
  lat?: number | null,
  lng?: number | null,
): MapCoordinates | null {
  if (lat == null || lng == null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (isPlaceholderPin(lng)) return null;
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return null;
  return { lat, lng };
}

export function buildMapsLink(
  coordinates: MapCoordinates | null | undefined,
  address: string,
): string {
  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function buildGeocodeQuery(address: string, locality: string, city: string): string {
  return [address, locality, city].filter(Boolean).join(", ");
}

/** Nominatim (OpenStreetMap) — client-side only; respect usage policy (low volume). */
export async function geocodeAddress(query: string): Promise<MapCoordinates | null> {
  const q = query.trim();
  if (!q) return null;

  try {
    const params = new URLSearchParams({ q, format: "json", limit: "1" });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const hit = data?.[0];
    if (!hit?.lat || !hit?.lon) return null;

    const lat = Number.parseFloat(hit.lat);
    const lng = Number.parseFloat(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
