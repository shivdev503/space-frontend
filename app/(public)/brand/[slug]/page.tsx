import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildMetadataWithCmsSeoFallback } from "@/lib/metadata-with-cms-seo";
import { buildPageMetadataFromSeo } from "@/lib/seo-metadata";
import { BrandPage } from "@/modules/brand/brand-page";
import { brandWorkspacesInCity, loadBrandPageData } from "@/services/brand-api";

type BrandRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string }>;
};

export async function generateMetadata({ params }: BrandRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadBrandPageData(slug);
  if (!data) notFound();
  // City-filtered views share the brand page's canonical URL.
  const pathname = `/brand/${slug.trim().toLowerCase()}`;

  if (data.brand.seo) return buildPageMetadataFromSeo(pathname, data.brand.seo);

  const { name } = data.brand;
  const count = data.workspaces.length;
  return buildMetadataWithCmsSeoFallback(pathname, {
    title: `${name} Coworking Spaces in India | ${count} Centres`,
    description: `Compare ${count} ${name} coworking centres across ${data.cities.length} cities with real prices and photos. Book a free tour with zero brokerage.`,
  });
}

export default async function BrandRoute({ params, searchParams }: BrandRouteProps) {
  const [{ slug }, { city }] = await Promise.all([params, searchParams]);
  const data = await loadBrandPageData(slug);
  if (!data) notFound();

  const activeCity = data.cities.find((c) => c.slug === city?.trim().toLowerCase())?.slug;
  return <BrandPage data={data} workspaces={brandWorkspacesInCity(data, activeCity)} activeCity={activeCity} />;
}
