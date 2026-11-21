import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pageFromSearchParams, withPageMetadata } from "@/lib/pagination-metadata";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { managedOfficeLocalitySeo } from "@/lib/seo-templates";
import { MIN_LISTINGS_FOR_LOCALITY_PAGE } from "@/lib/sitemap-public-urls";
import {
  managedOfficeLocalityFacts,
  managedOfficeLocalityFaqs,
} from "@/modules/managed-office/managed-office-location-content";
import { MANAGED_OFFICE_PAGE_SIZE } from "@/modules/managed-office/managed-office-format";
import { ManagedOfficeLocationPage } from "@/modules/managed-office/managed-office-location-page";
import { loadManagedOfficeLocalityPage } from "@/services/managed-office-location";
import { getSeoBySlug } from "@/services/seo-content";

type PageProps = {
  params: Promise<{ segment: string; location: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ segment, location }, sp] = await Promise.all([params, searchParams]);
  const page = await loadManagedOfficeLocalityPage(segment, location);
  if (!page) notFound();

  const { cityData, locality } = page;
  const metadata = await buildMetadataWithCmsSeoFallback(
    `/managed-office/${cityData.city.slug}/${locality.slug}`,
    managedOfficeLocalitySeo(locality.name, cityData.city.name, managedOfficeLocalityFacts(locality.offices)),
  );
  // Too few offices to be useful in search: same bar as the locality sitemap.
  if (locality.offices.length < MIN_LISTINGS_FOR_LOCALITY_PAGE) {
    return { ...metadata, robots: { index: false, follow: true } };
  }
  return withPageMetadata(metadata, sp);
}

export default async function ManagedOfficeLocalityRoute({ params, searchParams }: PageProps) {
  const [{ segment, location }, sp] = await Promise.all([params, searchParams]);
  const page = await loadManagedOfficeLocalityPage(segment, location);
  if (!page) notFound();

  const { cityData, locality, localities } = page;
  const listingPage = pageFromSearchParams(sp);
  const totalPages = Math.max(1, Math.ceil(locality.offices.length / MANAGED_OFFICE_PAGE_SIZE));
  // A page number past the end is not a page.
  if (listingPage > totalPages) notFound();
  const city = cityData.city.name;
  const facts = managedOfficeLocalityFacts(locality.offices);
  const seo = await getSeoBySlug(pathnameToSeoSlug(`/managed-office/${cityData.city.slug}/${locality.slug}`));

  return (
    <ManagedOfficeLocationPage
      cityData={cityData}
      locality={locality}
      localities={localities}
      listingPage={listingPage}
      totalPages={totalPages}
      title={seoPageTitleOrFallback(seo, `Managed Office Space in ${locality.name}, ${city}`)}
      faqs={seoFaqsOrFallback(seo, managedOfficeLocalityFaqs(locality.name, city, facts))}
    />
  );
}
