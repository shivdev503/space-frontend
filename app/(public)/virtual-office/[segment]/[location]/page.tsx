import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { VerticalLocationPage } from "@/modules/location-pages/vertical-location-page";
import { getVerticalLocationPageContent } from "@/services/coworking-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string; location: string }>;
}): Promise<Metadata> {
  const { segment, location } = await params;
  const page = await getVerticalLocationPageContent("virtual-office", segment, location);

  if (!page) notFound();

  return buildMetadataWithCmsSeoFallback(`/virtual-office/${segment}/${location}`, {
    title: page.title,
    description: page.subtitle,
  });
}

export default async function VirtualOfficeLocationPage({
  params,
}: {
  params: Promise<{ segment: string; location: string }>;
}) {
  const { segment, location } = await params;
  const data = await getVerticalLocationPageContent("virtual-office", segment, location);

  if (!data) {
    notFound();
  }

  return <VerticalLocationPage data={data} />;
}
