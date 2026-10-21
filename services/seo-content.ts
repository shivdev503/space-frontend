import { cache } from "react";

import { normalizeSeoFromResponse } from "@/lib/seo-normalize";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { resolveApiBaseUrl, resolveInternalAppBaseUrl } from "@/services/env-config";
import type { SeoContent } from "@/types/seo.model";

async function fetchSeoBySlugInternal(slug: string): Promise<SeoContent | null> {
  if (!slug) return null;

  const upstream = resolveApiBaseUrl();
  if (!upstream) return null;

  const tryFetch = async (url: string) => {
    // Network failures (API down, DNS, timeout) fall back to static SEO instead of erroring the page.
    const res = await fetch(url, {
      cache: "no-store",
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

/**
 * Deduplicate SEO fetch in the same request (e.g. `generateMetadata` + layout).
 * Always hits the upstream API — no cross-request cache.
 */
export const getSeoBySlug = cache((slug: string) => fetchSeoBySlugInternal(slug));
