import type { BreadcrumbItem } from "@/components/seo/breadcrumbs";
import { slugifyPgName } from "@/lib/pg-slug";
import { verticalPath } from "@/lib/vertical-path";
import { canonicalCoworkingCitySlug, resolveCatalogIdToSlug } from "@/services/catalog-city-id";
import { slugifyMicroLocationName } from "@/services/location-api";
import type { SpaceVertical } from "@/types";
import { toTitleCase } from "@/utils/format";

const VERTICAL_LABEL: Record<SpaceVertical, string> = {
  coworking: "Coworking",
  coliving: "Coliving & PG",
  "virtual-office": "Virtual Office",
  "office-space": "Managed Office",
};

/** PG / catalog city names whose route slug differs. */
const CITY_NAME_TO_ROUTE: Record<string, string> = {
  bengaluru: "bangalore",
  "new-delhi": "delhi",
  "navi-mumbai": "mumbai",
};

/** Route slug for a listing's city: catalog id first, then the display name. */
export function routeCitySlug(cityName?: string, cityId?: string): string {
  const fromCatalog = cityId ? resolveCatalogIdToSlug(cityId) : null;
  const raw = fromCatalog ?? (cityName ? slugifyPgName(cityName) : "");
  if (!raw) return "";
  return canonicalCoworkingCitySlug(CITY_NAME_TO_ROUTE[raw] ?? raw);
}

function hub(vertical: SpaceVertical): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: VERTICAL_LABEL[vertical], href: `/${verticalPath(vertical)}` },
  ];
}

/** Home › Vertical › City */
export function cityTrail(vertical: SpaceVertical, cityName: string): BreadcrumbItem[] {
  return [...hub(vertical), { name: cityName }];
}

/** Home › Vertical › City › Locality */
export function localityTrail(
  vertical: SpaceVertical,
  city: { name: string; slug: string },
  localityName: string,
): BreadcrumbItem[] {
  return [
    ...hub(vertical),
    { name: city.name, href: `/${verticalPath(vertical)}/${city.slug}` },
    { name: localityName },
  ];
}

/** Home › Vertical › City › Locality › Listing (city / locality links only when known). */
export function listingTrail(
  vertical: SpaceVertical,
  listing: { name: string; cityName?: string; cityId?: string; localityName?: string },
): BreadcrumbItem[] {
  const base = `/${verticalPath(vertical)}`;
  const citySlug = routeCitySlug(listing.cityName, listing.cityId);
  const items = hub(vertical);
  if (citySlug && listing.cityName?.trim()) {
    const cityLabel = citySlug === "gurgaon" ? "Gurugram" : toTitleCase(listing.cityName.trim());
    items.push({ name: cityLabel, href: `${base}/${citySlug}` });
    const locality = listing.localityName?.trim();
    const localitySlug = locality ? slugifyMicroLocationName(locality) : "";
    // Virtual office has no locality pages.
    if (locality && localitySlug && vertical !== "virtual-office") {
      items.push({ name: toTitleCase(locality), href: `${base}/${citySlug}/${localitySlug}` });
    }
  }
  items.push({ name: listing.name });
  return items;
}
