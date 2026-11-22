import { sitemapEntriesResponse } from "@/lib/sitemap-route-response";
import { collectBuildingPagesSitemapEntries } from "@/lib/sitemap-public-urls";

/** Built from the buildings API on request; cached for an hour (see building-api). */
export const dynamic = "force-dynamic";

export function GET() {
  return sitemapEntriesResponse(collectBuildingPagesSitemapEntries);
}
