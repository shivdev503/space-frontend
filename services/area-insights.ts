/**
 * "At a glance" facts, FAQs and nearby-area links for coliving and coworking locality pages, computed
 * from the area's live listings. Every number and name comes from the listings themselves, so each
 * area page says something different and true (instead of the same template text on every page).
 */

import { cache } from "react";

import { buildPgColivingLocationPageParams } from "@/lib/pg-list-priority";
import { collectLocalityPagesSitemapEntries } from "@/lib/sitemap-public-urls";
import { canonicalCoworkingCitySlug, getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import { deriveAppCitySlugFromWorkspace } from "@/services/coworking-workspace-mapper";
import { slugifyMicroLocationName } from "@/services/location-api";
import { loadCoworkingCards } from "@/services/market-stats";
import { fetchPgList } from "@/services/pg-api";
import { citySlugOf, loadColivingInventory, loadCoworkingInventory, type InventorySpace } from "@/services/sitemap-inventory";
import type { FAQItem } from "@/types";
import type { PgDetail } from "@/types/pg.model";
import { formatCurrency } from "@/utils/format";

export type AreaFact = { label: string; value: string };
export type AreaLink = { name: string; href: string; note?: string };
export type AreaInsights = {
  heading: string;
  summary: string[];
  facts: AreaFact[];
  highlights: { title: string; links: AreaLink[] }[];
  nearby: AreaLink[];
  faqs: FAQItem[];
};

const MAX_PGS = 200;
const PG_PAGE = 50;
const NEARBY_LIMIT = 8;

const rupees = (n: number) => formatCurrency(Math.round(n));

/** The value if it's ready within `ms`, else `fallback` (the work continues and is cached for later requests). */
function ready<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise.catch(() => fallback), new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[i];
}

/** "A, B and C". */
function listJoin(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/* ------------------------------------------------------------------ nearby areas */

/** Live locality pages (the verified sitemap set), as paths. */
async function liveLocalityPaths(): Promise<Set<string>> {
  try {
    // The verified list is built once an hour (shared with the sitemap). A page never waits for that
    // build: if it isn't ready within 300 ms the page renders without nearby links this once.
    const entries = await ready(collectLocalityPagesSitemapEntries(), 300, []);
    return new Set(entries.map((e) => new URL(e.loc).pathname));
  } catch {
    return new Set();
  }
}

/**
 * Other areas in the same city that have live listings and a live page, most listings first.
 * Server-rendered links, so Google can follow them (the localities rail is built in the browser).
 */
async function nearbyAreas(
  vertical: "coliving" | "coworking",
  items: InventorySpace[],
  citySlug: string,
  currentSlug: string,
): Promise<AreaLink[]> {
  const live = await liveLocalityPaths();
  const groups = new Map<string, { name: string; count: number }>();
  for (const item of items) {
    if (citySlugOf(item) !== citySlug || !item.localityName) continue;
    const slug = slugifyMicroLocationName(item.localityName);
    if (!slug || slug === currentSlug) continue;
    const g = groups.get(slug) ?? { name: item.localityName.trim(), count: 0 };
    g.count += 1;
    groups.set(slug, g);
  }
  return Array.from(groups, ([slug, g]) => ({ slug, ...g }))
    .filter((g) => live.has(`/${vertical}/${citySlug}/${g.slug}`))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, NEARBY_LIMIT)
    .map((g) => ({
      name: g.name,
      href: `/${vertical}/${citySlug}/${g.slug}`,
      note: plural(g.count, vertical === "coliving" ? "PG" : "space", vertical === "coliving" ? "PGs" : "spaces"),
    }));
}

/* ------------------------------------------------------------------ coliving */

type RoomKind = "Single" | "Double sharing" | "Triple sharing";

function roomKind(type: string): RoomKind | null {
  const t = type.toLowerCase();
  if (/single|1\s*(sharing|seater|bed)|private/.test(t)) return "Single";
  if (/double|twin|2\s*(sharing|seater|bed)/.test(t)) return "Double sharing";
  if (/triple|3\s*(sharing|seater|bed)/.test(t)) return "Triple sharing";
  return null;
}

function guestsKind(value: string): "girls" | "boys" | "both" | null {
  const v = value.toLowerCase();
  if (/girl|female|women|ladies/.test(v) && !/boy|male\b|men\b|gents/.test(v)) return "girls";
  if (/boy|male|\bmen\b|gents/.test(v) && !/girl|female|women|ladies/.test(v)) return "boys";
  if (/both|all|co-?ed|any|girl.*boy|boy.*girl/.test(v)) return "both";
  return null;
}

