"use client";

import { Phone } from "lucide-react";

import {
  formatPgPhoneDisplay,
  pgPhoneTelHref,
  resolvePgContactPhone,
} from "@/lib/pg-contact";
import { toPhone10 } from "@/lib/phone-norm";
import type { PgDetail } from "@/types/pg.model";

type ColivingOwnerContactSuccessProps = {
  firstName: string;
  ownerName?: string;
  ownerPhone: string;
  propertyName?: string;
};

export function ColivingOwnerContactSuccess({
  firstName,
  ownerName,
  ownerPhone,
  propertyName,
}: ColivingOwnerContactSuccessProps) {
  const displayPhone = formatPgPhoneDisplay(ownerPhone);
  const telHref = pgPhoneTelHref(ownerPhone);
  const ten = toPhone10(ownerPhone);
  const waHref = ten ? `https://wa.me/91${ten}` : null;
  const hostLabel = ownerName?.trim() || "the owner";

  return (
    <div className="flex animate-[colivingQuizFade_.4s_ease] flex-col items-center gap-2.5 px-1 py-1.5 text-center">
      <div className="mb-1 grid h-[62px] w-[62px] place-items-center rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] animate-[colivingQuizPop_.5s_cubic-bezier(.2,1.4,.5,1)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M4 12l5 5 11-13" />
        </svg>
      </div>
      <h4 className="font-display text-2xl tracking-tight text-ink">You&apos;re all set!</h4>
      <p className="max-w-[32ch] text-[13.5px] leading-relaxed text-muted">
        Thanks {firstName}! You can contact {hostLabel}
        {propertyName ? ` for ${propertyName}` : ""} directly — free, no brokerage.
      </p>

      <div className="mt-2 w-full rounded-xl border border-slate-200/80 bg-[#f9f8f5] p-4 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Owner contact</p>
        {ownerName?.trim() ? (
          <p className="mt-1.5 text-sm font-semibold text-ink">{ownerName.trim()}</p>
        ) : null}
        <a
          href={telHref}
          className="mt-2 inline-flex items-center gap-2 text-[1.05rem] font-semibold text-[color:var(--color-brand)] hover:underline"
        >
          <Phone className="h-4 w-4" aria-hidden />
          {displayPhone}
        </a>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={telHref}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[color:var(--color-brand)] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--color-accent)]"
          >
            Call now
          </a>
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm font-semibold text-ink hover:bg-white/80"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ownerContactFromPg(pg: PgDetail | null | undefined): {
  phone: string | null;
  name: string;
} {
  if (!pg) return { phone: null, name: "" };
  return {
    phone: resolvePgContactPhone(pg),
    name: pg.postedBy?.trim() || "",
  };
}
