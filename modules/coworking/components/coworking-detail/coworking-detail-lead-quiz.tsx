"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleCheckBig,
  DoorClosed,
  Loader2,
  Mail,
  Presentation,
  Search,
  ShieldCheck,
  Sun,
  User,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildUserEnquiryBody } from "@/lib/user-enquiry-payload";
import { toPhone10 } from "@/lib/phone-norm";
import { useCoworkingLeadQuiz } from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz-context";
import { submitUserEnquiry } from "@/services/user-enquiry-api";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

type QuizOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const LOOKING_OPTIONS: QuizOption[] = [
  { value: "Hot Desk", label: "Hot Desk", icon: Armchair },
  { value: "Dedicated Desk", label: "Dedicated Desk", icon: Briefcase },
  { value: "Private Cabin", label: "Private Cabin", icon: DoorClosed },
  { value: "Meeting Room", label: "Meeting Room", icon: Presentation },
  { value: "Day Pass", label: "Day Pass", icon: Sun },
  { value: "Virtual Office", label: "Virtual Office", icon: Mail },
];

const TEAM_OPTIONS: QuizOption[] = [
  { value: "Just me", label: "Just me", icon: User },
  { value: "2–5 people", label: "2–5 people", icon: Users },
  { value: "6–15 people", label: "6–15 people", icon: Users },
  { value: "16–50 people", label: "16–50 people", icon: Building },
  { value: "50+ people", label: "50+ people", icon: Building2 },
];

const MOVE_IN_OPTIONS: QuizOption[] = [
  { value: "Immediately", label: "Immediately", icon: Zap },
  { value: "Within 15 days", label: "Within 15 days", icon: Calendar },
  { value: "Within a month", label: "Within a month", icon: CalendarDays },
  { value: "Just exploring", label: "Just exploring", icon: Search },
];

function teamToPersonCount(team: string): string {
  if (team === "Just me") return "1";
  if (team === "2–5 people") return "3";
  if (team === "6–15 people") return "10";
  if (team === "16–50 people") return "25";
  if (team === "50+ people") return "50";
  return "1";
}

/** Copy, options and CRM fields for the lead form, so other verticals can reuse it. */
export type LeadQuizConfig = {
  heading: string;
  subheading: string;
  priceLabel: string;
  lookingQuestion: string;
  lookingOptions: QuizOption[];
  teamQuestion: string;
  teamOptions: QuizOption[];
  teamToCount: (team: string) => string;
  submitLabel: string;
  doneMessage: string;
  /** Appended to the space name in the enquiry, e.g. "coworking tour". */
  enquiryContext: string;
  spaceListingKey: "work_space" | "office_space" | "managed_office";
  mxSpaceType: string;
  emailPrefix: string;
};

const COWORKING_QUIZ: LeadQuizConfig = {
  heading: "Book a free tour",
  subheading: "Answer 3 quick questions — we'll line up a visit & your best rate.",
  priceLabel: "Starting from",
  lookingQuestion: "What are you looking for?",
  lookingOptions: LOOKING_OPTIONS,
  teamQuestion: "How big is your team?",
  teamOptions: TEAM_OPTIONS,
  teamToCount: teamToPersonCount,
  submitLabel: "Get my free tour & quote",
  doneMessage: "Our SpaceWallah expert will call you shortly to schedule your visit and share the best available rate.",
  enquiryContext: "coworking tour",
  spaceListingKey: "work_space",
  mxSpaceType: "Web Coworking",
  emailPrefix: "coworking.lead",
};

const OFFICE_TEAM_COUNTS: Record<string, string> = {
  "Up to 20 seats": "15",
  "20–50 seats": "35",
  "50–100 seats": "75",
  "100–250 seats": "150",
  "250+ seats": "250",
};

