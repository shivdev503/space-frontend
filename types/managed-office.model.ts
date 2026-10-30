/**
 * Managed office model (`GET /api/user/managedOffices`, `GET /api/user/managedOffice/:slug`).
 * Shares location / images / amenities / brand / hours / seo shapes with {@link CoworkingModel.WorkSpace}.
 */

import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { SeoContent } from "@/types/seo.model";

export namespace ManagedOfficeModel {
  export type SeatType = "warm_shell" | "ready_to_move_in" | "bare_shell";

  export interface Plan {
    _id?: string;
    category?: { _id?: string; id?: string; name?: string } | string;
    seat_type?: SeatType;
    duration?: "month" | "year" | "week" | "day" | "hour";
    /** Price per seat for the duration; 0 means price on request. */
    price?: number;
    number_of_items?: number;
    should_show?: boolean;
  }

  export interface Floor {
    floor_number?: number;
    area?: number;
    seats?: number;
  }

  export interface Building {
    total_floors?: number;
    super_area?: number;
    total_seats?: number;
    floors?: Floor[];
  }

  export interface LeaseTerms {
    min_seats?: number;
    min_duration_months?: number;
  }

  export interface Rating {
    source?: string;
    average?: number;
    total?: number;
  }

  export type Location = Partial<CoworkingModel.Location> & {
    building_name?: string;
    /** Locality text when it isn't linked to a micro location. */
    micro_location_string?: string;
    metro_stop_landmark?: string;
    metro_stop_distance?: string;
    is_near_metro?: boolean;
  };

  export interface ManagedOffice {
    _id: string;
    id: string;
    name: string;
    slug: string;
    description?: string;
    /** Rewritten listing copy (HTML) — preferred over `description` when present. */
    new_description?: string;
    images?: CoworkingModel.Image[];
    /** API field name (typo preserved for wire compatibility). */
    amenties?: CoworkingModel.Amenity[];
    location?: Location;
    geometry?: CoworkingModel.Geometry;
    hours_of_operation?: Record<string, CoworkingModel.WorkingHours>;
    plans?: Plan[];
    /** Lowest visible monthly seat price; `null` when on request. */
    starting_price?: number | null;
    building?: Building;
    lease_terms?: LeaseTerms;
    rating?: Rating;
    centre_type?: "managed_office" | "coworking";
    is_new_launch?: boolean;
    no_of_seats?: number;
    brand?: CoworkingModel.Brand;
    seo?: CoworkingModel.SeoMeta;
    new_seo?: SeoContent;
    status?: string;
  }

  export interface ListResponse {
    message?: string;
    data?: ManagedOffice[];
    totalRecords?: number;
  }

  export interface DetailResponse {
    message?: string;
    data?: ManagedOffice;
  }
}
