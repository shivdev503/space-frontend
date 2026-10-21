import { resolvePgContactPhone } from "@/lib/pg-contact";
import { extractPgCoordinates, extractPgNearbyPlaces } from "@/lib/pg-nearby";
import { resolvePgListingSlug, slugifyPgName } from "@/lib/pg-slug";
import type { Space } from "@/types";
import type { PgDetail, PgDetailResponse, PgImage, PgPriorityMap } from "@/types/pg.model";
import { isBlockedImageUrl, toSpaceImageCdnUrl } from "@/lib/space-image-url";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function normalizePgPriority(raw: unknown): PgPriorityMap | undefined {
  if (!isRecord(raw)) return undefined;
  const out: PgPriorityMap = {};
  for (const key of ["overall", "location", "micro_location"] as const) {
    const slot = raw[key];
    if (!isRecord(slot)) continue;
    const is_active = slot.is_active === true || slot.is_active === "true";
    const orderRaw = slot.order;
    const order =
      typeof orderRaw === "number" && Number.isFinite(orderRaw)
        ? orderRaw
        : typeof orderRaw === "string"
          ? Number.parseInt(orderRaw, 10)
          : undefined;
    out[key] = {
      is_active,
      ...(order != null && Number.isFinite(order) ? { order } : {}),
    };
  }
  return Object.keys(out).length ? out : undefined;
}

function isMongoObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value.trim());
}

/** Strip path/query so `slug` or `/coliving/foo` → `foo`. */
function normalizeSlugSegment(value: string): string {
  const t = value.trim();
  if (!t) return "";
  if (t.includes("/")) {
    const parts = t.split("/").filter(Boolean);
    return (parts[parts.length - 1] ?? t).trim();
  }
  return t;
}

const SLUG_KEYS = ["slug", "pg_slug", "pgSlug", "url_slug", "urlSlug", "seo_slug"] as const;

/** Read public listing slug from API list/detail row shapes. */
export function pickPgApiSlug(row: Record<string, unknown>): string | undefined {
  for (const key of SLUG_KEYS) {
    const v = row[key];
    if (typeof v === "string" && v.trim()) {
      const seg = normalizeSlugSegment(v);
      if (seg) return seg;
    }
  }

  const pgId = row.pg_id ?? row.pgId;
  if (typeof pgId === "string" && pgId.trim() && !isMongoObjectId(pgId)) {
    return normalizeSlugSegment(pgId);
  }

  return undefined;
}

/**
 * Normalizes one `GET /api/user/pgs` row so `slug` is always on {@link PgDetail}
 * (handles `{ slug, ...fields }`, `{ id, slug, data: {...} }`, etc.).
 */
export function normalizePgListItem(raw: unknown): PgDetail | null {
  if (!isRecord(raw)) return null;

  const nested =
    raw.data != null && isRecord(raw.data) && !Array.isArray(raw.data)
      ? raw.data
      : null;

  const merged: Record<string, unknown> = nested ? { ...nested, ...raw } : { ...raw };
  const slug = pickPgApiSlug(raw) ?? (nested ? pickPgApiSlug(nested) : undefined);

  const name = String(merged.name ?? "").trim();
  if (!name) return null;

  const pg = merged as unknown as PgDetail;
  const nearbyPlaces = extractPgNearbyPlaces(merged);
  const coordinates = extractPgCoordinates(merged) ?? pg.coordinates;
  const priority = normalizePgPriority(merged.priority) ?? pg.priority;
  const contactPhone = resolvePgContactPhone({ ...pg, ...merged } as PgDetail) ?? undefined;

  return {
    ...pg,
    name,
    slug: slug ?? pg.slug?.trim(),
    coordinates,
    nearbyPlaces: nearbyPlaces.length ? nearbyPlaces : pg.nearbyPlaces,
    priority,
    contactPhone,
  };
}

export function normalizePgListItems(raw: unknown[]): PgDetail[] {
  return raw
    .map((row) => normalizePgListItem(row))
    .filter((row): row is PgDetail => row != null);
}

/** Ensures detail envelope `slug` is copied onto `data` for cards and share links. */
export function normalizePgDetailResponse(res: PgDetailResponse): PgDetailResponse {
  const envelopeSlug =
    res.slug?.trim() ||
    pickPgApiSlug(res as unknown as Record<string, unknown>) ||
    pickPgApiSlug(res.data as unknown as Record<string, unknown>);

  const dataSlug = res.data.slug?.trim() || envelopeSlug;
  const contactPhone =
    resolvePgContactPhone(res.data) ??
    resolvePgContactPhone(res as unknown as PgDetail) ??
    undefined;

  return {
    ...res,
    slug: envelopeSlug || res.slug,
    data: {
      ...res.data,
      slug: dataSlug,
      contactPhone: contactPhone ?? res.data.contactPhone,
    },
  };
}

export function pgImagesSorted(images: PgImage[]): string[] {
  return [...images]
    .sort((a, b) => a.order - b.order)
    .map((img) => toSpaceImageCdnUrl(img.image))
    .filter((url) => url && !isBlockedImageUrl(url));
}

/**
 * Listing copy as plain-text paragraphs: `new_description` (HTML) when present,
 * else the legacy plain-text `description`.
 */
export function pgDescriptionParagraphs(pg: Pick<PgDetail, "description" | "new_description">): string[] {
  const html = pg.new_description?.trim();
  const raw = html
    ? html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
    : pg.description ?? "";
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** {@link pgDescriptionParagraphs} joined into one line (meta descriptions, cards). */
export function pgDescriptionText(pg: Pick<PgDetail, "description" | "new_description">): string {
  return pgDescriptionParagraphs(pg).join(" ");
}

export function pgStartingRent(pg: PgDetail): number {
  if (pg.rentRange.min != null) return pg.rentRange.min;
  const rents = pg.rooms.map((r) => r.rent).filter((r): r is number => r != null);
  return rents.length ? Math.min(...rents) : 0;
}

export function pgDetailToSpace(pg: PgDetail, id: string, slug: string): Space {
  const images = pgImagesSorted(pg.images);
  const minRent = pgStartingRent(pg);
  const publicSlug = resolvePgListingSlug(pg, slug);

  return {
    id,
    name: pg.name,
    slug: publicSlug,
    vertical: "coliving",
    brand: pg.postedBy,
    city: slugifyPgName(pg.city),
    location: slugifyPgName(pg.locality),
    address: pg.address,
    images: images.length ? images : [],
    price: minRent,
    spaceTypes: pg.rooms.map((r) => r.type),
    teamSizes: [],
    plans: pg.rooms
      .filter((r) => r.rent != null)
      .map((r) => ({
        name: r.type,
        price: r.rent!,
        unit: "/month",
      })),
    amenities: [...pg.commonAmenities, ...pg.roomAmenities],
    highlights: pg.food.included ? [`Meals: ${pg.food.meals.join(", ")}`] : [],
    description: pgDescriptionText(pg),
    rating: pg.rating,
    isFeatured: pg.verified,
    createdAt: pg.availableFrom ?? new Date().toISOString(),
  };
}
