"use client";

import { FormEvent, useId, useState } from "react";

import { toPhone10 } from "@/lib/phone-norm";
import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { submitUserEnquiry, UserEnquiryError } from "@/services/user-enquiry-api";
import type { SearchOption } from "@/types";
import { cn } from "@/utils/cn";

type CoworkingSelectFormProps = {
  cities: SearchOption[];
};

const fieldClass =
  "w-full rounded-[10px] border border-white/35 bg-white/15 px-4 py-[15px] text-sm font-medium text-white outline-none transition placeholder:text-white/75 focus:border-white/55 focus:bg-white/20";

export function CoworkingSelectForm({ cities }: CoworkingSelectFormProps) {
  const formId = useId();
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage(null);
    setIsPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const city = String(formData.get("city") ?? "").trim();
    const teamSize = String(formData.get("teamSize") ?? "").trim();
    const phone = String(formData.get("phone") ?? "");

    if (!city) {
      setStatus("error");
      setErrorMessage("Please select a city.");
      setIsPending(false);
      return;
    }
    const phone10 = toPhone10(phone);
    if (!phone10) {
      setStatus("error");
      setErrorMessage("Enter a valid 10-digit mobile number.");
      setIsPending(false);
      return;
    }

    const pageUrl =
      typeof window !== "undefined" ? window.location.href : "https://www.spacewallah.com";

    try {
      const body = buildUserEnquiryBody({
        name: "Coworking shortlist",
        email: `cw+${phone10}@spacewallah.com`,
        phone,
        interestedIn: teamSize
          ? `Coworking shortlist · ${teamSize} · ${city}`
          : `Coworking shortlist · ${city}`,
        city,
        pageUrl,
        mxSpaceType: "Coworking SpaceWallah Select",
        noOfPerson: teamSize || "1",
      });
      await submitUserEnquiry(body);
      form.reset();
      setStatus("success");
    } catch (e) {
      setStatus("error");
      if (e instanceof UserEnquiryError) {
        setErrorMessage(
          e.needLogin
            ? "Please sign in with your phone to submit, then try again."
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
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
      <select
        id={`${formId}-city`}
        name="city"
        required
        defaultValue=""
        className={cn(fieldClass, "cursor-pointer appearance-none")}
        disabled={isPending}
      >
        <option value="" disabled className="text-[color:var(--color-accent)]">
          Select City
        </option>
        {cities.map((c) => (
          <option key={c.value} value={c.label} className="text-ink">
            {c.label}
          </option>
        ))}
      </select>
      <input
        id={`${formId}-team`}
        name="teamSize"
        type="text"
        placeholder="Team size (e.g. 5 people)"
        className={fieldClass}
        disabled={isPending}
      />
      <input
        id={`${formId}-phone`}
        name="phone"
        type="tel"
        required
        inputMode="tel"
        autoComplete="tel"
        placeholder="Your mobile number"
        className={fieldClass}
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-[10px] bg-white py-4 text-[15px] font-bold text-[color:var(--color-accent)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.18)] disabled:opacity-60"
      >
        {isPending ? "Submitting…" : "Get Free Shortlist →"}
      </button>
      {status === "success" ? (
        <p className="text-sm text-white/90">Thanks — our team will reach out within 2 hours.</p>
      ) : null}
      {status === "error" && errorMessage ? (
        <p className="text-sm text-red-100">{errorMessage}</p>
      ) : null}
    </form>
  );
}
