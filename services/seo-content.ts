import { cache } from "react";

import { legacySeoSlug } from "@/lib/pathname-to-seo-slug";
import { normalizeSeoFromResponse } from "@/lib/seo-normalize";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { resolveApiBaseUrl, resolveInternalAppBaseUrl } from "@/services/env-config";
import type { SeoContent } from "@/types/seo.model";

const SEO_REVALIDATE_SECONDS = 300;

async function fetchSeoBySlugInternal(slug: string): Promise<SeoContent | null> {
  if (!slug) return null;

  const upstream = resolveApiBaseUrl();
  if (!upstream) return null;

  const tryFetch = async (url: string) => {
    // Network failures (API down, DNS, timeout) fall back to static SEO instead of erroring the page.
    const res = await fetch(url, {
      // Five minutes: SEO text changes rarely and is read on every page view.
      next: { revalidate: SEO_REVALIDATE_SECONDS },
      headers: buildApiClientHeaders(),
    }).catch(() => null);
    if (!res?.ok) return null;
    const json = (await res.json().catch(() => null)) as unknown;
    return normalizeSeoFromResponse(json);
  };

  const directUrl = `${upstream}/api/user/newSeo/${encodeURIComponent(slug)}`;
  const fromDirect = await tryFetch(directUrl);
  if (fromDirect) return fromDirect;

  const appBase = resolveInternalAppBaseUrl();
  const proxyUrl = `${appBase}/api/user/newSeo/${encodeURIComponent(slug)}`;
  if (proxyUrl !== directUrl) {
    return tryFetch(proxyUrl);
  }
  return null;
}

/** CMS entry for the slug, falling back to the legacy `office-space-…` slug for managed office URLs. */
async function fetchSeoWithLegacyFallback(slug: string): Promise<SeoContent | null> {
  const current = await fetchSeoBySlugInternal(slug);
  if (current) return current;
  const legacy = legacySeoSlug(slug);
  return legacy ? fetchSeoBySlugInternal(legacy) : null;
}

/**
 * Deduplicate SEO fetch in the same request (e.g. `generateMetadata` + layout).
 * Always hits the upstream API — no cross-request cache.
 */
export const getSeoBySlug = cache((slug: string) => fetchSeoWithLegacyFallback(slug));
