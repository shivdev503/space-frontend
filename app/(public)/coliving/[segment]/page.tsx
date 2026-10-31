import type { Metadata } from "next";

import { notFound, redirect } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { withPageMetadata } from "@/lib/pagination-metadata";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { buildPgColivingCityPageParams } from "@/lib/pg-list-priority";
import { buildPgListParamsFromSearchParams } from "@/lib/pg-list-params";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { colivingCitySeo, colivingListingSeo } from "@/lib/seo-templates";
import { ColivingCityPage } from "@/modules/coliving/coliving-city-page";
import { ColivingDetailPage } from "@/modules/coliving/coliving-detail-page";
import { getVerticalCityPageContent } from "@/services/cities";
import { loadPgDetail, loadPgList } from "@/services/pg-api";
import { colivingMarketStats } from "@/services/market-stats";
import { getSeoBySlug } from "@/services/seo-content";

type PageProps = {
  params: Promise<{ segment: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ segment }, sp] = await Promise.all([params, searchParams]);
  const cityPage = await getVerticalCityPageContent("coliving", segment);

  if (cityPage) {
    const stats = await colivingMarketStats(cityPage.city.name);
    const metadata = await buildMetadataWithCmsSeoFallback(
      `/coliving/${cityPage.city.slug}`,
      colivingCitySeo(cityPage.city.name, stats),
    );
    return withPageMetadata(metadata, sp);
  }

  const pgRes = await loadPgDetail(segment);
  if (pgRes?.data) {
    const pg = pgRes.data;
    return buildMetadataWithCmsSeoFallback(`/coliving/${pgRes.slug}`, colivingListingSeo(pg));
  }

  notFound();
}

export default async function ColivingSegmentPage({ params, searchParams }: PageProps) {
  const { segment } = await params;
  const sp = await searchParams;

  const cityData = await getVerticalCityPageContent("coliving", segment);
  if (cityData) {
    const listParams = buildPgColivingCityPageParams(
      cityData.catalogCityId,
      cityData.city.name,
      buildPgListParamsFromSearchParams(sp),
    );
    const pgList = await loadPgList(listParams);
    const pathname = `/coliving/${cityData.city.slug}`;
    const seo = await getSeoBySlug(pathnameToSeoSlug(pathname));

    return (
      <ColivingCityPage
        data={{
          ...cityData,
          title: seoPageTitleOrFallback(seo, cityData.title),
          faqs: seoFaqsOrFallback(seo, cityData.faqs),
        }}
        pgList={pgList.data}
        pgTotal={pgList.totalRecords}
        pgPage={listParams.page ?? 1}
      />
    );
  }

  const pgResponse = await loadPgDetail(segment);
  if (!pgResponse?.data) {
    notFound();
  }

  const canonicalSlug = pgResponse.slug?.trim();
  const segmentDecoded = decodeURIComponent(segment);
  if (canonicalSlug && canonicalSlug !== segmentDecoded) {
    redirect(`/coliving/${encodeURIComponent(canonicalSlug)}`);
  }

  const pg = pgResponse.data;
  const similarRes = await loadPgList({
    city: pg.city,
    locality: pg.locality,
    limit: 12,
    page: 1,
    sortBy: "rating",
    orderBy: -1,
  });
  const similar = similarRes.data.filter((item) => item.name !== pg.name);

  return <ColivingDetailPage response={pgResponse} similar={similar} />;
}
