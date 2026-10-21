import type { Metadata } from "next";

import { notFound, redirect } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { buildPgColivingCityPageParams } from "@/lib/pg-list-priority";
import { buildPgListParamsFromSearchParams } from "@/lib/pg-list-params";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { ColivingCityPage } from "@/modules/coliving/coliving-city-page";
import { ColivingDetailPage } from "@/modules/coliving/coliving-detail-page";
import { getVerticalCityPageContent } from "@/services/cities";
import { loadPgDetail, loadPgList } from "@/services/pg-api";
import { getSeoBySlug } from "@/services/seo-content";
import { toTitleCase } from "@/utils/format";
import { pgDescriptionText } from "@/services/pg-mapper";

type PageProps = {
  params: Promise<{ segment: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const cityPage = await getVerticalCityPageContent("coliving", segment);

  if (cityPage) {
    return buildMetadataWithCmsSeoFallback(`/coliving/${cityPage.city.slug}`, {
      title: cityPage.title,
      description: cityPage.subtitle,
    });
  }

  const pgRes = await loadPgDetail(segment);
  if (pgRes?.data) {
    const pg = pgRes.data;
    return buildMetadataWithCmsSeoFallback(`/coliving/${pgRes.slug}`, {
      title: `${pg.name} | ${pg.locality}, ${pg.city}`,
      description: pgDescriptionText(pg).slice(0, 160) || "Explore coliving and PG rooms across top cities in India.",
    });
  }

  return buildMetadataWithCmsSeoFallback(`/coliving/${segment}`, {
    title: `${toTitleCase(segment)} | Coliving Space`,
    description: "Discover coliving homes and PG rooms across top cities in India.",
  });
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
