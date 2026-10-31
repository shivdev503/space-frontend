import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { seoPageTitleOrFallback } from "@/lib/seo-page-title";
import { managedOfficeLocalitySeo } from "@/lib/seo-templates";
import { MIN_LISTINGS_FOR_LOCALITY_PAGE } from "@/lib/sitemap-public-urls";
import {
  managedOfficeLocalityFacts,
  managedOfficeLocalityFaqs,
} from "@/modules/managed-office/managed-office-location-content";
import { ManagedOfficeLocationPage } from "@/modules/managed-office/managed-office-location-page";
import { loadManagedOfficeLocalityPage } from "@/services/managed-office-location";
import { getSeoBySlug } from "@/services/seo-content";

type PageProps = {
  params: Promise<{ segment: string; location: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment, location } = await params;
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
  return metadata;
}

export default async function ManagedOfficeLocalityRoute({ params }: PageProps) {
  const { segment, location } = await params;
  const page = await loadManagedOfficeLocalityPage(segment, location);
  if (!page) notFound();

  const { cityData, locality, localities } = page;
  const city = cityData.city.name;
  const facts = managedOfficeLocalityFacts(locality.offices);
  const seo = await getSeoBySlug(pathnameToSeoSlug(`/managed-office/${cityData.city.slug}/${locality.slug}`));

  return (
    <ManagedOfficeLocationPage
      cityData={cityData}
      locality={locality}
      localities={localities}
      title={seoPageTitleOrFallback(seo, `Managed Office Space in ${locality.name}, ${city}`)}
      faqs={seoFaqsOrFallback(seo, managedOfficeLocalityFaqs(locality.name, city, facts))}
    />
  );
}
