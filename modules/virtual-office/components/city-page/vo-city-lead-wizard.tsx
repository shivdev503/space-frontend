"use client";

import { FormEvent, useMemo, useState } from "react";

import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/contact-data";
import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { toPhone10 } from "@/lib/phone-norm";
import type { VirtualOfficeCatalogCity } from "@/lib/virtual-office-city-catalog";
import { submitUserEnquiry } from "@/services/user-enquiry-api";
import { cn } from "@/utils/cn";

const NEED_OPTIONS = [
  { id: "address", icon: "📬", label: "Business Address" },
  { id: "gst", icon: "🧾", label: "GST Registration" },
  { id: "company", icon: "🏢", label: "Company Registration" },
  { id: "all", icon: "📦", label: "All of the above" },
] as const;

const BIZ_TYPES = ["Startup", "E‑commerce", "Freelancer", "Consultant", "Enterprise"] as const;
const TIMELINES = ["Immediately", "Within 1 week", "Within 1 month", "Just researching"] as const;

type NeedId = (typeof NEED_OPTIONS)[number]["id"];

function needLabel(id: NeedId): string {
  return NEED_OPTIONS.find((o) => o.id === id)?.label ?? "Virtual office";
}

type VoCityLeadWizardProps = {
  citySlug: string;
  cityDisplay: string;
  catalog: VirtualOfficeCatalogCity;
  onClose?: () => void;
  showClose?: boolean;
  className?: string;
};

