"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { ListingModel } from "@/types/listing.model";

import { mapWorkSpaceToCoworkingWizardState } from "../../lib/map-workspace-to-wizard";

import {
  DEFAULT_COUNTRY_ID,
  MIN_DESCRIPTION_WORDS,
  MIN_IMAGES,
} from "../wizard/constants";
import {
  emptyLocation,
  validateLocation,
} from "../wizard/shared-location-step";
import { validateGallery } from "../wizard/shared-gallery-step";
import { usePersistedDraft } from "../wizard/use-persisted-draft";

import type {
  AmenitySelection,
  CoworkingHoursState,
  CoworkingWizardState,
  DeskTypeSelection,
} from "./types";

const initialHours: CoworkingHoursState = {
  weekdayOpen: true,
  weekdayFrom: "09:00 AM",
  weekdayTo: "08:00 PM",
  saturdayOpen: true,
  saturdayFrom: "09:00 AM",
  saturdayTo: "08:00 PM",
  sundayOpen: false,
  sundayFrom: "",
  sundayTo: "",
};

const initialState: CoworkingWizardState = {
  name: "",
  seats: "",
  description: "",
  deskTypes: [],
  amenities: [],
  hours: initialHours,
  location: emptyLocation,
  images: [],
};

/** Angular `coworking-addproperty.component.ts` desk-type → duration mapping. */
const KNOWN_DESK_TYPE_DURATIONS: Record<string, ListingModel.DurationValue> = {
  "6231b1722a52af3ddaa73a44": "day",
  "6231bca42a52af3ddaa73ab1": "year",
};

