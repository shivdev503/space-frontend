"use client";

import { useMemo } from "react";

import { SharedGalleryStep } from "../wizard/shared-gallery-step";
import { SharedLocationStep } from "../wizard/shared-location-step";
import { WizardShell, type WizardStep } from "../wizard/wizard-shell";

import { OfficeStepBasicInfo } from "./step-basic-info";
import { OfficeStepReview } from "./step-review";
import { useOfficeAmenities, useOfficeWizard } from "./use-office-wizard";

type Props = {
  userName?: string;
  editId?: string | null;
};

/**
 * Office-space multi-step wizard. Mirrors the Angular
 * `AddOfficeSpaceComponent` flow: basic info → location → gallery → review,
 * with the single save happening only on the final step via
 * `POST /api/admin/officeSpaces`.
 */
export function OfficeWizard({ userName, editId = null }: Props) {
  const wizard = useOfficeWizard({ editId });
  const {
    amenities,
    loading: amenitiesLoading,
    error: amenitiesError,
  } = useOfficeAmenities();

  const steps = useMemo<WizardStep[]>(
    () => [
      {
        id: "basic",
        title: "Basic information",
        description: userName
          ? `Hi ${userName}, start with the essentials.`
          : "Start with the essentials.",
        content: (
          <OfficeStepBasicInfo
            wizard={wizard}
            amenities={amenities}
            amenitiesLoading={amenitiesLoading}
            amenitiesError={amenitiesError}
          />
        ),
        validate: () => wizard.basicInfoError,
      },
      {
        id: "location",
        title: "Where is the property?",
        description: "Pick city, micro-location and address.",
        content: (
          <SharedLocationStep
            value={wizard.state.location}
            onChange={wizard.patchLocation}
            disabled={wizard.busy}
          />
        ),
        validate: () => wizard.locationError,
      },
      {
        id: "gallery",
        title: "Photos",
        description: "Upload clear photos of the building, floor plates, and common areas.",
        content: (
          <SharedGalleryStep
            images={wizard.state.images}
            onChange={(imgs) => wizard.set("images", imgs)}
            disabled={wizard.busy}
          />
        ),
        validate: () => wizard.galleryError,
      },
      {
        id: "review",
        title: "Review & submit",
        description: "Take a final look — everything below is saved together.",
        content: <OfficeStepReview state={wizard.state} />,
      },
    ],
    [wizard, amenities, amenitiesLoading, amenitiesError, userName],
  );

  if (wizard.loadError) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50/90 px-5 py-6 text-sm text-red-900">
        {wizard.loadError}
      </div>
    );
  }

  if (wizard.initializing) {
    return (
      <div className="rounded-[1.75rem] border border-ink/10 bg-white px-5 py-12 text-center text-sm text-ink/70 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        Loading your listing…
      </div>
    );
  }

  return (
    <WizardShell
      steps={steps}
      currentIndex={wizard.stepIndex}
      onStepChange={wizard.setStepIndex}
      onSubmit={wizard.submit}
      busy={wizard.busy}
      error={wizard.submitError}
      success={wizard.success}
      submitLabel={wizard.editId ? "Update managed office" : "Save managed office"}
      onResetDraft={wizard.editId ? undefined : wizard.resetDraft}
    />
  );
}
