import { buildApiClientHeaders } from "@/services/api-client-headers";
import { isCoworkingUserApiProxyEnabled, resolveApiBaseUrl } from "@/services/env-config";

/**
 * Old listing URLs from the backend (`GET /api/user/url-redirects`):
 *   { to }          → permanent redirect to the listing's live URL (renamed, or a hidden duplicate)
 *   { gone, city }  → 410 Gone (listing removed on purpose)
 *
 * The backend never lists a URL that is live, so live pages are never redirected or marked gone.
 * Loaded at most every 10 minutes per server process; if the API is unreachable, nothing is changed
 * and requests continue to the page as usual.
 */
export type ListingRedirect = { to?: string; gone?: boolean; city?: string };
type VerticalMap = Record<string, ListingRedirect>;
type RedirectMaps = { coliving: VerticalMap; coworking: VerticalMap; managedOffice: VerticalMap };

const TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 4000;

let cached: { at: number; maps: RedirectMaps } | null = null;
let inflight: Promise<RedirectMaps | null> | null = null;

const EMPTY: RedirectMaps = { coliving: {}, coworking: {}, managedOffice: {} };

function asMap(v: unknown): VerticalMap {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as VerticalMap) : {};
}

async function fetchMaps(): Promise<RedirectMaps | null> {
  if (!isCoworkingUserApiProxyEnabled()) return null;
  try {
    const res = await fetch(`${resolveApiBaseUrl()}/api/user/url-redirects`, {
      headers: buildApiClientHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const d = json.data ?? {};
    return { coliving: asMap(d.coliving), coworking: asMap(d.coworking), managedOffice: asMap(d.managedOffice) };
  } catch {
    return null;
  }
}

function refresh(): Promise<RedirectMaps | null> {
  inflight ??= fetchMaps()
    .then((fresh) => {
      if (fresh) cached = { at: Date.now(), maps: fresh };
      else if (cached) cached = { at: Date.now() - TTL_MS + 60_000, maps: cached.maps }; // retry in a minute
      return fresh;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * The current maps. Only the very first request waits for the API; after that an expired copy is
 * served while a fresh one loads in the background, so page requests are never slowed down.
 */
async function loadMaps(): Promise<RedirectMaps> {
  if (cached) {
    if (Date.now() - cached.at >= TTL_MS) void refresh();
    return cached.maps;
  }
  return (await refresh()) ?? EMPTY;
}

const VERTICAL_KEY: Record<string, keyof RedirectMaps> = {
  coliving: "coliving",
  coworking: "coworking",
  "managed-office": "managedOffice",
};

/** `/coliving/<slug>`, `/coworking/<slug>`, `/managed-office/<slug>` only; everything else is untouched. */
export function parseListingPath(pathname: string): { vertical: string; slug: string } | null {
  const m = /^\/(coliving|coworking|managed-office)\/([a-z0-9-]+)\/?$/i.exec(pathname);
  return m ? { vertical: m[1].toLowerCase(), slug: m[2].toLowerCase() } : null;
}

export async function findListingRedirect(vertical: string, slug: string): Promise<ListingRedirect | null> {
  const key = VERTICAL_KEY[vertical];
  if (!key) return null;
  const entry = (await loadMaps())[key][slug];
  if (!entry || (entry.to && entry.to === slug)) return null;
  return entry.to || entry.gone ? entry : null;
}

const CITY_ROUTE: Record<string, string> = {
  gurugram: "gurgaon",
  bengaluru: "bangalore",
  "new-delhi": "delhi",
  "navi-mumbai": "mumbai",
};

function citySlug(city?: string): string {
  const s = String(city ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return CITY_ROUTE[s] ?? s;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const NOUN: Record<string, string> = { coliving: "PG", coworking: "coworking space", "managed-office": "managed office" };
const PLURAL: Record<string, string> = { coliving: "PGs", coworking: "coworking spaces", "managed-office": "managed offices" };

/** Body of the 410 page: says the listing was removed and links to live listings nearby. */
export function goneHtml(vertical: string, city?: string): string {
  const c = citySlug(city);
  const cityName = city ? escapeHtml(city.trim()) : "";
  const cityLink = c
    ? `<a href="/${vertical}/${encodeURIComponent(c)}" style="color:#12b886">See live ${PLURAL[vertical]} in ${cityName}</a><br>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Listing removed | SpaceWallah</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#222;line-height:1.6"><h1 style="font-size:1.4rem">This ${NOUN[vertical] ?? "listing"} is no longer listed</h1><p>It has been removed from SpaceWallah.</p><p>${cityLink}<a href="/${vertical}" style="color:#12b886">Browse all ${PLURAL[vertical] ?? "listings"}</a></p></body></html>`;
}