export const MANAGED_OFFICE_QUIZ: LeadQuizConfig = {
  heading: "Book a site visit",
  subheading: "Answer 3 quick questions — we'll arrange a visit & negotiate the best terms.",
  priceLabel: "Starting from",
  lookingQuestion: "What kind of office do you need?",
  // Values match the managed office seat types, so a plan's "Get quote" pre-selects its answer.
  lookingOptions: [
    { value: "Ready to move in", label: "Ready to move in", icon: Building2 },
    { value: "Warm shell", label: "Warm shell", icon: Briefcase },
    { value: "Bare shell", label: "Bare shell", icon: DoorClosed },
    { value: "Not sure yet", label: "Not sure yet", icon: Search },
  ],
  teamQuestion: "How many seats do you need?",
  teamOptions: [
    { value: "Up to 20 seats", label: "Up to 20 seats", icon: User },
    { value: "20–50 seats", label: "20–50 seats", icon: Users },
    { value: "50–100 seats", label: "50–100 seats", icon: Users },
    { value: "100–250 seats", label: "100–250 seats", icon: Building },
    { value: "250+ seats", label: "250+ seats", icon: Building2 },
  ],
  teamToCount: (team) => OFFICE_TEAM_COUNTS[team] ?? "20",
  submitLabel: "Get my site visit & quote",
  doneMessage: "Our SpaceWallah expert will call you shortly to schedule your site visit and share the best terms.",
  enquiryContext: "managed office site visit",
  spaceListingKey: "managed_office",
  mxSpaceType: "Web Managed Office",
  emailPrefix: "office.lead",
};

type CoworkingDetailLeadQuizProps = {
  workspaceName: string;
  citySlug: string;
  spaceId: string;
  microlocation?: string;
  startingFrom: number;
  priceSuffix: string;
  membershipHint?: string;
  config?: LeadQuizConfig;
};