function deskTypeToDuration(categoryId: string): ListingModel.DurationValue {
  return KNOWN_DESK_TYPE_DURATIONS[categoryId] ?? "month";
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// --- Catalog loading (amenities + active categories) ---------------------

type Catalog = {
  amenities: ListingModel.Amenity[];
  activeCategories: ListingModel.ActiveCategory[];
};

function filterCoworkingAmenities(list: ListingModel.Amenity[]): ListingModel.Amenity[] {
  return list.filter((a) => a.for_coWorking === true);
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>({
    amenities: [],
    activeCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [amenRes, catRes] = await Promise.all([
          fetch("/api/admin/amenties", { cache: "no-store" }),
          fetch("/api/admin/Active_category", { cache: "no-store" }),
        ]);
        const amenJson = (await amenRes.json().catch(() => null)) as
          | ListingModel.ApiEnvelope<ListingModel.Amenity[]>
          | null;
        const catJson = (await catRes.json().catch(() => null)) as
          | ListingModel.ApiEnvelope<ListingModel.ActiveCategory[]>
          | null;

        if (cancelled) return;
        if (!amenRes.ok) throw new Error(amenJson?.message || `Amenities HTTP ${amenRes.status}`);
        if (!catRes.ok) throw new Error(catJson?.message || `Desk types HTTP ${catRes.status}`);

        setCatalog({
          amenities: filterCoworkingAmenities(amenJson?.data ?? []),
          activeCategories: catJson?.data ?? [],
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load catalog.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loading, error };
}

// --- Payload builder -----------------------------------------------------

function blankDay() {
  return {
    from: " ",
    to: " ",
    should_show: false,
    is_closed: false,
    is_open_24: false,
  };
}

export function buildHoursOfOperation(
  h: CoworkingHoursState,
): ListingModel.HoursOfOperation {
  const hours = {
    monday: { ...blankDay(), should_show: true },
    tuesday: { ...blankDay() },
    wednesday: { ...blankDay() },
    thursday: { ...blankDay() },
    friday: { ...blankDay() },
    saturday: { ...blankDay() },
    sunday: { ...blankDay() },
  };

  if (h.weekdayOpen && h.weekdayFrom && h.weekdayTo) {
    (["monday", "tuesday", "wednesday", "thursday", "friday"] as const).forEach(
      (day) => {
        hours[day].from = h.weekdayFrom;
        hours[day].to = h.weekdayTo;
        hours[day].should_show = day === "monday";
      },
    );
  }
  if (h.saturdayOpen && h.saturdayFrom && h.saturdayTo) {
    hours.saturday.from = h.saturdayFrom;
    hours.saturday.to = h.saturdayTo;
    hours.saturday.should_show = true;
  }
  if (h.sundayOpen && h.sundayFrom && h.sundayTo) {
    hours.sunday.from = h.sundayFrom;
    hours.sunday.to = h.sundayTo;
    hours.sunday.should_show = true;
  }
  return hours as ListingModel.HoursOfOperation;
}

export function buildOpeningHoursString(h: CoworkingHoursState): string {
  const parts: string[] = [];
  if (h.weekdayOpen && h.weekdayFrom && h.weekdayTo) {
    parts.push(`Mon - Fri : ${h.weekdayFrom} to ${h.weekdayTo}`);
  }
  if (h.saturdayOpen && h.saturdayFrom && h.saturdayTo) {
    parts.push(`Sat : ${h.saturdayFrom} to ${h.saturdayTo}`);
  }
  if (h.sundayOpen && h.sundayFrom && h.sundayTo) {
    parts.push(`Sun : ${h.sundayFrom} to ${h.sundayTo}`);
  }
  return parts.join(" and ");
}

export function buildCoworkingPayload(
  state: CoworkingWizardState,
): ListingModel.WorkSpacePayload {
  const plans: ListingModel.Plan[] = state.deskTypes.map((d) => {
    const priceNum = Number(d.price) || 0;
    return {
      duration: deskTypeToDuration(d.id),
      category: d.raw as unknown as ListingModel.Plan["category"],
      number_of_items: "" as unknown as ListingModel.Plan["number_of_items"],
      price: priceNum,
      should_show: true,
      _id: d.id,
    } as ListingModel.Plan;
  });

  const desk_types = state.deskTypes.map((d) => d.name).join(", ");

  return {
    name: state.name.trim(),
    description: state.description.trim(),
    no_of_seats: Number(state.seats) || 0,
    desk_types,
    city_name: state.location.cityName,
    opening_hours: buildOpeningHoursString(state.hours),
    hours_of_operation: buildHoursOfOperation(state.hours),
    plans,
    amenties: state.amenities,
    images: state.images.map((img) => ({
      image: img.image,
      url: img.url,
      order: img.order,
    })),
    location: {
      address1: state.location.address,
      landmark: state.location.metroLandmark,
      metro_stop_landmark: state.location.nearByLandmark,
      country: DEFAULT_COUNTRY_ID,
      city: state.location.cityId,
      micro_location: state.location.microLocationId,
      is_near_metro: Boolean(state.location.metroLandmark),
    },
    added_by_user: "seller",
  };
}

// --- The hook -----------------------------------------------------------

const COWORKING_DRAFT_KEY = "spacewallah:listing:coworking:draft/v2";

export type UseCoworkingWizardOptions = {
  /** When set, load that listing for editing (GET `/api/admin/userworkSpace/:id`). */
  editId?: string | null;
};

export function useCoworkingWizard(options: UseCoworkingWizardOptions = {}) {
  const editId = options.editId?.trim() || null;
  const draftEnabled = !editId;

  const [state, setState] = useState<CoworkingWizardState>(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(Boolean(editId));

  const { hydrated, clearDraft } = usePersistedDraft<CoworkingWizardState>({
    storageKey: COWORKING_DRAFT_KEY,
    state,
    setState,
    stepIndex,
    setStepIndex,
    enabled: draftEnabled,
  });

  useEffect(() => {
    if (!editId) {
      setInitializing(false);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setInitializing(true);
    setLoadError(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/userworkSpace/${encodeURIComponent(editId)}`,
          { cache: "no-store" },
        );
        const json = (await res.json().catch(() => null)) as
          | { data?: CoworkingModel.WorkSpace; message?: string }
          | null;
        if (!res.ok) {
          const msg =
            json?.message ||
            (res.status === 401
              ? "Please sign in again to edit this listing."
              : `Could not load listing (HTTP ${res.status}).`);
          if (!cancelled) setLoadError(msg);
          return;
        }
        const data = json?.data;
        if (data && !cancelled) {
          setState(mapWorkSpaceToCoworkingWizardState(data));
          setStepIndex(0);
          clearDraft();
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load listing.");
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // clearDraft is stable for our purposes; we only re-fetch when `editId` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const set = useCallback(<K extends keyof CoworkingWizardState>(
    key: K,
    value: CoworkingWizardState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const patchLocation = useCallback((patch: Partial<typeof state.location>) => {
    setState((prev) => ({ ...prev, location: { ...prev.location, ...patch } }));
  }, []);

  const patchHours = useCallback((patch: Partial<CoworkingHoursState>) => {
    setState((prev) => ({ ...prev, hours: { ...prev.hours, ...patch } }));
  }, []);

  const toggleAmenity = useCallback((a: AmenitySelection) => {
    setState((prev) => {
      const exists = prev.amenities.some((x) => x.id === a.id);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((x) => x.id !== a.id)
          : [...prev.amenities, a],
      };
    });
  }, []);

  const toggleDeskType = useCallback((cat: ListingModel.ActiveCategory) => {
    setState((prev) => {
      const exists = prev.deskTypes.some((x) => x.id === cat.id);
      return {
        ...prev,
        deskTypes: exists
          ? prev.deskTypes.filter((x) => x.id !== cat.id)
          : [...prev.deskTypes, { id: cat.id, name: cat.name, price: "", raw: cat }],
      };
    });
  }, []);

  const setDeskPrice = useCallback((id: string, price: string) => {
    setState((prev) => ({
      ...prev,
      deskTypes: prev.deskTypes.map((d) => (d.id === id ? { ...d, price } : d)),
    }));
  }, []);

  // --- Validation per step -----------------------------------------

  const basicInfoError = useMemo(() => {
    if (state.name.trim().length < 2) return "Space name is required (min 2 characters).";
    const seats = Number(state.seats);
    if (!Number.isFinite(seats) || seats <= 0) return "Please enter a valid seat count.";
    if (countWords(state.description) < MIN_DESCRIPTION_WORDS) {
      return `Description must be at least ${MIN_DESCRIPTION_WORDS} words.`;
    }
    if (state.deskTypes.length === 0) return "Pick at least one desk type.";
    const missingPrice = state.deskTypes.find(
      (d) => !d.price || Number(d.price) <= 0,
    );
    if (missingPrice) return `Enter a price for ${missingPrice.name}.`;
    if (state.amenities.length === 0) return "Select at least one amenity.";
    if (state.hours.weekdayOpen && (!state.hours.weekdayFrom || !state.hours.weekdayTo)) {
      return "Please set weekday opening hours.";
    }
    if (state.hours.saturdayOpen && (!state.hours.saturdayFrom || !state.hours.saturdayTo)) {
      return "Please set Saturday opening hours.";
    }
    if (state.hours.sundayOpen && (!state.hours.sundayFrom || !state.hours.sundayTo)) {
      return "Please set Sunday opening hours.";
    }
    return null;
  }, [state]);

  const locationError = useMemo(() => validateLocation(state.location), [state.location]);
  const galleryError = useMemo(() => validateGallery(state.images), [state.images]);

  // --- Submit ------------------------------------------------------

  async function submit(): Promise<void> {
    setSubmitError(null);
    setSuccess(null);
    const firstError = basicInfoError || locationError || galleryError;
    if (firstError) {
      setSubmitError(firstError);
      return;
    }
    setBusy(true);
    try {
      const basePayload = buildCoworkingPayload(state);
      const payload = editId ? { ...basePayload, id: editId } : basePayload;
      const res = await fetch("/api/admin/workSpace", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as
        | { message?: string; data?: unknown; error?: { message?: string } }
        | null;
      if (!res.ok) {
        const msg =
          json?.error?.message ||
          json?.message ||
          (res.status === 401
            ? "Please login again before saving."
            : `Failed to save (HTTP ${res.status}).`);
        throw new Error(msg);
      }
      setSuccess(
        editId
          ? "Your coworking space was updated successfully."
          : "Coworking space saved successfully. You can manage it from your dashboard.",
      );
      if (!editId) {
        clearDraft();
        setState(initialState);
        setStepIndex(0);
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const resetDraft = useCallback(() => {
    clearDraft();
    setState(initialState);
    setStepIndex(0);
    setSubmitError(null);
    setSuccess(null);
  }, [clearDraft]);

  return {
    state,
    set,
    patchLocation,
    patchHours,
    toggleAmenity,
    toggleDeskType,
    setDeskPrice,
    stepIndex,
    setStepIndex,
    busy,
    submitError,
    success,
    basicInfoError,
    locationError,
    galleryError,
    submit,
    hydrated,
    resetDraft,
    editId,
    loadError,
    initializing,
  };
}

export type UseCoworkingWizardReturn = ReturnType<typeof useCoworkingWizard>;

/** Word count helper re-exported for UI usage. */
export const coworkingMinDescriptionWords = MIN_DESCRIPTION_WORDS;
export const coworkingMinImages = MIN_IMAGES;
