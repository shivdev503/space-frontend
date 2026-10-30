/**
 * Title / meta description templates (SpaceWallah audit, Oct 2026), filled from live data.
 * Used only when the CMS has no SEO entry for the URL. Descriptions follow house style:
 * no commas or dashes.
 */

import type { MarketStats } from "@/services/market-stats";
import { countLabel } from "@/services/market-stats";
import { pgStartingRent } from "@/services/pg-mapper";
import {
  coworkingPlanCategoryLabel,
  filterCoworkingPlansForStartingPrice,
} from "@/services/workspace-plan-pricing";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { PgDetail } from "@/types/pg.model";

export type SeoCopy = { title: string; description: string };

function rupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function includesWord(haystack: string, needle: string): boolean {
  return Boolean(needle) && haystack.toLowerCase().includes(needle.toLowerCase());
}

/** "{Name} {Locality} {City}" without repeating parts already in the name. */
function nameWithPlace(name: string, locality?: string, city?: string): string {
  const parts = [name];
  if (locality && !includesWord(name, locality)) parts.push(locality);
  if (city && !includesWord(name, city) && !includesWord(locality ?? "", city)) parts.push(city);
  return parts.join(" ");
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(" ")} and ${items[items.length - 1]}`;
}

// ── Coworking ────────────────────────────────────────────────────────────────

export function coworkingCitySeo(city: string, stats: MarketStats | null): SeoCopy {
  const n = stats?.count ? countLabel(stats.count) : "";
  const from = stats?.minPrice ? ` from ${rupees(stats.minPrice)}` : "";
  return {
    title: n ? `Coworking Space in ${city} | ${n} Options${from}` : `Coworking Space in ${city} | Prices & Photos`,
    description: `Find ${n ? `${n} ` : ""}verified coworking spaces in ${city}${from ? `${from} per seat` : ""}. Compare prices and photos and book a free tour with zero brokerage.`,
  };
}

export function coworkingLocalitySeo(locality: string, city: string, stats: MarketStats | null): SeoCopy {
  const n = stats?.count ? `${countLabel(stats.count)} ` : "";
  const from = stats?.minPrice ? ` from ${rupees(stats.minPrice)} per seat` : "";
  return {
    title: `Coworking Space in ${locality} ${city} | Prices & Photos`,
    description: `Explore ${n}coworking spaces in ${locality} ${city}${from} with real prices and photos. Get a free shortlist from a SpaceWallah expert today.`,
  };
}

export function coworkingListingSeo(ws: CoworkingModel.WorkSpace): SeoCopy {
  const locality = ws.location?.micro_location?.name?.trim() ?? "";
  const city = ws.location?.city?.name?.trim() ?? "";
  const plans = Array.from(
    new Set(
      filterCoworkingPlansForStartingPrice(ws.plans ?? [])
        .map((p) => coworkingPlanCategoryLabel(p).toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 3);
  const offer = plans.length ? joinList(plans) : "flexible workspaces";
  const from = ws.starting_price ? ` from ${rupees(ws.starting_price)} per month` : "";
  return {
    title: `${nameWithPlace(ws.name, locality, city)} | Price & Photos`,
    description: `${ws.name}${locality ? ` in ${locality}` : ""} offers ${offer}${from}. See amenities and photos and book a free tour.`,
  };
}

// ── Coliving / PG ────────────────────────────────────────────────────────────

export function colivingCitySeo(city: string, stats: MarketStats | null): SeoCopy {
  const n = stats?.count ? countLabel(stats.count) : "";
  const from = stats?.minPrice ? ` from ${rupees(stats.minPrice)}` : "";
  return {
    title: n ? `PG & Coliving in ${city} | ${n} Rooms${from}` : `PG & Coliving in ${city} | Rooms & Prices`,
    description: `Find ${n ? `${n} ` : ""}verified PGs and coliving rooms in ${city}${from ? `${from} a month` : ""} with food WiFi and housekeeping. Filter boys girls or unisex and move in fast.`,
  };
}

export function colivingLocalitySeo(locality: string, city: string, stats: MarketStats | null): SeoCopy {
  const n = stats?.count ? `${countLabel(stats.count)} ` : "";
  const from = stats?.minPrice ? ` from ${rupees(stats.minPrice)} a month` : "";
  return {
    title: `PG & Coliving in ${locality} ${city} | Rooms & Prices`,
    description: `Find ${n}verified PGs and coliving rooms in ${locality} ${city}${from} with food WiFi and housekeeping. See photos and prices and move in fast.`,
  };
}

export function colivingListingSeo(pg: PgDetail): SeoCopy {
  const rent = pgStartingRent(pg);
  const label = includesWord(pg.name, "pg") || includesWord(pg.name, "coliving") ? pg.name : `${pg.name} PG`;
  const sharing = Array.from(new Set(pg.rooms.map((r) => r.type.trim().toLowerCase()).filter(Boolean))).slice(0, 3);
  const guests = pg.preferredGuests?.trim().toLowerCase();
  return {
    title: `${nameWithPlace(label, pg.locality, pg.city)}${rent ? ` | ${rupees(rent)}/mo` : ""}`,
    description: `${pg.name} in ${pg.locality} ${pg.city} has ${sharing.length ? `${joinList(sharing)} ` : ""}rooms${rent ? ` from ${rupees(rent)} a month` : ""}${guests && guests !== "all" ? ` for ${guests}` : ""}. See photos rules and amenities.`,
  };
}

// ── Virtual office / managed office ──────────────────────────────────────────

export function virtualOfficeCitySeo(city: string, minPrice: number | null): SeoCopy {
  const from = minPrice ? ` from ${rupees(minPrice)}` : "";
  return {
    title: `Virtual Office in ${city} for GST${from ? `${from}/mo` : ""}`,
    description: `Get a virtual office in ${city} for GST and company registration${from ? `${from} a month` : ""}. NOC rent agreement and utility bill in 48 hours.`,
  };
}

export function virtualOfficeListingSeo(ws: CoworkingModel.WorkSpace): SeoCopy {
  const locality = ws.location?.micro_location?.name?.trim() ?? "";
  const city = ws.location?.city?.name?.trim() ?? "";
  return {
    title: `Virtual Office at ${nameWithPlace(ws.name, locality, city)} | GST Address`,
    description: `Get a virtual office address at ${ws.name}${locality ? ` in ${locality}` : ""}${city ? ` ${city}` : ""} for GST and company registration. NOC rent agreement and utility bill with zero brokerage.`,
  };
}

export function managedOfficeCitySeo(city: string): SeoCopy {
  return {
    title: `Managed Office in ${city} | Teams of 20 to 500`,
    description: `Find fully managed offices in ${city} for growing teams. Compare verified options and get expert help at zero cost.`,
  };
}

export function managedOfficeListingSeo(office: {
  name: string;
  location?: { micro_location?: { name?: string }; city?: { name?: string } };
}): SeoCopy {
  const locality = office.location?.micro_location?.name?.trim() ?? "";
  const city = office.location?.city?.name?.trim() ?? "";
  return {
    title: `${nameWithPlace(office.name, locality, city)} | Managed Office`,
    description: `${office.name}${city ? ` in ${city}` : ""} is a fully managed office for growing teams. See photos and amenities and get expert help at zero cost.`,
  };
}
