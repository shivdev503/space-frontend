import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { buildPageMetadataFromSeo } from "@/lib/seo-metadata";
import { seoFaqsOrFallback } from "@/lib/seo-page-faqs";
import { managedOfficeCitySeo, managedOfficeListingSeo } from "@/lib/seo-templates";
import { VerticalCityPage } from "@/modules/city-pages/vertical-city-page";
import { OfficeSpaceDetailPage } from "@/modules/office-space/office-space-detail-page";
import { getVerticalCityPageContent } from "@/services/cities";
import { loadOfficeSpaceDetail } from "@/services/office-space-detail-api";
import { officeSpacesAsSpaces } from "@/services/office-space-api";
import { getSeoBySlug } from "@/services/seo-content";
import type { SeoContent } from "@/types/seo.model";
import { toTitleCase } from "@/utils/format";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const cityPage = await getVerticalCityPageContent("office-space", segment);

  if (cityPage) {
    return buildMetadataWithCmsSeoFallback(
      `/managed-office/${cityPage.city.slug}`,
      managedOfficeCitySeo(cityPage.city.name),
    );
  }

  const office = await loadOfficeSpaceDetail(segment);
  if (office) {
    const pathname = `/managed-office/${office.slug}`;
    // Per-office SEO from the API, when it is filled in.
    if (office.seo?.title?.trim() && office.seo.status !== false) {
      return buildPageMetadataFromSeo(pathname, office.seo as unknown as SeoContent);
    }
    return buildMetadataWithCmsSeoFallback(pathname, managedOfficeListingSeo(office));
  }

  return buildMetadataWithCmsSeoFallback(`/managed-office/${segment}`, {
    title: `${toTitleCase(segment)} | Managed Office`,
    description: "Explore premium managed offices across top cities in India.",
  });
}

export default async function OfficeSpaceSegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const cityData = await getVerticalCityPageContent("office-space", segment);
  if (cityData) {
    const seo = await getSeoBySlug(pathnameToSeoSlug(`/managed-office/${cityData.city.slug}`));
    return <VerticalCityPage data={{ ...cityData, faqs: seoFaqsOrFallback(seo, cityData.faqs) }} />;
  }

  const office = await loadOfficeSpaceDetail(segment);
  if (!office) notFound();

  const cityId = office.location?.city?.id?.trim();
  const similarOffices = cityId
    ? ((await officeSpacesAsSpaces(cityId, 12)) ?? [])
        .filter((o) => (o.id || o._id) !== (office.id || office._id))
        .slice(0, 6)
    : [];

  return <OfficeSpaceDetailPage office={office} similarOffices={similarOffices} />;
}
