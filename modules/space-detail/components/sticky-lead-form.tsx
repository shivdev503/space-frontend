"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ContactFormModal } from "@/components/contact/contact-form-modal";
import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { submitUserEnquiry, UserEnquiryError } from "@/services/user-enquiry-api";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

type LeadTarget = {
  city: string;
  spaceId: string;
};

type StickyLeadFormProps = {
  leadTarget: LeadTarget;
  submitLabel: string;
  interestedInDefault?: string;
  mxSpaceType?: string;
  spaceListingKey?: "work_space" | "office_space" | "living_space" | "managed_office";
  microlocation?: string;
  /** Coworking detail mock layout — desktop card only; pair with {@link CoworkingDetailMobileBar}. */
  variant?: "default" | "coworking-detail";
  startingFrom?: number;
  priceSuffix?: string;
  membershipHint?: string;
};

function isValidEmail(v: string): boolean {
  const s = v.trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function normalizePhoneDigits(v: string): string {
  return v.replace(/[^\d]/g, "");
}

function FieldShell({
  icon: Icon,
  error,
  children,
}: {
  icon: typeof User;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-2xl border bg-white px-4 transition",
          error ? "border-rose-300" : "border-slate-200 focus-within:border-[color:var(--color-brand)]",
          "focus-within:ring-4 focus-within:ring-[rgba(18,184,134,0.18)]",
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", error ? "text-rose-500" : "text-slate-500")} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

function CtaButton({
  children,
  disabled,
  onClick,
  type,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white",
        "bg-[color:var(--color-brand)] shadow-[0_14px_38px_rgba(18,184,134,0.30)]",
        "transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)] hover:shadow-[0_18px_52px_rgba(11,59,46,0.30)] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(18,184,134,0.22)]",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_14px_38px_rgba(18,184,134,0.30)]",
      )}
    >
      {children}
    </button>
  );
}

