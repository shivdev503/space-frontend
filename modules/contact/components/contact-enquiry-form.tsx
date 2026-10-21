"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { FormEvent, useId, useMemo, useState } from "react";

import {
  CONTACT_VERTICAL_OPTIONS,
} from "@/lib/contact-data";
import { toPhone10 } from "@/lib/phone-norm";
import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { submitUserEnquiry, UserEnquiryError } from "@/services/user-enquiry-api";
import { cn } from "@/utils/cn";

const fieldClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-ink shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:border-[color:var(--color-brand)] focus:ring-2 focus:ring-[color:var(--color-brand)]/20";

export function ContactEnquiryForm() {
  const formId = useId();
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vertical, setVertical] = useState(CONTACT_VERTICAL_OPTIONS[0].value);

  const mxSpaceType = useMemo(
    () => CONTACT_VERTICAL_OPTIONS.find((o) => o.value === vertical)?.mxSpaceType ?? "Contact page enquiry",
    [vertical],
  );

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
    const city = String(formData.get("city") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name) {
      setStatus("error");
      setErrorMessage("Please enter your name.");
      setIsPending(false);
      return;
    }
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
    if (!message) {
      setStatus("error");
      setErrorMessage("Tell us a little about what you're looking for.");
      setIsPending(false);
      return;
    }

    const verticalLabel =
      CONTACT_VERTICAL_OPTIONS.find((o) => o.value === vertical)?.label ?? "General enquiry";
    const interestedIn = `${verticalLabel}${city ? ` — ${city}` : ""}: ${message}`;
    const pageUrl =
      typeof window !== "undefined" ? window.location.href : "https://www.spacewallah.com";

    try {
      const body = buildUserEnquiryBody({
        name,
        email,
        phone,
        interestedIn,
        city: city || "India",
        pageUrl,
        mxSpaceType,
      });
      await submitUserEnquiry(body);
      form.reset();
      setVertical(CONTACT_VERTICAL_OPTIONS[0].value);
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

  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] sm:p-8">
      <div className="border-b border-slate-100 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
          Send a message
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
          Tell us what you need
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Share a few details and our workspace experts will reach out with curated options.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-name`} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Full name
            </label>
            <input
              id={`${formId}-name`}
              name="name"
              required
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              className={cn(fieldClass, "h-12", isPending && "pointer-events-none opacity-60")}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-phone`} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Mobile number
            </label>
            <input
              id={`${formId}-phone`}
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit number"
              className={cn(fieldClass, "h-12", isPending && "pointer-events-none opacity-60")}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-email`} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Email
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              className={cn(fieldClass, "h-12", isPending && "pointer-events-none opacity-60")}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-city`} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              City
            </label>
            <input
              id={`${formId}-city`}
              name="city"
              autoComplete="address-level2"
              placeholder="e.g. Gurgaon, Bangalore"
              className={cn(fieldClass, "h-12", isPending && "pointer-events-none opacity-60")}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-vertical`} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            I&apos;m interested in
          </label>
          <select
            id={`${formId}-vertical`}
            name="vertical"
            value={vertical}
            onChange={(e) => setVertical(e.target.value as typeof vertical)}
            className={cn(fieldClass, "h-12 appearance-none", isPending && "pointer-events-none opacity-60")}
            disabled={isPending}
          >
            {CONTACT_VERTICAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-message`} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Your requirement
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            rows={4}
            placeholder="Seats, budget, area, move-in date, or any specific preferences…"
            className={cn(
              fieldClass,
              "min-h-[7rem] resize-y py-3",
              isPending && "pointer-events-none opacity-60",
            )}
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white",
            "bg-gradient-to-b from-[color:var(--color-brand)] to-[color:var(--color-accent)]",
            "shadow-[0_14px_38px_rgba(76,175,80,0.30)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(76,175,80,0.36)]",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(76,175,80,0.22)]",
            "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
          )}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {isPending ? "Sending…" : "Submit enquiry"}
          {!isPending ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </button>

        {status === "success" ? (
          <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-center text-sm font-medium text-emerald-800">
            Thank you — our team will reach out shortly with curated options.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="rounded-xl border border-rose-200/90 bg-rose-50/90 px-4 py-3 text-center text-sm text-rose-800">
            {errorMessage || "Something went wrong. Please try again."}
          </p>
        ) : null}
      </form>
    </div>
  );
}
