import { sitemapEntriesResponse } from "@/lib/sitemap-route-response";
import { collectLocalityPagesSitemapEntries } from "@/lib/sitemap-public-urls";

/** Built from live listings on request; cached for an hour (see sitemap-inventory). */
export const dynamic = "force-dynamic";

export function GET() {
  return sitemapEntriesResponse(collectLocalityPagesSitemapEntries);
}
