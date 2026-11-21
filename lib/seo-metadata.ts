import type { Metadata } from "next";

import { resolveCanonicalUrl } from "@/lib/canonical-url";
import type { SeoContent, SeoImageRef } from "@/types/seo.model";
import { APP_NAME } from "@/utils/constants";

function socialImageUrl(ref?: SeoImageRef | undefined): string | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "string" && (ref.startsWith("http://") || ref.startsWith("https://"))) {
    return ref;
  }
  if (typeof ref === "string" && ref.length > 0) {
    return ref;
  }
  if (typeof ref === "object" && ref !== null) {
    const s = "s3_link" in ref && typeof ref.s3_link === "string" ? ref.s3_link : undefined;
    const u = "url" in ref && typeof (ref as { url?: string }).url === "string"
      ? (ref as { url: string }).url
      : undefined;
    if (s) return s;
    if (u) return u;
  }
  return undefined;
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

export function buildPageMetadataFromSeo(pathname: string, seo: SeoContent): Metadata {
  const canonical = resolveCanonicalUrl(pathname || "/", seo.url);

  // Use CMS `title` as the document title as-is (no brand suffix).
  const documentTitle = (seo.title?.trim() || seo.page_title?.trim() || APP_NAME) as string;

  const kw = seo.keywords
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const ogImage = socialImageUrl(seo.open_graph?.image);
  const twImage = socialImageUrl(seo.twitter?.image) ?? ogImage;

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
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: (seo.twitter?.title || seo.title || documentTitle).trim(),
      description: (seo.twitter?.description || seo.description || "").trim() || undefined,
      images: twImage ? [twImage] : undefined,
    },
  };
}
