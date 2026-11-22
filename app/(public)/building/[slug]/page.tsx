import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { BreadcrumbItem } from "@/components/seo/breadcrumbs";
import { routeCitySlug } from "@/lib/breadcrumb-trails";
import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { collectLocalityPages } from "@/lib/sitemap-public-urls";
import { managedOfficeImages } from "@/modules/managed-office/managed-office-format";
import { buildingFacts, buildingSeo } from "@/modules/building/building-content";
import { BuildingPage } from "@/modules/building/building-page";
import { buildingDistance, loadBuilding, loadBuildingsOrEmpty, type Building } from "@/services/building-api";
import { getVerticalCityPageContent } from "@/services/cities";
import { coworkingCardRow, loadCoworkingWorkspacesInBuilding } from "@/services/coworking-api";
import { buildWorkspaceGalleryMedia } from "@/services/coworking-workspace-mapper";
import { slugifyMicroLocationName } from "@/services/location-api";
import { listManagedOffices } from "@/services/managed-office-api";
import { cache } from "react";

type PageProps = { params: Promise<{ slug: string }> };

/** The building and its live centres (shared by metadata and the page within one request). */
const loadBuildingPage = cache(async (slug: string) => {
  const building = await loadBuilding(slug);
  if (!building) return null;
  const [workspaces, offices] = await Promise.all([
    loadCoworkingWorkspacesInBuilding(building.id, building.coworkingSlugs),
    building.managedOfficeSlugs.length
      ? listManagedOffices({ building: building.id, limit: 100 }).then((r) =>
          (r?.rows ?? []).filter((o) => building.managedOfficeSlugs.includes(o.slug.trim())),
        )
      : Promise.resolve([]),
  ]);
  // The building list can be up to an hour old: only show a page while 2+ centres still load.
  if (workspaces.length + offices.length < 2) return null;
  return { building, workspaces: workspaces.map(coworkingCardRow), offices, facts: buildingFacts(workspaces, offices, building.name) };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadBuildingPage(slug);
  if (!page) notFound();
  const { building, facts, workspaces, offices } = page;
  // The building's own photo, else the first centre's.
  const photos = [
    building.image,
    ...workspaces.flatMap((w) => buildWorkspaceGalleryMedia(w).images),
    ...offices.flatMap((o) => managedOfficeImages(o).images),
  ];
  return buildMetadataWithCmsSeoFallback(`/building/${building.slug}`, buildingSeo(building, facts), photos);
}

/** Home › Coworking › City › Area › Building, linking only the city and area pages that exist. */
async function breadcrumbsFor(building: Building, citySlug: string): Promise<BreadcrumbItem[]> {
  const items: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Coworking", href: "/coworking" },
  ];
  if (citySlug && building.cityName) {
    const cityPage = await getVerticalCityPageContent("coworking", citySlug);
    items.push({ name: cityPage?.city.name ?? building.cityName, href: cityPage ? `/coworking/${citySlug}` : undefined });
    if (building.areaName) {
      const areaSlug = slugifyMicroLocationName(building.areaName);
      const areaPages = await collectLocalityPages().catch(() => []);
      const hasArea = areaPages.some((p) => p.vertical === "coworking" && p.city === citySlug && p.locality === areaSlug);
      items.push({ name: building.areaName, href: hasArea ? `/coworking/${citySlug}/${areaSlug}` : undefined });
    }
  }
  items.push({ name: building.name });
  return items;
}

export default async function BuildingRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = await loadBuildingPage(slug);
  if (!page) notFound();
  const { building } = page;
  const citySlug = routeCitySlug(building.cityName, building.cityId);

  const [breadcrumbs, all] = await Promise.all([breadcrumbsFor(building, citySlug), loadBuildingsOrEmpty()]);
  const nearby = all
    .filter((b) => b.slug !== building.slug && b.cityId === building.cityId)
    .map((b) => ({ building: b, distanceKm: buildingDistance(building, b) / 1000 }))
    .filter((n) => Number.isFinite(n.distanceKm))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6);

  return (
    <BuildingPage
      building={building}
      facts={page.facts}
      workspaces={page.workspaces}
      offices={page.offices}
      breadcrumbs={breadcrumbs}
      citySlug={citySlug}
      nearby={nearby}
    />
  );
}
