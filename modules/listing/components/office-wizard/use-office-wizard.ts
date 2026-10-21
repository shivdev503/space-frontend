"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { OfficeSpaceModel } from "@/types/office-space.model";
import type { ListingModel } from "@/types/listing.model";

import { mapOfficeSpaceToOfficeWizardState } from "../../lib/map-office-to-wizard";

import { DEFAULT_COUNTRY_ID, MIN_DESCRIPTION_WORDS } from "../wizard/constants";
import {
  emptyLocation,
  validateLocation,
} from "../wizard/shared-location-step";
import { validateGallery } from "../wizard/shared-gallery-step";
import type { LocationFormState } from "../wizard/shared-location-step";
import { usePersistedDraft } from "../wizard/use-persisted-draft";

export type OfficeWizardState = {
  name: string;
  area: string;
  rent: string;
  officeType: ListingModel.OfficeType | "";
  description: string;
  amenities: ListingModel.Amenity[];
  location: LocationFormState;
  images: ListingModel.ListingImage[];
};

const initialState: OfficeWizardState = {
  name: "",
  area: "",
  rent: "",
  officeType: "",
  description: "",
  amenities: [],
  location: emptyLocation,
  images: [],
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function useOfficeAmenities() {
  const [amenities, setAmenities] = useState<ListingModel.Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/amenties", { cache: "no-store" });
        const json = (await res.json().catch(() => null)) as
          | ListingModel.ApiEnvelope<ListingModel.Amenity[]>
          | null;
        if (cancelled) return;
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
        const filtered = (json?.data ?? []).filter((a) => a.for_office === true);
        setAmenities(filtered);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load amenities.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { amenities, loading, error };
}

export function buildOfficePayload(state: OfficeWizardState): ListingModel.OfficeSpacePayload {
  return {
    name: state.name.trim(),
    description: state.description.trim(),
    city_name: state.location.cityName,
    amenties: state.amenities,
    images: state.images.map((img) => ({
      image: img.image,
      url: img.url,
      order: img.order,
    })),
    other_detail: {
      area_for_lease_in_sq_ft: Number(state.area) || 0,
      rent_in_sq_ft: state.rent.trim(),
      office_type:
        (state.officeType as ListingModel.OfficeType) ||
        ("fully-furnished" as ListingModel.OfficeType),
    },
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

const OFFICE_DRAFT_KEY = "spacewallah:listing:office:draft/v2";

export type UseOfficeWizardOptions = {
  editId?: string | null;
};

export function useOfficeWizard(options: UseOfficeWizardOptions = {}) {
  const editId = options.editId?.trim() || null;
  const draftEnabled = !editId;

  const [state, setState] = useState<OfficeWizardState>(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(Boolean(editId));

  const { hydrated, clearDraft } = usePersistedDraft<OfficeWizardState>({
    storageKey: OFFICE_DRAFT_KEY,
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
          `/api/admin/userofficeSpaces/${encodeURIComponent(editId)}`,
          { cache: "no-store" },
        );
        const json = (await res.json().catch(() => null)) as
          | { data?: OfficeSpaceModel.OfficeSpace; message?: string }
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
          setState(mapOfficeSpaceToOfficeWizardState(data));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const set = useCallback(<K extends keyof OfficeWizardState>(key: K, value: OfficeWizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const patchLocation = useCallback((patch: Partial<LocationFormState>) => {
    setState((prev) => ({ ...prev, location: { ...prev.location, ...patch } }));
  }, []);

  const toggleAmenity = useCallback((a: ListingModel.Amenity) => {
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

  const basicInfoError = useMemo(() => {
    if (state.name.trim().length < 2) return "Building / office name is required.";
    if (!Number.isFinite(Number(state.area)) || Number(state.area) <= 0) {
      return "Please enter a valid area (sq ft).";
    }
    if (state.rent.trim().length === 0) return "Please enter rent per sq ft.";
    if (!state.officeType) return "Select a furnishing type.";
    if (countWords(state.description) < MIN_DESCRIPTION_WORDS) {
      return `Description must be at least ${MIN_DESCRIPTION_WORDS} words.`;
    }
    if (state.amenities.length === 0) return "Select at least one amenity.";
    return null;
  }, [state]);

  const locationError = useMemo(() => validateLocation(state.location), [state.location]);
  const galleryError = useMemo(() => validateGallery(state.images), [state.images]);

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
      const basePayload = buildOfficePayload(state);
      const payload = editId ? { ...basePayload, id: editId } : basePayload;
      const res = await fetch("/api/admin/officeSpaces", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
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
          ? "Your managed office was updated successfully."
          : "Office space saved successfully. You can manage it from your dashboard.",
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
    toggleAmenity,
    stepIndex,
    setStepIndex,
    busy,
    submitError,
    success,
    basicInfoError,
    locationError,
    galleryError,
    submit,
    countWords,
    hydrated,
    resetDraft,
    editId,
    loadError,
    initializing,
  };
}

export type UseOfficeWizardReturn = ReturnType<typeof useOfficeWizard>;
