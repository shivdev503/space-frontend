import { spaceImageUrl } from "@/lib/space-image-url";
import type { ImageGalleryAdjustment } from "@/modules/space-detail/components/space-detail-gallery";
import type { ManagedOfficeModel } from "@/types/managed-office.model";

const SEAT_TYPE_LABELS: Record<ManagedOfficeModel.SeatType, string> = {
  warm_shell: "Warm shell",
  ready_to_move_in: "Ready to move in",
  bare_shell: "Bare shell",
};

export function seatTypeLabel(type?: ManagedOfficeModel.SeatType): string {
  return type ? SEAT_TYPE_LABELS[type] ?? "" : "";
}

/** Lowest visible monthly seat price, or `null` when every plan is on request. */
export function managedOfficeStartingPrice(office: ManagedOfficeModel.ManagedOffice): number | null {
  if (typeof office.starting_price === "number" && office.starting_price > 0) return office.starting_price;
  const prices = (office.plans ?? [])
    .filter((p) => p.should_show !== false && typeof p.price === "number" && p.price > 0)
    .map((p) => p.price as number);
  return prices.length ? Math.min(...prices) : null;
}

export function managedOfficeLocality(office: ManagedOfficeModel.ManagedOffice): string {
  return (
    office.location?.micro_location?.name?.trim() ||
    office.location?.micro_location_string?.trim() ||
    ""
  );
}

export function managedOfficeCityName(office: ManagedOfficeModel.ManagedOffice): string {
  return office.location?.city?.name?.trim() || "";
}

/** "Micro location, City". */
export function managedOfficePlace(office: ManagedOfficeModel.ManagedOffice): string {
  return [managedOfficeLocality(office), managedOfficeCityName(office)].filter(Boolean).join(", ");
}

export function managedOfficeCitySlugish(office: ManagedOfficeModel.ManagedOffice): string {
  return (managedOfficeCityName(office) || "city").toLowerCase().replace(/\s+/g, "-");
}

export function managedOfficeImages(office: ManagedOfficeModel.ManagedOffice): {
  images: string[];
  imageAdjustments: ImageGalleryAdjustment[];
} {
  const rows: { src: string; brightness: number; contrast: number }[] = [];
  const sorted = [...(office.images ?? [])].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  for (const row of sorted) {
    const src = spaceImageUrl(row?.image);
    if (!src || rows.some((r) => r.src === src)) continue;
    const brightness = Number(row?.image?.brightness);
    const contrast = Number(row?.image?.contrast);
    rows.push({
      src,
      brightness: Number.isFinite(brightness) && brightness > 0 ? brightness : 1,
      contrast: Number.isFinite(contrast) && contrast > 0 ? contrast : 1,
    });
  }
  return {
    images: rows.map((r) => r.src),
    imageAdjustments: rows.map((r) => ({ brightness: r.brightness, contrast: r.contrast })),
  };
}

/** What a listing card reads: rows serialized to the browser don't need the rest. */
export function managedOfficeCardRow(office: ManagedOfficeModel.ManagedOffice): ManagedOfficeModel.ManagedOffice {
  const firstImage = [...(office.images ?? [])].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)).slice(0, 1);
  return {
    _id: office._id,
    id: office.id,
    name: office.name,
    slug: office.slug,
    images: firstImage,
    location: {
      building_name: office.location?.building_name,
      city: office.location?.city,
      micro_location: office.location?.micro_location,
      micro_location_string: office.location?.micro_location_string,
    },
    plans: office.plans,
    starting_price: office.starting_price,
    rating: office.rating,
    lease_terms: office.lease_terms,
    is_new_launch: office.is_new_launch,
  };
}

/** Description HTML/text, preferring the rewritten copy. */
export function managedOfficeDescription(office: ManagedOfficeModel.ManagedOffice): string {
  return office.new_description?.trim() || office.description?.trim() || "";
}

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

/** Day rows for an opening-hours list: `[{ day: "Monday", value: "08:00 AM – 08:00 PM" }]`. */
export function managedOfficeHours(office: ManagedOfficeModel.ManagedOffice): { day: string; value: string }[] {
  const hours = office.hours_of_operation ?? {};
  return DAY_ORDER.flatMap((day) => {
    const row = hours[day] as
      | { from?: string; to?: string; is_closed?: boolean; is_open_24?: boolean }
      | undefined;
    if (!row) return [];
    const label = day[0].toUpperCase() + day.slice(1);
    if (row.is_closed) return [{ day: label, value: "Closed" }];
    if (row.is_open_24) return [{ day: label, value: "Open 24 hours" }];
    if (row.from && row.to) return [{ day: label, value: `${row.from} – ${row.to}` }];
    return [];
  });
}
