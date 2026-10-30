/**
 * Host / listing panel HTTP client (axios). Single source of truth for every
 * upstream call the listing section (create/edit coworking space, office space,
 * vendor auth, catalog lookups) makes.
 *
 * Mirrors the Angular `Listing-Project-master` services:
 *   - `login/login-service/login.service.ts`                → auth.vendorLogin / validateVendor / vendorDetails
 *   - `register/register-service/register.service.ts`       → auth.registerVendor / resendOtp / getCountry
 *   - `coworking/coworking-service/coworkingservice.service.ts`
 *   - `office-space/office-service/office-service.service.ts`
 *
 * Follows the existing service pattern (see `coworking-api.ts`, `office-space-api.ts`):
 *   - Shared lazy `axios.create` (`baseURL`, `timeout`, JSON headers)
 *   - Typed request/response functions
 *   - No direct `fetch` — route handlers call these helpers
 *
 * Env:
 *   - Base URL is the shared {@link resolveApiBaseUrl} (local:
 *     `http://localhost:8000`, production: `https://api.spacewallah.com` via
 *     `API_BASE_URL`). The project intentionally talks to a single backend
 *     origin at a time — there is no listing-specific override.
 *   - `LISTING_API_TIMEOUT_MS` — request timeout override.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import {
  resolveListingApiBaseUrl,
  resolveListingApiTimeoutMs,
} from "@/services/env-config";
import {
  buildApiClientHeaders,
  buildApiClientHeadersMultipart,
} from "@/services/api-client-headers";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { OfficeSpaceModel } from "@/types/office-space.model";
import { ListingModel } from "@/types/listing.model";

// --------- Endpoint paths ---------
// Paths are joined against {@link resolveListingApiBaseUrl} (defaults to the
// shared app origin `http://localhost:8000` / `https://api.spacewallah.com`) and
// therefore carry the same `/api/…` prefix the rest of this project uses.

export const listingApiPaths = {
  // auth
  vendorLogin: "/api/user/vendorLogin",
  validateVendor: "/api/user/validateVendor",
  vendorSignUp: "/api/user/vendorSignUp",
  resendOtp: "/api/user/resendOTP",
  vendorGoogleLogin: "/api/user/vendorGoogleLogin",
  vendorDetails: (phone: string) =>
    `/api/user/vendorDetails?phone_number=${encodeURIComponent(phone)}`,

  // catalog
  amenities: "/api/admin/amenties?limit=100",
  activeCategories: "/api/admin/Active_category",
  activeColivingCategories: "/api/admin/Active_colivingCategory",
  countries: "/api/admin/countries",
  statesByCountry: (countryId: string) =>
    `/api/admin/stateByCountry/${encodeURIComponent(countryId)}`,
  citiesByCountry: (countryId: string) =>
    `/api/admin/city/getCityByCountryOnly/${encodeURIComponent(countryId)}`,
  citiesByState: (stateId: string) =>
    `/api/admin/city/getCityByCountryState/${encodeURIComponent(stateId)}`,
  microLocationsByCity: (cityId: string) =>
    `/api/admin/microLocationByCity/${encodeURIComponent(cityId)}`,

  // save / read
  workSpaces: "/api/admin/workSpace",
  workSpaceById: (id: string) => `/api/admin/workSpace/${encodeURIComponent(id)}`,
  officeSpaces: "/api/admin/officeSpaces",
  officeSpaceById: (id: string) =>
    `/api/admin/officeSpaces/${encodeURIComponent(id)}`,
  uploadImage: "/api/admin/upload",

  // vendor-owned listings (same pattern as Angular `userworkSpace`/`userofficeSpaces`)
  userWorkSpace: (id: string) =>
    `/api/admin/userworkSpace/${encodeURIComponent(id)}`,
  userOfficeSpaces: (id: string) =>
    `/api/admin/userofficeSpaces/${encodeURIComponent(id)}`,

  /** Angular `listing.service` — vendor's coworking rows */
  vendorWorkSpaces: (userId: string, limit: number) =>
    `/api/admin/workSpaces?userid=${encodeURIComponent(userId)}&limit=${limit}`,
  /** Angular `listing.service` — vendor's office rows */
  vendorOfficeSpacesList: (userId: string, limit: number) =>
    `/api/admin/officeSpaces?userid=${encodeURIComponent(userId)}&limit=${limit}`,

  /** Host PG / co-living listing create (Angular admin PG save) */
  adminPg: "/api/admin/pg",
  adminPgById: (id: string) => `/api/admin/pg/${encodeURIComponent(id)}`,
  /** Vendor PG listings — `GET /api/admin/pgs?userId=&limit=` */
  adminPgs: (userId: string, limit: number) =>
    `/api/admin/pgs?userId=${encodeURIComponent(userId)}&limit=${limit}`,
} as const;

