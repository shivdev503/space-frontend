"use client";

import type { CSSProperties } from "react";
import { RemoteImage } from "@/components/ui/remote-image";
import { ChevronLeft, ChevronRight, Grid3X3, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/cn";

export type ImageGalleryAdjustment = {
  brightness?: number;
  contrast?: number;
};

type ImageEntry = { src: string; originalIndex: number };

export type SpaceDetailGalleryProps = {
  name: string;
  images: string[];
  /** Per-image brightness/contrast (same indices as `images` before dedupe). */
  imageAdjustments?: Array<ImageGalleryAdjustment | undefined>;
  className?: string;
};

function uniqueImageEntries(
  raw: string[],
): ImageEntry[] {
  const seen = new Set<string>();
  const list: ImageEntry[] = [];
  raw.forEach((src, originalIndex) => {
    const trimmed = src.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    list.push({ src: trimmed, originalIndex });
  });
  return list;
}

/** Photo-tour rows: one wide photo, then a pair, repeating (Airbnb "Show all photos" layout). */
function tourRows(entries: ImageEntry[]): Array<Array<{ entry: ImageEntry; index: number }>> {
  const rows: Array<Array<{ entry: ImageEntry; index: number }>> = [];
  let i = 0;
  let wide = true;
  while (i < entries.length) {
    const size = wide ? 1 : Math.min(2, entries.length - i);
    rows.push(entries.slice(i, i + size).map((entry, k) => ({ entry, index: i + k })));
    i += size;
    wide = !wide;
  }
  return rows;
}

function filterStyleForIndex(
  originalIndex: number,
  imageCount: number,
  adjustments?: Array<ImageGalleryAdjustment | undefined>,
): CSSProperties | undefined {
  if (originalIndex < 0 || originalIndex >= imageCount) return undefined;
  const adj = adjustments?.[originalIndex];
  if (!adj) return undefined;
  const b = adj.brightness ?? 1;
  const c = adj.contrast ?? 1;
  if (b === 1 && c === 1) return undefined;
  return { filter: `brightness(${b}) contrast(${c})` };
}

export function SpaceDetailGallery({
  name,
  images,
  imageAdjustments,
  className,
}: SpaceDetailGalleryProps) {
  const allEntries = useMemo(() => uniqueImageEntries(images), [images]);
  const allPhotos = useMemo(() => allEntries.map((e) => e.src), [allEntries]);
  const preview = useMemo(() => allEntries.slice(0, 5), [allEntries]);
  const [index, setIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourFocusIndex, setTourFocusIndex] = useState<number | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRailRef = useRef<HTMLDivElement>(null);
  const tourScrollRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => tourRows(allEntries), [allEntries]);

  const styleAt = useCallback(
    (entry: ImageEntry) =>
      filterStyleForIndex(entry.originalIndex, images.length, imageAdjustments),
    [imageAdjustments, images.length],
  );

  /** Opens the photo tour, scrolled to the clicked preview photo (or the top for "Show all"). */
  const openTour = useCallback(
    (previewIndex: number | null) => {
      const entry = previewIndex === null ? undefined : preview[previewIndex];
      const fullIndex = entry ? allEntries.findIndex((e) => e.src === entry.src) : 0;
      setTourFocusIndex(fullIndex > 0 ? fullIndex : null);
      setTourOpen(true);
    },
    [allEntries, preview],
  );

  const closeTour = useCallback(() => {
    setTourOpen(false);
    setTourFocusIndex(null);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + allPhotos.length) % allPhotos.length));
  }, [allPhotos.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % allPhotos.length));
  }, [allPhotos.length]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const onScroll = () => {
      const w = el.clientWidth || 1;
      const i = Math.round(el.scrollLeft / w);
      setIndex(Math.max(0, Math.min(preview.length - 1, i)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [preview.length]);

  const overlayOpen = tourOpen || lightboxIndex !== null;

  useEffect(() => {
    if (!overlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [overlayOpen]);

  useEffect(() => {
    if (!overlayOpen) return;

    // The slideshow sits above the tour, so Escape closes it first.
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
        return;
      }
      if (e.key === "Escape") closeTour();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, lightboxIndex, closeLightbox, closeTour, goPrev, goNext]);

  useEffect(() => {
    if (!tourOpen) return;
    const container = tourScrollRef.current;
    if (!container) return;
    if (tourFocusIndex === null) {
      container.scrollTop = 0;
      return;
    }
    const target = container.querySelector<HTMLElement>(`[data-tour-index="${tourFocusIndex}"]`);
    target?.scrollIntoView({ block: "center" });
  }, [tourOpen, tourFocusIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const rail = thumbRailRef.current;
    if (!rail) return;
    const thumb = rail.querySelector<HTMLElement>(`[data-thumb-index="${lightboxIndex}"]`);
    thumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [lightboxIndex]);

  if (preview.length === 0) return null;

  const pad = String(index + 1).padStart(2, "0");
  const total = String(preview.length).padStart(2, "0");
  const photoCount = allPhotos.length;
  const activeEntry = lightboxIndex !== null ? allEntries[lightboxIndex] : null;
  const activeSrc = activeEntry?.src ?? null;

  return (
    <>
      <div className={cn("relative mt-3 sm:mt-7", className)}>
        <span
          className="pointer-events-none absolute right-4 top-3.5 z-[2] rounded-full bg-slate-950/65 px-3 py-1.5 font-mono text-xs tracking-wide text-white backdrop-blur-md lg:hidden"
          aria-hidden
        >
          {pad} / {total}
        </span>

        <div
          ref={railRef}
          className={cn(
            "relative overflow-hidden rounded-3xl lg:grid lg:h-[560px] lg:grid-cols-[1.6fr_1fr_1fr] lg:grid-rows-2 lg:gap-2",
            "max-lg:-mx-4 max-lg:flex max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:rounded-none",
            "max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden",
          )}
        >
          {preview.map((entry, i) => (
            <button
              key={`${entry.src}-${i}`}
              type="button"
              onClick={() => openTour(i === preview.length - 1 && photoCount > 1 ? null : i)}
              className={cn(
                "group relative block overflow-hidden bg-slate-200 text-left",
                i === 0 && "lg:row-span-2",
                "max-lg:aspect-[5/4] max-lg:w-full max-lg:shrink-0 max-lg:snap-center",
              )}
              aria-label={`View photo ${i + 1} of ${photoCount}`}
            >
              <RemoteImage
                src={entry.src}
                alt={`${name} — photo ${i + 1}`}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 880px) 100vw, 50vw"
                priority={i === 0}
                style={styleAt(entry)}
              />
              {i === preview.length - 1 && photoCount > 1 ? (
                <span
                  className={cn(
                    "absolute inset-0 flex items-end justify-end p-3.5 transition",
                    photoCount > 5 && "bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.04] bg-white/95 px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition group-hover:bg-white max-lg:hidden">
                    <Grid3X3 className="h-3.5 w-3.5" aria-hidden />
                    Show all {photoCount} photos
                  </span>
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 pt-3.5 lg:hidden">
          <div className="flex items-center gap-1.5" aria-hidden>
            {preview.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full bg-slate-200 transition-all",
                  i === index ? "w-5 bg-ink" : "w-1.5",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => openTour(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink"
          >
            <Grid3X3 className="h-3.5 w-3.5" aria-hidden />
            All {photoCount} photos
          </button>
        </div>
      </div>

      {portalReady && tourOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex flex-col bg-white"
              role="dialog"
              aria-modal="true"
              aria-label={`${name} — all photos`}
            >
              <div className="shrink-0 border-b border-slate-200/90 bg-white">
                <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-4 px-4 sm:px-8">
                  <button
                    type="button"
                    onClick={closeTour}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-slate-100"
                    aria-label="Close photos"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                  <p className="min-w-0 flex-1 truncate text-base font-semibold text-ink sm:text-lg">{name}</p>
                  <p className="shrink-0 text-sm text-muted">
                    {photoCount} {photoCount === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </div>

              <div ref={tourScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="mx-auto flex w-full max-w-[880px] flex-col gap-2 px-4 py-6 sm:gap-3 sm:px-8 sm:py-8">
                  {rows.map((row) => (
                    <div
                      key={row[0].index}
                      className={cn("grid gap-2 sm:gap-3", row.length === 2 && "sm:grid-cols-2")}
                    >
                      {row.map(({ entry, index: photoIndex }) => (
                        <button
                          key={`${entry.src}-tour`}
                          type="button"
                          data-tour-index={photoIndex}
                          onClick={() => setLightboxIndex(photoIndex)}
                          className={cn(
                            "group relative block w-full overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl",
                            row.length === 1 ? "aspect-[3/2]" : "aspect-[4/3]",
                          )}
                          aria-label={`Open photo ${photoIndex + 1} of ${photoCount}`}
                        >
                          <RemoteImage
                            src={entry.src}
                            alt={`${name} — photo ${photoIndex + 1}`}
                            fill
                            className="object-cover transition duration-500 group-hover:brightness-[0.92]"
                            sizes={row.length === 1 ? "(max-width: 880px) 100vw, 880px" : "(max-width: 640px) 100vw, 440px"}
                            style={styleAt(entry)}
                          />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {portalReady && lightboxIndex !== null && activeSrc && activeEntry
        ? createPortal(
            <div
              className="fixed inset-0 z-[130] flex flex-col bg-[#020617]/96 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4"
              role="dialog"
              aria-modal="true"
              aria-label={`${name} photos`}
            >
              <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-3 sm:mb-3">
                  <p className="text-sm font-medium text-white/90">
                    {lightboxIndex + 1} / {photoCount}
                  </p>
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Close
                  </button>
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/40">
                  <RemoteImage
                    src={activeSrc}
                    alt={`${name} — photo ${lightboxIndex + 1}`}
                    fill
                    className="object-contain p-1 sm:p-2"
                    sizes="100vw"
                    priority
                    style={styleAt(activeEntry)}
                  />

                  {photoCount > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white sm:left-4"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white sm:right-4"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  ) : null}
                </div>

                <div
                  ref={thumbRailRef}
                  className="no-scrollbar mt-3 flex max-h-[5.5rem] shrink-0 gap-2 overflow-x-auto overflow-y-hidden pb-1 pt-0.5"
                  aria-label="Photo thumbnails"
                >
                  {allEntries.map((entry, i) => (
                    <button
                      key={`${entry.src}-${i}-thumb`}
                      type="button"
                      data-thumb-index={i}
                      onClick={() => setLightboxIndex(i)}
                      className={cn(
                        "relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-[4.5rem] sm:w-32",
                        i === lightboxIndex
                          ? "border-[color:var(--color-brand)] ring-2 ring-[color:var(--color-brand)]/50"
                          : "border-transparent opacity-75 hover:opacity-100",
                      )}
                    >
                      <RemoteImage
                        src={entry.src}
                        alt={`${name} thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="128px"
                        style={styleAt(entry)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
