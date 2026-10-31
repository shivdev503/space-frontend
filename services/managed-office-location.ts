import { cache } from "react";

import { managedOfficeLocality } from "@/modules/managed-office/managed-office-format";
import { getVerticalCityPageContent } from "@/services/cities";
import { normalizeLocationSegment, slugifyMicroLocationName } from "@/services/location-api";
import { listManagedOffices } from "@/services/managed-office-api";
import type { ManagedOfficeModel } from "@/types/managed-office.model";

const CITY_OFFICES_LIMIT = 1000;

export type ManagedOfficeLocality = {
  name: string;
  slug: string;
  offices: ManagedOfficeModel.ManagedOffice[];
};

/** Offices grouped by locality, largest first. Spelling variants ("Dlf" / "DLF") share a slug. */
export function managedOfficeLocalities(offices: ManagedOfficeModel.ManagedOffice[]): ManagedOfficeLocality[] {
  const bySlug = new Map<string, ManagedOfficeLocality>();
  for (const office of offices) {
    const name = managedOfficeLocality(office).replace(/\s+/g, " ").replace(/\bdlf\b/i, "DLF");
    const slug = slugifyMicroLocationName(name);
    if (!slug) continue;
    const group = bySlug.get(slug);
    if (group) group.offices.push(office);
    else bySlug.set(slug, { name, slug, offices: [office] });
  }
  return Array.from(bySlug.values()).sort(
    (a, b) => b.offices.length - a.offices.length || a.name.localeCompare(b.name),
  );
}

/**
 * Locality pages are built from the offices themselves, so a page exists exactly when a live office
 * is in that locality. Returns null for any other URL; throws if the API is unavailable.
 */
export const loadManagedOfficeLocalityPage = cache(async (citySegment: string, locationSegment: string) => {
  const cityData = await getVerticalCityPageContent("office-space", citySegment);
  if (!cityData?.catalogCityId) return null;

  const result = await listManagedOffices({ city: cityData.catalogCityId, limit: CITY_OFFICES_LIMIT });
  if (!result) throw new Error("Managed offices API is unavailable");

  const localities = managedOfficeLocalities(result.rows);
  const key = normalizeLocationSegment(locationSegment).toLowerCase().replace(/_/g, "-");
  const locality = localities.find((item) => item.slug === key);
  return locality ? { cityData, locality, localities } : null;
});
