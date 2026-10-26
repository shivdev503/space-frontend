import type { MetadataRoute } from "next";

import { resolveAppUrl } from "@/services/env-config";

export default function robots(): MetadataRoute.Robots {
  const base = resolveAppUrl().replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/add", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
