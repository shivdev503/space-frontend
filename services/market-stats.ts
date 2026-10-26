/**
 * Live listing counts and starting prices for city / locality SEO copy.
 * Coworking uses the cached full workspace list (shared with sitemaps and brand pages);
 * PGs use two small API calls (count + cheapest) so metadata stays fast.
 */

import { cache } from "react";

import { cachedLoader } from "@/lib/cached-loader";
import { pgApiCityName } from "@/lib/pg-list-priority";
import { canonicalCoworkingCitySlug } from "@/services/catalog-city-id";
import {
  deriveAppCitySlugFromWorkspace,
  normalizeCoworkingWorkspacesPayload,
} from "@/services/coworking-workspace-mapper";
import { slugifyMicroLocationName } from "@/services/location-api";
import { fetchPgList } from "@/services/pg-api";
import { loadCoworkingWorkspaceRows } from "@/services/sitemap-inventory";

export type MarketStats = {
  count: number;
  /** Lowest monthly starting price, or null when unknown. */
  minPrice: number | null;
};

/** Workspaces with `starting_price` resolved the same way as listing cards. */
const loadCoworkingCards = cachedLoader(async () =>
  normalizeCoworkingWorkspacesPayload({ data: await loadCoworkingWorkspaceRows() }).data,
);

function normalizeSegment(segment: string): string {
  let value = segment.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep as-is */
  }
  return value.toLowerCase().replace(/_/g, "-");
}

async function fetchCoworkingStats(citySlug: string, localitySegment?: string): Promise<MarketStats | null> {
  try {
    const city = canonicalCoworkingCitySlug(normalizeSegment(citySlug));
    const locality = localitySegment ? normalizeSegment(localitySegment) : "";
    const matches = (await loadCoworkingCards()).filter((ws) => {
      if (canonicalCoworkingCitySlug(deriveAppCitySlugFromWorkspace(ws)) !== city) return false;
      if (!locality) return true;
      const name = ws.location?.micro_location?.name ?? "";
      return name ? slugifyMicroLocationName(name) === locality : false;
    });
    const prices = matches.map((ws) => ws.starting_price ?? 0).filter((p) => p > 0);
    return { count: matches.length, minPrice: prices.length ? Math.min(...prices) : null };
  } catch {
    return null;
  }
}

async function fetchColivingStats(cityDisplayName: string, localityName?: string): Promise<MarketStats | null> {
  try {
    const base = { city: pgApiCityName(cityDisplayName), ...(localityName ? { locality: localityName } : {}) };
    const [all, cheapest] = await Promise.all([
      fetchPgList({ ...base, limit: 1, page: 1 }),
      fetchPgList({ ...base, limit: 1, page: 1, sortBy: "minMonthlyRent", orderBy: 1 }),
    ]);
    const min = cheapest.data[0]?.rentRange?.min;
    return { count: all.totalRecords, minPrice: typeof min === "number" && min > 0 ? min : null };
  } catch {
    return null;
  }
}

/** Coworking count / starting price for a city, or one of its localities. */
export const coworkingMarketStats = cache(fetchCoworkingStats);

/** PG & coliving count / cheapest rent for a city (display name), or one of its localities. */
export const colivingMarketStats = cache(fetchColivingStats);

/** "110+" style label: exact below 10, otherwise rounded down to the nearest ten. */
export function countLabel(count: number): string {
  if (count < 10) return String(count);
  return `${Math.floor(count / 10) * 10}+`;
}