export function StickyLeadForm({
  leadTarget,
  submitLabel,
  interestedInDefault = "Workspace enquiry",
  mxSpaceType = "Web Coworking",
  spaceListingKey = "work_space",
  microlocation = "",
  variant = "default",
  startingFrom = 0,
  priceSuffix = "/ mo",
  membershipHint,
}: StickyLeadFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [openMobile, setOpenMobile] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<{ name: boolean; phone: boolean; email: boolean }>({
    name: false,
    phone: false,
    email: false,
  });

  const phoneDigits = useMemo(() => normalizePhoneDigits(phone), [phone]);
  const errors = useMemo(() => {
    const e: { name?: string; phone?: string; email?: string } = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!phoneDigits) e.phone = "Phone number is required.";
    else if (phoneDigits.length < 10) e.phone = "Enter a valid 10-digit number.";
    else if (phoneDigits.length < 7) e.phone = "Enter a valid phone number.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address.";
    return e;
  }, [email, name, phoneDigits]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const phoneRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (openMobile) {
      const t = window.setTimeout(() => phoneRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
    return;
  }, [openMobile]);

  useEffect(() => {
    if (!openMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openMobile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setEnquiryError(null);
    setIsPending(true);

    try {
      setTouched({ name: true, phone: true, email: true });
      if (!canSubmit) {
        setIsPending(false);
        return;
      }

      const pageUrl =
        typeof window !== "undefined" ? window.location.href : "https://www.spacewallah.com";
      const body = buildUserEnquiryBody({
        name: name.trim(),
        email: email.trim(),
        phone: `+91${phoneDigits}`,
        interestedIn: interestedInDefault,
        city: leadTarget.city,
        microlocation: microlocation || undefined,
        pageUrl,
        spaceId: leadTarget.spaceId,
        spaceListingKey,
        mxSpaceType,
      });

      await submitUserEnquiry(body);

      setName("");
      setPhone("");
      setEmail("");
      setTouched({ name: false, phone: false, email: false });
      setStatus("success");
      setOpenMobile(false);
    } catch (e) {
      setStatus("error");
      if (e instanceof UserEnquiryError) {
        setEnquiryError(
          e.needLogin
            ? "Please sign in with your phone to submit an enquiry, then try again."
            : e.message,
        );
      } else {
        setEnquiryError(e instanceof Error ? e.message : "Could not submit right now.");
      }
    } finally {
      setIsPending(false);
    }
  }

  function FormContents({ compact }: { compact?: boolean }) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(76,175,80,0.14)] px-3 py-1 text-xs font-semibold text-[#2E7D32]">
            <span>⚡</span>
            Instant Response
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <BadgeCheck className="h-4 w-4 text-[#4CAF50]" />
            Verified Space
          </div>
        </div>

        <div className={cn("mt-5 grid gap-3", compact ? "gap-2.5" : "")}>
          <FieldShell icon={User} error={touched.name ? errors.name : undefined}>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Your name"
              className="h-12 w-full bg-transparent text-sm font-medium text-ink placeholder:text-slate-400 outline-none"
              autoComplete="name"
            />
          </FieldShell>

          <div>
            <div
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl border bg-white px-4 transition",
                touched.phone && errors.phone ? "border-rose-300" : "border-slate-200 focus-within:border-[#4CAF50]",
                "focus-within:ring-4 focus-within:ring-[rgba(76,175,80,0.18)]",
              )}
            >
              <Phone
                className={cn("h-4 w-4 shrink-0", touched.phone && errors.phone ? "text-rose-500" : "text-slate-500")}
              />
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  ref={phoneRef}
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  inputMode="tel"
                  placeholder="Phone number"
                  className="h-12 w-full bg-transparent text-sm font-medium text-ink placeholder:text-slate-400 outline-none"
                  autoComplete="tel"
                />
              </div>
            </div>
            {touched.phone && errors.phone ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.phone}</p>
            ) : null}
          </div>

          <FieldShell icon={Mail} error={touched.email ? errors.email : undefined}>
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="name@company.com"
              className="h-12 w-full bg-transparent text-sm font-medium text-ink placeholder:text-slate-400 outline-none"
              autoComplete="email"
            />
          </FieldShell>
        </div>

        <div className={cn("mt-5 grid gap-3", compact ? "" : "")}>
          <CtaButton type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isPending ? "Sending..." : submitLabel}
          </CtaButton>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#4CAF50]" />
              No spam. Only genuine leads.
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BadgeCheck className="h-4 w-4 text-[#4CAF50]" />
              1000+ people booked this space
            </div>
          </div>
        </div>

        {status === "success" ? (
          <div className="mt-4 rounded-2xl border border-[rgba(76,175,80,0.30)] bg-[rgba(76,175,80,0.12)] px-4 py-3 text-sm text-slate-900">
            <p className="font-semibold">Request received.</p>
            <p className="mt-1 text-slate-700">We’ll call you shortly with availability & best pricing.</p>
          </div>
        ) : null}
        {status === "error" ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {enquiryError || "Could not submit right now. Please try again."}
          </div>
        ) : null}
      </>
    );
  }

  if (variant === "coworking-detail") {
    return (
      <>
        <aside className="sticky top-[90px] hidden lg:block">
          <div
            id="lead-form"
            className="overflow-hidden rounded-[18px] border border-[#E7E9E6] bg-white shadow-[0_8px_30px_rgba(20,24,29,0.08)]"
          >
            <div className="border-b border-[#EEF0ED] bg-gradient-to-b from-[#EDF7EE] to-white px-6 pb-4 pt-5">
              <p className="text-[13px] font-semibold text-muted">Starting from</p>
              <p className="mt-0.5 text-[32px] font-extrabold tracking-[-0.03em] text-ink">
                {startingFrom > 0 ? formatCurrency(startingFrom) : "On request"}{" "}
                {startingFrom > 0 ? (
                  <span className="text-[15px] font-semibold text-muted">{priceSuffix}</span>
                ) : null}
              </p>
              {membershipHint ? (
                <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-brand)] bg-white px-3 py-1.5 text-[12.5px] font-bold text-[#2f8035]">
                  {membershipHint}
                </p>
              ) : null}
            </div>
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
              <h3 className="text-lg font-extrabold tracking-[-0.02em] text-ink">Book a free tour</h3>
              <p className="mt-1 text-[13.5px] text-muted">
                Share your details — we&apos;ll line up a visit &amp; your best rate.
              </p>
              <div className="mt-4">
                <FormContents compact />
              </div>
            </form>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Desktop / tablet sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="w-full rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-lg xl:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4CAF50]">
            Check Availability
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-ink">Enquire Now</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Get best deals for this workspace.</p>

          <form onSubmit={handleSubmit} className="mt-5" id="lead-form">
            <FormContents />
          </form>
        </div>
      </aside>

      {/* Mobile: sticky bottom CTA → modal */}
      <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/92 p-3 backdrop-blur lg:hidden">
        <CtaButton onClick={() => setOpenMobile(true)} disabled={isPending}>
          Enquire Now
          <ArrowRight className="h-4 w-4" />
        </CtaButton>
      </div>

      <div className="lg:hidden">
        <ContactFormModal
          open={openMobile}
          onOpenChange={setOpenMobile}
          leadTarget={leadTarget}
          submitLabel={submitLabel}
          interestedInDefault={interestedInDefault}
          mxSpaceType={mxSpaceType}
          spaceListingKey={spaceListingKey}
          microlocation={microlocation}
        />
      </div>
    </>
  );
}
