import { canonicalCoworkingCitySlug } from "@/services/catalog-city-id";

const VERTICAL_PREFIXES = ["coworking", "coliving", "managed-office", "virtual-office"] as const;

/** Catalog city route slugs — aligned with `AVAILABLE_CITY` names in cities-data. */
const CATALOG_CITY_NAMES = [
  "gurugram",
  "mumbai",
  "bangalore",
  "hyderabad",
  "chennai",
  "lucknow",
  "pune",
  "noida",
  "delhi",
  "indore",
  "ahmedabad",
  "jaipur",
  "kochi",
  "chandigarh",
  "kolkata",
  "coimbatore",
  "goa",
  "bhubaneswar",
  "faridabad",
  "guwahati",
  "dehradun",
  "jodhpur",
  "ludhiana",
  "patna",
  "raipur",
  "surat",
  "trivandrum",
  "vadodara",
  "calicut",
  "mohali",
  "visakhapatnam",
  "bhopal",
  "ernakulam",
  "nagpur",
] as const;

const KNOWN_CITY_SLUGS: Set<string> = (() => {
  const slugs = new Set<string>();
  for (const name of CATALOG_CITY_NAMES) {
    slugs.add(name);
    slugs.add(canonicalCoworkingCitySlug(name));
  }
  slugs.add("gurgaon");
  slugs.add("bengaluru");
  slugs.add("new-delhi");
  return slugs;
})();

export function isKnownVerticalCitySlug(segment: string): boolean {
  const key = segment.trim().toLowerCase();
  return KNOWN_CITY_SLUGS.has(key) || KNOWN_CITY_SLUGS.has(canonicalCoworkingCitySlug(key));
}

/**
 * True for listing detail URLs like `/coworking/altf-orchid-business-park` —
 * not city hubs (`/coworking/gurgaon`) or locality pages (`/coworking/gurgaon/mg-road`).
 */
export function isVerticalDetailPagePath(pathname: string): boolean {
  const path = (pathname.split("?")[0] ?? "/").replace(/\/+$/, "") || "/";
  if (path === "/") return false;

  const parts = path.split("/").filter(Boolean);
  if (parts.length !== 2) return false;

  const [vertical, segment] = parts;
  if (!VERTICAL_PREFIXES.includes(vertical as (typeof VERTICAL_PREFIXES)[number])) {
    return false;
  }

  return !isKnownVerticalCitySlug(decodeURIComponent(segment));
}

/**
 * City and locality hubs (`/coworking/gurgaon`, `/coliving/noida/sector-62`, `/managed-office/gurgaon`)
 * render the CMS FAQs in-page together with their FAQPage JSON-LD.
 */
export function isFaqOwningHubPath(pathname: string): boolean {
  const path = (pathname.split("?")[0] ?? "/").replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return false;
  const [vertical, segment] = parts;
  if (vertical !== "coworking" && vertical !== "coliving" && vertical !== "managed-office") return false;
  if (parts.length === 2) {
    try {
      return isKnownVerticalCitySlug(decodeURIComponent(segment));
    } catch {
      return isKnownVerticalCitySlug(segment);
    }
  }
  return true;
}
