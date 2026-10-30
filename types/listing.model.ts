/**
 * Host / listing panel wire model.
 *
 * Mirrors the Angular `Listing-Project-master` sources:
 *   - `src/app/model/register.ts`       → {@link ListingModel.VendorRegisterRequest}
 *   - `src/app/model/country.ts`        → {@link ListingModel.Country}, {@link ListingModel.CountryStateCity}
 *   - `src/app/model/amenties.ts`       → {@link ListingModel.Amenity}
 *   - `src/app/model/workspace.ts`      → {@link ListingModel.WorkSpacePayload} & supporting types
 *   - login / validate / vendorDetails  → {@link ListingModel.VendorSession}
 *
 * Nested under a namespace to avoid clashes with app types in `@/types`.
 */

import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { OfficeSpaceModel } from "@/types/office-space.model";

export namespace ListingModel {
  // -------- Auth --------

  export interface VendorLoginRequest {
    phone_number: string;
  }

  export interface VendorValidateOtpRequest {
    phone_number: string;
    otp: string;
  }

  export interface VendorRegisterRequest {
    name: string;
    email: string;
    phone_number: string;
    dial_code: string;
  }

  export interface VendorResendOtpRequest {
    phone_number: string;
    dial_code: string;
  }

  export interface VendorProfilePic {
    s3_link?: string;
  }

  export interface VendorUser {
    id: string;
    name?: string;
    phone_number?: string;
    role?: string;
    email?: string;
    dial_code?: string;
    profile_pic?: VendorProfilePic;
  }

  /** `user/validateVendor` response body (Angular `LoginComponent.validateOtp`). */
  export interface VendorSession {
    token: string;
    data: VendorUser;
  }

  /** `user/vendorGoogleLogin` request: Google ID token, plus name and mobile for a new host. */
  export interface VendorGoogleLoginRequest {
    credential: string;
    name?: string;
    phone_number?: string;
    dial_code?: string;
  }

  /** Either a session, or `needs_phone` when a new host must add their mobile number first. */
  export interface VendorGoogleLoginResponse {
    message?: string;
    token?: string;
    data?: VendorUser;
    needs_phone?: boolean;
    profile?: { name?: string; email?: string };
  }

  // -------- Catalog (amenities, categories, countries, states, cities, microlocations) --------

  export type Amenity = CoworkingModel.Amenity & {
    /** Angular `Amenities.added_on` */
    added_on?: string | Date;
    /** Present on upstream rows (vertical flags). */
    for_coWorking?: boolean;
    for_office?: boolean;
    for_coLiving?: boolean;
    for_flatspace?: boolean;
  };

  /** Angular `Country` (countrystatecity.in). */
  export interface Country {
    id: number | string;
    name: string;
    iso2?: string;
  }

  /** Angular `CountrystateCityModal`. */
  export interface CountryStateCity {
    id: string;
    name: string;
    description?: string;
    country?: unknown;
    state?: unknown;
    city?: unknown;
    icons?: string;
    image?: string;
    for_coWorking?: boolean;
    for_office?: boolean;
    for_coLiving?: boolean;
    for_flatspace?: boolean;
  }

  /** `admin/Active_category` rows (desk types). Same shape as micro-location/amenity. */
  export interface ActiveCategory {
    _id?: string;
    id: string;
    name: string;
    description?: string;
    icons?: string;
    country?: string | null;
    for_coWorking?: boolean;
    for_office?: boolean;
    for_coLiving?: boolean;
    for_flatspace?: boolean;
    active?: boolean;
    added_on?: string | Date;
    updated_on?: string | Date;
  }

  export type MicroLocation = CoworkingModel.MicroLocation;

  // -------- Save payloads --------

  export type HoursOfOperation = CoworkingModel.WorkSpace["hours_of_operation"];
  export type Plan = CoworkingModel.Plan;

  /** Mirrors Angular `coworking-addproperty.component.ts` `reqObj`. */
  export interface WorkSpacePayload {
    id?: string;
    name: string;
    description: string;
    no_of_seats: number;
    desk_types?: string;
    city_name?: string;
    opening_hours?: string;
    hours_of_operation?: HoursOfOperation;
    plans?: Plan[];
    amenties?: Amenity[];
    images?: Array<{ image: unknown; order?: number }> | unknown[];
    location?: Partial<WorkSpaceLocation>;
    user?: string;
    added_by_user?: "seller" | "admin" | string;
  }

