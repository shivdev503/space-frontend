import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { WorkspacePlaceJsonLd } from "@/components/seo/listing-json-ld";
import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pageFromSearchParams, withPageMetadata } from "@/lib/pagination-metadata";
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
import {
  coworkingCardRow,
  loadCoworkingWorkspaceDetail,
  loadCoworkingWorkspacesPageForCity,
} from "@/services/coworking-api";
import { getSimilarSpaces, resolveVerticalSegment } from "@/services/spaces";
import type { SeoContent } from "@/types/seo.model";
import { toTitleCase } from "@/utils/format";

type SearchParams = Record<string, string | string[] | undefined>;

/** Virtual office providers per city page (`?page=N`). */
const VO_CITY_PAGE_SIZE = 12;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ segment: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const [{ segment }, sp] = await Promise.all([params, searchParams]);
  const cityPage = await getVerticalCityPageContent("virtual-office", segment);

  if (cityPage) {
    const catalog = getVirtualOfficeCityCatalogBySlug(cityPage.city.slug);
    const cityName = getVirtualOfficeCityDisplayName(cityPage.city.slug, catalog?.name ?? cityPage.city.name);
    const metadata = await buildMetadataWithCmsSeoFallback(
      `/virtual-office/${cityPage.city.slug}`,
      virtualOfficeCitySeo(cityName, catalog ? getCityLowestMonthlyPrice(catalog) : null),
    );
    return withPageMetadata(metadata, sp);
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
  searchParams,
}: {
  params: Promise<{ segment: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ segment }, sp] = await Promise.all([params, searchParams]);
  const result = await resolveVerticalSegment("virtual-office", segment);

  if (result.type === "city") {
    const cityData = await getVerticalCityPageContent("virtual-office", segment);

    if (!cityData) {
      notFound();
    }

    const page = pageFromSearchParams(sp);
    const initialVirtualOfficeListing = await loadVirtualOfficeCityPage(cityData.catalogCityId, page);
    // A page number past the end is not a page.
    if (page > 1 && !initialVirtualOfficeListing) notFound();

    return <VerticalCityPage data={{ ...cityData, initialVirtualOfficeListing }} />;
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

/** One page of a city's virtual office providers; undefined when none load (the client then fetches). */
async function loadVirtualOfficeCityPage(catalogCityId: string | undefined, page: number) {
  if (!catalogCityId?.trim()) return undefined;
  try {
    const payload = await loadCoworkingWorkspacesPageForCity(catalogCityId, VO_CITY_PAGE_SIZE, page, undefined, true);
    const rows = (payload.data ?? []).map(coworkingCardRow);
    if (rows.length === 0) return undefined;
    const total = payload.meta?.totalRecords ?? payload.meta?.total;
    return {
      rows,
      totalRecords: typeof total === "number" && Number.isFinite(total) ? total : rows.length,
      query: "",
      page,
    };
  } catch {
    return undefined;
  }
}
