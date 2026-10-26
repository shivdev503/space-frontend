"use client";

import { CoworkingFilteredListing } from "@/modules/coworking/components/coworking-filtered-listing";
import type { CityPageData } from "@/types";

export function CoworkingCityListing({
  data,
  showPopularLocalities = true,
}: {
  data: CityPageData;
  showPopularLocalities?: boolean;
}) {
  const localityFallback = data.popularLocations.map((loc) => ({
    name: loc.name,
    slug: loc.slug,
  }));

  return (
    <CoworkingFilteredListing
      listBasePath={`/coworking/${data.city.slug}`}
      catalogCityId={data.catalogCityId ?? ""}
      locationLabel={data.city.name}
      seedSpaces={data.spaces}
      initialListing={data.initialCoworkingListing}
      showPopularLocalities={showPopularLocalities}
      popularLocalities={
        data.catalogCityId
          ? {
              catalogCityId: data.catalogCityId,
              citySlug: data.city.slug,
              fallbackLocations: localityFallback,
            }
          : undefined
      }
    />
  );
}
