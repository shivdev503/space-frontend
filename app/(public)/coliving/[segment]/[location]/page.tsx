import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { colivingLocalitySeo } from "@/lib/seo-templates";
import { ColivingLocationPage } from "@/modules/coliving/coliving-location-page";
import { getColivingLocationPageContent, loadColivingLocalityPgs } from "@/services/coliving-location";
import { colivingMarketStats } from "@/services/market-stats";
import { getSeoBySlug } from "@/services/seo-content";

type PageProps = {
  params: Promise<{ segment: string; location: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment, location } = await params;
  const page = await getColivingLocationPageContent(segment, location);

  if (!page) notFound();

  const pgList = await loadColivingLocalityPgs(page);

  const stats = await colivingMarketStats(page.city.name, page.locationName);
  const metadata = await buildMetadataWithCmsSeoFallback(
    `/coliving/${page.citySlug}/${page.locationSlug}`,
    colivingLocalitySeo(page.locationName, page.city.name, stats),
  );
  // A real locality with no PGs yet is a thin page.
  return pgList.totalRecords === 0 ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

export default async function ColivingLocationRoute({ params }: PageProps) {
  const { segment, location } = await params;
  const data = await getColivingLocationPageContent(segment, location);

  if (!data) {
    notFound();
  }

  const pgList = await loadColivingLocalityPgs(data);
  const pathname = `/coliving/${segment}/${location}`;
  const seo = await getSeoBySlug(pathnameToSeoSlug(pathname));

  return (
    <ColivingLocationPage
      data={{
        ...data,
        title: seoPageTitleOrFallback(seo, data.title),
        faqs: seoFaqsOrFallback(seo, data.faqs),
      }}
      pgList={pgList.data}
      pgTotal={pgList.totalRecords}
    />
  );
}
