/** Coworking city / microlocation listing filters — synced to `?minPrice=&maxPrice=&sortBy=&orderBy=` */

export type CoworkingPriceRangeKey =
  | ""
  | "lt-10k"
  | "10k-15k"
  | "15k-20k"
  | "20k-30k"
  | "30k-plus";

export type CoworkingListFilterState = {
  minPrice: string;
  maxPrice: string;
  priceRange: CoworkingPriceRangeKey;
  sortBy: string;
  orderBy: "1" | "-1";
};

export const DEFAULT_COWORKING_LIST_FILTERS: CoworkingListFilterState = {
  minPrice: "",
  maxPrice: "",
  priceRange: "",
  sortBy: "starting_price",
  orderBy: "1",
};

export const COWORKING_PRICE_RANGE_OPTIONS: {
  key: CoworkingPriceRangeKey;
  label: string;
  min?: number;
  max?: number;
}[] = [
  { key: "lt-10k", label: "Less than ₹10,000", max: 10000 },
  { key: "10k-15k", label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { key: "15k-20k", label: "₹15,000 – ₹20,000", min: 15000, max: 20000 },
  { key: "20k-30k", label: "₹20,000 – ₹30,000", min: 20000, max: 30000 },
  { key: "30k-plus", label: "₹30,000+", min: 30000 },
];

export const COWORKING_SORT_OPTIONS = [
  { value: "starting_price:1", label: "Price: low to high", sortBy: "starting_price", orderBy: "1" as const },
  { value: "starting_price:-1", label: "Price: high to low", sortBy: "starting_price", orderBy: "-1" as const },
];

export function priceRangeFromMinMax(minPrice: string, maxPrice: string): CoworkingPriceRangeKey {
  const min = minPrice.trim();
  const max = maxPrice.trim();
  if (!min && !max) return "";
  const match = COWORKING_PRICE_RANGE_OPTIONS.find(
    (r) =>
      r.key &&
      String(r.min ?? "") === min &&
      String(r.max ?? "") === max,
  );
  return match?.key ?? "";
}

export function minMaxFromPriceRange(key: CoworkingPriceRangeKey): { minPrice: string; maxPrice: string } {
  if (!key) return { minPrice: "", maxPrice: "" };
  const row = COWORKING_PRICE_RANGE_OPTIONS.find((r) => r.key === key);
  if (!row) return { minPrice: "", maxPrice: "" };
  return {
    minPrice: row.min != null ? String(row.min) : "",
    maxPrice: row.max != null ? String(row.max) : "",
  };
}

export function parseCoworkingListFiltersFromSearchParams(sp: URLSearchParams): CoworkingListFilterState {
  const minPrice = sp.get("minPrice") ?? "";
  const maxPrice = sp.get("maxPrice") ?? "";
  const sortBy = sp.get("sortBy") ?? DEFAULT_COWORKING_LIST_FILTERS.sortBy;
  const orderBy = sp.get("orderBy") === "-1" ? "-1" : "1";
  const priceRange = priceRangeFromMinMax(minPrice, maxPrice);
  return { minPrice, maxPrice, priceRange, sortBy, orderBy };
}

export function countActiveCoworkingListFilters(
  filters: CoworkingListFilterState,
  options?: { excludeSort?: boolean },
): number {
  let count = 0;
  if (filters.minPrice.trim() || filters.maxPrice.trim()) count += 1;
  if (!options?.excludeSort) {
    const isDefaultSort =
      filters.sortBy === DEFAULT_COWORKING_LIST_FILTERS.sortBy &&
      filters.orderBy === DEFAULT_COWORKING_LIST_FILTERS.orderBy;
    if (!isDefaultSort) count += 1;
  }
  return count;
}

export function coworkingFiltersToApiParams(
  filters: CoworkingListFilterState,
  options?: { includeSortInRequest?: boolean },
): {
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  orderBy?: 1 | -1;
} {
  const out: {
    minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  orderBy?: 1 | -1;
  } = {};

  const min = Number(filters.minPrice);
  const max = Number(filters.maxPrice);
  if (Number.isFinite(min) && min >= 0 && filters.minPrice.trim()) out.minPrice = min;
  if (Number.isFinite(max) && max > 0 && filters.maxPrice.trim()) out.maxPrice = max;

  const includeSort = options?.includeSortInRequest ?? true;
  if (includeSort && filters.sortBy.trim()) {
    out.sortBy = filters.sortBy.trim();
    out.orderBy = filters.orderBy === "1" ? 1 : -1;
  }

  return out;
}

export function coworkingFiltersToSearchParams(filters: CoworkingListFilterState): URLSearchParams {
  const qs = new URLSearchParams();
  if (filters.minPrice.trim()) qs.set("minPrice", filters.minPrice.trim());
  if (filters.maxPrice.trim()) qs.set("maxPrice", filters.maxPrice.trim());
  if (
    filters.sortBy !== DEFAULT_COWORKING_LIST_FILTERS.sortBy ||
    filters.orderBy !== DEFAULT_COWORKING_LIST_FILTERS.orderBy
  ) {
    qs.set("sortBy", filters.sortBy);
    qs.set("orderBy", filters.orderBy);
  }
  return qs;
}

/** Listing page size — shared by the server's first page and the client's "Load more". */
export const COWORKING_LIST_PAGE_SIZE = 24;

/**
 * Stable key for the listing-relevant query (price + sort). The server renders page 1 for
 * this key; the client skips its first fetch when the URL still matches.
 */
export function coworkingListQueryKey(sp: URLSearchParams): string {
  const filters = parseCoworkingListFiltersFromSearchParams(sp);
  return `${coworkingFiltersToSearchParams(filters).toString()}|${sp.has("sortBy") ? "sort" : ""}`;
}

/** Client-side fallback when upstream ignores price query params. */
export function applyCoworkingListFiltersClient(
  rows: { starting_price?: number }[],
  filters: CoworkingListFilterState,
): typeof rows {
  let out = [...rows];
  const min = Number(filters.minPrice);
  const max = Number(filters.maxPrice);
  if (Number.isFinite(min) && filters.minPrice.trim()) {
    out = out.filter((w) => (w.starting_price ?? 0) >= min);
  }
  if (Number.isFinite(max) && filters.maxPrice.trim()) {
    out = out.filter((w) => (w.starting_price ?? 0) <= max);
  }
  if (filters.sortBy === "starting_price") {
    const dir = filters.orderBy === "1" ? 1 : -1;
    out.sort((a, b) => ((a.starting_price ?? 0) - (b.starting_price ?? 0)) * dir);
  }
  return out;
}
