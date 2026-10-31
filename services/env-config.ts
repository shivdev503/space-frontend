/**
 * Runtime-safe URL/timeout helpers.
 *
 * This project should run without requiring local env vars for core browsing UX.
 * (Deployments can still override via standard `API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` etc.)
 */

function trimUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

/** Default leads path appended to `resolveApiBaseUrl()` when no explicit leads URL is set. */
const LEADS_SUBMIT_PATH = "/api/leads";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
/** Used only when no URL env var is set — localhost in dev, the live domains in production builds. */
const DEFAULT_APP_ORIGIN_DEV = IS_PRODUCTION ? "https://spacewallah.com" : "http://localhost:3000";
const DEFAULT_API_ORIGIN_DEV = IS_PRODUCTION ? "https://api.spacewallah.com" : "http://localhost:8000";
const DEFAULT_COWORKING_TIMEOUT_MS = 3500;
/** Server calls fail the page when they time out, so they get far longer than the browser's quick fallback. */
const DEFAULT_COWORKING_SERVER_TIMEOUT_MS = 8000;
const DEFAULT_LEADS_TIMEOUT_MS = 8000;
const DEFAULT_LISTING_TIMEOUT_MS = 15000;

/** Site origin for metadata and absolute URLs. */
export function resolveAppUrl(): string {
  if (typeof window !== "undefined") {
    return trimUrl(window.location.origin);
  }

  /** Prefer explicit production domain (canonical, OG URLs, JSON-LD). */
  const explicit =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return trimUrl(explicit);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return trimUrl(`https://${vercel.replace(/^https?:\/\//, "")}`);

  return DEFAULT_APP_ORIGIN_DEV;
}

/**
 * Base URL to reach this Next app from server code (e.g. SEO fetch → same-origin proxy).
 * Mirrors {@link resolveAppUrl} for Vercel / APP_URL; needed when falling back to `/api/user/newSeo/*` proxy.
 */
export function resolveInternalAppBaseUrl(): string {
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return trimUrl(`https://${vercel.replace(/^https?:\/\//, "")}`);

  const explicit = process.env.APP_URL?.trim() ?? process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return trimUrl(explicit);

  return DEFAULT_APP_ORIGIN_DEV;
}

function resolveServerApiBase(): string {
  for (const raw of [
    process.env.API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ]) {
    const t = raw?.trim();
    if (t) return trimUrl(t);
  }
  return "";
}

function resolveClientApiBase(): string {
  for (const raw of [
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ]) {
    const t = raw?.trim();
    if (t) return trimUrl(t);
  }
  return "";
}

/**
 * Shared backend origin for coworking, leads, and any future API calls.
 * Local: `http://localhost:8000` — production: `https://api.spacewallah.com` (no trailing slash).
 */
export function resolveApiBaseUrl(): string {
  const origin = typeof window === "undefined" ? resolveServerApiBase() : resolveClientApiBase();
  if (origin) return origin;
  return DEFAULT_API_ORIGIN_DEV;
}

/**
 * Coworking workspaces client: same origin as `resolveApiBaseUrl()`, paths `/api/user/workSpaces`, etc.
 */
export function resolveCoworkingApiBaseUrl(): string {
  return resolveApiBaseUrl();
}

/** If there is an API base URL, we can call the user API proxy. */
export function isCoworkingUserApiProxyEnabled(): boolean {
  const base = (typeof window === "undefined" ? resolveServerApiBase() : resolveClientApiBase()).trim();
  return Boolean(base) || process.env.NODE_ENV !== "production";
}

/** Coworking axios timeout with safe defaults. */
export function resolveCoworkingApiTimeoutMs(): number {
  const fallback = typeof window === "undefined" ? DEFAULT_COWORKING_SERVER_TIMEOUT_MS : DEFAULT_COWORKING_TIMEOUT_MS;
  const raw = process.env.COWORKING_API_TIMEOUT_MS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : fallback;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Lead form POST URL. Defaults to `{API_BASE_URL}/api/leads`.
 * Override with `NEXT_PUBLIC_LEADS_API_URL` / `LEADS_API_URL` if the path differs.
 */
export function resolveLeadsSubmitUrl(): string {
  const explicitPub = process.env.NEXT_PUBLIC_LEADS_API_URL?.trim();
  const explicitServer = process.env.LEADS_API_URL?.trim();

  if (typeof window === "undefined") {
    const explicit = explicitPub || explicitServer;
    if (explicit) return trimUrl(explicit);
    return `${resolveApiBaseUrl()}${LEADS_SUBMIT_PATH}`;
  }

  if (explicitPub) return trimUrl(explicitPub);
  return `${resolveApiBaseUrl()}${LEADS_SUBMIT_PATH}`;
}

/** Lead POST timeout with safe defaults. */
export function resolveLeadsSubmitTimeoutMs(): number {
  const raw = process.env.LEADS_API_TIMEOUT_MS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_LEADS_TIMEOUT_MS;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LEADS_TIMEOUT_MS;
}

/**
 * Host / listing panel upstream base URL.
 *
 * Intentionally delegates to {@link resolveApiBaseUrl} — the whole project
 * talks to a single backend origin at a time. Mixing origins is a footgun
 * because vendor tokens issued by one backend get rejected by the other,
 * so we removed the old `LISTING_API_BASE_URL` escape hatch on purpose.
 */
export function resolveListingApiBaseUrl(): string {
  return resolveApiBaseUrl();
}

/** Listing upstream timeout with safe defaults. */
export function resolveListingApiTimeoutMs(): number {
  const raw = process.env.LISTING_API_TIMEOUT_MS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_LISTING_TIMEOUT_MS;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LISTING_TIMEOUT_MS;
}
