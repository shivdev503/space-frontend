import { workspaceAddress, workspaceCitySlugish, workspaceRating } from "@/modules/coworking/components/coworking-detail-header";
import { spaceImageUrl, toSpaceImageCdnUrl } from "@/lib/space-image-url";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

/** Most spaces a user can compare at once. */
export const COMPARE_MAX = 5;

/** What the compare tray keeps per selected space (small enough for localStorage). */
export type CompareItem = {
  slug: string;
  name: string;
  image: string;
  area: string;
  city: string;
};

export type ComparePlan = { key: string; label: string; price: number; unit: string };

export type CompareHours = {
  weekdays: string;
  saturday: string;
  sunday: string;
  open24: boolean;
  openSunday: boolean;
};

/** Serializable comparison view of one coworking space, built on the server. */
export type CompareSpace = CompareItem & {
  id: string;
  citySlug: string;
  address: string;
  rating: number;
  startingPrice: number;
  plans: ComparePlan[];
  nearMetro: boolean;
  hours: CompareHours;
  amenities: string[];
};

const IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=72";

/** Same plans the detail page leaves out of coworking pricing. */
const EXCLUDED_PLANS = new Set(["business address", "gst registration", "virtual office", "company registration"]);

/** Admin has a few near-duplicate amenity names; compare them as one row. */
const AMENITY_ALIASES: Record<string, string> = {
  "meeting room": "Meeting Rooms",
  ac: "Air-Conditioning",
  "air conditioning": "Air-Conditioning",
  wifi: "Wi-Fi",
  "wi fi": "Wi-Fi",
  kitchen: "Functional Kitchen",
  cafe: "Cafe",
};

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export function compareImage(workspace: CoworkingModel.WorkSpace): string {
  const hero = typeof workspace.image === "string" ? toSpaceImageCdnUrl(workspace.image) : "";
  return hero || spaceImageUrl(workspace.images?.[0]?.image) || IMAGE_FALLBACK;
}

export function toCompareItem(workspace: CoworkingModel.WorkSpace): CompareItem {
  return {
    slug: workspace.slug,
    name: workspace.name,
    image: compareImage(workspace),
    area: workspace.location?.micro_location?.name?.trim() || "",
    city: workspace.location?.city?.name?.trim() || "",
  };
}

function planLabel(plan: CoworkingModel.Plan): string {
  const c = plan.category as { name?: string } | string | undefined;
  if (c && typeof c === "object" && c.name?.trim()) return c.name.trim();
  if (typeof c === "string" && c.trim() && !/^[a-f0-9]{24}$/i.test(c)) return c.trim();
  return "";
}

function planUnit(label: string, duration?: string): string {
  if (/day/i.test(label) || duration === "day") return "/day";
  if (duration === "year") return "/yr";
  return "/mo";
}

function comparePlans(workspace: CoworkingModel.WorkSpace): ComparePlan[] {
  const byKey = new Map<string, ComparePlan>();
  for (const plan of workspace.plans ?? []) {
    const label = planLabel(plan);
    const price = typeof plan.price === "number" ? plan.price : Number(plan.price) || 0;
    if (!label || plan.should_show === false || price <= 0 || EXCLUDED_PLANS.has(label.toLowerCase())) continue;
    const unit = planUnit(label, plan.duration);
    const key = `${label.toLowerCase()}${unit}`;
    const existing = byKey.get(key);
    if (!existing || price < existing.price) byKey.set(key, { key, label, price, unit });
  }
  return [...byKey.values()];
}

/** "08:00 AM" -> "8 AM", "08:30 PM" -> "8:30 PM". */
function shortTime(value: string): string {
  const m = value.trim().match(/^0?(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) return value.trim();
  return `${m[1]}${m[2] === "00" ? "" : `:${m[2]}`} ${m[3].toUpperCase()}`;
}

function dayLabel(slot: CoworkingModel.WorkingHours | undefined): string {
  if (!slot) return "";
  if (slot.is_open_24) return "Open 24 hours";
  if (slot.is_closed || (!slot.from && !slot.to)) return "Closed";
  return `${shortTime(slot.from)} – ${shortTime(slot.to)}`;
}

function compareHours(workspace: CoworkingModel.WorkSpace): CompareHours {
  const hours = workspace.hours_of_operation ?? {};
  const weekdayLabels = WEEKDAYS.map((d) => dayLabel(hours[d]));
  const known = weekdayLabels.filter(Boolean);
  const weekdays = !known.length ? "" : known.every((l) => l === known[0]) ? known[0] : `${known[0]} (varies)`;
  const sunday = dayLabel(hours.sunday);
  const all = [...weekdayLabels, dayLabel(hours.saturday), sunday];
  return {
    weekdays,
    saturday: dayLabel(hours.saturday),
    sunday,
    open24: all.every((l) => l === "Open 24 hours"),
    openSunday: Boolean(sunday) && sunday !== "Closed",
  };
}

function compareAmenities(workspace: CoworkingModel.WorkSpace): string[] {
  const names = new Set<string>();
  for (const a of workspace.amenties ?? []) {
    const raw = a?.name?.trim();
    if (!raw) continue;
    const key = raw.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
    names.add(AMENITY_ALIASES[key] ?? raw);
  }
  return [...names];
}

/** "Chhatarpur, Delhi, Delhi" -> "Chhatarpur, Delhi". */
function uniqueParts(address: string): string {
  const seen = new Set<string>();
  return address
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !seen.has(p.toLowerCase()) && seen.add(p.toLowerCase()))
    .join(", ");
}

export function toCompareSpace(workspace: CoworkingModel.WorkSpace): CompareSpace {
  const plans = comparePlans(workspace);
  const monthly = plans.filter((p) => p.unit === "/mo").map((p) => p.price);
  const startingPrice = workspace.starting_price || (monthly.length ? Math.min(...monthly) : 0);
  const location = workspace.location;
  return {
    ...toCompareItem(workspace),
    id: workspace.id || workspace._id || workspace.slug,
    citySlug: workspaceCitySlugish(workspace),
    address: location ? uniqueParts(workspaceAddress(workspace)) : "",
    rating: workspaceRating(workspace),
    startingPrice,
    plans,
    nearMetro: Boolean(location?.metro_detail?.is_near_metro || (location as { is_near_metro?: boolean })?.is_near_metro),
    hours: compareHours(workspace),
    amenities: compareAmenities(workspace),
  };
}

/** `/coworking/compare?spaces=a,b,c` */
export function compareHref(slugs: string[]): string {
  return `/coworking/compare?spaces=${slugs.map(encodeURIComponent).join(",")}`;
}

/** Slugs from a `?spaces=a,b,c` query (compare and shortlist URLs), de-duplicated. */
export function parseCompareSlugs(raw: string | string[] | undefined, max = COMPARE_MAX): string[] {
  const value = Array.isArray(raw) ? raw.join(",") : raw || "";
  const slugs = value.split(",").map((s) => {
    try {
      return decodeURIComponent(s).trim();
    } catch {
      return s.trim();
    }
  });
  return [...new Set(slugs.filter(Boolean))].slice(0, max);
}
