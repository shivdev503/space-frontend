"use client";

import { CoworkingFilteredListing } from "@/modules/coworking/components/coworking-filtered-listing";
import { Pagination } from "@/modules/city-pages/components/pagination";
import type { LocationPageData } from "@/types";

type LocationListingExperienceProps = {
  data: LocationPageData;
};

export function LocationListingExperience({ data }: LocationListingExperienceProps) {
  if (data.vertical === "coworking" && data.catalogCityId) {
    const listBasePath = `/coworking/${data.citySlug}/${data.locationSlug}`;

    return (
      <CoworkingFilteredListing
        listBasePath={listBasePath}
        catalogCityId={data.catalogCityId}
        locationLabel={data.locationName}
        microLocationId={data.workspaceMicroLocationId}
        seedSpaces={data.spaces}
        initialListing={data.initialCoworkingListing}
        showPopularLocalities={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Pagination
        spaces={data.spaces}
        coworkingWorkspaces={null}
        ctaLabel={data.vertical === "coworking" ? "View Details" : "Get Quote"}
        cardVariant="airbnb"
      />
    </div>
  );
}
