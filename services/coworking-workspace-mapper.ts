import type { Space, SpaceImageAdjustment, SpaceVertical } from "@/types";
import { resolveCatalogIdToSlug } from "@/services/catalog-city-id";
import { CoworkingModel } from "@/types/coworking-workspace.model";
import {
  coworkingPlanCategoryLabel,
  resolveWorkspaceStartingPrice,
  withResolvedStartingPrice,
} from "@/services/workspace-plan-pricing";
import { toTitleCase } from "@/utils/format";
import { workspaceDescriptionHtml } from "@/lib/coworking-workspace-content";
import { spaceImageUrl, toSpaceImageCdnUrl } from "@/lib/space-image-url";

function emptySeo(title: string, description: string): CoworkingModel.SeoMeta {
  return {
    description,
    status: true,
    title,
    keywords: "",
  };
}

function stubBrand(brandName: string): CoworkingModel.Brand {
  const slug = brandName.toLowerCase().replace(/\s+/g, "-");
  return {
    id: slug,
    name: brandName,
    description: "",
    slug,
    should_show_on_home: "true",
    image: { id: "", name: "", real_name: "", s3_link: "" },
    seo: emptySeo(brandName, ""),
    cities: [],
    images: [],
  };
}

const closedDay: CoworkingModel.WorkingHours = {
  should_show: false,
  is_closed: true,
  is_open_24: false,
  from: "",
  to: "",
};

function defaultHours(): Record<string, CoworkingModel.WorkingHours> {
  return {
    monday: closedDay,
    tuesday: closedDay,
    wednesday: closedDay,
    thursday: closedDay,
    friday: closedDay,
    saturday: closedDay,
    sunday: closedDay,
  };
}

function seedPlansToApiPlans(plans: Space["plans"]): CoworkingModel.Plan[] {
  return plans.map((p, i) => ({
    _id: `plan_${i}`,
    category: p.name,
    price: p.price,
    should_show: true,
  }));
}

function seedImagesToApiImages(urls: string[]): {
  hero: string;
  gallery: CoworkingModel.Image[];
} {
  const [first, ...rest] = urls.length ? urls : [""];
  const gallery: CoworkingModel.Image[] = rest.map((url, order) => ({
    order,
    image: {
      id: `img_${order}`,
      name: "",
      real_name: "",
      s3_link: url,
      title: "",
    },
  }));
  return { hero: first ?? "", gallery };
}

function buildLocation(space: Space, catalogCityId: string): CoworkingModel.Location {
  const cityDisplay = toTitleCase(space.city);
  const microDisplay = toTitleCase(space.location);

  return {
    name: space.name,
    floor: 0,
    address: space.address,
    address1: space.address,
    address2: "",
    city: {
      id: catalogCityId,
      icon: "",
      name: cityDisplay,
      for_coWorking: true,
      for_office: true,
      for_coLiving: false,
      locations: [],
    },
    micro_location: {
      id: space.location,
      icon: "",
      name: microDisplay,
      for_coWorking: true,
      for_office: false,
      for_coLiving: false,
    },
    state: "",
    country: "India",
    postal_code: "",
    landmark: "",
    landmark_distance: "",
    latitude: 0,
    longitude: 0,
    metro_detail: { distance: 0, is_near_metro: false, name: "" },
    shuttle_point: { distance: 0, is_near: false, name: "" },
  };
}

const defaultGeometry: CoworkingModel.Geometry = {
  type: "Point",
  coordinates: [0, 0],
};

/**
 * Maps app seed {@link Space} to {@link CoworkingModel.WorkSpace} for `/api/user/workSpaces` mock responses.
 */
