import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { VerticalLocationPage } from "@/modules/location-pages/vertical-location-page";
import { getVerticalLocationPageContent } from "@/services/coworking-api";
import { toTitleCase } from "@/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string; location: string }>;
}): Promise<Metadata> {
  const { segment, location } = await params;
  const page = await getVerticalLocationPageContent("office-space", segment, location);

  if (!page) {
    return buildMetadataWithCmsSeoFallback(`/managed-office/${segment}/${location}`, {
      title: `Managed Office in ${toTitleCase(location)}, ${toTitleCase(segment)}`,
      description: "Discover managed office options in this location.",
    });
  }

  return buildMetadataWithCmsSeoFallback(`/managed-office/${segment}/${location}`, {
    title: page.title,
    description: page.subtitle,
  });
}

export default async function OfficeSpaceLocationPage({
  params,
}: {
  params: Promise<{ segment: string; location: string }>;
}) {
  const { segment, location } = await params;
  const data = await getVerticalLocationPageContent("office-space", segment, location);

  if (!data) {
    notFound();
  }

  return <VerticalLocationPage data={data} />;
}
