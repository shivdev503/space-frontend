"use client";

import { useCallback } from "react";

import type { ListingModel } from "@/types/listing.model";

import { isPlaceholderPin } from "@/lib/listing-pin";

import { AsyncSearchSelect, type AsyncOption } from "./async-search-select";
import { DEFAULT_COUNTRY_ID } from "./constants";
import { Field, TextArea, TextInput } from "./fields";

export type LocationFormState = {
  cityId: string;
  cityName: string;
  microLocationId: string;
  microLocationName: string;
  /** maps to upstream `location.address1` */
  address: string;
  /** maps to upstream `location.landmark` */
  metroLandmark: string;
  /** maps to upstream `location.nearby_landmark` */
  nearByLandmark: string;
  /** When editing: fields the form doesn't show (pin, building, floor…), sent back unchanged. */
  kept?: Record<string, unknown>;
};

const NOT_KEPT = new Set(["city", "micro_location", "address", "id", "_id"]);

/** Saved location fields to send back on an edit; the API replaces the whole `location`. */
export function keptLocationFields(location: unknown): Record<string, unknown> {
  if (!location || typeof location !== "object") return {};
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(location)) {
    // Refs arrive populated; `state` is the only one the form doesn't set.
    if (key === "state" && value && typeof value === "object") {
      const ref = value as { _id?: string; id?: string };
      if (ref._id || ref.id) kept.state = ref._id || ref.id;
    } else if (["string", "number", "boolean"].includes(typeof value) && !NOT_KEPT.has(key)) {
      kept[key] = value;
    }
  }
  if (isPlaceholderPin(kept.longitude)) {
    delete kept.latitude;
    delete kept.longitude;
  }
  return kept;
}

export const emptyLocation: LocationFormState = {
  cityId: "",
  cityName: "",
  microLocationId: "",
  microLocationName: "",
  address: "",
  metroLandmark: "",
  nearByLandmark: "",
};

type Props = {
  value: LocationFormState;
  onChange: (patch: Partial<LocationFormState>) => void;
  disabled?: boolean;
};

/** Page size used on both the city and micro-location async dropdowns. */
const LOCATION_PAGE_SIZE = 10;

/**
 * Shared location step used by both the coworking and office-space wizards.
 *
 * Both the city and micro-location inputs are debounced async comboboxes
 * backed by paginated upstream endpoints:
 *
 *   GET /api/admin/city/getCityByCountryOnly/:countryId?page=1&limit=10&name=<q>
 *   GET /api/admin/microLocationByCity/:cityId?page=1&limit=10&name=<q>
 *
 * On focus each select shows the first 10 rows; typing in the input
 * debounces a name-search query. Selecting a city clears the current
 * micro-location choice so the dependent dropdown starts clean.
 */
