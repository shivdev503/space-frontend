"use client";

import dynamic from "next/dynamic";
import { RemoteImage } from "@/components/ui/remote-image";
import Link from "next/link";
import {
  BedDouble,
  Check,
  CircleCheck,
  Clock,
  Home,
  MapPin,
  Menu,
  Minus,
  Users,
  X,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import type { MapCoordinates } from "@/lib/coliving-map";
import { useColivingLeadQuiz } from "@/modules/coliving/components/detail/coliving-detail-lead-quiz-context";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

const ColivingLeafletMap = dynamic(
  () =>
    import("@/modules/space-detail/components/space-detail-leaflet-map-dynamic").then(
      (m) => m.SpaceDetailLeafletMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="mt-6 h-64 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-[#ebe6dc] sm:h-72"
        aria-hidden
      />
    ),
  },
);

const FOOD_IMAGE =
  "https://img.spacewallah.com/images/65d31396ce62fdcf2bdf6f5f1622ef5775b05269.webp";

export function ColivingHostSection({
  hostName,
  hostInitials,
  verified,
  subtitle,
  tags,
}: {
  hostName: string;
  hostInitials: string;
  verified?: boolean;
  subtitle: string;
  tags: string[];
}) {
  const { focusLeadQuiz } = useColivingLeadQuiz();

  return (
    <div className="border-b border-slate-200/80 pb-6 max-lg:pt-1 lg:rounded-2xl lg:border lg:bg-white lg:p-6 lg:shadow-soft">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c4a574] text-sm font-semibold text-white">
            {hostInitials}
          </div>
          {verified ? (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-brand)] ring-2 ring-[#f9f8f5]"
              aria-hidden
            >
              <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-ink sm:text-lg">
            Hosted by {hostName}
            {verified ? (
              <>
                <span className="text-slate-300"> · </span>
                <span className="font-normal text-ink/85">Listed by verified agent</span>
              </>
            ) : null}
          </h3>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={focusLeadQuiz}
          className="hidden shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-[#f9f8f5] lg:inline-flex"
        >
          Message host
        </button>
      </div>
      <button
        type="button"
        onClick={focusLeadQuiz}
        className="mt-5 flex w-full items-center justify-center rounded-full border border-slate-200/90 bg-white py-3 text-sm font-semibold text-ink transition hover:bg-white/80 lg:hidden"
      >
        Message host
      </button>
    </div>
  );
}

export function ColivingHighlightGrid({
  items,
}: {
  items: { icon: ComponentType<{ className?: string }>; label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200/80 bg-white p-4"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
            <item.icon className="h-4 w-4" aria-hidden />
          </div>
          <p className="mt-3 text-xs text-muted">{item.label}</p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ColivingAmenityTabs({
  active,
  onChange,
}: {
  active: 0 | 1 | 2;
  onChange: (tab: 0 | 1 | 2) => void;
}) {
  const tabs = ["Property amenities", "In your room", "Not provided"] as const;

  return (
    <div className="mt-6 flex gap-5 overflow-x-auto border-b border-slate-200/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(i as 0 | 1 | 2)}
          className={cn(
            "shrink-0 pb-3 text-sm transition",
            active === i
              ? "-mb-px border-b-2 border-ink font-semibold text-ink"
              : "font-medium text-muted hover:text-ink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ColivingAmenityGrid({ items, muted }: { items: string[]; muted?: boolean }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
      {items.map((label) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-slate-200/80 px-3 py-3",
            muted ? "bg-[#f9f8f5] opacity-60" : "bg-white",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              muted ? "bg-slate-100 text-slate-400" : "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]",
            )}
          >
            {muted ? <Minus className="h-3.5 w-3.5" /> : <CircleCheck className="h-3.5 w-3.5" />}
          </div>
          <span className="text-[0.8125rem] leading-snug text-ink">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function ColivingRoomCard({
  title,
  specs,
  features,
  rent,
  deposit,
  recommended,
  bookingHref = "#booking-panel",
}: {
  title: string;
  specs?: string;
  features: string[];
  rent: number | null;
  deposit?: number | null;
  recommended?: boolean;
  bookingHref?: string;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-5",
        recommended
          ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)] shadow-[0_0_0_1px_rgba(76,175,80,0.14)]"
          : "border-slate-200/80",
      )}
    >
      {recommended ? (
        <span className="absolute -top-3 left-4 rounded-full bg-[color:var(--color-brand)] px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white">
          Most chosen
        </span>
      ) : null}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
        <BedDouble className="h-6 w-6" strokeWidth={1.4} aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      {specs ? <p className="mt-0.5 text-sm text-muted">{specs}</p> : null}
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink/90">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-brand)]" strokeWidth={2.5} />
            {f}
          </li>
        ))}
      </ul>
      <div className="my-5 border-t border-dashed border-slate-200" aria-hidden />
      <div className="flex flex-wrap items-baseline gap-2">
        {rent != null ? (
          <>
            <b className="text-2xl font-semibold tracking-tight text-ink">{formatCurrency(rent)}</b>
            <span className="text-sm text-muted">/ month · all-inclusive</span>
          </>
        ) : (
          <span className="text-sm text-muted">Rent on request</span>
        )}
        {recommended ? (
          <span className="ml-auto rounded-full bg-[color:var(--color-brand-soft)] px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[color:var(--color-brand)]">
            Best value
          </span>
        ) : null}
      </div>
      {deposit != null ? (
        <p className="mt-1 text-xs text-muted">Deposit {formatCurrency(deposit)} · refundable on exit</p>
      ) : null}
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-brand)]" aria-hidden />
        Beds available · move-in this week
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href={bookingHref}
          className={cn(
            "inline-flex flex-1 items-center justify-center rounded-full py-3 text-sm font-semibold transition",
            recommended
              ? "bg-[color:var(--color-brand)] text-white hover:bg-[color:var(--color-accent)]"
              : "border border-slate-200/90 bg-white text-ink hover:bg-[#f9f8f5]",
          )}
        >
          Reserve
        </Link>
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white text-ink"
          aria-label="More room options"
        >
          <Menu className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}

