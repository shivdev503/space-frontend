/** Single PG — returned inside list `data[]` and detail `data` */
export interface PgCoordinates {
  lat: number;
  lng: number;
}

export interface PgReview {
  status: string;
  rating: number;
  feedback: string;
  date: string;
}

export interface PgNoticePeriod {
  required: boolean;
  days: number;
}

export interface PgMaintenanceCharge {
  applicable: boolean;
  amount: number | null;
}

export interface PgFood {
  included: boolean;
  meals: string[];
}

export interface PgLaundry {
  available: boolean;
  schedule: string;
}

export interface PgParking {
  available: boolean;
  vehicleType: string;
}

export interface PgRoom {
  type: string;
  rent: number | null;
  deposit: number | null;
}

export interface PgRentRange {
  min: number | null;
  max: number | null;
}

export interface PgImage {
  image: string;
  order: number;
}

export interface PgNearbyPlace {
  name: string;
  dist: string;
}

export type PgPriorityType = "overall" | "location" | "micro_location";

export type PgPrioritySlot = {
  is_active?: boolean;
  order?: number;
};

export type PgPriorityMap = Partial<Record<PgPriorityType, PgPrioritySlot>>;

export interface PgDetail {
  /** Public URL segment for `/coliving/[slug]` — from API when present. */
  slug?: string;
  /** When set, marks featured slots from `GET /api/user/pgs` priority ordering. */
  priority?: PgPriorityMap;
  name: string;
  city: string;
  locality: string;
  address: string;
  street: string;
  coordinates?: PgCoordinates;
  rating: number;
  reviews: PgReview[];
  noticePeriod: PgNoticePeriod;
  maintenanceCharge: PgMaintenanceCharge;
  food: PgFood;
  rules: string[];
  laundry: PgLaundry;
  roomCleaning: boolean;
  water: boolean;
  parking: PgParking;
  commonAmenities: string[];
  roomAmenities: string[];
  gateClosing: boolean;
  preferredGuests: string;
  type: string;
  availableFrom?: string;
  postedBy: string;
  /** Operator / listing phone when returned by the PG API. */
  contactPhone?: string;
  contactSchedule: string;
  description: string;
  /** Rewritten listing copy (HTML) — preferred over `description` when present. */
  new_description?: string;
  verified: boolean;
  status: string;
  rooms: PgRoom[];
  rentRange: PgRentRange;
  images: PgImage[];
  /** Parsed from API / location connectivity fields when available. */
  nearbyPlaces?: PgNearbyPlace[];
}

export interface PgListResponse {
  message: string;
  data: PgDetail[];
  totalRecords: number;
}

export interface PgDetailResponse {
  message: string;
  id: string;
  slug: string;
  data: PgDetail;
}

export type PgListParams = {
  city?: string;
  locality?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  foodIncluded?: boolean;
  parking?: boolean;
  preferredGuest?: string;
  type?: string;
  limit?: number;
  page?: number;
  skip?: number;
  sortBy?: string;
  orderBy?: 1 | -1;
  /** `overall` | `location` | `micro_location` — featured PGs first when set. */
  priorityType?: PgPriorityType;
  priority_type?: PgPriorityType;
  /** Catalog city Mongo `_id`; required for `location` / `micro_location`. */
  priorityCity?: string;
  priority_city?: string;
  /** Virtual-office city priority rail (not coliving). */
  virtualPriority?: boolean;
  virtual_priority?: boolean;
  /** When true, return only active priority PGs for the type. */
  priorityOnly?: boolean;
  priority_only?: boolean;
};
