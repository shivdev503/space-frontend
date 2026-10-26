"use client";

import Link from "next/link";
import { Check, ChevronLeft, Heart, MapPin, Share2 } from "lucide-react";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { listingTrail } from "@/lib/breadcrumb-trails";

export type ColivingPropertyHeaderProps = {
  name: string;
  locality: string;
  city: string;
  citySlug: string;
  address: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  shareSlug: string;
};

function getTitleParts(name: string, locality: string) {
  const loc = locality.trim();
  const locLower = loc.toLowerCase();
  const nameLower = name.toLowerCase();
  const locationInName = locLower.length > 0 && nameLower.includes(locLower);

  if (locationInName) {
    return { primary: name, accent: null as string | null };
  }

  return { primary: name, accent: loc || null };
}

export function ColivingPropertyHeader({
  name,
  locality,
  city,
  citySlug,
  address,
  rating,
  reviewCount,
  verified,
  shareSlug,
}: ColivingPropertyHeaderProps) {
  const { primary: titlePrimary, accent: titleAccent } = getTitleParts(name, locality);
  const ratingLabel = rating > 0 ? rating.toFixed(2) : "—";
  const breadcrumbLabel = locality.trim() || city;
  const sharePath = `/coliving/${shareSlug.trim()}`;

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({
        title: name,
        url: `${window.location.origin}${sharePath}`,
      });
    }
  }

  return (
    <>
      <nav
        className="flex items-center gap-1.5 pb-3 pt-0.5 text-[0.8125rem] leading-tight lg:hidden"
        aria-label="Back to area"
      >
        <Link
          href={`/coliving/${citySlug}`}
          className="shrink-0 text-muted transition hover:text-ink"
        >
          {breadcrumbLabel}
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
        <span className="min-w-0 truncate font-medium text-ink">{name}</span>
      </nav>

      <Breadcrumbs
        className="hidden pb-2 pt-1 lg:block lg:text-[0.8125rem]"
        separator="›"
        items={listingTrail("coliving", { name, cityName: city, localityName: locality })}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
        <div className="min-w-0 flex-1">
          <h1 className="max-w-3xl font-display text-[1.625rem] font-semibold leading-[1.12] tracking-[-0.02em] text-ink sm:text-[1.75rem] lg:mt-1 lg:text-[2rem]">
            {titlePrimary}
            {titleAccent ? (
              <>
                <span className="text-slate-300"> · </span>
                <span className="font-serif font-semibold italic text-[color:var(--color-brand)]">
                  {titleAccent}
                </span>
              </>
            ) : null}
          </h1>

          <div className="mt-3 flex flex-col gap-2.5 sm:mt-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-ink/90">
              {verified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-brand)]/20 bg-[color:var(--color-brand-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-brand)]">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  Verified
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 font-medium">
                <span className="text-amber-500" aria-hidden>
                  ★
                </span>
                {ratingLabel}
                {reviewCount > 0 ? ` · ${reviewCount} reviews` : null}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 lg:block" aria-hidden />
              <Link
                href="#location"
                className="hidden items-center gap-1.5 text-muted underline decoration-slate-200 underline-offset-[3px] transition hover:text-ink lg:inline-flex"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="line-clamp-1">{address}</span>
              </Link>
            </div>

            <Link
              href="#location"
              className="inline-flex items-start gap-1.5 text-[0.8125rem] leading-snug text-muted underline decoration-slate-300 underline-offset-[3px] transition hover:text-ink lg:hidden"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{address}</span>
            </Link>
          </div>
        </div>

        <div className="flex gap-2 lg:shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-medium text-ink/90 transition hover:border-slate-300 hover:bg-[#f9f8f5] sm:text-[0.8125rem]"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            Share
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-medium text-ink/90 transition hover:border-slate-300 hover:bg-[#f9f8f5] sm:text-[0.8125rem]"
          >
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Save
          </button>
        </div>
      </div>
    </>
  );
}
