import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { coworkingLocalitySeo } from "@/lib/seo-templates";
import { VerticalLocationPage } from "@/modules/location-pages/vertical-location-page";
import { getVerticalLocationPageContent, loadInitialCoworkingListing } from "@/services/coworking-api";
import { coworkingMarketStats } from "@/services/market-stats";
import { getSeoBySlug } from "@/services/seo-content";
import { toTitleCase } from "@/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string; location: string }>;
}): Promise<Metadata> {
  const { segment, location } = await params;
  const page = await getVerticalLocationPageContent("coworking", segment, location);

  if (!page) {
    return buildMetadataWithCmsSeoFallback(`/coworking/${segment}/${location}`, {
      title: `Coworking in ${toTitleCase(location)}, ${toTitleCase(segment)}`,
      description: "Discover coworking spaces in this location.",
    });
  }

  const stats = await coworkingMarketStats(segment, location);
  return buildMetadataWithCmsSeoFallback(
    `/coworking/${page.citySlug}/${page.locationSlug}`,
    coworkingLocalitySeo(page.locationName, page.city.name, stats),
  );
}

export default async function CoworkingLocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ segment: string; location: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ segment, location }, sp] = await Promise.all([params, searchParams]);
  const data = await getVerticalLocationPageContent("coworking", segment, location);

  if (!data) {
    notFound();
  }

  const pathname = `/coworking/${segment}/${location}`;
  const [seo, initialCoworkingListing] = await Promise.all([
    getSeoBySlug(pathnameToSeoSlug(pathname)),
    loadInitialCoworkingListing(data.catalogCityId ?? "", sp, data.workspaceMicroLocationId),
  ]);
  return (
    <VerticalLocationPage
      data={{
        ...data,
        title: seoPageTitleOrFallback(seo, data.title),
        faqs: seoFaqsOrFallback(seo, data.faqs),
        initialCoworkingListing,
      }}
    />
  );
}
