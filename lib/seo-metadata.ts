import type { Metadata } from "next";

import { resolveCanonicalUrl } from "@/lib/canonical-url";
import { shareImages } from "@/lib/share-image";
import { spaceImageUrl } from "@/lib/space-image-url";
import type { SeoContent, SeoImageRef } from "@/types/seo.model";
import { APP_NAME } from "@/utils/constants";

/** A CMS share image, when it is a URL or a populated asset (not a bare id). */
function socialImageUrl(ref?: SeoImageRef): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return spaceImageUrl(ref) || ref.url || undefined;
}

function parseRobots(robots: string | undefined): Metadata["robots"] {
  if (!robots || !robots.trim()) {
    return { index: true, follow: true, googleBot: { index: true, follow: true } };
  }
  const r = robots.toLowerCase();
  return {
    index: !r.includes("noindex"),
    follow: !r.includes("nofollow"),
    googleBot: {
      index: !r.includes("noindex"),
      follow: !r.includes("nofollow"),
    },
  };
}

export function buildPageMetadataFromSeo(
  pathname: string,
  seo: SeoContent,
  /** The page's own photos, best first; used when the CMS has no share image. */
  photos: ReadonlyArray<string | null | undefined> = [],
): Metadata {
  const canonical = resolveCanonicalUrl(pathname || "/", seo.url);

  // Use CMS `title` as the document title as-is (no brand suffix).
  const documentTitle = (seo.title?.trim() || seo.page_title?.trim() || APP_NAME) as string;

  const kw = seo.keywords
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const ogImage = socialImageUrl(seo.open_graph?.image);
  const twImage = socialImageUrl(seo.twitter?.image);

  return {
    title: { absolute: documentTitle },
    description: seo.description?.trim() || undefined,
    keywords: kw?.length ? kw : undefined,
    robots: parseRobots(seo.robots),
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: (seo.open_graph?.title || seo.title || documentTitle).trim(),
      description: (seo.open_graph?.description || seo.description || "").trim() || undefined,
      url: canonical,
      siteName: APP_NAME,
      images: shareImages([ogImage, ...photos], documentTitle),
    },
    twitter: {
      card: "summary_large_image",
      title: (seo.twitter?.title || seo.title || documentTitle).trim(),
      description: (seo.twitter?.description || seo.description || "").trim() || undefined,
      images: shareImages([twImage, ogImage, ...photos], documentTitle),
    },
  };
}
