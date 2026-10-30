"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";

import { COLIVING_LISTING_STEPS } from "./coliving-listing.constants";
import { ColivingMobileStepBody } from "./coliving-listing-step-body";
import { ColivingChevron, ColivingStepSuccess } from "./coliving-listing-steps";
import type { ColivingListingDraft } from "./coliving-listing.types";

type Props = {
  stepIdx: number;
  data: ColivingListingDraft;
  set: (patch: Partial<ColivingListingDraft>) => void;
  patchLocation: (patch: Partial<ColivingListingDraft["location"]>) => void;
  setImages: (images: ColivingListingDraft["images"]) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void | Promise<void>;
  onView: () => void;
  onAnother: () => void;
  isSuccess: boolean;
  busy?: boolean;
  submitError?: string | null;
  isEdit?: boolean;
};

function StepDots({ stepIdx }: { stepIdx: number }) {
  const total = COLIVING_LISTING_STEPS.length;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 8,
          right: 8,
          height: 2,
          background: "var(--c-line)",
          transform: "translateY(-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 8,
          height: 2,
          background: "var(--c-primary)",
          transform: "translateY(-50%)",
          width: `calc((100% - 16px) * ${stepIdx / (total - 1)})`,
          transition: "width .3s",
        }}
      />
      {COLIVING_LISTING_STEPS.map((s, i) => {
        const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "todo";
        return (
          <div
            key={s.key}
            style={{
              position: "relative",
              zIndex: 1,
              width: state === "active" ? 22 : 16,
              height: state === "active" ? 22 : 16,
              borderRadius: "50%",
              background: state === "todo" ? "var(--c-surface-2)" : "var(--c-primary)",
              border:
                state === "todo"
                  ? "1.5px solid var(--c-line-strong)"
                  : "1.5px solid var(--c-primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9.5,
              fontWeight: 700,
              boxShadow: state === "active" ? "0 0 0 4px var(--c-primary-soft)" : "none",
              transition: "all .2s",
            }}
          >
            {state === "done" ? <Check size={10} strokeWidth={3.2} /> : state === "active" ? s.n : null}
          </div>
        );
      })}
    </div>
  );
}

export function ColivingListingMobileChrome({
  stepIdx,
  data,
  set,
  patchLocation,
  setImages,
  onBack,
  onNext,
  onSubmit,
  onView,
  onAnother,
  isSuccess,
  busy,
  submitError,
  isEdit,
}: Props) {
  const step = COLIVING_LISTING_STEPS[stepIdx];
  const isLast = stepIdx === COLIVING_LISTING_STEPS.length - 1;
  const pct = Math.round(((stepIdx + 1) / COLIVING_LISTING_STEPS.length) * 100);

  if (isSuccess) {
    return (
      <div className="lf-screen">
        <div className="lf-topbar">
          <div className="lf-logo">
            <span className="lf-logo-dot" />
            SpaceWallah
          </div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--c-success)",
            }}
          >
            Submitted
          </div>
        </div>
        <ColivingStepSuccess data={data} onView={onView} onAnother={onAnother} />
      </div>
    );
  }

  return (
    <div className="lf-screen">
      <div className="lf-topbar">
        <div className="lf-logo">
          <span className="lf-logo-dot" />
          SpaceWallah
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/add/dashboard" className="lf-save" style={{ textDecoration: "none" }}>
            My listings
          </Link>
          <Link href="/add" className="lf-save" style={{ textDecoration: "none" }}>
            Exit
          </Link>
        </div>
      </div>

      <div className="lf-stepper">
        <div className="lf-stepper-meta">
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            <span className="lf-step-n">Step {step.n}</span>
            <span style={{ color: "var(--c-faint)" }}> / {COLIVING_LISTING_STEPS.length}</span>
            <span style={{ color: "var(--c-ink-2)", margin: "0 6px" }}>·</span>
            <span style={{ color: "var(--c-ink-2)" }}>{step.label}</span>
          </span>
          <span className="lf-step-pct">{pct}%</span>
        </div>
        <StepDots stepIdx={stepIdx} />
      </div>

      <div className="lf-head">
        <div className="lf-eyebrow">{step.label}</div>
        <h1 className="lf-title">{step.title}</h1>
        <p className="lf-sub">{step.sub}</p>
      </div>

      <div className="lf-body">
        {submitError ? (
          <div
            className="lf-helper"
            style={{
              color: "var(--c-danger)",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          >
            {submitError}
          </div>
        ) : null}
        <ColivingMobileStepBody
          stepIdx={stepIdx}
          data={data}
          set={set}
          patchLocation={patchLocation}
          setImages={setImages}
          disabled={busy}
        />
      </div>

      <div className="lf-foot-hint" title="auto-saved">
        <Check size={11} strokeWidth={2.4} />
        Your progress is auto-saved
      </div>

      <div className="lf-foot">
        <button
          type="button"
          className="lf-btn ghost"
          onClick={onBack}
          disabled={stepIdx === 0}
          style={stepIdx === 0 ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
        >
          <ColivingChevron direction="left" /> Back
        </button>
        <button
          type="button"
          className="lf-btn primary"
          disabled={busy}
          onClick={() => void (isLast ? onSubmit() : onNext())}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> {isEdit ? "Saving…" : "Submitting…"}
            </span>
          ) : isLast
              ? isEdit
                ? "Update listing"
                : "Submit Listing"
              : "Continue"}{" "}
          {!isLast && !busy ? <ColivingChevron direction="right" /> : null}
        </button>
      </div>
    </div>
  );
}
