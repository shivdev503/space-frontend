import type { OfficeSpaceModel } from "@/types/office-space.model";
import type { ListingModel } from "@/types/listing.model";

import type { OfficeWizardState } from "../components/office-wizard/use-office-wizard";
import { emptyLocation, keptLocationFields } from "../components/wizard/shared-location-step";
import { mapListingImagesFromApi } from "./map-listing-images";

/**
 * Map API office space (vendor GET) into wizard state for editing.
 */
export function mapOfficeSpaceToOfficeWizardState(
  office: OfficeSpaceModel.OfficeSpace,
): OfficeWizardState {
  const loc = office.location;
  const city = loc?.city;
  const micro = loc?.micro_location;
  const cityId = typeof city === "object" && city && "id" in city ? String(city.id) : "";
  const cityName = typeof city === "object" && city && "name" in city ? String(city.name) : "";
  let microId = "";
  let microName = "";
  if (typeof micro === "object" && micro) {
    microId = String((micro as { id?: string; _id?: string; key?: string }).id
      ?? (micro as { _id?: string })._id
      ?? (micro as { key?: string }).key
      ?? "");
    microName = String((micro as { name?: string }).name ?? "");
  }

  const other = office.other_detail;
  const area = other?.area_for_lease_in_sq_ft;
  const rent = other?.rent_in_sq_ft;
  const officeType = (other?.office_type as ListingModel.OfficeType | string | undefined) ?? "";

  const amenties = office.amenties as ListingModel.Amenity[] | undefined;
  const images = mapListingImagesFromApi(office.images);

  return {
    name: String(office.name ?? "").trim(),
    area: area != null && Number.isFinite(Number(area)) ? String(area) : "",
    rent: rent != null ? String(rent) : "",
    officeType: (officeType as OfficeWizardState["officeType"]) || "",
    description: String(office.description ?? "").trim(),
    amenities: Array.isArray(amenties) ? amenties : [],
    location: {
      ...emptyLocation,
      kept: keptLocationFields(loc),
      cityId,
      cityName,
      microLocationId: microId,
      microLocationName: microName,
      address: String(loc?.address1 ?? loc?.address ?? "").trim(),
      metroLandmark: String(loc?.landmark ?? "").trim(),
      nearByLandmark: String(
        (loc as { nearby_landmark?: string } | undefined)?.nearby_landmark
          // Listings saved before `nearby_landmark` existed kept it in the metro field.
          ?? (loc as { metro_stop_landmark?: string } | undefined)?.metro_stop_landmark
          ?? "",
      ).trim(),
    },
    images,
  };
}
