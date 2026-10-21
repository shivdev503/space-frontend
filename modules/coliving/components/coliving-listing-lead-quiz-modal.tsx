"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BedSingle,
  CircleHelp,
  Lock,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RemoteImage } from "@/components/ui/remote-image";
import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import type { PgOwnerContact } from "@/lib/pg-owner-contact";
import { resolvePgListingSlug, slugifyPgName } from "@/lib/pg-slug";
import { ColivingOwnerContactSuccess } from "@/modules/coliving/components/coliving-owner-contact-success";
import { pgStartingRent } from "@/services/pg-mapper";
import { fetchPgOwnerContact } from "@/services/pg-owner-contact-api";
import { submitUserEnquiry } from "@/services/user-enquiry-api";
import type { PgDetail } from "@/types/pg.model";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

const CONCIERGE_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80";

const WHO_OPTIONS = ["A man", "A woman", "A couple"] as const;
const WHEN_OPTIONS = ["Immediately", "Within 2 weeks", "In a month", "Just exploring"] as const;

type RoomIcon = "triple" | "double" | "single" | "unsure";

type RoomOption = {
  id: string;
  title: string;
  subtitle: string;
  price: number | null;
  value: string;
  icon: RoomIcon;
};

function roomIcon(icon: RoomIcon) {
  const cls = "h-5 w-5";
  if (icon === "triple") return <BedDouble className={cls} strokeWidth={1.8} />;
  if (icon === "double") return <Users className={cls} strokeWidth={1.8} />;
  if (icon === "single") return <BedSingle className={cls} strokeWidth={1.8} />;
  return <CircleHelp className={cls} strokeWidth={1.8} />;
}

function inferRoomIcon(name: string): RoomIcon {
  const n = name.toLowerCase();
  if (n.includes("triple") || n.includes("3")) return "triple";
  if (n.includes("double") || n.includes("2") || n.includes("twin")) return "double";
  if (n.includes("single") || n.includes("private")) return "single";
  return "double";
}

function roomSubtitle(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("triple")) return "3 beds, most chosen";
  if (n.includes("double")) return "2 beds, attached bath";
  if (n.includes("single") || n.includes("private")) return "1 bed, private bath";
  return "Fully furnished, attached bath";
}

function buildRoomOptions(pg: PgDetail): RoomOption[] {
  const rooms = pg.rooms?.length
    ? pg.rooms
    : [{ type: "Standard room", rent: pgStartingRent(pg), deposit: null }];

  const fromRooms: RoomOption[] = rooms.map((room, index) => ({
    id: `${room.type}-${index}`,
    title: room.type,
    subtitle: roomSubtitle(room.type),
    price: room.rent,
    value: room.rent != null ? `${room.type}, ${formatCurrency(room.rent)}/mo` : room.type,
    icon: inferRoomIcon(room.type),
  }));

  fromRooms.push({
    id: "not-sure",
    title: "Not sure yet",
    subtitle: "Help me decide",
    price: null,
    value: "Not sure yet, show me options",
    icon: "unsure",
  });

  return fromRooms;
}

type ColivingListingLeadQuizModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pg: PgDetail;
  spaceListingId?: string;
};

