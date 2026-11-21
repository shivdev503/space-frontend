import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pageFromSearchParams, withPageMetadata } from "@/lib/pagination-metadata";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { colivingLocalitySeo } from "@/lib/seo-templates";
import { ColivingLocationPage } from "@/modules/coliving/coliving-location-page";
import {
  COLIVING_LOCALITY_PAGE_SIZE,
  getColivingLocationPageContent,
  loadColivingLocalityPgs,
  loadColivingLocalityPgsPage,
} from "@/services/coliving-location";
import { colivingMarketStats } from "@/services/market-stats";
import { colivingAreaInsights } from "@/services/area-insights";
import { getSeoBySlug } from "@/services/seo-content";

type PageProps = {
  params: Promise<{ segment: string; location: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ segment, location }, sp] = await Promise.all([params, searchParams]);
  const page = await getColivingLocationPageContent(segment, location);

  if (!page) notFound();

  const pgList = await loadColivingLocalityPgs(page);

  const stats = await colivingMarketStats(page.city.name, page.locationName);
  const metadata = await buildMetadataWithCmsSeoFallback(
    `/coliving/${page.citySlug}/${page.locationSlug}`,
    colivingLocalitySeo(page.locationName, page.city.name, stats),
  );
  // A real locality with no PGs yet is a thin page.
  return pgList.totalRecords === 0
    ? { ...metadata, robots: { index: false, follow: true } }
    : withPageMetadata(metadata, sp);
}

export default async function ColivingLocationRoute({ params, searchParams }: PageProps) {
  const [{ segment, location }, sp] = await Promise.all([params, searchParams]);
  const pgPage = pageFromSearchParams(sp);
  const data = await getColivingLocationPageContent(segment, location);

  if (!data) {
    notFound();
  }

  const pathname = `/coliving/${segment}/${location}`;
  const [pgList, seo, insights] = await Promise.all([
    loadColivingLocalityPgsPage(data, pgPage),
    getSeoBySlug(pathnameToSeoSlug(pathname)),
    colivingAreaInsights(data.citySlug, data.city.name, data.locationName, data.locationSlug),
  ]);

  // A page number past the end is not a page.
  if (pgPage > 1 && pgList.data.length === 0) notFound();

  return (
    <ColivingLocationPage
      data={{
        ...data,
        title: seoPageTitleOrFallback(seo, data.title),
        // CMS FAQs win; otherwise FAQs answered from this area's own listings (not the generic template).
        faqs: seoFaqsOrFallback(seo, insights?.faqs.length ? insights.faqs : data.faqs),
      }}
      pgList={pgList.data}
      pgTotal={pgList.totalRecords}
      pgPage={pgPage}
      pgTotalPages={Math.max(1, Math.ceil(pgList.totalRecords / COLIVING_LOCALITY_PAGE_SIZE))}
      insights={insights}
    />
  );
}