  /**
   * Wire-shape of `other_detail` used by Angular upstream `admin/officeSpaces`.
   * Extends {@link OfficeSpaceModel.OfficeSpaceOtherDetail} but loosens numeric
   * fields that the form submits as user-typed strings (e.g. `rent_in_sq_ft`).
   */
  export type OfficeSpaceOtherDetailPayload = Partial<
    Omit<OfficeSpaceModel.OfficeSpaceOtherDetail, "rent_in_sq_ft">
  > & {
    area_for_lease_in_sq_ft: number;
    rent_in_sq_ft: number | string;
    office_type: OfficeType;
  };

  /** Mirrors Angular `add-office-space.component.ts` `reqObj`. */
  export interface OfficeSpacePayload {
    id?: string;
    name: string;
    description: string;
    city_name?: string;
    amenties?: Amenity[];
    images?: Array<{ image: unknown; order?: number }> | unknown[];
    other_detail: OfficeSpaceOtherDetailPayload;
    location?: Partial<WorkSpaceLocation>;
    user?: string;
    added_by_user?: "seller" | "admin" | string;
  }

  /** Common location sub-object shape (Angular `Location`). */
  export interface WorkSpaceLocation {
    name: string;
    address: string;
    address1: string;
    city: string | unknown;
    micro_location: string | unknown;
    country: string;
    state: string;
    postal_code: string;
    landmark: string;
    landmark_distance: string;
    metro_stop_landmark?: string;
    bus_stop_landmark?: string;
    bus_stop_distance?: string;
    ferry_stop_landmark?: string;
    ferry_stop_distance?: string;
    taxi_stand_landmark?: string;
    taxi_stand_distance?: string;
    tram_landmark?: string;
    tram_distance?: string;
    micro_location_string?: string;
    latitude: number;
    longitude: number;
    is_near_metro?: boolean;
    is_bus_stop?: boolean;
    is_ferry_stop?: boolean;
    is_taxi_stand?: boolean;
    is_tram?: boolean;
  }

  // -------- Enums (mirrors Angular enums) --------

  export const Status = {
    PENDING: "pending",
    ENABLE: "approve",
    DISABLE: "reject",
    DELETE: "delete",
  } as const;
  export type StatusValue = (typeof Status)[keyof typeof Status];

  export const Duration = {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
    HOUR: "hour",
  } as const;
  export type DurationValue = (typeof Duration)[keyof typeof Duration];

  export const OfficeTypeEnum = {
    RAW: "raw",
    SEMI_FURNISHED: "semi-furnished",
    FULLY_FURNISHED: "fully-furnished",
  } as const;
  export type OfficeType = (typeof OfficeTypeEnum)[keyof typeof OfficeTypeEnum];

  // -------- Responses (listing read) --------

  export interface VendorWorkSpaceListResponse {
    data: CoworkingModel.WorkSpace[];
    totalRecords?: number;
    message?: string;
  }

  export interface VendorOfficeSpaceListResponse {
    data: OfficeSpaceModel.OfficeSpace[];
    totalRecords?: number;
    message?: string;
  }

  /** Generic `{ message, data }` envelope used by admin endpoints. */
  export interface ApiEnvelope<T> {
    message?: string;
    data: T;
    /**
     * Optional total count returned by paginated endpoints
     * (e.g. `/admin/city/getCityByCountryOnly/:id?page=&limit=&name=`).
     */
    totalRecords?: number;
  }

  /**
   * Single row returned by `POST admin/upload`.
   * Angular consumers then persist `{ image: id, url: s3_link, order }` into
   * the workspace/office `images[]` array.
   */
  export interface UploadedImage {
    id: string;
    s3_link: string;
  }

  /** Canonical in-memory shape used by the listing wizard for each image slot. */
  export interface ListingImage {
    /** Upstream image id (returned from `/api/admin/upload`). */
    image: string;
    /** S3 URL for preview rendering. */
    url: string;
    /** Display order (1-indexed to match Angular). */
    order: number;
  }
}