export function ColivingListingLeadQuizModal({
  open,
  onOpenChange,
  pg,
  spaceListingId,
}: ColivingListingLeadQuizModalProps) {
  const roomOptions = useMemo(() => buildRoomOptions(pg), [pg]);
  const minPrice = pg.rentRange.min ?? pgStartingRent(pg);
  const maxPrice = pg.rentRange.max ?? Math.max(...pg.rooms.map((r) => r.rent ?? 0), minPrice);
  const rating = pg.rating > 0 ? pg.rating.toFixed(2) : "4.86";
  const findKey = spaceListingId?.trim() || resolvePgListingSlug(pg);

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [unlockedContact, setUnlockedContact] = useState<PgOwnerContact | null>(null);
  const [room, setRoom] = useState("");
  const [who, setWho] = useState("");
  const [when, setWhen] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);

  const totalSteps = 3;
  const progress = done ? 100 : (step / totalSteps) * 100;

  const resetQuiz = useCallback(() => {
    setStep(1);
    setDone(false);
    setSubmitting(false);
    setSubmitError(null);
    setUnlockedContact(null);
    setRoom("");
    setWho("");
    setWhen("");
    setName("");
    setPhone("");
    setConsent(true);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    window.setTimeout(resetQuiz, 280);
  }, [onOpenChange, resetQuiz]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  const recapItems = useMemo(() => {
    const items: string[] = [];
    if (room) items.push(room.split(", ")[0] ?? room);
    if (who) items.push(who);
    if (when) items.push(when);
    return items;
  }, [room, who, when]);

  const nameOk = name.trim().length >= 2;
  const phoneOk = /^[6-9]\d{9}$/.test(phone.trim());
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const roomLabel = room ? (room.split(", ")[0] ?? room) : "your room";

  const handleSubmit = useCallback(async () => {
    if (!nameOk || !phoneOk || !consent || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const interestedIn = [
        `${pg.name}, coliving lead`,
        room && `Room: ${room}`,
        who && `Moving in: ${who}`,
        when && `Move timeline: ${when}`,
      ]
        .filter(Boolean)
        .join(", ");

      const body = buildUserEnquiryBody({
        name: name.trim(),
        email: `coliving.lead+${phone.trim()}@spacewallah.com`,
        phone: phone.trim(),
        interestedIn,
        city: slugifyPgName(pg.city),
        microlocation: pg.locality,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        spaceId: spaceListingId || slugifyPgName(pg.name),
        spaceListingKey: "living_space",
        mxSpaceType: "Web Coliving",
        moveInDate: when,
        noOfPerson: who === "A couple" ? "2" : "1",
      });

      await submitUserEnquiry(body);
      const contact = findKey ? await fetchPgOwnerContact(findKey) : null;
      setUnlockedContact(contact);
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    consent,
    findKey,
    name,
    nameOk,
    pg.city,
    pg.locality,
    pg.name,
    phone,
    phoneOk,
    room,
    spaceListingId,
    submitting,
    when,
    who,
  ]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 backdrop-blur-[2px] sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Get free room details"
          onClick={handleClose}
        >
          <motion.div
            className="relative flex max-h-[min(100dvh,920px)] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[1.35rem] border border-slate-200/80 bg-white shadow-[0_-12px_48px_rgba(15,23,42,0.18)] sm:rounded-[1.35rem] sm:shadow-[0_20px_60px_rgba(15,23,42,0.2)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="border-b border-slate-200/80 bg-gradient-to-b from-[color:var(--color-brand-soft)] to-white px-[18px] pb-3.5 pt-5 sm:px-[22px] sm:pt-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brand)]">
                  Starting from
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                  <b className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
                    {formatCurrency(minPrice)}
                  </b>
                  <small className="text-[13px] text-muted">/ month</small>
                  {maxPrice > minPrice ? (
                    <>
                      <span className="text-[13px] text-slate-400">,</span>
                      <small className="text-[13px] text-muted">up to {formatCurrency(maxPrice)}</small>
                    </>
                  ) : (
                    <>
                      <span className="text-[13px] text-slate-400">,</span>
                      <small className="text-[13px] text-muted">all-inclusive</small>
                    </>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-ink/90">
                  <span>
                    <span className="text-amber-500">★</span> {rating}, 38 reviews
                  </span>
                  <span className="text-slate-300">,</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-[color:var(--color-brand)]">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    Zero brokerage
                  </span>
                </div>
              </div>

              {!done ? (
                <div className="flex items-center gap-2.5 px-[18px] pt-3 sm:px-[22px]">
                  <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#f2efe8]">
                    <div
                      className="h-full rounded-full bg-[color:var(--color-brand)] transition-[width] duration-300 ease-[cubic-bezier(.2,.7,.2,1)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] tracking-wide text-muted">
                    Step {step} of {totalSteps}
                  </span>
                </div>
              ) : null}

              <div className="relative px-[18px] pb-5 pt-3.5 sm:px-[22px] sm:pb-[22px]">
                {!done && step === 1 ? (
                  <div className="flex animate-[colivingQuizFade_.4s_ease] flex-col gap-3">
                    <div>
                      <h3 className="font-display text-[20px] leading-[1.15] tracking-tight text-ink sm:text-[22px]">
                        Which room suits you?
                      </h3>
                      <p className="mt-1 text-[12.5px] text-muted">
                        Pick one, we&apos;ll check live availability for it.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {roomOptions.map((option) => {
                        const selected = room === option.value;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setRoom(option.value)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-[13px] border-[1.5px] bg-white px-3.5 py-3 text-left transition",
                              selected
                                ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]"
                                : "border-slate-200/90 hover:border-[#cfcabc] hover:bg-[#f9f8f5]",
                            )}
                          >
                            <span
                              className={cn(
                                "grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px]",
                                selected
                                  ? "bg-[color:var(--color-brand)] text-white"
                                  : "bg-[#f2efe8] text-[color:var(--color-brand)]",
                              )}
                            >
                              {roomIcon(option.icon)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium leading-tight text-ink">
                                {option.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted">{option.subtitle}</span>
                            </span>
                            {option.price != null ? (
                              <span className="shrink-0 text-sm font-semibold text-ink">
                                {formatCurrency(option.price)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                    <QuizNav onNext={() => setStep(2)} nextLabel="Continue" nextDisabled={!room} />
                  </div>
                ) : null}

                {!done && step === 2 ? (
                  <div className="flex animate-[colivingQuizFade_.4s_ease] flex-col gap-3">
                    <div>
                      <h3 className="font-display text-[20px] leading-[1.15] tracking-tight text-ink sm:text-[22px]">
                        Who&apos;s moving in?
                      </h3>
                      <p className="mt-1 text-[12.5px] text-muted">This home is open to everyone.</p>
                    </div>
                    <ChipGroup options={WHO_OPTIONS} value={who} onChange={setWho} />
                    <div className="mt-2">
                      <h3 className="font-display text-[20px] leading-[1.15] tracking-tight text-ink sm:text-[22px]">
                        When are you looking to move?
                      </h3>
                    </div>
                    <ChipGroup options={WHEN_OPTIONS} value={when} onChange={setWhen} />
                    <QuizNav
                      showBack
                      onBack={() => setStep(1)}
                      onNext={() => setStep(3)}
                      nextLabel="Almost there"
                      nextDisabled={!who || !when}
                    />
                  </div>
                ) : null}

                {!done && step === 3 ? (
                  <div className="flex animate-[colivingQuizFade_.4s_ease] flex-col gap-3">
                    <div>
                      <h3 className="font-display text-[20px] leading-[1.15] tracking-tight text-ink sm:text-[22px]">
                        Where should we send the details?
                      </h3>
                      <p className="mt-1 text-[12.5px] text-muted">
                        Free room photos, exact pricing &amp; a callback, no spam.
                      </p>
                    </div>
                    {recapItems.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {recapItems.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(76,175,80,0.12)] bg-[color:var(--color-brand-soft)] px-2.5 py-1 text-[11.5px] text-[color:var(--color-brand)]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
                        Your name
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        autoComplete="name"
                        className="w-full rounded-[11px] border-[1.5px] border-slate-200/90 bg-white px-3.5 py-3 text-base text-ink transition placeholder:text-slate-400 focus:border-[color:var(--color-brand)] focus:outline-none focus:ring-[3px] focus:ring-[color:var(--color-brand-soft)] sm:text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
                        Phone / WhatsApp
                      </span>
                      <div className="grid grid-cols-[auto_1fr] gap-2">
                        <span className="flex items-center justify-center rounded-[11px] border-[1.5px] border-slate-200/90 bg-[#f9f8f5] px-3 text-sm font-medium text-ink/90">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="10-digit number"
                          autoComplete="tel"
                          className="w-full rounded-[11px] border-[1.5px] border-slate-200/90 bg-white px-3.5 py-3 text-base text-ink transition placeholder:text-slate-400 focus:border-[color:var(--color-brand)] focus:outline-none focus:ring-[3px] focus:ring-[color:var(--color-brand-soft)] sm:text-sm"
                        />
                      </div>
                    </label>
                    <label className="mt-0.5 flex cursor-pointer items-start gap-2 text-[11.5px] leading-relaxed text-muted">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-brand)]"
                      />
                      <span>
                        Send me photos &amp; availability on WhatsApp. I agree to be contacted about this
                        property.
                      </span>
                    </label>
                    {submitError ? (
                      <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                        {submitError}
                      </p>
                    ) : null}
                    <QuizNav
                      showBack
                      onBack={() => setStep(2)}
                      onNext={() => void handleSubmit()}
                      nextLabel={submitting ? "Submitting…" : "Get free details"}
                      nextDisabled={!nameOk || !phoneOk || !consent || submitting}
                    />
                  </div>
                ) : null}

                {done && unlockedContact?.phone ? (
                  <ColivingOwnerContactSuccess
                    firstName={firstName}
                    ownerName={unlockedContact.name || pg.postedBy}
                    ownerPhone={unlockedContact.phone}
                    propertyName={pg.name}
                  />
                ) : null}

                {done && !unlockedContact?.phone ? (
                  <div className="flex animate-[colivingQuizFade_.4s_ease] flex-col items-center gap-2.5 px-1 py-1.5 text-center">
                    <div className="mb-1 grid h-[62px] w-[62px] place-items-center rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] animate-[colivingQuizPop_.5s_cubic-bezier(.2,1.4,.5,1)]">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M4 12l5 5 11-13" />
                      </svg>
                    </div>
                    <h4 className="font-display text-2xl tracking-tight text-ink">You&apos;re all set!</h4>
                    <p className="max-w-[30ch] text-[13.5px] leading-relaxed text-muted">
                      Thanks {firstName}! Aditi will WhatsApp the photos &amp; pricing for {roomLabel} to +91{" "}
                      {phone} shortly.
                    </p>
                    <div className="mt-2 flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-[#f9f8f5] p-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                        <RemoteImage src={CONCIERGE_AVATAR} alt="" fill className="object-cover" sizes="36px" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium text-ink">Aditi, Living Concierge</p>
                        <p className="text-[11.5px] text-muted">Usually replies in under 10 min</p>
                      </div>
                      <span className="ml-auto shrink-0 rounded-full bg-[color:var(--color-brand-soft)] px-2.5 py-1 text-[10.5px] font-medium text-[color:var(--color-brand)]">
                        Assigned
                      </span>
                    </div>
                  </div>
                ) : null}

                {!done ? (
                  <div className="mt-3.5 flex items-center justify-center gap-1.5 border-t border-slate-200/80 pt-3.5 text-[11.5px] text-muted">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-brand)]" aria-hidden />
                    No payment now, 100% free, no brokerage
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: string;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-[1.5px] px-[15px] py-2.5 text-[13.5px] transition",
              selected
                ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)] font-medium text-[color:var(--color-brand)]"
                : "border-slate-200/90 bg-white text-ink/90 hover:border-[#cfcabc] hover:bg-[#f9f8f5]",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function QuizNav({
  showBack,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  showBack?: boolean;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-1 flex items-center gap-2.5 pb-1">
      {showBack ? (
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl border border-slate-200/90 bg-white text-ink/90 transition hover:bg-[#f2efe8]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : null}
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-[color:var(--color-brand)] bg-[color:var(--color-brand)] px-[18px] py-3.5 text-[14.5px] font-medium text-white transition hover:bg-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {nextLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
