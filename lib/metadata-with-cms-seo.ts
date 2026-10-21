import type { Metadata } from "next";

import { buildPageMetadataFromSeo } from "@/lib/seo-metadata";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { getSeoBySlug } from "@/services/seo-content";
import { buildMetadata } from "@/utils/metadata";

type FallbackMeta = {
  title: string;
  description: string;
  /** Optional comma-separated keywords when CMS SEO is unavailable. */
  keywords?: string;
};

/**
 * Prefer CMS SEO (`/api/user/newSeo/:slug`) when available; otherwise use static fallback metadata.
 * Slug is derived from the public pathname (same convention as `getResolvedSeoForRequest`).
 */
export async function buildMetadataWithCmsSeoFallback(
  pathname: string,
  fallback: FallbackMeta,
): Promise<Metadata> {
  const slug = pathnameToSeoSlug(pathname);
  const seo = await getSeoBySlug(slug);
  if (seo) {
    return buildPageMetadataFromSeo(pathname, seo);
  }

  const base = buildMetadata(fallback.title, fallback.description, pathname);
  const kw = fallback.keywords
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    ...base,
    keywords: kw?.length ? kw : undefined,
  };
}