export function mapSeedSpaceToCoworkingWorkspace(
  space: Space,
  catalogCityId: string,
): CoworkingModel.WorkSpace {
  const plans = seedPlansToApiPlans(space.plans);
  const { hero, gallery } = seedImagesToApiImages(space.images);

  const base: CoworkingModel.WorkSpace = {
    _id: space.id,
    id: space.id,
    name: space.name,
    productId: space.id,
    country_dbname: "india",
    currency_code: "INR",
    description: space.description,
    email: "",
    website_Url: "",
    location: buildLocation(space, catalogCityId),
    facilities: { desks: 0, lounge: 0, table: 0 },
    image: hero,
    images: gallery,
    likes: [],
    status: "active",
    plans,
    coliving_plans: [],
    seats: space.teamSizes.length ? 10 : 0,
    is_favorite: false,
    price_type: "monthly",
    starting_price: 0,
    show_price: true,
    amenties: space.amenities.map((name, i) => ({
      id: `amenity_${i}`,
      category: "general",
      name,
      icon: "",
    })),
    rooms: [],
    contact_details: [],
    no_of_seats: space.teamSizes.length ? 10 : 0,
    geometry: defaultGeometry,
    slug: space.slug,
    brand: stubBrand(space.brand),
    hours_of_operation: defaultHours(),
    seo: emptySeo(space.name, space.description),
    space_type: space.spaceTypes[0],
    options: { zoom: 12 },
    space_contact_details: {},
  };

  return withResolvedStartingPrice(base);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function workspaceWireId(rec: Record<string, unknown>): string {
  const a = rec._id;
  const b = rec.id;
  if (typeof a === "string" && a.trim()) return a.trim();
  if (typeof b === "string" && b.trim()) return b.trim();
  if (a != null && typeof a === "object" && "$oid" in a) {
    const oid = (a as { $oid?: unknown }).$oid;
    if (typeof oid === "string" && oid.trim()) return oid.trim();
  }
  return "";
}

/** True if object looks like a coworking workspace document from the wire. */
export function isCoworkingWorkspaceShape(v: unknown): v is CoworkingModel.WorkSpace {
  if (!isRecord(v)) return false;
  const id = workspaceWireId(v);
  return Boolean(id) && typeof v.slug === "string" && v.slug.length > 0;
}

function coerceWorkspaceRow(item: Record<string, unknown>): CoworkingModel.WorkSpace | null {
  const _id = workspaceWireId(item);
  const slug = item.slug;
  if (!_id || typeof slug !== "string" || !slug.trim()) return null;
  const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : _id;
  const plans = Array.isArray(item.plans) ? (item.plans as CoworkingModel.Plan[]) : [];
  return withResolvedStartingPrice({ ...item, _id, id, plans } as CoworkingModel.WorkSpace);
}

/**
 * Normalizes `GET /api/user/workSpaces` JSON:
 * `{ message, data: workSpaces[], totalRecords, locations }` (plus optional `meta` from callers).
 */
export function normalizeCoworkingWorkspacesPayload(
  raw: unknown,
  extraMeta?: CoworkingModel.WorkSpacesListResponse["meta"],
): CoworkingModel.WorkSpacesListResponse {
  if (Array.isArray(raw)) {
    const data = raw
      .filter(isRecord)
      .map((item) => coerceWorkspaceRow(item))
      .filter((w): w is CoworkingModel.WorkSpace => w != null);
    return { data, meta: extraMeta };
  }

  if (!isRecord(raw)) {
    return { data: [], meta: extraMeta };
  }

  const dataArr = Array.isArray(raw.data) ? raw.data : [];
  const data: CoworkingModel.WorkSpace[] = dataArr
    .filter(isRecord)
    .map((item) => coerceWorkspaceRow(item))
    .filter((w): w is CoworkingModel.WorkSpace => w != null);

  const meta: CoworkingModel.WorkSpacesListResponse["meta"] = { ...extraMeta };
  if (typeof raw.message === "string" && raw.message.trim()) {
    meta.message = raw.message.trim();
  }
  const totalRecords = raw.totalRecords;
  if (typeof totalRecords === "number" && Number.isFinite(totalRecords)) {
    meta.totalRecords = totalRecords;
    meta.total = totalRecords;
  }
  if (Array.isArray(raw.locations)) {
    meta.googleLocations = raw.locations;
  }

  return { data, meta: Object.keys(meta).length > 0 ? meta : undefined };
}

/**
 * `GET /api/user/workSpace/:slug` → `{ message, data: result }` (workspace document).
 * Falls back to a root-level document for mocks/tests.
 */
export function parseCoworkingWorkspaceSinglePayload(raw: unknown): CoworkingModel.WorkSpace | null {
  if (!isRecord(raw)) return null;
  if (isRecord(raw.data)) {
    const ws = coerceWorkspaceRow(raw.data);
    if (ws) return ws;
  }
  return coerceWorkspaceRow(raw);
}

/** App route city slug for links and mock-db filters (catalog id → slug, else name). */
export function deriveAppCitySlugFromWorkspace(ws: CoworkingModel.WorkSpace): string {
  const id = ws.location?.city?.id?.trim();
  if (id) {
    const slug = resolveCatalogIdToSlug(id);
    if (slug) return slug;
  }
  const name = ws.location?.city?.name?.trim().toLowerCase() ?? "";
  if (name === "gurugram") return "gurgaon";
  if (name) return name.replace(/\s+/g, "-");
  return "unknown";
}

function adjustmentFromImageAsset(
  asset: CoworkingModel.ImageAsset | undefined,
): SpaceImageAdjustment | undefined {
  if (!asset) return undefined;
  const b = asset.brightness;
  const c = asset.contrast;
  const out: SpaceImageAdjustment = {};
  if (typeof b === "number" && Number.isFinite(b) && b !== 1) out.brightness = b;
  if (typeof c === "number" && Number.isFinite(c) && c !== 1) out.contrast = c;
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Hero + gallery URLs in display order, with optional per-index tone metadata from the wire. */
export function buildWorkspaceGalleryMedia(ws: CoworkingModel.WorkSpace): {
  images: string[];
  imageAdjustments?: Array<SpaceImageAdjustment | undefined>;
} {
  const images: string[] = [];
  const imageAdjustments: Array<SpaceImageAdjustment | undefined> = [];
  const sortedRows = [...(ws.images ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const add = (url: string, asset: CoworkingModel.ImageAsset | undefined) => {
    const trimmed = url.trim();
    if (!trimmed || images.includes(trimmed)) return;
    images.push(trimmed);
    imageAdjustments.push(adjustmentFromImageAsset(asset));
  };

  const hero = ws.image?.trim();
  if (hero) {
    const match = sortedRows.find((r) => r.image?.s3_link?.trim() === hero);
    add(match ? spaceImageUrl(match.image) : toSpaceImageCdnUrl(hero), match?.image);
  }
  for (const row of sortedRows) {
    add(spaceImageUrl(row.image), row.image);
  }

  if (images.length === 0) {
    images.push("");
    imageAdjustments.push(undefined);
  }

  const hasAnyAdjustment = imageAdjustments.some((a) => a != null && Object.keys(a).length > 0);
  return {
    images,
    imageAdjustments: hasAnyAdjustment ? imageAdjustments : undefined,
  };
}

type ApiSpaceVertical = Extract<SpaceVertical, "coworking" | "virtual-office">;

/** VO listing “starting from” = lowest **Business Address** plan `/month` (not coworking desk min). */
function resolveVirtualOfficeHeroMonthlyPrice(ws: CoworkingModel.WorkSpace): number {
  let minBa: number | null = null;
  for (const p of ws.plans ?? []) {
    const label = coworkingPlanCategoryLabel(p).trim().toLowerCase();
    if (!label.includes("business address")) continue;
    const raw = p.price;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n)) continue;
    if (minBa === null || n < minBa) minBa = n;
  }
  if (minBa != null) return minBa;

  const sp = ws.starting_price;
  if (typeof sp === "number" && Number.isFinite(sp) && sp > 0) return sp;

  let minAny: number | null = null;
  for (const p of ws.plans ?? []) {
    const raw = p.price;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n)) continue;
    if (minAny === null || n < minAny) minAny = n;
  }
  if (minAny != null) return minAny;

  return resolveWorkspaceStartingPrice(ws);
}

