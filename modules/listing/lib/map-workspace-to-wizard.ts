import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { ListingModel } from "@/types/listing.model";

import type { CoworkingHoursState, CoworkingWizardState, DeskTypeSelection } from "../components/coworking-wizard/types";
import { emptyLocation, keptLocationFields } from "../components/wizard/shared-location-step";
import { mapListingImagesFromApi } from "./map-listing-images";

const defaultHours: CoworkingHoursState = {
  weekdayOpen: true,
  weekdayFrom: "09:00 AM",
  weekdayTo: "08:00 PM",
  saturdayOpen: true,
  saturdayFrom: "09:00 AM",
  saturdayTo: "08:00 PM",
  sundayOpen: false,
  sundayFrom: "",
  sundayTo: "",
};

function mapApiHours(
  h: Record<string, CoworkingModel.WorkingHours> | undefined,
): CoworkingHoursState {
  if (!h || typeof h !== "object") return { ...defaultHours };
  const out: CoworkingHoursState = { ...defaultHours };
  const mon = h.monday;
  if (mon?.from?.trim() && mon?.to?.trim() && !mon.is_closed) {
    out.weekdayOpen = true;
    out.weekdayFrom = mon.from.trim();
    out.weekdayTo = mon.to.trim();
  } else {
    out.weekdayOpen = false;
  }
  const sat = h.saturday;
  if (sat?.from?.trim() && sat?.to?.trim() && !sat.is_closed) {
    out.saturdayOpen = true;
    out.saturdayFrom = sat.from.trim();
    out.saturdayTo = sat.to.trim();
  } else {
    out.saturdayOpen = false;
  }
  const sun = h.sunday;
  if (sun?.from?.trim() && sun?.to?.trim() && !sun.is_closed) {
    out.sundayOpen = true;
    out.sundayFrom = sun.from.trim();
    out.sundayTo = sun.to.trim();
  } else {
    out.sundayOpen = false;
  }
  return out;
}

function planToDeskType(p: CoworkingModel.Plan): DeskTypeSelection | null {
  const price = p.price;
  const cat = p.category as
    | (ListingModel.ActiveCategory & { _id?: string })
    | string
    | null
    | undefined;

  if (cat && typeof cat === "object") {
    const id = String((cat as { _id?: string; id?: string })._id ?? (cat as { id?: string }).id ?? p._id ?? "");
    if (!id) return null;
    const name = (cat as { name?: string }).name || "Desk type";
    return {
      id,
      name,
      price: String(price ?? ""),
      raw: { ...cat, id, name } as ListingModel.ActiveCategory,
    };
  }
  if (p._id) {
    return {
      id: p._id,
      name: "Desk type",
      price: String(price ?? ""),
      raw: { id: p._id, name: "Desk type" } as ListingModel.ActiveCategory,
    };
  }
  return null;
}

/**
 * Map API {@link CoworkingModel.WorkSpace} (vendor GET) into wizard state for editing.
 */
export function mapWorkSpaceToCoworkingWizardState(ws: CoworkingModel.WorkSpace): CoworkingWizardState {
  const loc = ws.location;
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

  const deskTypes: DeskTypeSelection[] = [];
  for (const p of ws.plans ?? []) {
    const dt = planToDeskType(p);
    if (dt) deskTypes.push(dt);
  }

  const amenties = ws.amenties as ListingModel.Amenity[] | undefined;
  const images = mapListingImagesFromApi(ws.images);

  return {
    name: String(ws.name ?? "").trim(),
    seats: String(ws.no_of_seats ?? ws.seats ?? "").trim() || "0",
    description: String(ws.description ?? "").trim(),
    deskTypes,
    amenities: Array.isArray(amenties) ? amenties : [],
    hours: mapApiHours(ws.hours_of_operation as Record<string, CoworkingModel.WorkingHours> | undefined),
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
