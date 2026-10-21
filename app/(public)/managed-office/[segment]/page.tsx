import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { VerticalCityPage } from "@/modules/city-pages/vertical-city-page";
import { OfficeSpaceDetailPage } from "@/modules/office-space/office-space-detail-page";
import { getVerticalCityPageContent } from "@/services/cities";
import { loadOfficeSpaceDetail } from "@/services/office-space-detail-api";
import { officeSpacesAsSpaces } from "@/services/office-space-api";
import { toTitleCase } from "@/utils/format";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const cityPage = await getVerticalCityPageContent("office-space", segment);

  if (cityPage) {
    return buildMetadataWithCmsSeoFallback(`/managed-office/${cityPage.city.slug}`, {
      title: cityPage.title,
      description: cityPage.subtitle,
    });
  }

  const office = await loadOfficeSpaceDetail(segment);
  if (office) {
    return buildMetadataWithCmsSeoFallback(`/managed-office/${office.slug}`, {
      title: `${office.name} | Managed Office`,
      description:
        `${office.description ?? ""}`.trim() || "Explore premium managed offices across India.",
    });
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
    return <VerticalCityPage data={cityData} />;
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