function apiWorkspaceToSpace(ws: CoworkingModel.WorkSpace, citySlug: string, vertical: ApiSpaceVertical): Space {
  const planNames = ws.plans?.length
    ? ws.plans.map((p) => coworkingPlanCategoryLabel(p))
    : vertical === "virtual-office"
      ? ["Virtual office"]
      : ["Coworking"];

  const { images, imageAdjustments } = buildWorkspaceGalleryMedia(ws);

  const amenityNames = (ws.amenties ?? []).map((a) => a.name).filter(Boolean);
  const starting =
    vertical === "virtual-office"
      ? resolveVirtualOfficeHeroMonthlyPrice(ws)
      : typeof ws.starting_price === "number" && Number.isFinite(ws.starting_price)
        ? ws.starting_price
        : resolveWorkspaceStartingPrice(ws);

  const planUnit = vertical === "virtual-office" ? "/month" : "/seat/month";
  const appPlans =
    ws.plans?.map((p) => ({
      name: coworkingPlanCategoryLabel(p),
      price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
      unit: planUnit,
    })) ?? [];

  return {
    id: ws.id || ws._id,
    name: ws.name,
    slug: ws.slug,
    vertical,
    brand: ws.brand?.name ?? "",
    city: citySlug,
    location: ws.location?.micro_location?.id ?? ws.location?.micro_location?.name ?? "central",
    address: [ws.location?.address, ws.location?.address1].filter(Boolean).join(", ") || "",
    images,
    ...(imageAdjustments ? { imageAdjustments } : {}),
    price: starting,
    spaceTypes: ws.space_type ? [ws.space_type] : planNames,
    teamSizes: ["1-5", "6-20"],
    plans: appPlans.length ? appPlans : [{ name: "From", price: starting, unit: planUnit }],
    amenities: amenityNames.length ? amenityNames : ["WiFi"],
    highlights: amenityNames.slice(0, 8),
    description: workspaceDescriptionHtml(ws),
    rating: ws.ratings ? Number.parseFloat(ws.ratings) || 0 : 0,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Maps {@link CoworkingModel.WorkSpace} → app {@link Space} for listing cards (city page, grids, detail).
 */
export function coworkingApiWorkspaceToSpace(ws: CoworkingModel.WorkSpace, citySlug: string): Space {
  return apiWorkspaceToSpace(ws, citySlug, "coworking");
}

/** Same wire as coworking; {@link Space.vertical} `virtual-office` and plan units suited to VO listings. */
export function virtualOfficeApiWorkspaceToSpace(ws: CoworkingModel.WorkSpace, citySlug: string): Space {
  return apiWorkspaceToSpace(ws, citySlug, "virtual-office");
}
