import { loadBlogPostBySlug } from "@/services/blog-api";
import { loadBrandPageData } from "@/services/brand-api";
import { getVerticalCityPageContent } from "@/services/cities";
import { colivingLocalityExists } from "@/services/coliving-location";
import { getVerticalLocationPageContent, loadCoworkingWorkspaceDetail } from "@/services/coworking-api";
import { loadManagedOfficeDetail } from "@/services/managed-office-api";
import { loadManagedOfficeLocalityPage } from "@/services/managed-office-location";
import { loadPgDetail } from "@/services/pg-api";
import { resolveVerticalSegment } from "@/services/spaces";
import type { SpaceVertical } from "@/types";

const VERTICAL_BY_ROOT: Record<string, SpaceVertical> = {
  coworking: "coworking",
  coliving: "coliving",
  "virtual-office": "virtual-office",
  "managed-office": "office-space",
};

async function listingExists(vertical: SpaceVertical, segment: string): Promise<boolean> {
  switch (vertical) {
    case "coworking":
      return (await loadCoworkingWorkspaceDetail(segment)) != null;
    case "coliving":
      return Boolean((await loadPgDetail(segment))?.data);
    case "office-space":
      return (await loadManagedOfficeDetail(segment)) != null;
    case "virtual-office":
      // Throws notFound() itself when there is no listing.
      await resolveVerticalSegment("virtual-office", segment);
      return true;
  }
}

async function localityExists(vertical: SpaceVertical, city: string, location: string): Promise<boolean> {
  if (vertical === "coliving") return colivingLocalityExists(city, location);
  if (vertical === "office-space") return (await loadManagedOfficeLocalityPage(city, location)) != null;
  return (await getVerticalLocationPageContent(vertical, city, location)) != null;
}

/**
 * False for URLs that match a dynamic route but have no content behind them. `(public)/loading.tsx`
 * starts the response with a 200 before any page or metadata runs, so a page's own `notFound()` can
 * only produce a "soft 404"; the layout above it calls this to send a real one. Other paths are
 * left to the router. Throws when the API is down, so an outage is a 500 and not a false 404.
 */
export async function publicRouteExists(pathname: string): Promise<boolean> {
  const [root, first, second, ...rest] = pathname.split("/").filter(Boolean);
  if (!root || !first || rest.length) return true;

  if (root === "blog" && !second) return (await loadBlogPostBySlug(first)) != null;
  if (root === "brand" && !second) return (await loadBrandPageData(first)) != null;
  if (root === "coworking" && (first === "compare" || first === "shortlist") && !second) return true;

  const vertical = VERTICAL_BY_ROOT[root];
  if (!vertical) return true;
  if (second) return localityExists(vertical, first, second);
  if (await getVerticalCityPageContent(vertical, first)) return true;
  return listingExists(vertical, first);
}

/**
 * A managed office area with no live offices any more (a retired locality such as
 * `/managed-office/noida/sector-135`) whose city page exists → that city page. Called by the layout,
 * which answers before the page starts streaming, so the redirect is a real 308 and not a soft one.
 * Every other path → null.
 */
export async function retiredAreaRedirect(pathname: string): Promise<string | null> {
  const [root, city, area, ...rest] = pathname.split("/").filter(Boolean);
  if (root !== "managed-office" || !city || !area || rest.length) return null;
  if ((await loadManagedOfficeLocalityPage(city, area)) != null) return null;
  const cityData = await getVerticalCityPageContent("office-space", city);
  return cityData ? `/managed-office/${encodeURIComponent(cityData.city.slug)}` : null;
}
