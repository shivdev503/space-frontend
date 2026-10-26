import { buildRootSitemapIndexEntries } from "@/lib/sitemap-public-urls";
import { xmlResponse } from "@/lib/sitemap-route-response";
import { buildSitemapIndexXml } from "@/lib/sitemap-xml";

export const dynamic = "force-static";

export function GET() {
  return xmlResponse(buildSitemapIndexXml(buildRootSitemapIndexEntries(), { preserveOrder: true }));
}
