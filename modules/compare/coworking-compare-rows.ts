import type { CompareSpace } from "@/lib/coworking-compare";
import { formatCurrency } from "@/utils/format";

export type CompareCell = {
  /** Shown in the cell; empty means "not listed". */
  text: string;
  /** Used to decide whether a row differs between spaces. */
  value: string;
  best?: boolean;
  /** Small pill next to the best value, e.g. "Lowest". */
  badge?: string;
  /** Yes / no rows (amenities, metro). */
  check?: boolean;
};

export type CompareRow = { id: string; label: string; cells: CompareCell[] };

export type CompareSectionId = "price" | "rating" | "location" | "hours" | "amenities";
export type CompareSection = { id: CompareSectionId; title: string; rows: CompareRow[] };

const PLAN_ORDER = ["hot desk", "dedicated desk", "private cabin", "day pass", "meeting room"];

/** Indexes holding the best number, only when at least two spaces have a value and they differ. */
function bestIndexes(values: (number | null)[], pick: "min" | "max"): Set<number> {
  const present = values.filter((v): v is number => v != null && v > 0);
  if (present.length < 2 || present.every((v) => v === present[0])) return new Set();
  const target = pick === "min" ? Math.min(...present) : Math.max(...present);
  return new Set(values.flatMap((v, i) => (v === target ? [i] : [])));
}

/** Highlight `true` cells, only when some spaces have it and some do not. */
function bestFlags(flags: boolean[]): Set<number> {
  if (flags.every(Boolean) || !flags.some(Boolean)) return new Set();
  return new Set(flags.flatMap((f, i) => (f ? [i] : [])));
}

function priceRow(id: string, label: string, values: (number | null)[], unit: (i: number) => string): CompareRow {
  const best = bestIndexes(values, "min");
  return {
    id,
    label,
    cells: values.map((v, i) => ({
      text: v ? `${formatCurrency(v)}${unit(i)}` : "",
      value: v ? String(v) : "",
      best: best.has(i),
      badge: best.has(i) ? "Lowest" : undefined,
    })),
  };
}

export function buildCompareSections(spaces: CompareSpace[]): CompareSection[] {
  // ---- price
  const planKeys = new Map<string, { label: string; unit: string }>();
  spaces.forEach((s) => s.plans.forEach((p) => planKeys.set(p.key, { label: p.label, unit: p.unit })));
  const rank = (label: string) => {
    const i = PLAN_ORDER.findIndex((name) => label.toLowerCase().includes(name));
    return i < 0 ? PLAN_ORDER.length : i;
  };
  const planRows = [...planKeys.entries()]
    .sort(([, a], [, b]) => rank(a.label) - rank(b.label) || a.label.localeCompare(b.label))
    .map(([key, { label, unit }]) =>
      priceRow(
        `plan-${key}`,
        label,
        spaces.map((s) => s.plans.find((p) => p.key === key)?.price ?? null),
        () => unit,
      ),
    );

  // ---- rating
  const ratingBest = bestIndexes(spaces.map((s) => s.rating || null), "max");

  // ---- location
  const metroBest = bestFlags(spaces.map((s) => s.nearMetro));

  // ---- hours
  const open24Best = bestFlags(spaces.map((s) => s.hours.open24));
  const sundayBest = bestFlags(spaces.map((s) => s.hours.openSunday));

  // ---- amenities: most common across the compared spaces first
  const amenityCount = new Map<string, number>();
  spaces.forEach((s) => s.amenities.forEach((a) => amenityCount.set(a, (amenityCount.get(a) ?? 0) + 1)));
  const amenities = [...amenityCount.entries()]
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([name]) => name);
  const totalBest = bestIndexes(spaces.map((s) => s.amenities.length || null), "max");

  return [
    {
      id: "price",
      title: "Pricing",
      rows: [
        priceRow("starting", "Starting from", spaces.map((s) => s.startingPrice || null), () => "/mo"),
        ...planRows,
      ],
    },
    {
      id: "rating",
      title: "Rating",
      rows: [
        {
          id: "rating",
          label: "Guest rating",
          cells: spaces.map((s, i) => ({
            text: s.rating ? `${s.rating.toFixed(1)} / 5` : "",
            value: s.rating ? s.rating.toFixed(1) : "",
            best: ratingBest.has(i),
            badge: ratingBest.has(i) ? "Top rated" : undefined,
          })),
        },
      ],
    },
    {
      id: "location",
      title: "Location",
      rows: [
        { id: "area", label: "Area", cells: spaces.map((s) => ({ text: s.area, value: s.area })) },
        { id: "city", label: "City", cells: spaces.map((s) => ({ text: s.city, value: s.city })) },
        { id: "address", label: "Address", cells: spaces.map((s) => ({ text: s.address, value: s.address })) },
        {
          id: "metro",
          label: "Near metro",
          cells: spaces.map((s, i) => ({
            text: s.nearMetro ? "Yes" : "",
            value: String(s.nearMetro),
            check: s.nearMetro,
            best: metroBest.has(i),
          })),
        },
      ],
    },
    {
      id: "hours",
      title: "Opening hours",
      rows: [
        {
          id: "weekdays",
          label: "Mon – Fri",
          cells: spaces.map((s, i) => ({
            text: s.hours.weekdays,
            value: s.hours.weekdays,
            best: open24Best.has(i),
            badge: open24Best.has(i) ? "24×7" : undefined,
          })),
        },
        { id: "saturday", label: "Saturday", cells: spaces.map((s) => ({ text: s.hours.saturday, value: s.hours.saturday })) },
        {
          id: "sunday",
          label: "Sunday",
          cells: spaces.map((s, i) => ({
            text: s.hours.sunday,
            value: s.hours.sunday,
            best: sundayBest.has(i),
            badge: sundayBest.has(i) ? "Open" : undefined,
          })),
        },
      ],
    },
    {
      id: "amenities",
      title: "Amenities",
      rows: [
        {
          id: "amenity-total",
          label: "Total amenities",
          cells: spaces.map((s, i) => ({
            text: s.amenities.length ? String(s.amenities.length) : "",
            value: String(s.amenities.length),
            best: totalBest.has(i),
            badge: totalBest.has(i) ? "Most" : undefined,
          })),
        },
        ...amenities.map((name) => ({
          id: `amenity-${name}`,
          label: name,
          cells: spaces.map((s) => {
            const has = s.amenities.includes(name);
            return { text: has ? "Included" : "", value: String(has), check: has };
          }),
        })),
      ],
    },
  ];
}

/** True when every space shows the same thing in this row. */
export function rowIsSame(row: CompareRow): boolean {
  return row.cells.every((c) => c.value === row.cells[0]?.value);
}
