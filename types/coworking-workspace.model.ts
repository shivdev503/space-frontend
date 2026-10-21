/**
 * Canonical coworking workspace wire model — aligned with backend Angular classes
 * (WorkSpace, Location, Plan, Brand, etc.). Use `CoworkingModel.*` or re-exports from
 * `coworking-workspace-api.ts` (`CoworkingApiWorkspace`, …).
 *
 * Nested under a namespace so names like `City` / `Brand` do not clash with app types in `index.ts`.
 */

import type { SeoContent } from "@/types/seo.model";

export namespace CoworkingModel {
  export interface SeoMeta {
    description: string;
    status: boolean;
    title: string;
    footer_title?: string;
    footer_description?: string;  
    keywords?: string;
    page_title?: string;
    script?: string;
    robots?: string;
    faqs?: unknown[];
  }

  export interface BrandImageAsset {
    id: string;
    name: string;
    real_name: string;
    s3_link: string;
  }

  export interface Brand {
    id: string;
    name: string;
    description: string;
    slug: string;
    should_show_on_home: string;
    trusted_user?: string;
    image: BrandImageAsset;
    seo: SeoMeta;
    cities: unknown[];
    brand_tag?: string;
    brand_tag_line?: string;
    logo_tag_line?: string;
    review?: string;
    images: Image[];
  }

  export interface City {
    id: string;
    icon: string;
    name: string;
    for_coWorking: boolean;
    for_office: boolean;
    for_coLiving: boolean;
    locations: string[];
  }

  export interface MicroLocation {
    id: string;
    icon: string;
    name: string;
    for_coWorking: boolean;
    for_office: boolean;
    for_coLiving: boolean;
    /** From micro-location-by-city API / app routes when not the same as `id`. */
    slug?: string;
    /** Workspace list `micro_location` value when different from `id`. */
    key?: string;
  }

  export interface Location {
    name: string;
    floor: number;
    address: string;
    address1: string;
    address2: string;
    city: City;
    micro_location: MicroLocation;
    state: string;
    country: string;
    postal_code: string;
    landmark: string;
    landmark_distance: string;
    latitude: number;
    longitude: number;
    metro_detail: {
      distance: number;
      is_near_metro: boolean;
      name: string;
    };
    shuttle_point: {
      distance: number;
      is_near: boolean;
      name: string;
    };
  }

  export interface Facility {
    desks: number;
    lounge: number;
    table: number;
  }

  export interface Amenity {
    id: string;
    category: string;
    name: string;
    icon: string;
  }

  export interface Plan {
    duration?: string;
    number_of_items?: number;
    _id?: string;
    category: unknown;
    price: number;
    should_show?: boolean;
  }

  export interface ImageAsset {
    id: string;
    name: string;
    real_name: string;
    s3_link: string;
    /** Storage folder (e.g. `images`) — CDN URL is `img.spacewallah.com/{folder_name}/{name}`. */
    folder_name?: string;
    title: string;
    alt?: string;
    brightness?: number;
    contrast?: number;
  }

  export interface Image {
    order: number;
    image: ImageAsset;
  }

  export interface Geometry {
    type: "Point";
    coordinates: unknown;
  }

  export interface PriceFilter {
    minPrice: number;
    maxPrice: number;
    postTitle?: string;
    preTitle?: string;
    isTitle?: boolean;
    postTitleSign?: boolean;
  }

  export interface SizeFilter {
    minSize: number;
    maxSize: number;
    postTitle?: string;
    preTitle?: string;
    isTitle?: boolean;
  }

  export interface SpaceContactDetails {
    name?: string;
    email?: string;
    phone?: string;
    show_on_website?: boolean;
  }

  export interface WorkingHours {
    should_show: boolean;
    is_closed: boolean;
    is_open_24: boolean;
    from: string;
    to: string;
  }

  export interface WorkingDays {
    day: string;
    time: WorkingHours;
  }

  export interface Calendar {
    date: Date | string;
    status: string;
    seats: number;
    state?: string;
  }

  /** Root coworking workspace document (API / Mongo). */
  export interface WorkSpace {
    _id: string;
    id: string;
    name: string;
    productId: string;
    country_dbname: string;
    currency_code: string;
    description: string;
    /** Rewritten listing copy (HTML) — preferred over `description` when present. */
    new_description?: string;
    email: string;
    website_Url: string;
    location: Location;
    facilities: Facility;
    /** Primary / hero image URL or key */
    image: string;
    images: Image[];
    likes: unknown[];
    status: string;
    plans: Plan[];
    coliving_plans: unknown[];
    seats: number;
    price?: unknown;
    spaceTag?: string;
    ratings?: string;
    is_favorite: boolean;
    price_type: string;
    starting_price: number;
    show_price: boolean;
    /** API field name (typo preserved for wire compatibility). */
    amenties: Amenity[];
    rooms: unknown[];
    contact_details: unknown[];
    no_of_seats: number;
    geometry: Geometry;
    slug: string;
    brand: Brand;
    hours_of_operation: Record<string, WorkingHours>;
    seo: SeoMeta;
    /** Current per-space SEO (same shape as CMS SEO) — preferred over `seo`. */
    new_seo?: SeoContent;
    virtualSeo?: SeoMeta;
    space_type?: string;
    options: {
      zoom: number;
    };
    space_contact_details: SpaceContactDetails;
    calendar?: Calendar[];
  }

  export const WorkSpacePlan = {
    HOT_DESK: "hot-desk",
    DEDICATED_DESK: "dedicated-desk",
    DAY_PASS: "day-pass",
    PRIVATE_CABIN: "private-cabin",
    VIRTUAL_OFFICE: "virtual-office",
  } as const;

  export type WorkSpacePlanSlug = (typeof WorkSpacePlan)[keyof typeof WorkSpacePlan];

  export const WorkSpaceDay = {
    DAY_PASS: "day",
  } as const;

  export type WorkSpaceDaySlug = (typeof WorkSpaceDay)[keyof typeof WorkSpaceDay];

  /** Maps plan slug → human label (mirrors backend enum). */
  export const WorkSpacePlanTypeLabels: Record<string, string> = {
    "hot-desk": "hot desk",
    "Day Pass": "Day Pass",
    "private-cabin": "private cabin",
    "dedicated-desk": "dedicated desk",
    "dedicated-pass": "dedicated pass",
    "virtual-office": "virtual office",
  };

  /**
   * List: `/api/user/workSpaces` → `{ message, data, totalRecords, locations }`.
   * Detail: `/api/user/workSpace/:slug` → `{ message, data: WorkSpace }`.
   */
  export interface WorkSpacesListResponse {
    data: WorkSpace[];
    meta?: {
      limit?: number;
      page?: number;
      total?: number;
      /** From wire `totalRecords` when present. */
      totalRecords?: number;
      returned?: number;
      cityId?: string;
      citySlug?: string;
      source?: string;
      message?: string;
      /** From wire `locations` (e.g. Google geocoding results). */
      googleLocations?: unknown;
    };
  }
}
