import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { cache } from "react";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { buildPageMetadataFromSeo } from "@/lib/seo-metadata";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { managedOfficeCitySeo, managedOfficeListingSeo } from "@/lib/seo-templates";
import { VerticalCityPage } from "@/modules/city-pages/vertical-city-page";
import { ManagedOfficeDetailPage } from "@/modules/managed-office/managed-office-detail-page";
import { getVerticalCityPageContent } from "@/services/cities";
import { managedOfficeCardRow } from "@/modules/managed-office/managed-office-format";
import { loadManagedOfficeDetail, managedOfficesByCity } from "@/services/managed-office-api";
import { getSeoBySlug } from "@/services/seo-content";
import type { SeoContent } from "@/types/seo.model";


/** Managed offices for a city page (shared by metadata and the page within one request). */
const loadCityOffices = cache(async (catalogCityId?: string) =>
  catalogCityId ? managedOfficesByCity(catalogCityId, 60) : null,
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const cityPage = await getVerticalCityPageContent("office-space", segment);

  if (cityPage) {
    const [metadata, offices] = await Promise.all([
      buildMetadataWithCmsSeoFallback(`/managed-office/${cityPage.city.slug}`, managedOfficeCitySeo(cityPage.city.name)),
      loadCityOffices(cityPage.catalogCityId),
    ]);
    // A city with no managed offices is a thin page: keep it out of Google until inventory exists.
    if (offices && offices.length === 0) {
      return { ...metadata, robots: { index: false, follow: true } };
    }
    return metadata;
  }

  const office = await loadManagedOfficeDetail(segment);
  if (office) {
    const pathname = `/managed-office/${office.slug}`;
    // Per-office SEO from the API, when it is filled in (new_seo first, like workspaces).
    const seo = office.new_seo?.title?.trim() ? office.new_seo : office.seo;
    if (seo?.title?.trim() && seo.status !== false) {
      return buildPageMetadataFromSeo(pathname, seo as unknown as SeoContent);
    }
    return buildMetadataWithCmsSeoFallback(pathname, managedOfficeListingSeo(office));
  }

  notFound();
}

export default async function OfficeSpaceSegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const cityData = await getVerticalCityPageContent("office-space", segment);
  if (cityData) {
    const [seo, initialManagedOffices] = await Promise.all([
      getSeoBySlug(pathnameToSeoSlug(`/managed-office/${cityData.city.slug}`)),
      loadCityOffices(cityData.catalogCityId),
    ]);
    return (
      <VerticalCityPage
        data={{
          ...cityData,
          title: seoPageTitleOrFallback(seo, cityData.title),
          faqs: seoFaqsOrFallback(seo, cityData.faqs),
          initialManagedOffices: initialManagedOffices?.map(managedOfficeCardRow),
        }}
      />
    );
  }

  const office = await loadManagedOfficeDetail(segment);
  if (!office) notFound();

  const cityId = office.location?.city?.id?.trim();
  const similarOffices = cityId
    ? ((await managedOfficesByCity(cityId, 12)) ?? []).filter((o) => o.id !== office.id).slice(0, 6)
    : [];

  return <ManagedOfficeDetailPage office={office} similarOffices={similarOffices} />;
}
