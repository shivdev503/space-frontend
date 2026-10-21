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

import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { submitUserEnquiry, UserEnquiryError } from "@/services/user-enquiry-api";
import { cn } from "@/utils/cn";

type LeadTarget = {
  city: string;
  spaceId: string;
};

export type ContactFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadTarget: LeadTarget;
  submitLabel: string;
  title?: string;
  subtitle?: string;
  /** Maps to `interested_in` (default: workspace enquiry). */
  interestedInDefault?: string;
  /** `mx_Space_Type` in the API payload. */
  mxSpaceType?: string;
  /**
   * When `leadTarget.spaceId` is a 24-char hex id, set this listing field
   * (`work_space` for coworking / virtual office, `office_space` for office).
   * @default "work_space"
   */
  spaceListingKey?: "work_space" | "office_space" | "living_space";
  /** Optional microlocation / neighbourhood string for `location[]`. */
  microlocation?: string;
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
  type,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white",
        "bg-[color:var(--color-brand)] shadow-[0_14px_38px_rgba(18,184,134,0.30)]",
        "transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)] hover:shadow-[0_18px_52px_rgba(11,59,46,0.30)] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(18,184,134,0.22)]",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
      )}
    >
      {children}
    </button>
  );
}

export function ContactFormModal({
  open,
  onOpenChange,
  leadTarget,
  submitLabel,
  title = "Enquire Now",
  subtitle = "Get best deals for this workspace.",
  interestedInDefault = "Workspace enquiry",
  mxSpaceType = "Web Coworking",
  spaceListingKey = "work_space",
  microlocation = "",
}: ContactFormModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

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
    if (!email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address.";
    return e;
  }, [email, name, phoneDigits]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => phoneRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
      onOpenChange(false);
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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="w-full max-w-[420px] rounded-[1.75rem] border border-slate-200/60 bg-white shadow-[0_30px_80px_rgba(2,6,23,0.35)]"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4CAF50]">
                  Check Availability
                </p>
                <p className="mt-1 text-lg font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-muted">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-soft transition hover:bg-slate-50"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-5">
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

              <div className="mt-5 grid gap-3">
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
                      className={cn(
                        "h-4 w-4 shrink-0",
                        touched.phone && errors.phone ? "text-rose-500" : "text-slate-500",
                      )}
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

              <div className="mt-5 grid gap-3">
                <CtaButton type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isPending ? "Sending..." : submitLabel}
                  {!isPending ? <ArrowRight className="h-4 w-4" /> : null}
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

              {status === "error" ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {enquiryError || "Could not submit right now. Please try again."}
                </div>
              ) : null}
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

