"use client";

import Link from "next/link";
import { Check, Clock, Info, MapPin } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";

import { COLIVING_LISTING_STEPS } from "./coliving-listing.constants";
import { COLIVING_DESKTOP_TIPS } from "./coliving-listing-desktop-tips";
import { ColivingStepBody } from "./coliving-listing-step-body";
import { ColivingChevron } from "./coliving-listing-steps";
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
  onJump: (i: number) => void;
  onView: () => void;
  onAnother: () => void;
  isSuccess: boolean;
  busy?: boolean;
  submitError?: string | null;
  isEdit?: boolean;
};

function remainingMinutes(stepIdx: number) {
  return Math.max(1, COLIVING_LISTING_STEPS.length - stepIdx - 1);
}

function stepSubMicro(key: string, data: ColivingListingDraft) {
  switch (key) {
    case "basic":
      return data.name || "Name & type";
    case "location":
      return data.location.microLocationName || data.location.cityName || "City & map pin";
    case "rooms":
      return data.rooms?.length
        ? `${data.rooms.length} room type${data.rooms.length > 1 ? "s" : ""}`
        : "Add room types";
    case "food":
      return "Food, laundry, parking";
    case "amenities":
      return `${(data.amenCommon || []).length + (data.amenRoom || []).length} selected`;
    case "rules":
      return `${(data.rules || []).length} rules set`;
    case "photos":
      return data.images.length ? `${data.images.length} photos` : "Photos & description";
    default:
      return "";
  }
}

