import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { WorkspacePlaceJsonLd } from "@/components/seo/listing-json-ld";
import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { buildPageMetadataFromSeo } from "@/lib/seo-metadata";
import { virtualOfficeCitySeo, virtualOfficeListingSeo } from "@/lib/seo-templates";
import {
  getCityLowestMonthlyPrice,
  getVirtualOfficeCityCatalogBySlug,
  getVirtualOfficeCityDisplayName,
} from "@/lib/virtual-office-city-catalog";
import { VerticalCityPage } from "@/modules/city-pages/vertical-city-page";
import { VirtualOfficeDetailPage } from "@/modules/virtual-office/virtual-office-detail-page";
import { getVerticalCityPageContent } from "@/services/cities";
import { loadCoworkingWorkspaceDetail } from "@/services/coworking-api";
import { getSimilarSpaces, resolveVerticalSegment } from "@/services/spaces";
import type { SeoContent } from "@/types/seo.model";
import { toTitleCase } from "@/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const cityPage = await getVerticalCityPageContent("virtual-office", segment);

  if (cityPage) {
    const catalog = getVirtualOfficeCityCatalogBySlug(cityPage.city.slug);
    const cityName = getVirtualOfficeCityDisplayName(cityPage.city.slug, catalog?.name ?? cityPage.city.name);
    return buildMetadataWithCmsSeoFallback(
      `/virtual-office/${cityPage.city.slug}`,
      virtualOfficeCitySeo(cityName, catalog ? getCityLowestMonthlyPrice(catalog) : null),
    );
  }

  const workspace = await loadCoworkingWorkspaceDetail(segment);
  if (workspace) {
    const pathname = `/virtual-office/${workspace.slug}`;
    // Per-space virtual office SEO from the API, when it is filled in.
    const virtualSeo = workspace.virtualSeo;
    if (virtualSeo?.title?.trim() && virtualSeo.status !== false) {
      return buildPageMetadataFromSeo(pathname, virtualSeo as unknown as SeoContent);
    }
    return buildMetadataWithCmsSeoFallback(pathname, virtualOfficeListingSeo(workspace));
  }

  await resolveVerticalSegment("virtual-office", segment);

  return buildMetadataWithCmsSeoFallback(`/virtual-office/${segment}`, {
    title: `${toTitleCase(segment)} | Virtual Office`,
    description: "Compare virtual office providers and compliance-ready plans across India.",
  });
}

export default async function VirtualOfficeSegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const result = await resolveVerticalSegment("virtual-office", segment);

  if (result.type === "city") {
    const cityData = await getVerticalCityPageContent("virtual-office", segment);

    if (!cityData) {
      notFound();
    }

    return <VerticalCityPage data={cityData} />;
  }

  const workspace = await loadCoworkingWorkspaceDetail(result.space.slug);

  return (
    <>
      <WorkspacePlaceJsonLd
        name={result.space.name}
        path={`/virtual-office/${result.space.slug}`}
        images={result.space.images}
        location={workspace?.location}
        amenities={workspace?.amenties}
      />
      <VirtualOfficeDetailPage
        space={result.space}
        similarSpaces={await getSimilarSpaces("virtual-office", result.space.city, result.space.id)}
      />
    </>
  );
}
