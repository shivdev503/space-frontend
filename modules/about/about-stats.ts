import { EMPTY_CITY_PAGE_FILTERS, getCityPageData } from "@/services/mock-db";
import {
  citySlugOf,
  loadColivingInventory,
  loadCoworkingInventory,
  loadManagedOfficeInventory,
} from "@/services/sitemap-inventory";

/** Never hold the page for the counts: a slow load finishes in the background for the next visit. */
const WAIT_MS = 2500;

export type AboutStat = { value: string; label: string };

function orEmpty<T>(load: Promise<T[]>): Promise<T[]> {
  return Promise.race([load.catch(() => []), new Promise<T[]>((resolve) => setTimeout(() => resolve([]), WAIT_MS))]);
}

/** The last complete set, shown while a count is slow or failing. */
let lastComplete: AboutStat[] = [];

/** Live listing counts: all of them or none, because one count alone reads as all we list. */
export async function loadAboutStats(): Promise<AboutStat[]> {
  const [coworking, managed, coliving] = await Promise.all([
    orEmpty(loadCoworkingInventory()),
    orEmpty(loadManagedOfficeInventory()),
    orEmpty(loadColivingInventory()),
  ]);
  const cities = new Set<string>();
  for (const item of coworking) {
    const city = citySlugOf(item);
    if (city && getCityPageData("coworking", city, EMPTY_CITY_PAGE_FILTERS)) cities.add(city);
  }
  const stats = [
    { count: coworking.length, label: "Coworking spaces" },
    { count: cities.size, label: "Cities with coworking" },
    { count: managed.length, label: "Managed offices" },
    { count: coliving.length, label: "PG and coliving homes" },
  ];
  if (stats.every(({ count }) => count > 0)) {
    lastComplete = stats.map(({ count, label }) => ({ value: count.toLocaleString("en-IN"), label }));
  }
  return lastComplete;
}