export function VoCityLeadWizard({
  citySlug,
  cityDisplay,
  catalog,
  onClose,
  showClose = false,
  className,
}: VoCityLeadWizardProps) {
  const [step, setStep] = useState(1);
  const [need, setNeed] = useState<NeedId>("address");
  const [bizType, setBizType] = useState<string>(BIZ_TYPES[0]);
  const [zone, setZone] = useState("");
  const [timeline, setTimeline] = useState<string>(TIMELINES[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const zones = useMemo(() => {
    const fromCatalog = catalog.locations.map((l) => l.locality).filter(Boolean);
    return [...fromCatalog, "Any"];
  }, [catalog.locations]);

  const zoneValue = zone || zones[0] || "Any";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (!toPhone10(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setPending(true);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "https://www.spacewallah.com";
    const requirement = [
      `Need: ${needLabel(need)}`,
      `Business: ${bizType}`,
      `Zone: ${zoneValue}`,
      `Timeline: ${timeline}`,
    ].join(" · ");

    try {
      const body = buildUserEnquiryBody({
        name: name.trim(),
        email:
          email.trim() ||
          `vo-lead-${toPhone10(phone) ?? "user"}@clients.spacewallah.com`,
        phone,
        interestedIn: requirement,
        city: citySlug,
        microlocation: zoneValue === "Any" ? undefined : zoneValue,
        pageUrl,
        mxSpaceType: "Virtual Office",
        moveInDate: timeline,
      });
      await submitUserEnquiry(body);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-[#EAE7E0] bg-white shadow-[0_8px_30px_rgba(20,20,20,0.06)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[color:var(--color-brand)] to-[#7AC97D]" />

      {showClose && onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-[#F4F0E9] text-sm font-semibold text-[#555] hover:bg-[#e8e3d9] hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>
      ) : null}

      <div className="px-5 pb-4 pt-6 sm:px-[22px]">
        <h3 className="pr-8 text-[19px] font-bold tracking-tight text-ink">
          Get Virtual Office Details
        </h3>
        <p className="mt-1 text-[13px] text-muted">Compare plans · Verified providers · Reply in 2 hrs</p>
      </div>

      <div className="flex flex-wrap gap-2.5 border-b border-[#EAE7E0] px-5 pb-4 sm:px-[22px]">
        {["Zero brokerage", "99% GST approval", "Expert guidance"].map((line) => (
          <span key={line} className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#444]">
            <span className="font-bold text-emerald-600">✓</span>
            {line}
          </span>
        ))}
      </div>

      {!success ? (
        <>
          <div className="flex gap-1.5 px-5 pt-4 sm:px-[22px]">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  step >= n ? "bg-[color:var(--color-brand)]" : "bg-[#EAE7E0]",
                )}
              />
            ))}
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in px-5 py-3 pb-5 sm:px-[22px] sm:pb-[22px]">
              <h4 className="mb-3.5 text-[14.5px] font-semibold text-ink">What do you need?</h4>
              <div className="grid grid-cols-2 gap-2">
                {NEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNeed(opt.id)}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-[10px] border-[1.5px] px-3 py-3.5 text-left text-xs font-semibold text-ink transition",
                      need === opt.id
                        ? "border-[color:var(--color-brand)] bg-[#EDF7EE]"
                        : "border-[#EAE7E0] bg-white hover:border-[#bfb9ad]",
                    )}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-3.5 w-full rounded-xl bg-[color:var(--color-brand)] py-3 text-sm font-semibold text-white hover:bg-[color:var(--color-accent)]"
              >
                Next →
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="animate-in fade-in px-5 py-3 pb-5 sm:px-[22px] sm:pb-[22px]">
              <h4 className="mb-3.5 text-[14.5px] font-semibold text-ink">Tell us about your business</h4>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                Business type
              </label>
              <select
                value={bizType}
                onChange={(e) => setBizType(e.target.value)}
                className="mb-2.5 w-full rounded-lg border border-[#EAE7E0] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[color:var(--color-brand)]"
              >
                {BIZ_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                Preferred zone
              </label>
              <select
                value={zoneValue}
                onChange={(e) => setZone(e.target.value)}
                className="mb-2.5 w-full rounded-lg border border-[#EAE7E0] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[color:var(--color-brand)]"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                Move‑in timeline
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="mb-2.5 w-full rounded-lg border border-[#EAE7E0] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[color:var(--color-brand)]"
              >
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2.5 text-[13px] font-medium text-muted hover:text-ink"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-xl bg-[color:var(--color-brand)] py-3 text-sm font-semibold text-white hover:bg-[color:var(--color-accent)]"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <form
              onSubmit={handleSubmit}
              className="animate-in fade-in px-5 py-3 pb-5 sm:px-[22px] sm:pb-[22px]"
            >
              <h4 className="mb-3.5 text-[14.5px] font-semibold text-ink">How do we reach you?</h4>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                Full name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mb-2.5 w-full rounded-lg border border-[#EAE7E0] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[color:var(--color-brand)]"
              />
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                Mobile
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 70173 33425"
                className="mb-2.5 w-full rounded-lg border border-[#EAE7E0] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[color:var(--color-brand)]"
              />
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mb-2.5 w-full rounded-lg border border-[#EAE7E0] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[color:var(--color-brand)]"
              />
              {error ? <p className="mb-2 text-xs font-medium text-rose-600">{error}</p> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2.5 text-[13px] font-medium text-muted hover:text-ink"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-xl bg-[color:var(--color-brand)] py-3.5 text-sm font-semibold text-white hover:bg-[color:var(--color-accent)] disabled:opacity-60"
                >
                  {pending ? "Submitting…" : "Get Verified Options"}
                </button>
              </div>
              <p className="mt-2.5 text-center text-[11.5px] text-muted">
                🔒 Trusted by 500+ businesses in {cityDisplay}. Zero spam.
              </p>
            </form>
          ) : null}
        </>
      ) : (
        <div className="px-5 py-8 text-center sm:px-[22px]">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
            ✓
          </div>
          <h4 className="mt-3 text-lg font-semibold text-ink">Thanks — we&apos;ll be in touch</h4>
          <p className="mt-1.5 text-sm text-[#555]">
            An expert will WhatsApp you a curated shortlist within 2 working hours.
          </p>
        </div>
      )}

      <div className="border-t border-[#EAE7E0] bg-[#FCFBF8] px-5 py-3.5 text-center text-[13px] sm:px-[22px]">
        <a
          href={`https://wa.me/91${CONTACT_PHONE}`}
          className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
        >
          💬 WhatsApp: {CONTACT_PHONE_DISPLAY}
        </a>
        <p className="mt-1 text-xs text-muted">Free. Always.</p>
      </div>
    </div>
  );
}