export function CoworkingDetailLeadQuiz({
  workspaceName,
  citySlug,
  spaceId,
  microlocation = "",
  startingFrom,
  priceSuffix,
  membershipHint,
  config = COWORKING_QUIZ,
}: CoworkingDetailLeadQuizProps) {
  const { open, closeQuiz, presetNeed, consumePresetNeed, registerReset } = useCoworkingLeadQuiz();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [lookingFor, setLookingFor] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const totalSteps = 4;
  const progress = done ? 100 : ((step + 1) / totalSteps) * 100;

  const resetQuiz = useCallback(() => {
    setStep(0);
    setDone(false);
    setSubmitting(false);
    setSubmitError(null);
    setLookingFor("");
    setTeamSize("");
    setMoveIn("");
    setName("");
    setPhone("");
  }, []);

  useEffect(() => {
    registerReset(resetQuiz);
  }, [registerReset, resetQuiz]);

  useEffect(() => {
    if (!presetNeed) return;
    const preset = consumePresetNeed();
    if (preset) {
      setLookingFor(preset);
      setStep(1);
    }
  }, [presetNeed, consumePresetNeed]);

  const handleClose = useCallback(() => {
    closeQuiz();
    window.setTimeout(resetQuiz, 280);
  }, [closeQuiz, resetQuiz]);

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
    if (lookingFor) items.push(lookingFor);
    if (teamSize) items.push(teamSize);
    if (moveIn) items.push(moveIn);
    return items;
  }, [lookingFor, moveIn, teamSize]);

  const nameOk = name.trim().length >= 2;
  const phoneOk = Boolean(toPhone10(phone));

  const handleSubmit = useCallback(async () => {
    if (!nameOk || !phoneOk || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const interestedIn = [
        `${workspaceName} — ${config.enquiryContext}`,
        lookingFor && `Looking for: ${lookingFor}`,
        teamSize && `Team: ${teamSize}`,
        moveIn && `Move-in: ${moveIn}`,
      ]
        .filter(Boolean)
        .join(" · ");

      const body = buildUserEnquiryBody({
        name: name.trim(),
        email: `${config.emailPrefix}+${toPhone10(phone)}@spacewallah.com`,
        phone,
        interestedIn,
        city: citySlug,
        microlocation: microlocation || undefined,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        spaceId,
        spaceListingKey: config.spaceListingKey,
        mxSpaceType: config.mxSpaceType,
        noOfPerson: config.teamToCount(teamSize),
        moveInDate: moveIn,
      });

      await submitUserEnquiry(body);
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    citySlug,
    lookingFor,
    microlocation,
    moveIn,
    name,
    nameOk,
    phone,
    phoneOk,
    spaceId,
    submitting,
    teamSize,
    workspaceName,
    config,
  ]);

  const priceHeader = (
    <div className="border-b border-[#EEF0ED] bg-gradient-to-b from-[#EDF7EE] to-white px-5 pb-4 pt-5 sm:px-6">
      <p className="text-[13px] font-semibold text-muted">{config.priceLabel}</p>
      <p className="mt-0.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
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
  );

  const quizPanel = (
    <CoworkingQuizBody
      done={done}
      step={step}
      totalSteps={totalSteps}
      progress={progress}
      lookingFor={lookingFor}
      teamSize={teamSize}
      moveIn={moveIn}
      name={name}
      phone={phone}
      recapItems={recapItems}
      submitError={submitError}
      submitting={submitting}
      nameOk={nameOk}
      phoneOk={phoneOk}
      onStepChange={setStep}
      onLookingFor={setLookingFor}
      onTeamSize={setTeamSize}
      onMoveIn={setMoveIn}
      onName={setName}
      onPhone={setPhone}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onSubmit={() => void handleSubmit()}
      config={config}
    />
  );

  return (
    <>
      <aside className="sticky top-[90px] hidden lg:block">
        <div
          id="lead-form"
          className="overflow-hidden rounded-[18px] border border-[#E7E9E6] bg-white shadow-[0_8px_30px_rgba(20,24,29,0.08)]"
        >
          {priceHeader}
          <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
            <h3 className="text-lg font-extrabold tracking-[-0.02em] text-ink">{config.heading}</h3>
            <p className="mt-1 text-[13.5px] text-muted">{config.subheading}</p>
            <div className="mt-4">{quizPanel}</div>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-[rgba(12,14,17,0.55)] backdrop-blur-[4px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={config.heading}
            onClick={handleClose}
          >
            <motion.div
              className="relative flex max-h-[94dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-12px_48px_rgba(20,24,29,0.18)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-[18px] top-[18px] z-10 grid h-[38px] w-[38px] place-items-center rounded-full border border-[#E7E9E6] bg-white text-ink"
                aria-label="Close"
              >
                <X className="h-[18px] w-[18px]" />
              </button>

              <div className="shrink-0 px-[22px] pb-4 pt-[26px] pr-[52px]">
                <h3 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">{config.heading}</h3>
                <p className="mt-1.5 text-[13.5px] text-muted">{config.subheading}</p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[22px] pb-[max(28px,env(safe-area-inset-bottom))]">
                {quizPanel}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

type CoworkingQuizBodyProps = {
  done: boolean;
  step: number;
  totalSteps: number;
  progress: number;
  lookingFor: string;
  teamSize: string;
  moveIn: string;
  name: string;
  phone: string;
  recapItems: string[];
  submitError: string | null;
  submitting: boolean;
  nameOk: boolean;
  phoneOk: boolean;
  onStepChange: (step: number) => void;
  onLookingFor: (v: string) => void;
  onTeamSize: (v: string) => void;
  onMoveIn: (v: string) => void;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  config: LeadQuizConfig;
};

function CoworkingQuizBody({
  done,
  step,
  totalSteps,
  progress,
  teamSize,
  moveIn,
  name,
  phone,
  recapItems,
  submitError,
  submitting,
  nameOk,
  phoneOk,
  onStepChange,
  onLookingFor,
  onTeamSize,
  onMoveIn,
  onName,
  onPhone,
  onBack,
  onSubmit,
  config,
}: CoworkingQuizBodyProps) {
  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 px-1 py-4 text-center">
        <CircleCheckBig className="h-12 w-12 text-[color:var(--color-brand)]" strokeWidth={1.5} />
        <h3 className="text-xl font-extrabold tracking-[-0.02em] text-ink">You&apos;re all set!</h3>
        <p className="max-w-[34ch] text-[14px] leading-relaxed text-muted">
          {config.doneMessage}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-[#EEF0ED]">
        <div
          className="h-full rounded-full bg-[color:var(--color-brand)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
        Step {step + 1} of {totalSteps}
      </p>

      {step === 0 ? (
        <QuizStep
          question={config.lookingQuestion}
          options={config.lookingOptions}
          gridCols={2}
          onSelect={(value) => {
            onLookingFor(value);
            onStepChange(1);
          }}
        />
      ) : null}

      {step === 1 ? (
        <QuizStep
          question={config.teamQuestion}
          options={config.teamOptions}
          gridCols={2}
          onSelect={(value) => {
            onTeamSize(value);
            onStepChange(2);
          }}
        />
      ) : null}

      {step === 2 ? (
        <QuizStep
          question="When do you want to move in?"
          options={MOVE_IN_OPTIONS}
          gridCols={1}
          onSelect={(value) => {
            onMoveIn(value);
            onStepChange(3);
          }}
        />
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-3.5">
          <p className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-ink">
            Where should we send your options?
          </p>

          {recapItems.length ? (
            <div className="flex flex-wrap gap-2">
              {recapItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-[rgba(76,175,80,0.25)] bg-[#EDF7EE] px-3 py-1 text-[12.5px] font-semibold text-[#2f8035]"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Full name</span>
            <input
              value={name}
              onChange={(e) => onName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="h-12 w-full rounded-xl border border-[#E7E9E6] bg-white px-4 text-sm font-medium text-ink outline-none transition focus:border-[color:var(--color-brand)] focus:ring-4 focus:ring-[rgba(76,175,80,0.15)]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Phone number</span>
            <input
              value={phone}
              onChange={(e) => onPhone(e.target.value)}
              placeholder="+91 00000 00000"
              inputMode="tel"
              autoComplete="tel"
              className="h-12 w-full rounded-xl border border-[#E7E9E6] bg-white px-4 text-sm font-medium text-ink outline-none transition focus:border-[color:var(--color-brand)] focus:ring-4 focus:ring-[rgba(76,175,80,0.15)]"
            />
          </label>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!nameOk || !phoneOk || submitting}
            className={cn(
              "mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[13px] px-5 py-3.5 text-base font-semibold text-white",
              "bg-[color:var(--color-brand)] shadow-[0_6px_16px_rgba(18,184,134,0.32)] transition hover:bg-[color:var(--color-accent)]",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Sending…" : config.submitLabel}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-muted">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-brand)]" />
            No spam · Free consultation · Verified space
          </p>

          {submitError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {submitError}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className={cn(
          "mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-muted transition hover:text-ink",
          step === 0 && "invisible",
        )}
      >
        <ChevronLeft className="h-[15px] w-[15px]" />
        Back
      </button>
    </div>
  );
}

function QuizStep({
  question,
  options,
  gridCols,
  onSelect,
}: {
  question: string;
  options: QuizOption[];
  gridCols: 1 | 2;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[17px] font-bold leading-snug tracking-[-0.02em] text-ink">{question}</p>
      <div className={cn("grid gap-2.5", gridCols === 2 ? "grid-cols-1 min-[400px]:grid-cols-2" : "grid-cols-1")}>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border border-[#E7E9E6] bg-white px-3.5 py-3 text-left text-sm font-semibold text-ink transition",
                "hover:-translate-y-px hover:border-[color:var(--color-brand)] hover:bg-[#EDF7EE] hover:shadow-[0_4px_14px_rgba(20,24,29,0.06)]",
                "active:translate-y-0",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 text-[color:var(--color-brand)]" strokeWidth={2} />
              <span className="min-w-0 flex-1">{option.label}</span>
              <Check className="h-4 w-4 shrink-0 opacity-0 text-[color:var(--color-brand)] transition group-hover:opacity-40" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
