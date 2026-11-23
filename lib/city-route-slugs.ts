import { listHomepageCitiesFromAvailable } from "@/services/homepage-available-cities";
import { listCities } from "@/services/mock-db";

let slugs: string[] | null = null;

/**
 * Every city slug a `/{vertical}/{segment}` URL can be a city page for (the same sources
 * `getCityPageData` checks). Sent to the browser so a click can show the right loading skeleton:
 * `/coworking/gurgaon` is a city list, `/coworking/spring-house-…` is a listing. Server only.
 */
export function listCityRouteSlugs(): string[] {
  if (slugs) return slugs;
  const set = new Set<string>(["gurugram"]);
  for (const city of listCities()) set.add(city.slug.toLowerCase());
  for (const vertical of ["coworking", "office-space", "virtual-office", "coliving"] as const) {
    for (const city of listHomepageCitiesFromAvailable(vertical)) set.add(city.slug.toLowerCase());
  }
  slugs = Array.from(set).sort();
  return slugs;
}
