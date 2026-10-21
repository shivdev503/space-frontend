import { headers } from "next/headers";

import { getFallbackSeoContent } from "@/lib/seo-fallbacks";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { getRequestPathnameForSeo } from "@/lib/resolve-request-pathname";
import { getSeoBySlug } from "@/services/seo-content";
import type { SeoContent } from "@/types/seo.model";

export type ResolvedSeo = {
  seo: SeoContent;
  /** Normalized request path for canonical URLs, JSON-LD, and fallbacks. */
  pathname: string;
  /** True when `GET /api/user/newSeo/:slug` returned a usable document. */
  fromApi: boolean;
};

/**
 * Resolves SEO for `<head>` metadata on the current request. Uses middleware
 * `x-pathname` when present; CMS sections below the fold use client pathname
 * via {@link SeoCmsRouteSections} so soft navigations stay fast.
 */
export async function getResolvedSeoForRequest(): Promise<ResolvedSeo> {
  const h = await headers();
  const pathname = (await getRequestPathnameForSeo(h)) || "";
  const pathNorm = pathname && pathname.length > 0 ? pathname : "/";
  const slug = pathname
    ? pathnameToSeoSlug(pathname)
    : h.get("x-seo-slug")?.trim() || "generic";

  const fromApi = await getSeoBySlug(slug);
  if (fromApi) {
    return { seo: fromApi, pathname: pathNorm, fromApi: true };
  }

  return {
    seo: getFallbackSeoContent(pathname, slug),
    pathname: pathNorm,
    fromApi: false,
  };
}
