import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { toTitleCase } from "@/utils/format";

import {
  managedOfficeCityName,
  managedOfficeHours,
  managedOfficeLocality,
  seatTypeLabel,
} from "../../managed-office-format";

type Office = ManagedOfficeModel.ManagedOffice;

/**
 * Page title. Imported rows often store only the brand ("awfis"), so add the building or locality:
 * "Awfis WOCO One, Udyog Vihar".
 */
export function managedOfficeTitle(office: Office): string {
  const name = office.name?.trim() || "Managed office";
  const brand = office.brand?.name?.trim() || "";
  const building = office.location?.building_name?.replace(/\s+/g, " ").trim() || "";
  const locality = managedOfficeLocality(office);
  const isBrandOnly = Boolean(brand) && name.toLowerCase() === brand.toLowerCase();
  const base = isBrandOnly ? brand : name === name.toLowerCase() ? toTitleCase(name) : name;
  if (!isBrandOnly) return base;
  const where = [building, locality].filter(Boolean).filter((part) => !base.toLowerCase().includes(part.toLowerCase()));
  return where.length ? `${base} ${where.join(", ")}` : base;
}

/** Visible plans with a readable name: "Warm shell" / "Office Space". */
export function managedOfficePlans(office: Office) {
  return (office.plans ?? [])
    .filter((plan) => plan.should_show !== false)
    .map((plan) => {
      const category =
        typeof plan.category === "object" ? plan.category?.name?.trim() || "" : String(plan.category ?? "").trim();
      const seat = seatTypeLabel(plan.seat_type);
      const description =
        typeof plan.category === "object" ? (plan.category as { description?: string })?.description?.trim() || "" : "";
      const price = typeof plan.price === "number" && plan.price > 0 ? plan.price : 0;
      return {
        key: plan._id || `${seat}-${category}-${price}`,
        name: seat || category || "Office space",
        category: seat && category ? category : "",
        description,
        price,
        unit: plan.duration && plan.duration !== "month" ? `/ seat / ${plan.duration}` : "/ seat / mo",
      };
    });
}

export function managedOfficeMinSeats(office: Office): number {
  return office.lease_terms?.min_seats ?? 0;
}

/** "24 months" / "1 year". */
export function managedOfficeLockIn(office: Office): string {
  const months = office.lease_terms?.min_duration_months ?? 0;
  if (!months) return "";
  if (months % 12 === 0) return `${months / 12} year${months === 12 ? "" : "s"}`;
  return `${months} month${months === 1 ? "" : "s"}`;
}

/** Seat type labels across plans ("Warm shell", "Ready to move in"). */
export function managedOfficeSeatTypes(office: Office): string[] {
  return Array.from(new Set((office.plans ?? []).map((p) => seatTypeLabel(p.seat_type)).filter(Boolean)));
}

/** Groups identical days: "Mon – Fri: 09:00 AM – 06:00 PM · Sat, Sun: Closed". */
export function managedOfficeHoursSummary(office: Office): string {
  const rows = managedOfficeHours(office);
  if (!rows.length) return "";
  const groups: { days: string[]; value: string }[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.value === row.value) last.days.push(row.day.slice(0, 3));
    else groups.push({ days: [row.day.slice(0, 3)], value: row.value });
  }
  return groups
    .map((g) => `${g.days.length > 2 ? `${g.days[0]} – ${g.days[g.days.length - 1]}` : g.days.join(", ")}: ${g.value}`)
    .join(" · ");
}

export function managedOfficeMetro(office: Office): { name: string; distance: string } | null {
  const name = office.location?.metro_stop_landmark?.trim() || "";
  if (!name) return null;
  return { name: /metro/i.test(name) ? name : `${name} Metro`, distance: office.location?.metro_stop_distance?.trim() || "" };
}

/**
 * The coworking location block reads `location.micro_location.name`, `city.name`, `address`,
 * coordinates and `metro_detail`; give it those from a managed office.
 */
export function managedOfficeAsLocationWorkspace(office: Office): CoworkingModel.WorkSpace {
  const metro = managedOfficeMetro(office);
  return {
    name: managedOfficeTitle(office),
    amenties: office.amenties ?? [],
    location: {
      ...(office.location ?? {}),
      address: office.location?.address1?.trim() || office.location?.address?.trim() || "",
      micro_location: { name: managedOfficeLocality(office) },
      city: { name: managedOfficeCityName(office), id: office.location?.city?.id },
      metro_detail: metro ? { is_near_metro: true, name: metro.name } : { is_near_metro: false, name: "" },
    },
  } as unknown as CoworkingModel.WorkSpace;
}
