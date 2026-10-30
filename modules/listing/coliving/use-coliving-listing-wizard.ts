"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { mapPgApiToColivingDraft } from "@/lib/pg-listing-mapper";
import { validateColivingLocation } from "@/lib/pg-listing-payload";
import { MIN_IMAGES } from "@/modules/listing/components/wizard/constants";
import {
  validateGallery,
} from "@/modules/listing/components/wizard/shared-gallery-step";
import { usePersistedDraft } from "@/modules/listing/components/wizard/use-persisted-draft";

import {
  COLIVING_DRAFT_STORAGE_KEY,
  COLIVING_LISTING_STEPS,
} from "./coliving-listing.constants";
import {
  DEFAULT_COLIVING_LISTING,
  type ColivingListingDraft,
} from "./coliving-listing.types";

export type UseColivingListingWizardOptions = {
  editId?: string | null;
};

function validateBasic(draft: ColivingListingDraft): string | null {
  if (draft.name.trim().length < 2) return "Property name is required (min 2 characters).";
  return null;
}

function validateRooms(draft: ColivingListingDraft): string | null {
  if (!draft.rooms.length) return "Add at least one room type.";
  const invalid = draft.rooms.find((r) => !r.rent.trim() || parseRent(r.rent) <= 0);
  if (invalid) return `Enter monthly rent for ${invalid.kind || "each room type"}.`;
  return null;
}

function parseRent(value: string): number {
  const n = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function validateStep(stepIdx: number, draft: ColivingListingDraft): string | null {
  switch (stepIdx) {
    case 0:
      return validateBasic(draft);
    case 1:
      return validateColivingLocation(draft.location);
    case 2:
      return validateRooms(draft);
    case 6:
      return validateGallery(draft.images);
    default:
      return null;
  }
}

export function useColivingListingWizard(options: UseColivingListingWizardOptions = {}) {
  const router = useRouter();
  const editId = options.editId?.trim() || null;
  const draftEnabled = !editId;

  const [data, setDataState] = useState<ColivingListingDraft>(DEFAULT_COLIVING_LISTING);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setBusy] = useState(false);
  // After an edit we open the dashboard; stay busy until it has rendered.
  const [navigating, startNavigation] = useTransition();
  const busy = saving || navigating;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(Boolean(editId));
  const [createdPgId, setCreatedPgId] = useState<string | null>(null);

  const { hydrated, clearDraft } = usePersistedDraft({
    storageKey: COLIVING_DRAFT_STORAGE_KEY,
    state: data,
    setState: setDataState,
    stepIndex: stepIdx,
    setStepIndex: setStepIdx,
    enabled: draftEnabled && !submitted,
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
        const res = await fetch(`/api/admin/pg/${encodeURIComponent(editId)}`, {
          cache: "no-store",
        });
        const json = (await res.json().catch(() => null)) as
          | { data?: Record<string, unknown>; message?: string; session_expired?: boolean }
          | null;

        if (!res.ok) {
          if (res.status === 401 && json?.session_expired) {
            router.replace("/list-your-space?reason=session-expired");
            return;
          }
          const msg =
            json?.message ||
            (res.status === 401
              ? "Please sign in again to edit this listing."
              : `Could not load listing (HTTP ${res.status}).`);
          if (!cancelled) setLoadError(msg);
          return;
        }

        const row = json?.data;
        if (row && !cancelled) {
          setDataState(mapPgApiToColivingDraft(row));
          setStepIdx(0);
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
  }, [editId, router]);

  const set = useCallback((patch: Partial<ColivingListingDraft>) => {
    setDataState((d) => ({ ...d, ...patch }));
  }, []);

  const patchLocation = useCallback((patch: Partial<ColivingListingDraft["location"]>) => {
    setDataState((prev) => ({ ...prev, location: { ...prev.location, ...patch } }));
  }, []);

  const setImages = useCallback((images: ColivingListingDraft["images"]) => {
    setDataState((prev) => ({ ...prev, images }));
  }, []);

  const stepError = useMemo(() => validateStep(stepIdx, data), [stepIdx, data]);

  const goNext = useCallback(() => {
    const err = validateStep(stepIdx, data);
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setStepIdx((i) => Math.min(COLIVING_LISTING_STEPS.length - 1, i + 1));
  }, [stepIdx, data]);

  const goBack = useCallback(() => {
    setSubmitError(null);
    setStepIdx((i) => Math.max(0, i - 1));
  }, []);

  const submit = useCallback(async () => {
    const firstError =
      validateBasic(data) ||
      validateColivingLocation(data.location) ||
      validateRooms(data) ||
      validateGallery(data.images);
    if (firstError) {
      setSubmitError(firstError);
      return;
    }

    setBusy(true);
    setSubmitError(null);

    const body = JSON.stringify({
      draft: data,
      location: data.location,
      images: data.images,
    });

    try {
      const res = await fetch(
        editId ? `/api/admin/pg/${encodeURIComponent(editId)}` : "/api/admin/pg",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
      );

      const json = (await res.json().catch(() => null)) as
        | {
            message?: string;
            error?: { message?: string };
            data?: { _id?: string; id?: string; pg_id?: string };
            session_expired?: boolean;
          }
        | null;

      if (!res.ok) {
        if (res.status === 401 && json?.session_expired) {
          router.replace("/list-your-space?reason=session-expired");
          return;
        }
        throw new Error(
          json?.error?.message ||
            json?.message ||
            (res.status === 401
              ? "Please sign in again before submitting."
              : `Failed to ${editId ? "update" : "submit"} listing (HTTP ${res.status}).`),
        );
      }

      if (editId) {
        startNavigation(() => router.push("/add/dashboard"));
        return;
      }

      const id =
        json?.data?._id ??
        json?.data?.id ??
        (typeof json?.data === "object" && json?.data !== null
          ? (json.data as { pg_id?: string }).pg_id
          : undefined);
      if (id) setCreatedPgId(String(id));

      setSubmitted(true);
      clearDraft();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }, [clearDraft, data, editId, router]);

  const reset = useCallback(() => {
    setStepIdx(0);
    setDataState(DEFAULT_COLIVING_LISTING);
    setSubmitted(false);
    setSubmitError(null);
    setCreatedPgId(null);
    clearDraft();
  }, [clearDraft]);

  const jumpTo = useCallback(
    (i: number) => {
      if (submitted || busy || initializing) return;
      setSubmitError(null);
      setStepIdx(i);
    },
    [submitted, busy, initializing],
  );

  return {
    data,
    set,
    patchLocation,
    setImages,
    stepIdx,
    submitted,
    hydrated: editId ? !initializing : hydrated,
    busy,
    submitError,
    loadError,
    initializing,
    editId,
    stepValidationError: stepError,
    createdPgId,
    goNext,
    goBack,
    submit,
    reset,
    jumpTo,
    minImages: MIN_IMAGES,
  };
}
