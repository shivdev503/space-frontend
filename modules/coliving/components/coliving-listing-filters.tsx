"use client";

import { useCallback, useEffect, useState } from "react";

import type { PgListParams } from "@/types/pg.model";

export type PgFilterState = {
  city: string;
  locality: string;
  name: string;
  minPrice: string;
  maxPrice: string;
  verified: boolean;
  foodIncluded: boolean;
  parking: boolean;
  preferredGuest: string;
  type: string;
  sortBy: string;
  orderBy: "1" | "-1";
};

export const DEFAULT_PG_FILTERS: PgFilterState = {
  city: "",
  locality: "",
  name: "",
  minPrice: "",
  maxPrice: "",
  verified: false,
  foodIncluded: false,
  parking: false,
  preferredGuest: "",
  type: "",
  sortBy: "added_on",
  orderBy: "-1",
};

export function filtersToParams(filters: PgFilterState, page: number, limit: number): PgListParams {
  const params: PgListParams = {
    page,
    limit,
    sortBy: filters.sortBy,
    orderBy: Number(filters.orderBy) as 1 | -1,
  };
  if (filters.city.trim()) params.city = filters.city.trim();
  if (filters.locality.trim()) params.locality = filters.locality.trim();
  if (filters.name.trim()) params.name = filters.name.trim();
  const min = Number(filters.minPrice);
  const max = Number(filters.maxPrice);
  if (Number.isFinite(min) && min > 0) params.minPrice = min;
  if (Number.isFinite(max) && max > 0) params.maxPrice = max;
  if (filters.verified) params.verified = true;
  if (filters.foodIncluded) params.foodIncluded = true;
  if (filters.parking) params.parking = true;
  if (filters.preferredGuest.trim()) params.preferredGuest = filters.preferredGuest.trim();
  if (filters.type.trim()) params.type = filters.type.trim();
  return params;
}

export function parseFiltersFromSearchParams(sp: URLSearchParams): PgFilterState {
  return {
    city: sp.get("city") ?? "",
    locality: sp.get("locality") ?? "",
    name: sp.get("name") ?? "",
    minPrice: sp.get("minPrice") ?? "",
    maxPrice: sp.get("maxPrice") ?? "",
    verified: sp.get("verified") === "true",
    foodIncluded: sp.get("foodIncluded") === "true",
    parking: sp.get("parking") === "true",
    preferredGuest: sp.get("preferredGuest") ?? "",
    type: sp.get("type") ?? "",
    sortBy: sp.get("sortBy") ?? "added_on",
    orderBy: sp.get("orderBy") === "1" ? "1" : "-1",
  };
}

export function countActivePgFilters(
  filters: PgFilterState,
  options?: { excludeSort?: boolean; excludeCity?: boolean },
): number {
  let count = 0;
  if (!options?.excludeCity && filters.city.trim()) count += 1;
  if (filters.locality.trim()) count += 1;
  if (filters.name.trim()) count += 1;
  if (filters.minPrice.trim()) count += 1;
  if (filters.maxPrice.trim()) count += 1;
  if (filters.type.trim()) count += 1;
  if (filters.preferredGuest.trim()) count += 1;
  if (filters.verified) count += 1;
  if (filters.foodIncluded) count += 1;
  if (filters.parking) count += 1;
  if (!options?.excludeSort) {
    if (filters.sortBy !== DEFAULT_PG_FILTERS.sortBy || filters.orderBy !== DEFAULT_PG_FILTERS.orderBy) {
      count += 1;
    }
  }
  return count;
}

export function filtersToSearchParams(filters: PgFilterState, page: number): URLSearchParams {
  const qs = new URLSearchParams();
  if (filters.city) qs.set("city", filters.city);
  if (filters.locality) qs.set("locality", filters.locality);
  if (filters.name) qs.set("name", filters.name);
  if (filters.minPrice) qs.set("minPrice", filters.minPrice);
  if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice);
  if (filters.verified) qs.set("verified", "true");
  if (filters.foodIncluded) qs.set("foodIncluded", "true");
  if (filters.parking) qs.set("parking", "true");
  if (filters.preferredGuest) qs.set("preferredGuest", filters.preferredGuest);
  if (filters.type) qs.set("type", filters.type);
  if (filters.sortBy !== "added_on") qs.set("sortBy", filters.sortBy);
  if (filters.orderBy !== "-1") qs.set("orderBy", filters.orderBy);
  if (page > 1) qs.set("page", String(page));
  return qs;
}

type PgListingFiltersProps = {
  filters: PgFilterState;
  onChange: (next: PgFilterState) => void;
  onApply: () => void;
  hideCityField?: boolean;
};

export function PgListingFilters({ filters, onChange, onApply, hideCityField }: PgListingFiltersProps) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const patch = useCallback((partial: Partial<PgFilterState>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const apply = () => {
    onChange(draft);
    onApply();
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!hideCityField ? (
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">City</span>
            <input
              type="text"
              value={draft.city}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder="Gurugram"
              className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
            />
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Locality</span>
          <input
            type="text"
            value={draft.locality}
            onChange={(e) => patch({ locality: e.target.value })}
            placeholder="Sector 39"
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">PG name</span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Search by name"
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Type</span>
          <input
            type="text"
            value={draft.type}
            onChange={(e) => patch({ type: e.target.value })}
            placeholder="Co-living"
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Min price (₹)</span>
          <input
            type="number"
            min={0}
            value={draft.minPrice}
            onChange={(e) => patch({ minPrice: e.target.value })}
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Max price (₹)</span>
          <input
            type="number"
            min={0}
            value={draft.maxPrice}
            onChange={(e) => patch({ maxPrice: e.target.value })}
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Preferred guests</span>
          <select
            value={draft.preferredGuest}
            onChange={(e) => patch({ preferredGuest: e.target.value })}
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
          >
            <option value="">Any</option>
            <option value="Both">Both</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Sort by</span>
          <select
            value={`${draft.sortBy}:${draft.orderBy}`}
            onChange={(e) => {
              const [sortBy, orderBy] = e.target.value.split(":");
              patch({ sortBy, orderBy: orderBy as "1" | "-1" });
            }}
            className="w-full rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-brand)]"
          >
            <option value="added_on:-1">Newest</option>
            <option value="rating:-1">Rating (high)</option>
            <option value="minMonthlyRent:1">Price (low)</option>
            <option value="maxMonthlyRent:-1">Price (high)</option>
            <option value="name:1">Name (A–Z)</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={draft.verified}
            onChange={(e) => patch({ verified: e.target.checked })}
            className="rounded border-slate-300"
          />
          Verified only
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={draft.foodIncluded}
            onChange={(e) => patch({ foodIncluded: e.target.checked })}
            className="rounded border-slate-300"
          />
          Food included
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={draft.parking}
            onChange={(e) => patch({ parking: e.target.checked })}
            className="rounded border-slate-300"
          />
          Parking
        </label>
        <button
          type="button"
          onClick={apply}
          className="ml-auto inline-flex items-center justify-center rounded-full bg-[color:var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(18,184,134,0.28)] transition hover:bg-[color:var(--color-accent)]"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
