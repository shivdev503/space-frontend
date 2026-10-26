import { seedListingsEnabled } from "@/lib/seed-listings";
import { getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import { coworkingWorkspacesAsSpaces } from "@/services/coworking-api";
import { FEATURED_CITY_SLUG } from "@/services/home";
import { getVerticalLandingData } from "@/services/mock-db";
import { SpaceVertical, type Space } from "@/types";

const FEATURED_LIMIT = 6;

/** Real listings for a hub's "featured" rail; empty when none can be loaded. */
async function liveFeaturedSpaces(vertical: SpaceVertical): Promise<Space[]> {
  if (vertical !== "coworking") return [];
  const catalogId = getCatalogCityIdBySlug(FEATURED_CITY_SLUG);
  if (!catalogId) return [];
  const spaces = await coworkingWorkspacesAsSpaces(catalogId, FEATURED_CITY_SLUG, FEATURED_LIMIT);
  return (spaces ?? []).slice(0, FEATURED_LIMIT);
}

export async function getVerticalLandingContent(vertical: SpaceVertical) {
  const data = getVerticalLandingData(vertical);
  // Landing copy comes from static content, but its featured listings are demo rows —
  // swap in live listings (or none) so production never links to fake spaces.
  const live = await liveFeaturedSpaces(vertical);
  if (live.length > 0 || !seedListingsEnabled()) {
    return { ...data, featuredSpaces: live };
  }
  return data;
}