// --------- Axios instance ---------

let listingAxios: AxiosInstance | null = null;

function getListingAxios(): AxiosInstance {
  const timeoutMs = resolveListingApiTimeoutMs();
  if (!listingAxios) {
    listingAxios = axios.create({
      baseURL: resolveListingApiBaseUrl(),
      timeout: timeoutMs,
      headers: buildApiClientHeaders(),
    });
  } else {
    listingAxios.defaults.baseURL = resolveListingApiBaseUrl();
    listingAxios.defaults.timeout = timeoutMs;
  }
  return listingAxios;
}

function withToken(
  token?: string | null,
  init?: AxiosRequestConfig,
): AxiosRequestConfig {
  if (!token) return init ?? {};
  return {
    ...(init ?? {}),
    headers: {
      ...(init?.headers ?? {}),
      token,
    },
  };
}

/** Standardized result shape so route handlers can forward `status` + `data`. */
export type ListingApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  message?: string;
};

function toSuccess<T>(res: AxiosResponse<T>): ListingApiResult<T> {
  return { ok: true, status: res.status, data: res.data };
}

function toFailure<T>(err: unknown): ListingApiResult<T> {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 502;
    const data = (err.response?.data as T) ?? null;
    const baseUrl = resolveListingApiBaseUrl();
    const isTimeout =
      err.code === "ECONNABORTED" || /timeout/i.test(err.message ?? "");
    const isNetwork =
      !err.response &&
      (err.code === "ECONNREFUSED" ||
        err.code === "ENOTFOUND" ||
        err.code === "ECONNRESET" ||
        err.code === "EAI_AGAIN");
    let message =
      (err.response?.data as { message?: string } | undefined)?.message ||
      err.message;
    if (isTimeout) {
      message = `Upstream at ${baseUrl} did not respond in time (${resolveListingApiTimeoutMs()}ms). If this is /city/getCityByCountryOnly, the backend likely does not have the India country document (id 6231ae062a52af3ddaa73a39) seeded.`;
    } else if (isNetwork) {
      message = `Could not reach backend at ${baseUrl} (${err.code ?? "network error"}). Check API_BASE_URL in .env.local.`;
    }
    return { ok: false, status, data, message };
  }
  if (err instanceof Error) {
    return { ok: false, status: 502, data: null, message: err.message };
  }
  return { ok: false, status: 502, data: null, message: "Upstream error" };
}

// =========================================================================
// Auth (mirrors Angular `LoginService` / `RegisterService`)
// =========================================================================

