import { citySlugOf, loadColivingInventory, loadCoworkingInventory } from "@/services/sitemap-inventory";
import { normalizeLocationSegment, slugifyMicroLocationName } from "@/services/location-api";
import { canonicalCoworkingCitySlug } from "@/services/catalog-city-id";

/**
 * Locality of a live listing, for URLs the micro-location catalog doesn't know: some listings sit in
 * localities flagged for another vertical or spelled differently ("L.B. Nagar"). Matches the sitemap,
 * which builds locality URLs from the same inventory. Server only (inventory is cached for an hour).
 */
export async function findInventoryLocality(
  vertical: "coworking" | "coliving",
  citySegment: string,
  locationSegment: string,
): Promise<{ id?: string; name: string } | null> {
  const city = canonicalCoworkingCitySlug(normalizeLocationSegment(citySegment).toLowerCase());
  const slug = normalizeLocationSegment(locationSegment).toLowerCase().replace(/_/g, "-");
  const items = await (vertical === "coworking" ? loadCoworkingInventory() : loadColivingInventory());
  const item = items.find(
    (row) => row.localityName && citySlugOf(row) === city && slugifyMicroLocationName(row.localityName) === slug,
  );
  return item?.localityName ? { id: item.localityId, name: item.localityName } : null;
}
