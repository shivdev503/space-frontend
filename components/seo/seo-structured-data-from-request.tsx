import { SeoStructuredData } from "@/components/seo/seo-structured-data";
import { resolveCanonicalUrl } from "@/lib/canonical-url";
import { getResolvedSeoForRequest } from "@/lib/seo-for-request";
import { isFaqOwningHubPath } from "@/lib/vertical-detail-route";

function isAddListingRoute(pathname: string) {
  return pathname === "/add" || pathname.startsWith("/add/");
}

/**
 * Server-rendered JSON-LD for the current request. Must stay in the initial HTML
 * so crawlers (Google) receive structured data without waiting for client JS.
 */
export async function SeoStructuredDataFromRequest() {
  const { seo, pathname } = await getResolvedSeoForRequest();
  const pathSeg = (pathname && pathname.length > 0 ? pathname : "/").split("?")[0] ?? "/";

  if (isAddListingRoute(pathSeg)) return null;

  // City/locality hubs emit FAQPage next to their in-page FAQ section.
  const faqs = isFaqOwningHubPath(pathSeg) ? null : seo.faqs;
  const hasJsonLd = Boolean(seo.script?.trim() || (faqs && faqs.length > 0));
  if (!hasJsonLd) return null;

  const pageUrl = resolveCanonicalUrl(pathname || "/", seo.url);

  return (
    <SeoStructuredData scriptJson={seo.script} faqs={faqs} pageUrl={pageUrl} />
  );
}