export function ColivingFoodCard({
  meals,
  bookingHref = "#booking-panel",
}: {
  meals: { label: string; time: string }[];
  bookingHref?: string;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <div className="relative aspect-[16/10] w-full bg-slate-200 sm:aspect-[2/1]">
        <RemoteImage src={FOOD_IMAGE} alt="" fill className="object-cover" sizes="(max-width: 880px) 100vw, 560px" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink shadow-sm">
          Included in rent
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-ink">Breakfast · Lunch · Dinner</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Served at scheduled times in the dining area. The menu changes weekly and accommodates dietary
          requests with 24-hour notice.
        </p>
        <ul className="mt-5 space-y-2.5 text-sm text-ink/90">
          {meals.map((meal) => (
            <li key={meal.label} className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 shrink-0 text-[color:var(--color-brand)]" aria-hidden />
              <span>
                <b>{meal.label}</b> · {meal.time}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={bookingHref}
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink"
        >
          View weekly menu →
        </Link>
      </div>
    </div>
  );
}

export function ColivingRuleCard({
  type,
  title,
  text,
}: {
  type: "allowed" | "no";
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          type === "allowed"
            ? "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]"
            : "bg-red-50 text-red-600",
        )}
      >
        {type === "allowed" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
      </div>
    </div>
  );
}

export function ColivingMapBlock({
  name,
  locality,
  city,
  address,
  coordinates,
  mapsLink,
}: {
  name: string;
  locality: string;
  city: string;
  address: string;
  coordinates?: MapCoordinates | null;
  mapsLink: string;
}) {
  return (
    <>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{address}</p>
      <ColivingLeafletMap
        className="mt-6"
        name={name}
        locality={locality}
        city={city}
        address={address}
        coordinates={coordinates}
        mapsLink={mapsLink}
      />
    </>
  );
}

export {
  SpaceDetailNearbyStrip as ColivingNearbyStrip,
  type SpaceDetailNearbyItem,
} from "@/modules/space-detail/components/space-detail-nearby-strip";

export function ColivingReviewsBlock({
  rating,
  reviewCount,
  bars,
  reviews,
}: {
  rating: number;
  reviewCount: number;
  bars: { label: string; score: number; width: string }[];
  reviews: {
    initial: string;
    name: string;
    when: string;
    stars: number;
    quote: string;
    color?: string;
  }[];
}) {
  const ratingLabel = rating > 0 ? rating.toFixed(2) : "—";

  return (
    <>
      <div className="mt-4 flex items-end gap-3">
        <p className="font-serif text-4xl font-semibold italic text-[color:var(--color-brand)]">
          {ratingLabel}
        </p>
        <div>
          <p className="text-amber-500 text-base leading-none">★★★★★</p>
          <p className="mt-1 text-xs text-muted">Verified residents only · last 12 months</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {bars.map((bar) => (
          <div key={bar.label} className="grid grid-cols-[6.5rem_1fr_2.25rem] items-center gap-3 text-sm">
            <span className="text-muted">{bar.label}</span>
            <div className="h-1 overflow-hidden rounded-full bg-slate-200/90">
              <div className="h-full rounded-full bg-ink" style={{ width: bar.width }} />
            </div>
            <span className="text-right font-medium text-ink">{bar.score}</span>
          </div>
        ))}
      </div>

      {reviews.length > 0 ? (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] max-lg:-mx-4 max-lg:px-4 [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
          {reviews.map((r) => (
            <article
              key={r.name}
              className="min-w-[min(100%,20rem)] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-5 lg:min-w-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                    r.color ?? "bg-[#c4a574]",
                  )}
                >
                  {r.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-muted">{r.when}</p>
                </div>
                <p className="text-sm text-amber-500" aria-label={`${r.stars} stars`}>
                  {"★".repeat(r.stars)}
                </p>
              </div>
              <p className="mt-3 font-display text-[0.9375rem] leading-relaxed text-ink/90">
                &ldquo;{r.quote}&rdquo;
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}

export const DEFAULT_REVIEW_BARS = [
  { label: "Cleanliness", score: 4.8, width: "96%" },
  { label: "Food quality", score: 4.6, width: "92%" },
  { label: "Safety", score: 4.9, width: "98%" },
  { label: "Wi-Fi", score: 4.5, width: "90%" },
  { label: "Staff", score: 4.85, width: "97%" },
  { label: "Value", score: 4.7, width: "94%" },
] as const;

export const DEFAULT_MEAL_SCHEDULE = [
  { label: "Breakfast", time: "7:30 – 9:30 AM" },
  { label: "Lunch", time: "12:30 – 2:30 PM" },
  { label: "Dinner", time: "8:00 – 10:00 PM" },
] as const;

export const DEFAULT_ROOM_FEATURES = [
  "Single bed, mattress + pillow",
  "AC / heating · hot water",
  "Personal cupboard + study desk",
  "Television in common area",
] as const;

export { Home, Users, Clock };
