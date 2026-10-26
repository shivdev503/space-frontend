import { notFound } from "next/navigation";

import { seedListingsEnabled } from "@/lib/seed-listings";
import { canonicalCoworkingCitySlug, getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import { loadCoworkingWorkspaceDetail, loadCoworkingWorkspacesList } from "@/services/coworking-api";
import {
  coworkingApiWorkspaceToSpace,
  deriveAppCitySlugFromWorkspace,
  virtualOfficeApiWorkspaceToSpace,
} from "@/services/coworking-workspace-mapper";
import { getCityPageData, getSpaceBySlug, listSpaces } from "@/services/mock-db";
import type { Space } from "@/types";
import { SpaceVertical } from "@/types";

/** Sample listings for a city — empty in production (see {@link seedListingsEnabled}). */
function seedCitySpaces(vertical: SpaceVertical, city: string): Space[] {
  return seedListingsEnabled() ? listSpaces({ vertical, city }) : [];
}

export async function getVerticalSpaceBySlug(vertical: SpaceVertical, slug: string) {
  if (vertical === "coworking") {
    const ws = await loadCoworkingWorkspaceDetail(slug);
    if (ws) return coworkingApiWorkspaceToSpace(ws, deriveAppCitySlugFromWorkspace(ws));
  }
  if (vertical === "virtual-office") {
    const ws = await loadCoworkingWorkspaceDetail(slug);
    if (ws) return virtualOfficeApiWorkspaceToSpace(ws, deriveAppCitySlugFromWorkspace(ws));
  }
  return seedListingsEnabled() ? getSpaceBySlug(slug, vertical) : undefined;
}

/** Up to 6 other listings in the city — real virtual offices from the API, never demo rows in production. */
export async function getSimilarSpaces(
  vertical: SpaceVertical,
  city: string,
  excludeSpaceId: string,
): Promise<Space[]> {
  if (vertical === "virtual-office") {
    const cityId = getCatalogCityIdBySlug(city);
    if (cityId) {
      const payload = await loadCoworkingWorkspacesList(cityId, 8, undefined, undefined, true);
      const real = payload.data
        .filter((ws) => (ws.id || ws._id) !== excludeSpaceId)
        .slice(0, 6)
        .map((ws) => virtualOfficeApiWorkspaceToSpace(ws, city));
      if (real.length > 0 || !seedListingsEnabled()) return real;
    }
  }
  return seedCitySpaces(vertical, city)
    .filter((space) => space.id !== excludeSpaceId)
    .slice(0, 6);
}

export async function resolveVerticalSegment(vertical: SpaceVertical, segment: string) {
  const cityKey =
    vertical === "coworking" ||
    vertical === "virtual-office" ||
    vertical === "office-space" ||
    vertical === "coliving"
      ? canonicalCoworkingCitySlug(segment.trim())
      : segment.trim();

  const spacesByCity = seedCitySpaces(vertical, cityKey);

  if (spacesByCity.length > 0) {
    return { type: "city" as const, city: cityKey, spaces: spacesByCity };
  }

  if (getCityPageData(vertical, segment)) {
    return { type: "city" as const, city: cityKey, spaces: [] };
  }

  if (vertical === "coworking") {
    const workspace = await loadCoworkingWorkspaceDetail(segment);
    if (!workspace) notFound();
    const space = coworkingApiWorkspaceToSpace(workspace, deriveAppCitySlugFromWorkspace(workspace));
    return { type: "detail" as const, space };
  }

  if (vertical === "virtual-office") {
    const workspace = await loadCoworkingWorkspaceDetail(segment);
    if (workspace) {
      const space = virtualOfficeApiWorkspaceToSpace(workspace, deriveAppCitySlugFromWorkspace(workspace));
      return { type: "detail" as const, space };
    }
  }

  const space = seedListingsEnabled() ? getSpaceBySlug(segment, vertical) : undefined;
  if (!space) notFound();

  return { type: "detail" as const, space };
}
