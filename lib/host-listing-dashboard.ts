import { buildWorkspaceGalleryMedia } from "@/services/coworking-workspace-mapper";
import type { VendorPgListingRow } from "@/services/listing-api";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { OfficeSpaceModel } from "@/types/office-space.model";

export type HostListingKind = "coworking" | "office" | "coliving";

export type HostListingCard = {
  kind: HostListingKind;
  id: string;
  name: string;
  city: string;
  locality: string;
  status: string;
  imageUrl: string;
  editHref: string;
  sortDate: number;
};

const PLACEHOLDERS: Record<HostListingKind, string> = {
  coworking:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
  office:
    "https://img.spacewallah.com/images/original/29f7c32fae7798c9733f5b891af3e0ded7031a85.jpg",
  coliving:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
};

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function pickUrl(...candidates: (string | undefined | null)[]): string | null {
  for (const c of candidates) {
    const t = c?.trim();
    if (t && isHttpUrl(t)) return t;
  }
  return null;
}

function thumbFromCoworking(ws: CoworkingModel.WorkSpace): string {
  const { images } = buildWorkspaceGalleryMedia(ws);
  const first = images.find((u) => u.trim().length > 0);
  return first || PLACEHOLDERS.coworking;
}

function thumbFromOffice(office: OfficeSpaceModel.OfficeSpace): string {
  return thumbFromCoworking(office);
}

function thumbFromPgRow(row: VendorPgListingRow & Record<string, unknown>): string {
  const rootImage = typeof row.image === "string" ? row.image : "";
  const direct = pickUrl(rootImage);
  if (direct) return direct;

  const images = row.images;
  if (Array.isArray(images) && images.length > 0) {
    const sorted = [...images].sort((a, b) => {
      const ao = typeof a === "object" && a && "order" in a ? Number((a as { order?: number }).order) : 0;
      const bo = typeof b === "object" && b && "order" in b ? Number((b as { order?: number }).order) : 0;
      return ao - bo;
    });

    for (const item of sorted) {
      if (typeof item === "string") {
        const url = pickUrl(item);
        if (url) return url;
        continue;
      }
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        const nested = rec.image;
        if (typeof nested === "string") {
          const url = pickUrl(nested);
          if (url) return url;
        }
        if (nested && typeof nested === "object") {
          const asset = nested as { s3_link?: string; url?: string };
          const url = pickUrl(asset.s3_link, asset.url);
          if (url) return url;
        }
        const url = pickUrl(
          typeof rec.s3_link === "string" ? rec.s3_link : undefined,
          typeof rec.url === "string" ? rec.url : undefined,
        );
        if (url) return url;
      }
    }
  }

  return PLACEHOLDERS.coliving;
}

function cityFromWorkSpace(ws: CoworkingModel.WorkSpace): string {
  const loc = ws.location;
  if (typeof loc?.city === "object" && loc.city && "name" in loc.city) {
    return String((loc.city as { name: string }).name);
  }
  return "";
}

function localityFromWorkSpace(ws: CoworkingModel.WorkSpace): string {
  const loc = ws.location;
  if (typeof loc?.micro_location === "object" && loc.micro_location && "name" in loc.micro_location) {
    return String((loc.micro_location as { name: string }).name);
  }
  return "";
}

function parseAddedOn(raw: unknown): number {
  if (typeof raw === "string" || typeof raw === "number") {
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

export function mapCoworkingToHostCard(ws: CoworkingModel.WorkSpace): HostListingCard {
  const id = String(ws.id || (ws as { _id?: string })._id || "");
  const raw = ws as CoworkingModel.WorkSpace & { added_on?: string };
  return {
    kind: "coworking",
    id,
    name: String(ws.name || "Untitled").trim() || "Untitled",
    city: cityFromWorkSpace(ws),
    locality: localityFromWorkSpace(ws),
    status: String(ws.status || "—"),
    imageUrl: thumbFromCoworking(ws),
    editHref: `/add/coworking-space?edit=${encodeURIComponent(id)}`,
    sortDate: parseAddedOn(raw.added_on),
  };
}

export function mapOfficeToHostCard(office: OfficeSpaceModel.OfficeSpace): HostListingCard {
  const id = String(office.id || (office as { _id?: string })._id || "");
  const raw = office as OfficeSpaceModel.OfficeSpace & { added_on?: string };
  return {
    kind: "office",
    id,
    name: String(office.name || "Untitled").trim() || "Untitled",
    city: cityFromWorkSpace(office),
    locality: localityFromWorkSpace(office),
    status: String(office.status || "—"),
    imageUrl: thumbFromOffice(office),
    editHref: `/add/office-space?edit=${encodeURIComponent(id)}`,
    sortDate: parseAddedOn(raw.added_on),
  };
}

export function mapPgToHostCard(row: VendorPgListingRow): HostListingCard {
  const id = String(row.id || row._id || "");
  const rec = row as VendorPgListingRow & Record<string, unknown>;
  return {
    kind: "coliving",
    id,
    name: String(row.name || "Untitled").trim() || "Untitled",
    city: String(row.city || "").trim(),
    locality: String(row.locality || "").trim(),
    status: String(row.status || row.form_status || "—"),
    imageUrl: thumbFromPgRow(rec),
    editHref: `/add/coliving-space?edit=${encodeURIComponent(id)}`,
    sortDate: parseAddedOn(row.added_on),
  };
}

export function kindLabel(kind: HostListingKind): string {
  if (kind === "coworking") return "Coworking";
  if (kind === "office") return "Office space";
  return "PG & Co-living";
}

export type StatusTone = "active" | "pending" | "neutral";

export function statusTone(status: string): StatusTone {
  const s = status.trim().toLowerCase();
  if (s === "active" || s === "published" || s === "live" || s === "approved") return "active";
  if (s === "pending" || s === "in review" || s === "draft" || s === "submitted") return "pending";
  return "neutral";
}

export function formatListingDate(ts: number): string | null {
  if (!ts) return null;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(ts));
  } catch {
    return null;
  }
}
