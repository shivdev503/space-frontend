import type { Metadata } from "next";

import { resolveCanonicalUrl } from "@/lib/canonical-url";
import { shareImages } from "@/lib/share-image";
import { resolveAppUrl } from "@/services/env-config";
import { APP_NAME } from "@/utils/constants";

export function buildMetadata(
  title: string,
  description: string,
  path = "",
  /** The page's own photos, best first; without one the share preview is the brand image. */
  photos: ReadonlyArray<string | null | undefined> = [],
): Metadata {
  const origin = resolveAppUrl();
  const pathname = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const url = resolveCanonicalUrl(pathname, null);

  const images = shareImages(photos, title);

  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(origin),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
