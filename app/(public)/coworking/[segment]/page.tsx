import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { VerticalCityPage } from "@/modules/city-pages/vertical-city-page";
import { CoworkingDetailPage } from "@/modules/coworking/coworking-detail-page";
import { getVerticalCityPageContent } from "@/services/cities";
import {
  loadCoworkingWorkspaceDetail,
  loadCoworkingWorkspacesList,
  loadInitialCoworkingListing,
} from "@/services/coworking-api";
import { coworkingMarketStats } from "@/services/market-stats";
import { resolveVerticalSegment } from "@/services/spaces";
import { workspaceSeo } from "@/lib/coworking-workspace-content";
import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { withPageMetadata } from "@/lib/pagination-metadata";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { buildPageMetadataFromSeo } from "@/lib/seo-metadata";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { coworkingBrandedTitle, coworkingCitySeo, coworkingListingSeo } from "@/lib/seo-templates";
import { getSeoBySlug } from "@/services/seo-content";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ segment: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [{ segment }, sp] = await Promise.all([params, searchParams]);

  const cityPage = await getVerticalCityPageContent("coworking", segment);
  if (cityPage) {
    const stats = await coworkingMarketStats(cityPage.city.slug);
    const metadata = await buildMetadataWithCmsSeoFallback(
      `/coworking/${cityPage.city.slug}`,
      coworkingCitySeo(cityPage.city.name, stats),
    );
    return withPageMetadata(metadata, sp);
  }

  const workspace = await loadCoworkingWorkspaceDetail(segment);
  if (workspace) {
    const pathname = `/coworking/${workspace.slug}`;
    const spaceSeo = workspaceSeo(workspace);
    if (spaceSeo) {
      return buildPageMetadataFromSeo(pathname, {
        ...spaceSeo,
        title: coworkingBrandedTitle(spaceSeo.title, workspace),
      });
    }

    return buildMetadataWithCmsSeoFallback(pathname, coworkingListingSeo(workspace));
  }

  notFound();
}

export default async function CoworkingSegmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ segment: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ segment }, sp] = await Promise.all([params, searchParams]);
  const result = await resolveVerticalSegment("coworking", segment);

  if (result.type === "city") {
    const cityData = await getVerticalCityPageContent("coworking", segment);
    if (!cityData) notFound();
    const pathname = `/coworking/${cityData.city.slug}`;
    const [seo, initialCoworkingListing] = await Promise.all([
      getSeoBySlug(pathnameToSeoSlug(pathname)),
      loadInitialCoworkingListing(cityData.catalogCityId ?? "", sp),
    ]);
    return (
      <VerticalCityPage
        data={{
          ...cityData,
          title: seoPageTitleOrFallback(seo, cityData.title),
          faqs: seoFaqsOrFallback(seo, cityData.faqs),
          initialCoworkingListing,
        }}
      />
    );
  }

  const workspace = await loadCoworkingWorkspaceDetail(result.space.slug);
  if (!workspace) notFound();

  const cityId = workspace.location?.city?.id?.trim();
  const similarWorkspaces = cityId
    ? (await loadCoworkingWorkspacesList(cityId, 10)).data
        .filter((w) => w.id !== workspace.id)
        .slice(0, 6)
    : [];

  return (
    <CoworkingDetailPage workspace={workspace} similarWorkspaces={similarWorkspaces} />
  );
}
