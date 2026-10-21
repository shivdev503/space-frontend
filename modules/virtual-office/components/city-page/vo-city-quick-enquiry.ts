"use client";

import { useState } from "react";

import { toPhone10 } from "@/lib/phone-norm";
import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { submitUserEnquiry } from "@/services/user-enquiry-api";

type QuickEnquiryInput = {
  phone: string;
  citySlug: string;
  requirement: string;
  locality?: string;
};

/** Phone-only enquiry used by the hero price form and the callback card. */
export function useVoQuickEnquiry(label: string) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit({ phone, citySlug, requirement, locality }: QuickEnquiryInput) {
    setError(null);
    const phone10 = toPhone10(phone);
    if (!phone10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setPending(true);
    try {
      await submitUserEnquiry(
        buildUserEnquiryBody({
          name: label,
          email: `vo-lead-${phone10}@clients.spacewallah.com`,
          phone: phone10,
          interestedIn: requirement,
          city: citySlug,
          microlocation: locality,
          pageUrl: typeof window !== "undefined" ? window.location.href : "https://www.spacewallah.com",
          mxSpaceType: "Virtual Office",
        }),
      );
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return { submit, pending, error, success };
}
