import axios, { getAdapter, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

/**
 * Short-lived server-side cache for PUBLIC listing data read through axios (PG, coworking, managed
 * office, locations, blog). Pages still render on every request; only identical public GET calls to
 * the API are answered from memory, so a page that asks for the same PG three times makes one call
 * and repeat visits don't wait on the API.
 *
 * Safety rules:
 *  - server only, GET only, 2xx responses only (errors and 404s always go to the API);
 *  - never for anything personal or write-like (contact numbers, enquiries, leads, vendor/host
 *    accounts, logins, OTPs, bookings) and never when the request carries a login token;
 *  - data is fresh for 60 s; after that the next caller still gets an instant answer while it reloads
 *    in the background, and nothing older than 5 minutes is ever served;
 *  - identical requests in flight share one API call;
 *  - capped at ~64 MB, least recently used entries dropped first.
 */

const FRESH_MS = 60_000;
const MAX_STALE_MS = 5 * 60_000;
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_ENTRY_BYTES = 4 * 1024 * 1024;

const PRIVATE_PATH = /contact|enquir|lead|vendor|login|logout|signup|sign-up|otp|auth|token|profile|account|booking|payment|wishlist|favou?rite|owner|\/me(\/|$)/i;
const AUTH_HEADERS = ["authorization", "x-auth-token", "x-access-token", "cookie"];

type Entry = {
  at: number;
  bytes: number;
  status: number;
  statusText: string;
  headers: AxiosResponse["headers"];
  body: string;
};

type Loaded = { res: AxiosResponse; entry: Entry | null };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<Loaded>>();
let totalBytes = 0;

const baseAdapter: AxiosAdapter = getAdapter(axios.defaults.adapter);

function headerValue(headers: InternalAxiosRequestConfig["headers"], name: string): unknown {
  if (!headers) return undefined;
  const h = headers as unknown as { get?: (n: string) => unknown } & Record<string, unknown>;
  return typeof h.get === "function" ? h.get(name) : h[name] ?? h[name.toLowerCase()];
}

function cacheKey(config: InternalAxiosRequestConfig): string | null {
  if (typeof window !== "undefined") return null;
  if ((config.method ?? "get").toLowerCase() !== "get") return null;
  if (AUTH_HEADERS.some((h) => headerValue(config.headers, h))) return null;
  const uri = axios.getUri(config);
  let path: string;
  try {
    path = new URL(uri).pathname;
  } catch {
    return null;
  }
  if (!path.startsWith("/api/user/") || PRIVATE_PATH.test(path)) return null;
  return uri;
}

function remove(key: string) {
  const e = store.get(key);
  if (!e) return;
  totalBytes -= e.bytes;
  store.delete(key);
}

function save(key: string, res: AxiosResponse): Entry | null {
  if (res.status < 200 || res.status >= 300) return null;
  let body: string;
  try {
    body = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
  } catch {
    return null;
  }
  const bytes = body.length * 2;
  if (bytes > MAX_ENTRY_BYTES) return null;
  const entry: Entry = { at: Date.now(), bytes, status: res.status, statusText: res.statusText, headers: res.headers, body };
  remove(key);
  store.set(key, entry);
  totalBytes += bytes;
  // Map keeps insertion order: the first keys are the least recently used.
  for (const k of store.keys()) {
    if (totalBytes <= MAX_BYTES) break;
    remove(k);
  }
  return entry;
}

function toResponse(entry: Entry, config: InternalAxiosRequestConfig): AxiosResponse {
  let data: unknown = entry.body;
  if (config.responseType === undefined || config.responseType === "json") {
    try {
      data = JSON.parse(entry.body);
    } catch {
      data = entry.body;
    }
  }
  // Each caller gets its own parsed copy, so a page mutating the data can't affect another request.
  return { data, status: entry.status, statusText: entry.statusText, headers: entry.headers, config, request: undefined };
}

/** One API call per key at a time; everyone asking meanwhile shares its result (or its error). */
function load(key: string, config: InternalAxiosRequestConfig): Promise<Loaded> {
  let p = inflight.get(key);
  if (!p) {
    p = baseAdapter(config)
      .then((res) => ({ res, entry: save(key, res) }))
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return p;
}

/** Axios adapter: serves public GETs from the cache, everything else goes straight to the API. */
export const cachingAdapter: AxiosAdapter = async (config) => {
  const key = cacheKey(config);
  if (!key) return baseAdapter(config);

  const hit = store.get(key);
  const age = hit ? Date.now() - hit.at : Infinity;
  if (hit && age < MAX_STALE_MS) {
    // Mark as recently used.
    store.delete(key);
    store.set(key, hit);
    if (age >= FRESH_MS) void load(key, config).catch(() => undefined); // refresh in the background
    return toResponse(hit, config);
  }
  if (hit) remove(key);

  // Not cached or too old: one shared API call. Errors and 404s reach every caller unchanged and are
  // never stored; a 2xx too large to store is returned as is.
  const { res, entry } = await load(key, config);
  return entry ? toResponse(entry, config) : { ...res, config };
};

export function apiCacheStats() {
  return { entries: store.size, megabytes: Math.round((totalBytes / 1024 / 1024) * 10) / 10, inflight: inflight.size };
}
