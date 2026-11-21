"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ColivingListingCard } from "@/modules/coliving/components/coliving-listing-card";
import { pgListingReactKey } from "@/lib/pg-slug";
import type { PgDetail } from "@/types/pg.model";
import { cn } from "@/utils/cn";

import { ColivingAccent, ColivingEyebrow } from "./coliving-detail-ui";

type ColivingDetailSimilarGridProps = {
  items: PgDetail[];
  /** "Browse all listings" target: the area page, else the city page, else /coliving (pages that exist). */
  browseHref: string;
  locality: string;
  currentName: string;
};

export function ColivingDetailSimilarGrid({
  items,
  browseHref,
  locality,
  currentName,
}: ColivingDetailSimilarGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filtered = items.filter((pg) => pg.name !== currentName).slice(0, 12);

  const syncScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(maxScroll > 6 && scrollLeft < maxScroll - 6);
  }, []);

  useEffect(() => {
    if (!filtered.length) return;
    const t = requestAnimationFrame(syncScrollButtons);
    return () => cancelAnimationFrame(t);
  }, [filtered.length, syncScrollButtons]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncScrollButtons();
    el.addEventListener("scroll", syncScrollButtons, { passive: true });
    const ro = new ResizeObserver(syncScrollButtons);
    ro.observe(el);
    window.addEventListener("resize", syncScrollButtons);
    return () => {
      el.removeEventListener("scroll", syncScrollButtons);
      ro.disconnect();
      window.removeEventListener("resize", syncScrollButtons);
    };
  }, [filtered.length, syncScrollButtons]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-similar-card]");
    const step = card ? card.offsetWidth + 16 : Math.min(320, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  if (!filtered.length) return null;

  return (
    <section className="border-t border-slate-200/80 bg-[#f9f8f5] py-12 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <ColivingEyebrow>Nearby in {locality}</ColivingEyebrow>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,3.6vw,2.625rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Similar coliving residences <ColivingAccent>to compare</ColivingAccent>
            </h2>
          </div>
          <Link
            href={browseHref}
            className="inline-flex shrink-0 items-center gap-1.5 border-b border-ink pb-0.5 text-sm font-medium text-ink transition hover:text-[color:var(--color-brand)]"
          >
            Browse all listings
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="relative mt-8">
          {filtered.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Scroll similar listings left"
                disabled={!canScrollLeft}
                onClick={() => scrollByDir(-1)}
                className={cn(
                  "absolute -left-1 top-[calc(50%-1.25rem)] z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition sm:flex",
                  canScrollLeft ? "hover:border-slate-300 hover:bg-slate-50" : "cursor-default opacity-35",
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Scroll similar listings right"
                disabled={!canScrollRight}
                onClick={() => scrollByDir(1)}
                className={cn(
                  "absolute -right-1 top-[calc(50%-1.25rem)] z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-800 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition sm:flex",
                  canScrollRight ? "hover:bg-slate-900" : "cursor-default opacity-35",
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <div
            ref={scrollRef}
            className={cn(
              "flex gap-4 overflow-x-auto pb-2",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              "snap-x snap-mandatory",
              "-mx-4 px-4 sm:mx-0 sm:px-0",
            )}
          >
            {filtered.map((pg, index) => (
              <div
                key={pgListingReactKey(pg, index)}
                data-similar-card
                className="w-[min(17.5rem,78vw)] shrink-0 snap-start sm:w-[17.5rem]"
              >
                <ColivingListingCard pg={pg} className="h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