const hasAmenity = (pg: PgDetail, re: RegExp) => [...(pg.roomAmenities ?? []), ...(pg.commonAmenities ?? [])].some((a) => re.test(a));

async function allLocalityPgs(catalogCityId: string | undefined, cityName: string, localityName: string) {
  const first = await fetchPgList(buildPgColivingLocationPageParams(catalogCityId, cityName, localityName, { page: 1 }));
  const out = [...first.data];
  const pages = Math.min(Math.ceil(first.totalRecords / PG_PAGE), Math.ceil(MAX_PGS / PG_PAGE));
  for (let page = 2; page <= pages; page += 1) {
    const res = await fetchPgList(buildPgColivingLocationPageParams(catalogCityId, cityName, localityName, { page }));
    out.push(...res.data);
  }
  return { pgs: out, total: first.totalRecords };
}

async function computeColivingInsights(citySlug: string, cityName: string, localityName: string, localitySlug: string): Promise<AreaInsights | null> {
  const catalogCityId = getCatalogCityIdBySlug(citySlug) ?? undefined;
  const { pgs, total } = await allLocalityPgs(catalogCityId, cityName, localityName);
  if (!total || !pgs.length) return null;

  const place = `${localityName}, ${cityName}`;
  const rents = pgs.map((p) => p.rentRange?.min ?? 0).filter((r) => r > 0).sort((a, b) => a - b);
  const byRoom = new Map<RoomKind, number>();
  for (const pg of pgs) {
    for (const room of pg.rooms ?? []) {
      const kind = roomKind(room.type ?? "");
      if (!kind || !room.rent || room.rent <= 0) continue;
      byRoom.set(kind, Math.min(byRoom.get(kind) ?? Infinity, room.rent));
    }
  }
  const guests = { girls: 0, boys: 0, both: 0 };
  for (const pg of pgs) {
    const k = guestsKind(pg.preferredGuests ?? "");
    if (k) guests[k] += 1;
  }
  const withFood = pgs.filter((p) => p.food?.included);
  const withAc = pgs.filter((p) => hasAmenity(p, /\bac\b|air[- ]?condition/i));
  const withWifi = pgs.filter((p) => hasAmenity(p, /wi-?fi|internet/i));
  const linkOf = (p: PgDetail, note?: string): AreaLink | null => (p.slug ? { name: p.name, href: `/coliving/${p.slug}`, note } : null);
  const cheapest = [...pgs]
    .filter((p) => (p.rentRange?.min ?? 0) > 0)
    .sort((a, b) => (a.rentRange.min ?? 0) - (b.rentRange.min ?? 0))
    .slice(0, 3)
    .map((p) => linkOf(p, `from ${rupees(p.rentRange.min ?? 0)}/month`))
    .filter((l): l is AreaLink => l != null);
  const girlsPgs = pgs.filter((p) => guestsKind(p.preferredGuests ?? "") === "girls").slice(0, 3).map((p) => linkOf(p)).filter((l): l is AreaLink => l != null);
  const foodPgs = withFood.slice(0, 3).map((p) => linkOf(p)).filter((l): l is AreaLink => l != null);

  const counted = pgs.length; // PGs we could read (all of them up to MAX_PGS)
  const share = (n: number) => (counted === total ? `${n} of the ${total}` : `${n} of ${counted} listed`);

  const summary: string[] = [];
  summary.push(
    `${localityName} in ${cityName} has ${plural(total, "PG", "PGs and coliving homes")} listed on SpaceWallah.` +
      (rents.length
        ? ` Monthly rent starts at ${rupees(rents[0])}${rents.length >= 4 ? `, and most cost between ${rupees(percentile(rents, 0.25))} and ${rupees(percentile(rents, 0.75))}` : ""}.`
        : ""),
  );
  const GUEST_WORDS = { girls: "for girls", boys: "for boys", both: "open to both boys and girls" } as const;
  const guestKinds = (["girls", "boys", "both"] as const).filter((k) => guests[k] > 0);
  const guestSentence =
    guestKinds.length === 1 && guests[guestKinds[0]] === total
      ? `All ${total === 1 ? "of them is" : `${total} are`} ${GUEST_WORDS[guestKinds[0]]}.`
      : guestKinds.length
        ? `Of these, ${listJoin(guestKinds.map((k) => `${guests[k]} ${guests[k] === 1 ? "is" : "are"} ${GUEST_WORDS[k]}`))}.`
        : "";
  const extraParts = [
    withFood.length ? `${withFood.length} include meals` : "",
    withAc.length ? `${withAc.length} have AC rooms` : "",
  ].filter(Boolean);
  if (guestSentence || extraParts.length) {
    summary.push(
      [guestSentence, extraParts.length ? `${listJoin(extraParts).replace(/^./, (c) => c.toUpperCase())}.` : ""]
        .filter(Boolean)
        .join(" "),
    );
  }

  const facts: AreaFact[] = [{ label: "PGs listed", value: String(total) }];
  if (rents.length) facts.push({ label: "Rent from", value: `${rupees(rents[0])}/month` });
  for (const kind of ["Single", "Double sharing", "Triple sharing"] as RoomKind[]) {
    const v = byRoom.get(kind);
    if (v && Number.isFinite(v)) facts.push({ label: `${kind} from`, value: `${rupees(v)}/month` });
  }
  if (guests.girls) facts.push({ label: "For girls", value: String(guests.girls) });
  if (guests.boys) facts.push({ label: "For boys", value: String(guests.boys) });
  if (withFood.length) facts.push({ label: "With meals", value: String(withFood.length) });
  if (withAc.length) facts.push({ label: "With AC rooms", value: String(withAc.length) });

  const faqs: FAQItem[] = [];
  const id = (n: number) => `coliving-${citySlug}-${localitySlug}-area-${n}`;
  if (rents.length) {
    const rooms = (["Single", "Double sharing", "Triple sharing"] as RoomKind[])
      .filter((k) => byRoom.has(k))
      .map((k) => `${k.toLowerCase()} from ${rupees(byRoom.get(k) ?? 0)}`);
    faqs.push({
      id: id(1),
      question: `What is the rent of a PG in ${place}?`,
      answer:
        `PG rent in ${localityName} starts at ${rupees(rents[0])} a month` +
        (rooms.length ? ` (${listJoin(rooms)})` : "") +
        (rents.length >= 4 ? `. Most PGs here cost between ${rupees(percentile(rents, 0.25))} and ${rupees(percentile(rents, 0.75))} a month.` : "."),
    });
  }
  if (girlsPgs.length) {
    faqs.push({
      id: id(2),
      question: `Are there PGs for girls in ${localityName}?`,
      answer: `Yes. ${share(guests.girls)} PGs in ${localityName} are for girls, for example ${listJoin(girlsPgs.map((l) => l.name))}.`,
    });
  }
  if (foodPgs.length) {
    faqs.push({
      id: id(3),
      question: `Which PGs in ${localityName} include food?`,
      answer: `${share(withFood.length)} PGs in ${localityName} include meals in the rent, such as ${listJoin(foodPgs.map((l) => l.name))}.`,
    });
  }
  if (cheapest.length) {
    faqs.push({
      id: id(4),
      question: `Which is the most affordable PG in ${localityName}?`,
      answer: `${cheapest[0].name} has the lowest starting rent in ${localityName} at ${cheapest[0].note?.replace("from ", "") ?? ""}.`,
    });
  }
  if (withWifi.length || withAc.length) {
    faqs.push({
      id: id(5),
      question: `Do PGs in ${localityName} have Wi-Fi and AC?`,
      answer: `${withWifi.length ? `${share(withWifi.length)} PGs in ${localityName} list Wi-Fi` : `PGs in ${localityName} don't list Wi-Fi`}${withAc.length ? `, and ${withAc.length} have AC rooms` : ""}.`,
    });
  }

  const nearby = await nearbyAreas("coliving", await ready(loadColivingInventory(), 300, [] as InventorySpace[]), citySlug, localitySlug);
  const highlights = [
    cheapest.length ? { title: "Lowest starting rent", links: cheapest } : null,
    girlsPgs.length ? { title: "For girls", links: girlsPgs } : null,
    foodPgs.length ? { title: "Meals included", links: foodPgs } : null,
  ].filter((h): h is { title: string; links: AreaLink[] } => h != null);

  return { heading: `PGs in ${localityName} at a glance`, summary, facts, highlights, nearby, faqs };
}

