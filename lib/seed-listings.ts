/**
 * Sample listings in `services/mock-db.ts` are a local-development fallback only (no API
 * running). Production never renders, links to or falls back to them — the audit found
 * Google indexing these demo spaces instead of real ones.
 */
export function seedListingsEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}
