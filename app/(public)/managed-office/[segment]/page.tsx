import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { cache } from "react";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pageFromSearchParams, withPageMetadata } from "@/lib/pagination-metadata";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { buildPageMetadataFromSeo } from "@/lib/seo-metadata";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { managedOfficeCitySeo, managedOfficeListingSeo } from "@/lib/seo-templates";
import { VerticalCityPage } from "@/modules/city-pages/vertical-city-page";
import { ManagedOfficeDetailPage } from "@/modules/managed-office/managed-office-detail-page";
import { buildingForListing } from "@/services/building-api";
import { getVerticalCityPageContent } from "@/services/cities";
import { MANAGED_OFFICE_PAGE_SIZE, managedOfficeCardRow, managedOfficeImages } from "@/modules/managed-office/managed-office-format";
import { loadManagedOfficeDetail, managedOfficesByCity } from "@/services/managed-office-api";
import { getSeoBySlug } from "@/services/seo-content";
import type { SeoContent } from "@/types/seo.model";


type SearchParams = Record<string, string | string[] | undefined>;

/** Every managed office in a city (shared by metadata and the page within one request); paged on the server. */
const loadCityOffices = cache(async (catalogCityId?: string) =>
  catalogCityId ? managedOfficesByCity(catalogCityId, 1000) : null,
);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ segment: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const [{ segment }, sp] = await Promise.all([params, searchParams]);
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
    return withPageMetadata(metadata, sp);
  }

  const office = await loadManagedOfficeDetail(segment);
  if (office) {
    const pathname = `/managed-office/${office.slug}`;
    // Per-office SEO from the API, when it is filled in (new_seo first, like workspaces).
    const photos = managedOfficeImages(office).images;
    const seo = office.new_seo?.title?.trim() ? office.new_seo : office.seo;
    if (seo?.title?.trim() && seo.status !== false) {
      return buildPageMetadataFromSeo(pathname, seo as unknown as SeoContent, photos);
    }
    return buildMetadataWithCmsSeoFallback(pathname, managedOfficeListingSeo(office), photos);
  }

  notFound();
}

export default async function OfficeSpaceSegmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ segment: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ segment }, sp] = await Promise.all([params, searchParams]);
  const cityData = await getVerticalCityPageContent("office-space", segment);
  if (cityData) {
    const [seo, initialManagedOffices] = await Promise.all([
      getSeoBySlug(pathnameToSeoSlug(`/managed-office/${cityData.city.slug}`)),
      loadCityOffices(cityData.catalogCityId),
    ]);
    const listingPage = pageFromSearchParams(sp);
    // A page number past the end is not a page.
    if (listingPage > Math.max(1, Math.ceil((initialManagedOffices?.length ?? 0) / MANAGED_OFFICE_PAGE_SIZE))) {
      notFound();
    }
    return (
      <VerticalCityPage
        data={{
          ...cityData,
          title: seoPageTitleOrFallback(seo, cityData.title),
          faqs: seoFaqsOrFallback(seo, cityData.faqs),
          initialManagedOffices: initialManagedOffices?.map(managedOfficeCardRow),
          listingPage,
        }}
      />
    );
  }

  const office = await loadManagedOfficeDetail(segment);
  if (!office) notFound();

  const cityId = office.location?.city?.id?.trim();
  const [cityOffices, building] = await Promise.all([
    cityId ? managedOfficesByCity(cityId, 12) : Promise.resolve(null),
    buildingForListing("managed-office", office.slug),
  ]);
  const similarOffices = (cityOffices ?? []).filter((o) => o.id !== office.id).slice(0, 6);

  return <ManagedOfficeDetailPage office={office} similarOffices={similarOffices} building={building} />;
}
