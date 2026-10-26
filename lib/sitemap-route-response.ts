import type { SitemapUrlEntry } from "@/lib/sitemap-xml";
import { buildUrlsetXml } from "@/lib/sitemap-xml";

const CACHE_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export function xmlResponse(xml: string): Response {
  return new Response(xml, { headers: CACHE_HEADERS });
}

/**
 * Renders a child sitemap from live inventory. When the API is unreachable this answers
 * 503 + Retry-After so crawlers retry later instead of indexing an empty sitemap.
 */
export async function sitemapEntriesResponse(load: () => Promise<SitemapUrlEntry[]>): Promise<Response> {
  try {
    return xmlResponse(buildUrlsetXml(await load()));
  } catch (error) {
    console.error("[sitemap] live inventory unavailable:", error);
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "600", "Cache-Control": "no-store" },
    });
  }
}
