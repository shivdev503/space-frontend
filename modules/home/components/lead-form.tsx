"use client";

import { FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { toPhone10 } from "@/lib/phone-norm";
import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { submitUserEnquiry, UserEnquiryError } from "@/services/user-enquiry-api";
import { cn } from "@/utils/cn";

type LeadFormProps = {
  compact?: boolean;
  /** `premium` — compact, labeled fields for hero / lead panels. */
  variant?: "default" | "premium";
  /** Larger fields / spacing when `variant="premium"` (e.g. desktop hero). */
  premiumSize?: "default" | "comfortable";
  submitLabel?: string;
  city?: string;
  mxSpaceType?: string;
};

const fieldPremium =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-ink shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400/90 focus:border-[color:var(--color-brand)] focus:ring-2 focus:ring-[color:var(--color-brand)]/20";

const fieldDefault =
  "h-14 w-full rounded-[1rem] border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-[color:var(--color-brand)]";

export function LeadForm({
  compact = false,
  variant = "default",
  premiumSize = "default",
  submitLabel = "Get Expert Advice",
  city = "India",
  mxSpaceType = "Homepage lead",
}: LeadFormProps) {
  const formId = useId();
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isPremium = variant === "premium";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage(null);
    setIsPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "");
    const requirement = String(formData.get("requirement") ?? "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMessage("Enter a valid email address.");
      setIsPending(false);
      return;
    }
    if (!toPhone10(phone)) {
      setStatus("error");
      setErrorMessage("Enter a valid 10-digit mobile number.");
      setIsPending(false);
      return;
    }

    const pageUrl =
      typeof window !== "undefined" ? window.location.href : "https://www.spacewallah.com";

    try {
      const body = buildUserEnquiryBody({
        name,
        email,
        phone,
        interestedIn: requirement || "Workspace consultation",
        city,
        pageUrl,
        mxSpaceType,
      });
      await submitUserEnquiry(body);
      form.reset();
      setStatus("success");
    } catch (e) {
      setStatus("error");
      if (e instanceof UserEnquiryError) {
        setErrorMessage(
          e.needLogin
            ? "Please sign in with your phone to submit an enquiry, then try again."
            : e.message,
        );
      } else {
        setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  }

  const labelClass =
    "block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-[0.7rem]";

  const comfortable = isPremium && premiumSize === "comfortable";
  const fieldPremiumComfort = cn(
    fieldPremium,
    comfortable && "px-4 py-3 text-base shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)]",
  );
  const textRows = comfortable ? 4 : 3;

  if (isPremium) {
    return (
      <form
        onSubmit={handleSubmit}
        className={comfortable ? "space-y-4" : "space-y-3"}
      >
        <div className={comfortable ? "grid gap-4 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
          <div className="space-y-1.5">
            <input
              id={`${formId}-name`}
              name="name"
              required
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              className={cn(
                fieldPremiumComfort,
                comfortable ? "h-12" : "h-10",
                isPending && "pointer-events-none opacity-60",
              )}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              className={cn(
                fieldPremiumComfort,
                comfortable ? "h-12" : "h-10",
                isPending && "pointer-events-none opacity-60",
              )}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <input
            id={`${formId}-phone`}
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit number"
            className={cn(
              fieldPremiumComfort,
              comfortable ? "h-12" : "h-10",
              isPending && "pointer-events-none opacity-60",
            )}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <textarea
            id={`${formId}-requirement`}
            name="requirement"
            required
            rows={textRows}
            placeholder="Seats, area, area / city, move-in date…"
            className={cn(
              fieldPremiumComfort,
              comfortable ? "min-h-[6.25rem] py-3" : "min-h-[4.5rem] py-2.5",
              "resize-y",
              isPending && "pointer-events-none opacity-60",
            )}
            disabled={isPending}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className={cn(
            "w-full rounded-xl px-5 py-0 font-semibold tracking-tight",
            comfortable ? "h-12 text-base" : "h-10 text-sm",
            comfortable
              ? "shadow-[0_14px_36px_-8px_rgba(76,175,80,0.45)] hover:shadow-[0_18px_40px_-8px_rgba(46,125,50,0.4)]"
              : "shadow-[0_10px_28px_-6px_rgba(48,88,215,0.55)] hover:shadow-[0_12px_32px_-6px_rgba(48,88,215,0.45)]",
            isPending && "pointer-events-none opacity-70",
          )}
          disabled={isPending}
        >
          {isPending ? "Sending…" : submitLabel}
        </Button>

        {status === "success" ? (
          <p className="rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-center text-xs font-medium text-emerald-800">
            Thank you — we&apos;ll reach out shortly.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="rounded-lg border border-rose-200/90 bg-rose-50/90 px-3 py-2 text-center text-xs text-rose-800">
            {errorMessage || "Something went wrong. Please try again."}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        name="name"
        required
        placeholder="Your name"
        className={fieldDefault}
        disabled={isPending}
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Your email"
        className={fieldDefault}
        disabled={isPending}
      />
      <input
        name="phone"
        required
        inputMode="tel"
        autoComplete="tel"
        placeholder="10-digit mobile number"
        className={fieldDefault}
        disabled={isPending}
      />
      <textarea
        name="requirement"
        required
        placeholder="Tell us what kind of workspace you need"
        className="min-h-32 rounded-[1rem] border border-slate-200 bg-white px-4 py-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-[color:var(--color-brand)]"
        disabled={isPending}
      />
      <Button
        type="submit"
        className={compact ? "w-full" : "w-full sm:w-auto"}
        disabled={isPending}
      >
        {isPending ? "Submitting..." : submitLabel}
      </Button>
      {status === "success" ? (
        <p className="text-sm text-[color:var(--color-brand)]">
          Thanks. Our workspace team will reach out shortly.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-rose-600">
          {errorMessage || "Something went wrong. Please try again."}
        </p>
      ) : null}
    </form>
  );
}