export function ColivingListingDesktopChrome({
  stepIdx,
  data,
  set,
  patchLocation,
  setImages,
  onBack,
  onNext,
  onSubmit,
  onJump,
  onView,
  onAnother,
  isSuccess,
  busy,
  submitError,
  isEdit,
}: Props) {
  const step = COLIVING_LISTING_STEPS[stepIdx];
  const isLast = stepIdx === COLIVING_LISTING_STEPS.length - 1;
  const pct = Math.round(((stepIdx + (isSuccess ? 1 : 0)) / COLIVING_LISTING_STEPS.length) * 100);
  const progressPct = isSuccess ? 100 : pct;
  const tip = !isSuccess && step ? COLIVING_DESKTOP_TIPS[step.key] : null;

  if (isSuccess) {
    return (
      <div className="lfd">
        <DesktopTop stepLabel="Submitted" isEdit={isEdit} hideExit />
        <div style={{ flex: 1, display: "flex" }}>
          <div className="lfd-success">
            <div className="lf-check-burst">
              <div className="lf-ring" />
              <div className="lf-ring" />
              <div className="lf-check">
                <Check size={48} strokeWidth={3} />
              </div>
            </div>
            <h1>Your property has been submitted!</h1>
            <p>
              We&apos;ll review and publish your listing within 24 hours. We&apos;ll email you the
              moment it goes live.
            </p>

            <div className="lf-summary" style={{ maxWidth: 420 }}>
              <div className="lf-summary-thumb" />
              <div className="lf-summary-meta">
                <div className="lf-summary-name">{data.name || "Sunrise Co-living"}</div>
                <div className="lf-summary-loc">
                  <MapPin size={14} strokeWidth={2} />
                  <span>
                    {data.location.microLocationName || "Koramangala"},{" "}
                    {data.location.cityName || "Bangalore"}
                  </span>
                </div>
              </div>
              <div className="lf-summary-status">In Review</div>
            </div>

            <div className="lfd-success-row">
              <button type="button" className="lfd-btn ghost" onClick={onAnother}>
                List Another Property
              </button>
              <button type="button" className="lfd-btn primary" onClick={onView}>
                My listings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lfd">
      <DesktopTop stepLabel={step.label} isEdit={isEdit} propertyName={data.name} />

      <div className="lfd-body">
        <aside className="lfd-side">
          <div className="lfd-side-prog">
            <div className="lfd-side-prog-h">
              <span className="lfd-prog-label">Listing progress</span>
              <span className="lfd-prog-pct">{progressPct}%</span>
            </div>
            <div className="lfd-side-bar">
              <div className="lfd-side-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="lfd-side-h">All steps</div>
          <div className="lfd-side-list">
            {COLIVING_LISTING_STEPS.map((s, i) => {
              const cls = i < stepIdx ? "done" : i === stepIdx ? "active" : "";
              return (
                <button
                  key={s.key}
                  type="button"
                  className={`lfd-side-item ${cls}`}
                  onClick={() => onJump(i)}
                >
                  <span className="lfd-side-num">
                    {i < stepIdx ? <Check size={12} strokeWidth={3.2} /> : s.n}
                  </span>
                  <span className="lfd-side-text">
                    <b>{s.label}</b>
                    <span>{stepSubMicro(s.key, data)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lfd-side-help">
            <div className="lfd-side-help-h">
              <Info size={14} strokeWidth={2} /> Need a hand?
            </div>
            <p className="lfd-side-help-p">
              Our hosting team can walk you through listing your property over a quick call.
            </p>
            <Link href="/list-your-space">Book a 15-min call →</Link>
          </div>
        </aside>

        <main className="lfd-main">
          <div className="lfd-main-scroll">
            <div className="lfd-main-inner">
              <div className="lfd-head">
                <div className="lfd-head-text">
                  <div className="lfd-eyebrow">
                    Step {step.n} of {COLIVING_LISTING_STEPS.length}
                  </div>
                  <h1 className="lfd-title">{step.title}</h1>
                  <p className="lfd-sub">{step.sub}</p>
                </div>
                <span className="lfd-meta-pill">
                  <Clock size={14} strokeWidth={2} />~{remainingMinutes(stepIdx)} min left
                </span>
              </div>

              {submitError ? (
                <div
                  className="lf-helper"
                  style={{
                    color: "var(--c-danger)",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  {submitError}
                </div>
              ) : null}

              {tip ? (
                <div className="lfd-split">
                  <div className="lfd-body-form">
                    <ColivingStepBody
                      stepIdx={stepIdx}
                      data={data}
                      set={set}
                      patchLocation={patchLocation}
                      setImages={setImages}
                      disabled={busy}
                    />
                  </div>
                  <aside className="lfd-aside">
                    <div className="lfd-aside-h">{tip.h}</div>
                    <div className="lfd-aside-body">{tip.body}</div>
                  </aside>
                </div>
              ) : (
                <div className="lfd-body-form">
                  <ColivingStepBody
                    stepIdx={stepIdx}
                    data={data}
                    set={set}
                    patchLocation={patchLocation}
                    setImages={setImages}
                    disabled={busy}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lfd-foot">
            <div className="lfd-foot-l">
              <span className="lfd-autosave">
                <span className="lfd-dot" /> Auto-saved
              </span>
              <span>
                {step.n} / {COLIVING_LISTING_STEPS.length} steps complete
              </span>
            </div>
            <div className="lfd-foot-r">
              <button
                type="button"
                className="lfd-btn ghost"
                onClick={onBack}
                disabled={stepIdx === 0 || busy}
              >
                <ColivingChevron direction="left" /> Back
              </button>
              <button
                type="button"
                className="lfd-btn primary"
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
                      : "Submit listing"
                    : "Continue"}{" "}
                {!isLast && !busy ? <ColivingChevron direction="right" /> : null}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

type DesktopTopProps = {
  stepLabel: string;
  isEdit?: boolean;
  propertyName?: string;
  hideExit?: boolean;
};

function DesktopTop({ stepLabel, isEdit, propertyName, hideExit }: DesktopTopProps) {
  const flowLabel = isEdit ? "Edit PG & Co-living" : "List PG & Co-living";
  const property = propertyName?.trim();

  return (
    <div className="lfd-top">
      <div className="lfd-top-inner">
        <div className="lfd-top-l">
          <Link href="/add/dashboard" className="lfd-logo">
            <span className="lf-logo-dot" />
            SpaceWallah
          </Link>
          <nav className="lfd-crumb" aria-label="Breadcrumb">
            <Link href="/add/dashboard">Host</Link>
            <span className="lfd-crumb-sep" aria-hidden>
              ›
            </span>
            <span>{flowLabel}</span>
            {property ? (
              <>
                <span className="lfd-crumb-sep" aria-hidden>
                  ›
                </span>
                <span className="lfd-crumb-property">{property}</span>
              </>
            ) : null}
            {stepLabel ? (
              <>
                <span className="lfd-crumb-sep" aria-hidden>
                  ›
                </span>
                <b>{stepLabel}</b>
              </>
            ) : null}
          </nav>
        </div>
        <div className="lfd-top-r">
          {!hideExit ? (
            <>
              <Link href="/add/dashboard" className="lfd-top-link">
                My listings
              </Link>
              <Link href="/add" className="lfd-top-link lfd-top-link--primary">
                Save &amp; exit
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
