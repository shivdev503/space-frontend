"use client";

import { RemoteImage } from "@/components/ui/remote-image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { colivingDetailHref } from "@/lib/coliving-urls";
import { ColivingListingCardViewNumber } from "@/modules/coliving/components/coliving-listing-card-view-number";
import { pgImagesSorted, pgStartingRent } from "@/services/pg-mapper";
import type { PgDetail } from "@/types/pg.model";
import { listingAltBase, listingPhotoAlt } from "@/lib/image-alt";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

const MAX_CAROUSEL_IMAGES = 6;

type ColivingListingCardProps = {
  pg: PgDetail;
  className?: string;
};

function ColivingListingCardCarousel({
  images,
  name,
  altBase,
  href,
  verified,
}: {
  images: string[];
  name: string;
  altBase: string;
  href: string;
  verified: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const scrollToIndex = useCallback(
    (next: number) => {
      const el = railRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(count - 1, next));
      setIndex(clamped);
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  useEffect(() => {
    const el = railRef.current;
    if (!el || count <= 1) return;

    const onScroll = () => {
      const width = el.clientWidth || 1;
      const next = Math.round(el.scrollLeft / width);
      setIndex(Math.max(0, Math.min(count - 1, next)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);

  const stopNav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-slate-100">
      <div
        ref={railRef}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
        aria-label={`${name} photos`}
      >
        {images.map((src, i) => (
          <Link
            key={`${src}-${i}`}
            href={href}
            className="relative block h-full w-full shrink-0 snap-start snap-always"
            aria-label={`View ${name}, photo ${i + 1} of ${count}`}
          >
            <RemoteImage
              src={src}
              alt={listingPhotoAlt(altBase, i)}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              draggable={false}
            />
          </Link>
        ))}
      </div>

      {verified ? (
        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-[rgba(34,34,34,0.72)] px-2 py-1 text-[0.7rem] font-semibold text-white backdrop-blur-sm">
          Verified
        </span>
      ) : null}

      <button
        type="button"
        aria-label={`Save ${name}`}
        onClick={stopNav}
        className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:scale-105 sm:h-9 sm:w-9"
      >
        <Heart className="h-[1.35rem] w-[1.35rem] stroke-[1.75px]" />
      </button>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              stopNav(e);
              scrollToIndex(index - 1);
            }}
            className={cn(
              "absolute left-3 top-1/2 z-20 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-md transition",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
              index === 0 && "pointer-events-none opacity-0",
            )}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              stopNav(e);
              scrollToIndex(index + 1);
            }}
            className={cn(
              "absolute right-3 top-1/2 z-20 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-md transition",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
              index >= count - 1 && "pointer-events-none opacity-0",
            )}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <span
                  key={`dot-${i}`}
                  className={cn(
                    "h-1.5 rounded-full bg-white/55 transition-all",
                    i === index ? "w-[1.35rem] bg-white" : "w-1.5",
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ColivingListingCard({ pg, className }: ColivingListingCardProps) {
  const href = colivingDetailHref(pg);
  const images = useMemo(() => {
    const sorted = pgImagesSorted(pg.images).slice(0, MAX_CAROUSEL_IMAGES);
    return sorted.length ? sorted : [PLACEHOLDER];
  }, [pg.images]);

  const min = pg.rentRange.min ?? pgStartingRent(pg);
  const hasRating = pg.rating > 0;
  const locationLine = [pg.locality, pg.city].filter(Boolean).join(", ");

  return (
    <article className={cn("group flex h-full min-h-0 flex-col", className)}>
      <ColivingListingCardCarousel
        images={images}
        name={pg.name}
        altBase={listingAltBase(pg.name, "PG", pg.locality, pg.city)}
        href={href}
        verified={pg.verified}
      />

      <Link href={href} className="mt-3 block min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-[0.9375rem] font-semibold leading-snug text-slate-950">
            {pg.name}
          </p>{" "}
          <div className="inline-flex shrink-0 items-center gap-0.5 text-[0.875rem] text-slate-950">
            {hasRating ? (
              <>
                <Star className="h-3 w-3 fill-slate-950 text-slate-950" />
                <span className="font-medium">{pg.rating.toFixed(1)}</span>
              </>
            ) : (
              <>
                <Star className="h-3 w-3 fill-slate-950 text-slate-950" />
                <span className="font-medium">New</span>
                <span className="sr-only"> listing</span>
              </>
            )}
          </div>
        </div>{" "}

        {locationLine ? (
          <p className="truncate text-[0.9375rem] text-slate-500">{locationLine}</p>
        ) : null}
      </Link>

      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="min-w-0 text-[0.9375rem] text-slate-950">
          {min > 0 ? (
            <>
              <span className="font-semibold">
                {formatCurrency(min)}
              </span>
              <span> per month</span>
            </>
          ) : (
            <span className="font-semibold">Price on request</span>
          )}
        </p>
        <ColivingListingCardViewNumber pg={pg} />
      </div>
    </article>
  );
}
