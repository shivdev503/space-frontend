"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { RemoteImage } from "@/components/ui/remote-image";
import { listingPhotoAlt } from "@/lib/image-alt";
import { cn } from "@/utils/cn";

/** Dots shown at once; longer sets slide the dot strip along (Airbnb style). */
const VISIBLE_DOTS = 5;
const DOT = 6;
const DOT_GAP = 5;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Dots({ count, index }: { count: number; index: number }) {
  const step = DOT + DOT_GAP;
  const windowed = count > VISIBLE_DOTS;
  // Keep the active dot centred once there are more dots than fit.
  const first = windowed
    ? Math.max(0, Math.min(count - VISIBLE_DOTS, index - Math.floor(VISIBLE_DOTS / 2)))
    : 0;

  return (
    <div
      className="overflow-hidden"
      style={{ width: (windowed ? VISIBLE_DOTS : count) * step - DOT_GAP }}
      aria-hidden
    >
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ gap: DOT_GAP, transform: `translateX(${-first * step}px)` }}
      >
        {Array.from({ length: count }).map((_, i) => {
          // Dots at the edge of a sliding window shrink, hinting there is more.
          const edge = windowed && ((i === first && first > 0) || (i === first + VISIBLE_DOTS - 1 && i < count - 1));
          return (
            <span
              key={i}
              className={cn(
                "shrink-0 rounded-full transition-all duration-300",
                i === index ? "bg-white" : "bg-white/60",
                edge ? "scale-[0.66]" : i === index ? "scale-110" : "scale-100",
              )}
              style={{ width: DOT, height: DOT }}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Swipeable photo strip for listing cards. Native scroll-snap gives momentum swiping on
 * phones and trackpads; arrows appear on hover for mouse users. Photos load one ahead
 * of the one in view, so a card costs a single image until someone browses it.
 */
export function ListingPhotoCarousel({
  images,
  href,
  name,
  altBase,
  sizes,
  className,
  ref,
}: {
  images: string[];
  href: string;
  name: string;
  altBase: string;
  sizes: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  // Highest slide allowed to load; grows as the user browses (or hovers, to warm the next one).
  const [loadUpTo, setLoadUpTo] = useState(0);
  const count = images.length;

  const go = useCallback(
    (next: number) => {
      const el = railRef.current;
      if (!el) return;
      const target = Math.max(0, Math.min(count - 1, next));
      setLoadUpTo((n) => Math.max(n, target + 1));
      el.scrollTo({ left: target * el.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    },
    [count],
  );

  useEffect(() => {
    const el = railRef.current;
    if (!el || count <= 1) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / (el.clientWidth || 1))));
        indexRef.current = next;
        setIndex(next);
        setLoadUpTo((n) => Math.max(n, next + 1));
      });
    };
    // Keep the same photo in view when the card is resized (rotation, window resize).
    const resize = new ResizeObserver(() => {
      el.scrollTo({ left: indexRef.current * el.clientWidth, behavior: "auto" });
    });
    el.addEventListener("scroll", onScroll, { passive: true });
    resize.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      resize.disconnect();
    };
  }, [count]);

  const arrow = (dir: -1 | 1) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    go(index + dir);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (count <= 1) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  const arrowClass =
    "absolute top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.18)] ring-1 ring-black/5 transition duration-200 hover:scale-[1.06] hover:bg-white active:scale-95 [@media(hover:hover)]:inline-flex";

  return (
    <div
      ref={ref}
      className={cn("relative isolate overflow-hidden bg-slate-100", className)}
      onPointerEnter={() => setLoadUpTo((n) => Math.max(n, 1))}
      onKeyDown={onKeyDown}
    >
      <div
        ref={railRef}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
      >
        {images.map((src, i) => (
          <Link
            key={`${src}-${i}`}
            href={href}
            draggable={false}
            className="relative block h-full w-full shrink-0 snap-center [scroll-snap-stop:always]"
            aria-label={count > 1 ? `View ${name}, photo ${i + 1} of ${count}` : `View ${name}`}
            tabIndex={i === index ? 0 : -1}
          >
            {i <= loadUpTo ? (
              <RemoteImage
                src={src}
                alt={listingPhotoAlt(altBase, i)}
                fill
                draggable={false}
                className="select-none object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes={sizes}
              />
            ) : null}
          </Link>
        ))}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Previous photo"
            onClick={arrow(-1)}
            className={cn(
              arrowClass,
              "left-2.5 opacity-0 group-hover:opacity-100",
              index === 0 && "pointer-events-none !opacity-0",
            )}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Next photo"
            onClick={arrow(1)}
            className={cn(
              arrowClass,
              "right-2.5 opacity-0 group-hover:opacity-100",
              index >= count - 1 && "pointer-events-none !opacity-0",
            )}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>

          {/* Soft shade so the dots read on bright photos. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-20 flex justify-center sm:bottom-3">
            <Dots count={count} index={index} />
          </div>
          <span className="sr-only" aria-live="polite">
            Photo {index + 1} of {count}
          </span>
        </>
      ) : null}
    </div>
  );
}