export function SharedLocationStep({ value, onChange, disabled }: Props) {
  const fetchCities = useCallback(
    async (query: string, signal: AbortSignal) => {
      const url = new URL(
        `/api/admin/city/getCityByCountryOnly/${encodeURIComponent(DEFAULT_COUNTRY_ID)}`,
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", String(LOCATION_PAGE_SIZE));
      if (query) url.searchParams.set("name", query);

      const res = await fetch(url.pathname + url.search, {
        cache: "no-store",
        signal,
      });
      const json = (await res.json().catch(() => null)) as
        | ListingModel.ApiEnvelope<ListingModel.CountryStateCity[]>
        | { message?: string }
        | null;
      if (!res.ok) {
        const msg =
          (json as { message?: string } | null)?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const envelope = (json ?? {}) as ListingModel.ApiEnvelope<
        ListingModel.CountryStateCity[]
      >;
      const cities = envelope.data ?? [];

      return {
        options: cities.map<AsyncOption>((c) => ({ value: c.id, label: c.name })),
        meta: {
          totalRecords: envelope.totalRecords ?? cities.length,
        } as const,
      };
    },
    [],
  );

  const cityId = value.cityId;
  const fetchMicroLocations = useCallback(
    async (query: string, signal: AbortSignal) => {
      if (!cityId) return { options: [] };

      const url = new URL(
        `/api/admin/microLocationByCity/${encodeURIComponent(cityId)}`,
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", String(LOCATION_PAGE_SIZE));
      if (query) url.searchParams.set("name", query);

      const res = await fetch(url.pathname + url.search, {
        cache: "no-store",
        signal,
      });
      const json = (await res.json().catch(() => null)) as
        | ListingModel.ApiEnvelope<ListingModel.MicroLocation[]>
        | { message?: string }
        | null;
      if (!res.ok) {
        const msg =
          (json as { message?: string } | null)?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const envelope = (json ?? {}) as ListingModel.ApiEnvelope<
        ListingModel.MicroLocation[]
      >;
      const rows = envelope.data ?? [];

      return {
        options: rows.map<AsyncOption>((m) => ({ value: m.id, label: m.name })),
        meta: {
          totalRecords: envelope.totalRecords ?? rows.length,
        } as const,
      };
    },
    [cityId],
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="City"
          required
          hint="Type to search — we only pull the top 10 matches at a time"
        >
          <AsyncSearchSelect
            value={value.cityId}
            selectedLabel={value.cityName || undefined}
            onChange={(opt) => {
              onChange({
                cityId: opt?.value ?? "",
                cityName: opt?.label ?? "",
                microLocationId: "",
                microLocationName: "",
                // Another city: the saved pin and state no longer apply.
                ...(value.kept && opt?.value !== value.cityId
                  ? { kept: { ...value.kept, latitude: undefined, longitude: undefined, state: undefined } }
                  : {}),
              });
            }}
            fetcher={fetchCities}
            placeholder={value.cityId ? value.cityName : "Start typing a city…"}
            disabled={disabled}
            noResultsText="No cities matched your search."
            footerText={`Top ${LOCATION_PAGE_SIZE} matches`}
          />
        </Field>

        <Field
          label="Micro-location"
          required
          hint={
            !value.cityId
              ? "Pick a city first"
              : "Type to search — e.g. sector, phase, block"
          }
        >
          <AsyncSearchSelect
            value={value.microLocationId}
            selectedLabel={value.microLocationName || undefined}
            onChange={(opt) => {
              onChange({
                microLocationId: opt?.value ?? "",
                microLocationName: opt?.label ?? "",
              });
            }}
            fetcher={fetchMicroLocations}
            placeholder={
              value.cityId
                ? value.microLocationName || "Start typing a locality…"
                : "Pick a city first"
            }
            disabled={disabled || !value.cityId}
            noResultsText={
              value.cityId
                ? "No micro-locations matched your search."
                : "Pick a city first."
            }
            footerText={`Top ${LOCATION_PAGE_SIZE} matches`}
          />
        </Field>
      </div>

      <Field label="Street address" required hint="Building / locality / street as it should appear to buyers">
        <TextArea
          value={value.address}
          onChange={(v) => onChange({ address: v })}
          placeholder="e.g. Tower A, 5th Floor, DLF Cyber City, Sector 25"
          rows={3}
          disabled={disabled}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Near-by metro station" hint="Leaving this blank is fine if there is none">
          <TextInput
            value={value.metroLandmark}
            onChange={(v) => onChange({ metroLandmark: v })}
            placeholder="e.g. Cyber City Metro Station"
            disabled={disabled}
          />
        </Field>
        <Field label="Other near-by landmark">
          <TextInput
            value={value.nearByLandmark}
            onChange={(v) => onChange({ nearByLandmark: v })}
            placeholder="e.g. Opposite Ambience Mall"
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}

/** Returns the first validation message or `null` when valid. */
export function validateLocation(v: LocationFormState): string | null {
  if (!v.cityId) return "Please select a city.";
  if (!v.microLocationId) return "Please select a micro-location.";
  if (v.address.trim().length < 10) return "Address must be at least 10 characters.";
  return null;
}