/* ------------------------------------------------------------------ coworking */

/** Plan category ids used by the backend (same ids as the admin panel). */
/** "₹4,999/month", "₹17,999/year". */
const perUnit = (price: number, unit?: string) => `${rupees(price)}/${unit || "month"}`;

const PLAN_TYPES: Record<string, string> = {
  "6231b1722a52af3ddaa73a44": "Day pass",
  "6231b1b42a52af3ddaa73a46": "Hot desk",
  "6231b1db2a52af3ddaa73a48": "Dedicated desk",
  "6231b1ec2a52af3ddaa73a4a": "Private cabin",
  "6231bca42a52af3ddaa73ab1": "Virtual office",
  "62833d8193f2bd4e9f1a3ceb": "Office space",
};

function categoryId(c: unknown): string {
  if (typeof c === "string") return c;
  if (c && typeof c === "object") {
    const o = c as { _id?: unknown; id?: unknown };
    return String(o._id ?? o.id ?? "");
  }
  return "";
}

async function computeCoworkingInsights(citySlug: string, cityName: string, localityName: string, localitySlug: string): Promise<AreaInsights | null> {
  const city = canonicalCoworkingCitySlug(citySlug);
  const spaces = (await loadCoworkingCards()).filter((ws) => {
    if (canonicalCoworkingCitySlug(deriveAppCitySlugFromWorkspace(ws)) !== city) return false;
    const name = ws.location?.micro_location?.name ?? "";
    return name ? slugifyMicroLocationName(name) === localitySlug : false;
  });
  if (!spaces.length) return null;

  const place = `${localityName}, ${cityName}`;
  const prices = spaces.map((s) => s.starting_price ?? 0).filter((p) => p > 0).sort((a, b) => a - b);
  const planMin = new Map<string, number>();
  const planUnit = new Map<string, string>();
  const planCount = new Map<string, number>();
  for (const s of spaces) {
    const seen = new Set<string>();
    for (const plan of s.plans ?? []) {
      const type = PLAN_TYPES[categoryId(plan.category)];
      if (!type || plan.should_show === false) continue;
      if (!seen.has(type)) {
        seen.add(type);
        planCount.set(type, (planCount.get(type) ?? 0) + 1);
      }
      if (plan.price > 0 && plan.price < (planMin.get(type) ?? Infinity)) {
        planMin.set(type, plan.price);
        planUnit.set(type, plan.duration || (type === "Day pass" ? "day" : "month"));
      }
    }
  }
  // One name per station: "Huda City Center" and "Huda City Centre" are the same stop.
  const metroByKey = new Map<string, string>();
  for (const sp of spaces) {
    const loc = sp.location as unknown as { metro_stop_landmark?: string; landmark?: string; is_near_metro?: boolean };
    const name = (loc?.metro_stop_landmark || (loc?.is_near_metro ? loc?.landmark : "") || "").trim();
    const key = name.toLowerCase().replace(/centre/g, "center").replace(/metro|station/g, "").replace(/[^a-z0-9]/g, "");
    if (name && key && !metroByKey.has(key)) metroByKey.set(key, name);
  }
  const metro = Array.from(metroByKey.values()).slice(0, 4);
  const cheapest = [...spaces]
    .filter((s) => (s.starting_price ?? 0) > 0 && s.slug)
    .sort((a, b) => (a.starting_price ?? 0) - (b.starting_price ?? 0))
    .slice(0, 3)
    .map((s) => ({ name: s.name, href: `/coworking/${s.slug}`, note: `from ${rupees(s.starting_price ?? 0)} per seat a month` }));

  const summary: string[] = [
    `${localityName} in ${cityName} has ${plural(spaces.length, "coworking space", "coworking spaces")} listed on SpaceWallah.` +
      (prices.length
        ? ` Seats start at ${rupees(prices[0])} a month${prices.length >= 4 ? `, and most are between ${rupees(percentile(prices, 0.25))} and ${rupees(percentile(prices, 0.75))}` : ""}.`
        : ""),
  ];
  const PLAN_PLURAL: Record<string, string> = {
    "Hot desk": "hot desks", "Dedicated desk": "dedicated desks", "Private cabin": "private cabins",
    "Day pass": "day passes", "Virtual office": "virtual offices",
  };
  const offered = Object.keys(PLAN_PLURAL).filter((t) => planCount.get(t));
  const everywhere = offered.filter((t) => planCount.get(t) === spaces.length);
  const some = offered.filter((t) => (planCount.get(t) ?? 0) < spaces.length);
  const planSentences = [
    everywhere.length
      ? `${spaces.length === 1 ? "It offers" : `All ${spaces.length} offer`} ${listJoin(everywhere.map((t) => PLAN_PLURAL[t]))}.`
      : "",
    some.length
      ? `${listJoin(some.map((t) => `${planCount.get(t)} offer ${PLAN_PLURAL[t]}`)).replace(/^./, (c) => c.toUpperCase())}.`
      : "",
  ].filter(Boolean);
  if (planSentences.length) summary.push(planSentences.join(" "));
  if (metro.length) summary.push(`Spaces here are close to ${listJoin(metro)}.`);

  const facts: AreaFact[] = [{ label: "Coworking spaces", value: String(spaces.length) }];
  if (prices.length) facts.push({ label: "Seats from", value: `${rupees(prices[0])}/month` });
  for (const t of ["Hot desk", "Dedicated desk", "Private cabin", "Day pass", "Virtual office"]) {
    const v = planMin.get(t);
    if (v && Number.isFinite(v)) facts.push({ label: `${t} from`, value: perUnit(v, planUnit.get(t)) });
  }

  const faqs: FAQItem[] = [];
  const id = (n: number) => `coworking-${city}-${localitySlug}-area-${n}`;
  if (prices.length) {
    const plans = ["Hot desk", "Dedicated desk", "Private cabin"].filter((t) => planMin.has(t)).map((t) => `${t.toLowerCase()} from ${perUnit(planMin.get(t) ?? 0, planUnit.get(t))}`);
    faqs.push({
      id: id(1),
      question: `What is the price of coworking space in ${place}?`,
      answer:
        `Coworking seats in ${localityName} start at ${rupees(prices[0])} a month` +
        (plans.length ? ` (${listJoin(plans)})` : "") +
        (prices.length >= 4 ? `. Most spaces here charge between ${rupees(percentile(prices, 0.25))} and ${rupees(percentile(prices, 0.75))}.` : "."),
    });
  }
  if (planCount.get("Day pass")) {
    faqs.push({
      id: id(2),
      question: `Can I get a day pass in ${localityName}?`,
      answer: `Yes. ${plural(planCount.get("Day pass") ?? 0, "space", "spaces")} in ${localityName} ${(planCount.get("Day pass") ?? 0) === 1 ? "offers" : "offer"} day passes${planMin.get("Day pass") ? `, from ${perUnit(planMin.get("Day pass") ?? 0, planUnit.get("Day pass"))}` : ""}.`,
    });
  }
  if (planCount.get("Private cabin")) {
    faqs.push({
      id: id(3),
      question: `Are private cabins available in ${localityName}?`,
      answer: `${plural(planCount.get("Private cabin") ?? 0, "space", "spaces")} in ${localityName} ${(planCount.get("Private cabin") ?? 0) === 1 ? "has" : "have"} private cabins${planMin.get("Private cabin") ? `, from ${perUnit(planMin.get("Private cabin") ?? 0, planUnit.get("Private cabin"))}` : ""}.`,
    });
  }
  if (metro.length) {
    faqs.push({
      id: id(4),
      question: `Which coworking spaces in ${localityName} are near a metro?`,
      answer: `Coworking spaces in ${localityName} are listed near ${listJoin(metro)}.`,
    });
  }
  if (cheapest.length) {
    faqs.push({
      id: id(5),
      question: `Which is the most affordable coworking space in ${localityName}?`,
      answer: `${cheapest[0].name} has the lowest starting price in ${localityName}, ${cheapest[0].note?.replace("from ", "") ?? ""}.`,
    });
  }

  const nearby = await nearbyAreas("coworking", await ready(loadCoworkingInventory(), 300, [] as InventorySpace[]), city, localitySlug);
  const highlights = cheapest.length ? [{ title: "Lowest starting price", links: cheapest }] : [];
  return { heading: `Coworking in ${localityName} at a glance`, summary, facts, highlights, nearby, faqs };
}

/* ------------------------------------------------------------------ public */

/** Never fails the page: on any error the page simply renders without the section. */
export const colivingAreaInsights = cache(async (citySlug: string, cityName: string, localityName: string, localitySlug: string) => {
  try {
    return await computeColivingInsights(citySlug, cityName, localityName, localitySlug);
  } catch {
    return null;
  }
});

export const coworkingAreaInsights = cache(
  async (citySlug: string, cityName: string, localityName: string, localitySlug: string) => {
    try {
      return await computeCoworkingInsights(citySlug, cityName, localityName, localitySlug);
    } catch {
      return null;
    }
  },
);