export async function vendorLogin(
  payload: ListingModel.VendorLoginRequest,
): Promise<ListingApiResult<{ message?: string }>> {
  try {
    const res = await getListingAxios().post(listingApiPaths.vendorLogin, payload);
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function validateVendor(
  payload: ListingModel.VendorValidateOtpRequest,
): Promise<ListingApiResult<ListingModel.VendorSession>> {
  try {
    const res = await getListingAxios().post<ListingModel.VendorSession>(
      listingApiPaths.validateVendor,
      payload,
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function vendorGoogleLogin(
  payload: ListingModel.VendorGoogleLoginRequest,
): Promise<ListingApiResult<ListingModel.VendorGoogleLoginResponse>> {
  try {
    const res = await getListingAxios().post<ListingModel.VendorGoogleLoginResponse>(
      listingApiPaths.vendorGoogleLogin,
      payload,
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function registerVendor(
  payload: ListingModel.VendorRegisterRequest,
): Promise<ListingApiResult<{ message?: string }>> {
  try {
    const res = await getListingAxios().post(listingApiPaths.vendorSignUp, payload);
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function resendVendorOtp(
  payload: ListingModel.VendorResendOtpRequest,
): Promise<ListingApiResult<{ message?: string }>> {
  try {
    const res = await getListingAxios().post(listingApiPaths.resendOtp, payload);
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getVendorDetails(
  phone_number: string,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.VendorUser>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.vendorDetails(phone_number),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

// =========================================================================
// Catalog (amenities, categories, countries, states, cities, microlocations)
// =========================================================================

export async function getListingAmenities(
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.Amenity[]>>> {
  try {
    const res = await getListingAxios().get(listingApiPaths.amenities, withToken(token));
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getListingActiveCategories(
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.ActiveCategory[]>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.activeCategories,
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getListingCountries(
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.CountryStateCity[]>>> {
  try {
    const res = await getListingAxios().get(listingApiPaths.countries, withToken(token));
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getListingStatesByCountry(
  countryId: string,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.CountryStateCity[]>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.statesByCountry(countryId),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export type ListCitiesQuery = {
  /** 1-indexed page number — matches the upstream `?page=` param. */
  page?: number;
  /** Page size (`?limit=`). Defaults server-side to the upstream's default. */
  limit?: number;
  /** Case-insensitive substring search against city `name`. */
  name?: string;
};

export async function getListingCitiesByCountry(
  countryId: string,
  token?: string | null,
  query?: ListCitiesQuery,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.CountryStateCity[]>>> {
  try {
    const params: Record<string, string | number> = {};
    if (query?.page != null) params.page = query.page;
    if (query?.limit != null) params.limit = query.limit;
    if (query?.name && query.name.trim().length > 0) params.name = query.name.trim();

    const res = await getListingAxios().get(
      listingApiPaths.citiesByCountry(countryId),
      { ...withToken(token), params },
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getListingCitiesByState(
  stateId: string,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.CountryStateCity[]>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.citiesByState(stateId),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export type ListMicroLocationsQuery = {
  /** 1-indexed page number — matches the upstream `?page=` param. */
  page?: number;
  /** Page size (`?limit=`). Defaults server-side to the upstream's default. */
  limit?: number;
  /** Case-insensitive substring search against micro-location `name`. */
  name?: string;
};

export async function getListingMicroLocationsByCity(
  cityId: string,
  token?: string | null,
  query?: ListMicroLocationsQuery,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<ListingModel.MicroLocation[]>>> {
  try {
    const params: Record<string, string | number> = {};
    if (query?.page != null) params.page = query.page;
    if (query?.limit != null) params.limit = query.limit;
    if (query?.name && query.name.trim().length > 0) params.name = query.name.trim();

    const res = await getListingAxios().get(
      listingApiPaths.microLocationsByCity(cityId),
      { ...withToken(token), params },
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

// =========================================================================
// Image upload (admin/upload)
// =========================================================================
//
// Uses native `fetch` instead of the shared axios instance because axios v1
// in Node 18+ cannot compute the multipart boundary for the Web-standard
// `FormData` (it relies on `form-data`'s `getBoundary()`). `fetch` handles
// this natively via the WHATWG Streams implementation.

export async function uploadListingImage(
  formData: FormData,
  token?: string | null,
): Promise<
  ListingApiResult<ListingModel.ApiEnvelope<ListingModel.UploadedImage[]>>
> {
  const base = resolveListingApiBaseUrl();
  const url = `${base}${listingApiPaths.uploadImage}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildApiClientHeadersMultipart(token ? { token } : undefined),
      body: formData,
    });

    const data = (await res.json().catch(() => null)) as
      | ListingModel.ApiEnvelope<ListingModel.UploadedImage[]>
      | null;

    return {
      ok: res.ok,
      status: res.status,
      data,
      message: !res.ok
        ? (data as { message?: string } | null)?.message || res.statusText
        : undefined,
    };
  } catch (err) {
    return toFailure(err);
  }
}

// =========================================================================
// Save payload builders (mirror Angular `submit()` shape used in the
// coworking-addproperty and add-office-space components).
// =========================================================================

const DEFAULT_COUNTRY_ID = "6231ae062a52af3ddaa73a39"; // Angular upstream default (India).

const EMPTY_DAY = {
  from: " ",
  to: " ",
  should_show: false,
  is_closed: false,
  is_open_24: false,
} as const;

const DEFAULT_HOURS_OF_OPERATION = {
  monday: { ...EMPTY_DAY, should_show: true },
  tuesday: { ...EMPTY_DAY },
  wednesday: { ...EMPTY_DAY },
  thursday: { ...EMPTY_DAY },
  friday: { ...EMPTY_DAY },
  saturday: { ...EMPTY_DAY },
  sunday: { ...EMPTY_DAY },
};

const DEFAULT_LOCATION: ListingModel.WorkSpaceLocation = {
  name: "",
  address: "",
  address1: "",
  city: "",
  micro_location: "",
  country: DEFAULT_COUNTRY_ID,
  state: "",
  postal_code: "",
  landmark: "",
  landmark_distance: "",
  metro_stop_landmark: "",
  bus_stop_landmark: "",
  bus_stop_distance: "",
  ferry_stop_landmark: "",
  ferry_stop_distance: "",
  taxi_stand_landmark: "",
  taxi_stand_distance: "",
  tram_landmark: "",
  tram_distance: "",
  micro_location_string: "",
  latitude: 13.08673,
  longitude: 80.204496,
  is_near_metro: false,
  is_bus_stop: false,
  is_ferry_stop: false,
  is_taxi_stand: false,
  is_tram: false,
};

export function buildWorkSpaceUpstreamPayload(
  input: Partial<ListingModel.WorkSpacePayload> & {
    /** legacy alias used by older forms */
    Property_name?: string;
    no_of_seats?: number | string;
  },
  userId?: string,
): ListingModel.WorkSpacePayload {
  const name = String(input.name ?? input.Property_name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const no_of_seats = Number(input.no_of_seats ?? 0) || 0;

  return {
    name,
    description,
    no_of_seats,
    desk_types: input.desk_types ?? "",
    city_name: input.city_name ?? "",
    opening_hours: input.opening_hours ?? "",
    hours_of_operation: (input.hours_of_operation ?? DEFAULT_HOURS_OF_OPERATION) as
      CoworkingModel.WorkSpace["hours_of_operation"],
    plans: Array.isArray(input.plans) ? input.plans : [],
    amenties: Array.isArray(input.amenties) ? input.amenties : [],
    images: Array.isArray(input.images) ? input.images : [],
    location: { ...DEFAULT_LOCATION, ...(input.location ?? {}) },
    ...(userId ? { user: userId } : {}),
    added_by_user: input.added_by_user ?? "seller",
  };
}

export function buildOfficeSpaceUpstreamPayload(
  input: Partial<ListingModel.OfficeSpacePayload> & {
    Property_name?: string;
    area_for_lease_in_sq_ft?: number | string;
    rent_in_sq_ft?: number | string;
    office_type?: string;
  },
  userId?: string,
): ListingModel.OfficeSpacePayload {
  const name = String(input.name ?? input.Property_name ?? "").trim();
  const description = String(input.description ?? "").trim();

  const other_detail = {
    ...(input.other_detail ?? {}),
    area_for_lease_in_sq_ft:
      Number(
        input.other_detail?.area_for_lease_in_sq_ft ??
          input.area_for_lease_in_sq_ft ??
          0,
      ) || 0,
    rent_in_sq_ft:
      input.other_detail?.rent_in_sq_ft ?? input.rent_in_sq_ft ?? "",
    office_type: ((input.other_detail?.office_type as string | undefined) ??
      input.office_type ??
      ListingModel.OfficeTypeEnum.FULLY_FURNISHED) as ListingModel.OfficeType,
  };

  return {
    name,
    description,
    city_name: input.city_name ?? "",
    amenties: Array.isArray(input.amenties) ? input.amenties : [],
    images: Array.isArray(input.images) ? input.images : [],
    other_detail,
    location: { ...DEFAULT_LOCATION, ...(input.location ?? {}) },
    ...(userId ? { user: userId } : {}),
    added_by_user: input.added_by_user ?? "seller",
  };
}

// =========================================================================
// Save / read coworking workspace (admin/workSpace)
// =========================================================================

export async function saveListingWorkSpace(
  payload: ListingModel.WorkSpacePayload,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<CoworkingModel.WorkSpace>>> {
  try {
    const { id, ...body } = payload;
    const path = id ? listingApiPaths.workSpaceById(id) : listingApiPaths.workSpaces;
    const method = id ? "put" : "post";
    const res = await getListingAxios().request({
      url: path,
      method,
      data: body,
      ...withToken(token),
    });
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getUserWorkSpaceById(
  id: string,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<CoworkingModel.WorkSpace>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.userWorkSpace(id),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

// =========================================================================
// Save / read office space (admin/officeSpaces)
// =========================================================================

export async function saveListingOfficeSpace(
  payload: ListingModel.OfficeSpacePayload,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<OfficeSpaceModel.OfficeSpace>>> {
  try {
    const { id, ...body } = payload;
    const path = id ? listingApiPaths.officeSpaceById(id) : listingApiPaths.officeSpaces;
    const method = id ? "put" : "post";
    const res = await getListingAxios().request({
      url: path,
      method,
      data: body,
      ...withToken(token),
    });
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getUserOfficeSpaceById(
  id: string,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<OfficeSpaceModel.OfficeSpace>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.userOfficeSpaces(id),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

// =========================================================================
// Vendor listing lists (Angular `listing.service` getCoworking/Office listing)
// =========================================================================

export async function getVendorCoworkingListings(
  userId: string,
  limit: number,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<CoworkingModel.WorkSpace[]>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.vendorWorkSpaces(userId, limit),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getVendorOfficeListings(
  userId: string,
  limit: number,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<OfficeSpaceModel.OfficeSpace[]>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.vendorOfficeSpacesList(userId, limit),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

// =========================================================================
// Save PG / co-living host listing (`POST /api/admin/pg`)
// =========================================================================

export async function saveListingPg(
  payload: Record<string, unknown> & { id?: string },
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<unknown>>> {
  try {
    const { id, ...body } = payload;
    const path = id ? listingApiPaths.adminPgById(id) : listingApiPaths.adminPg;
    const method = id ? "put" : "post";
    const res = await getListingAxios().request({
      url: path,
      method,
      data: body,
      ...withToken(token),
    });
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export type VendorPgListingRow = {
  _id?: string;
  id?: string;
  name?: string;
  city?: string;
  locality?: string;
  status?: string;
  added_on?: string;
  form_status?: string;
  image?: string;
  images?: Array<
    | string
    | {
        image?: string | { id?: string; s3_link?: string; url?: string };
        order?: number;
        s3_link?: string;
        url?: string;
      }
  >;
};

export async function getVendorPgListings(
  userId: string,
  limit: number,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<VendorPgListingRow[]>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.adminPgs(userId, limit),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}

export async function getAdminPgById(
  id: string,
  token?: string | null,
): Promise<ListingApiResult<ListingModel.ApiEnvelope<Record<string, unknown>>>> {
  try {
    const res = await getListingAxios().get(
      listingApiPaths.adminPgById(id),
      withToken(token),
    );
    return toSuccess(res);
  } catch (err) {
    return toFailure(err);
  }
}
