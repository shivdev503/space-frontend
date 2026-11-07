"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Link2,
  MapPin,
  Minus,
  Plus,
  Share2,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { ContactFormModal } from "@/components/contact/contact-form-modal";
import { compareStore } from "@/lib/compare-store";
import { COMPARE_MAX, compareHref, type CompareSpace } from "@/lib/coworking-compare";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

import {
  buildCompareSections,
  rowIsSame,
  type CompareCell,
  type CompareRow,
  type CompareSectionId,
} from "./coworking-compare-rows";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const HEADER_OFFSET = 80; // fixed site header (h-20)

const SECTION_ICON: Record<CompareSectionId, typeof Wallet> = {
  price: Wallet,
  rating: Star,
  location: MapPin,
  hours: Clock,
  amenities: Sparkles,
};

function toItem(s: CompareSpace) {
  return { slug: s.slug, name: s.name, image: s.image, area: s.area, city: s.city };
}

function DiffSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="group inline-flex items-center gap-2.5 text-[13.5px] font-semibold text-ink"
    >
      <span
        className={cn(
          "relative flex h-[26px] w-[44px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-300",
          on ? "justify-end bg-ink" : "justify-start bg-slate-300 group-hover:bg-slate-400",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 34 }}
          className="grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
        >
          <AnimatePresence initial={false}>
            {on ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="h-3 w-3 text-ink" strokeWidth={3.5} aria-hidden />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.span>
      </span>
      Show only differences
    </button>
  );
}

function CellContent({ cell }: { cell: CompareCell }) {
  if (cell.check !== undefined) {
    return cell.check ? (
      <span className={cn("inline-flex items-center gap-2", cell.best ? "font-semibold text-[#0b7a55]" : "text-ink")}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#E8F8F1]">
          <Check className="h-3.5 w-3.5 text-[#0b9a6f]" strokeWidth={3} aria-hidden />
        </span>
        <span className="sr-only sm:not-sr-only">{cell.text}</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 text-slate-400">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100">
          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        <span className="sr-only">Not listed</span>
      </span>
    );
  }
  if (!cell.text) return <span className="text-slate-400">—</span>;
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className={cn(cell.best ? "font-bold text-[#0b7a55]" : "font-medium text-ink")}>{cell.text}</span>
      {cell.badge ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 26, delay: 0.25 }}
          className="rounded-full bg-[#E8F8F1] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#0b7a55]"
        >
          {cell.badge}
        </motion.span>
      ) : null}
    </span>
  );
}

function Row({ row }: { row: CompareRow }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.32, ease: EASE_OUT }}
      // `clip`, not `hidden`: hidden makes a scroll container and the sticky row label stops sticking.
      className="overflow-clip"
    >
      <div className="compare-grid group/row border-t border-black/[0.06] transition-colors hover:bg-slate-50/70">
        <div className="col-span-full px-3 pt-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted lg:sticky lg:left-0 lg:z-10 lg:col-span-1 lg:bg-white lg:px-5 lg:py-4 lg:text-[13.5px] lg:normal-case lg:tracking-normal lg:text-ink lg:group-hover/row:bg-slate-50">
          <span className="sticky left-3 lg:static">{row.label}</span>
        </div>
        {row.cells.map((cell, i) => (
          <div
            key={i}
            className={cn(
              "px-3 py-2.5 text-[14px] leading-snug sm:px-4 lg:py-4",
              cell.best && "bg-[linear-gradient(180deg,rgba(18,184,134,0.06),rgba(18,184,134,0.02))]",
            )}
          >
            <CellContent cell={cell} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SpaceHeader({
  space,
  index,
  compact,
  onRemove,
  onQuote,
}: {
  space: CompareSpace;
  index: number;
  compact: boolean;
  onRemove: () => void;
  onQuote: () => void;
}) {
  const href = `/coworking/${space.slug}`;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.05 + index * 0.07 }}
      className="relative flex min-w-0 flex-col px-1.5 py-2 sm:px-2"
    >
      <motion.div
        initial={false}
        animate={{ height: compact ? 0 : "auto", opacity: compact ? 0 : 1, marginBottom: compact ? 0 : 12 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="overflow-hidden"
      >
        <Link href={href} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={space.image}
            alt={space.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </Link>
      </motion.div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${space.name} from compare`}
        className={cn(
          "absolute z-10 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-ink shadow-[0_6px_16px_rgba(15,23,42,0.18)] backdrop-blur transition hover:scale-105",
          compact ? "right-1.5 top-1.5" : "right-4 top-4 sm:right-5 sm:top-5",
        )}
      >
        <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </button>

      <div className={cn("min-w-0", compact && "pr-9")}>
        <Link href={href} className="block text-[14.5px] font-bold leading-snug tracking-[-0.01em] text-ink hover:underline sm:text-[15.5px]">
          <span className="line-clamp-2">{space.name}</span>
        </Link>
        {!compact ? (
          <p className="mt-1 line-clamp-1 text-[12.5px] text-muted sm:text-[13px]">
            {[space.area, space.city].filter(Boolean).join(", ")}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
          {space.startingPrice ? (
            <span className="text-ink">
              <span className="font-bold">{formatCurrency(space.startingPrice)}</span>
              <span className="text-muted">/mo</span>
            </span>
          ) : null}
          {space.rating ? (
            <span className="inline-flex items-center gap-1 font-semibold text-ink">
              <Star className="h-3.5 w-3.5 fill-[#f4a621] text-[#f4a621]" aria-hidden />
              {space.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex-1" />
      <motion.button
        type="button"
        onClick={onQuote}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "w-full rounded-xl bg-[color:var(--color-brand)] font-semibold text-white shadow-[0_8px_18px_rgba(18,184,134,0.28)] transition hover:bg-[color:var(--color-accent)]",
          compact ? "mt-2 py-2 text-[12.5px]" : "mt-3 py-2.5 text-[13.5px]",
        )}
      >
        Get quote
      </motion.button>
    </motion.div>
  );
}

function EmptyState({ one }: { one?: CompareSpace }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="mx-auto mt-10 max-w-[520px] rounded-[28px] bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-10"
    >
      <div className="mx-auto mb-5 flex w-fit -space-x-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10, rotate: (i - 1) * 8 }}
            animate={{ opacity: 1, y: 0, rotate: (i - 1) * 8 }}
            transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
            className="h-16 w-14 rounded-2xl border-2 border-white bg-[linear-gradient(160deg,#E8F8F1,#cdeee0)] shadow-md"
          />
        ))}
      </div>
      <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
        {one ? "Add one more space" : "Pick spaces to compare"}
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
        Tap <b className="text-ink">Compare</b> on any coworking space to add it. You can compare up to {COMPARE_MAX}{" "}
        spaces side by side, even across cities.
      </p>
      <Link
        href={one ? `/coworking/${one.citySlug}` : "/coworking"}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-black"
      >
        Browse coworking spaces
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </motion.div>
  );
}

export function CoworkingCompareView({ spaces: initial }: { spaces: CompareSpace[] }) {
  const router = useRouter();
  const [spaces, setSpaces] = useState(initial);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [quoteFor, setQuoteFor] = useState<CompareSpace | null>(null);
  const [compact, setCompact] = useState(false);
  const [scroll, setScroll] = useState({ left: false, right: false });
  const [copied, setCopied] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Which strip the user is scrolling; only that one drives the other, so smooth scrolls don't fight.
  const driverRef = useRef<"head" | "body">("body");

  // The URL is the source of truth for what is being compared (shared links, back / forward);
  // keep local state and the tray in step with it.
  useEffect(() => {
    setSpaces(initial);
    compareStore.replace(initial.map(toItem));
  }, [initial]);

  const sections = useMemo(() => buildCompareSections(spaces), [spaces]);
  const n = spaces.length;
  const cities = [...new Set(spaces.map((s) => s.city).filter(Boolean))];

  const updateScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (driverRef.current === "body" && headRef.current && headRef.current.scrollLeft !== el.scrollLeft) {
      headRef.current.scrollLeft = el.scrollLeft;
    }
    setScroll({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateScroll();
    window.addEventListener("resize", updateScroll);
    return () => window.removeEventListener("resize", updateScroll);
  }, [updateScroll, n]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting && entry.boundingClientRect.top < HEADER_OFFSET), {
      rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  const onHeadScroll = () => {
    const head = headRef.current;
    const body = bodyRef.current;
    if (driverRef.current === "head" && head && body && body.scrollLeft !== head.scrollLeft) {
      body.scrollLeft = head.scrollLeft;
    }
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = bodyRef.current;
    if (!el) return;
    driverRef.current = "body";
    const col = (el.scrollWidth - (window.innerWidth >= 1024 ? 196 : 0)) / Math.max(1, n);
    el.scrollBy({ left: dir * col, behavior: "smooth" });
  };

  const remove = (slug: string) => {
    const next = spaces.filter((s) => s.slug !== slug);
    setSpaces(next);
    compareStore.replace(next.map(toItem));
    router.replace(next.length ? compareHref(next.map((s) => s.slug)) : "/coworking/compare", { scroll: false });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Compare coworking spaces · SpaceWallah", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed.
    }
  };

  const gridStyle = { "--n": n } as CSSProperties;
  const addHref = spaces[0] ? `/coworking/${spaces[0].citySlug}` : "/coworking";

  return (
    <main className="compare-scope mx-auto w-full max-w-[1360px] px-4 pb-36 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
          <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[40px]">
            Compare coworking spaces
          </h1>
          {n ? (
            <p className="mt-2 text-[14.5px] text-muted sm:text-[15.5px]">
              {n} space{n === 1 ? "" : "s"}
              {cities.length ? ` in ${cities.join(" & ")}` : ""} · the best value in every row is highlighted
            </p>
          ) : null}
        </div>

        {n >= 2 ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <DiffSwitch on={onlyDiff} onChange={setOnlyDiff} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-ink transition hover:border-ink"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "copied" : "share"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2"
                  >
                    {copied ? <Link2 className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
                    {copied ? "Link copied" : "Share"}
                  </motion.span>
                </AnimatePresence>
              </button>
              {n < COMPARE_MAX ? (
                <Link
                  href={addHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-ink transition hover:border-ink"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add space
                </Link>
              ) : null}
              {scroll.left || scroll.right ? (
                <div className="ml-1 flex items-center gap-1.5">
                  {([-1, 1] as const).map((dir) => {
                    const enabled = dir < 0 ? scroll.left : scroll.right;
                    const Icon = dir < 0 ? ChevronLeft : ChevronRight;
                    return (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => scrollBy(dir)}
                        disabled={!enabled}
                        aria-label={dir < 0 ? "Previous spaces" : "More spaces"}
                        className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-white text-ink transition enabled:hover:border-ink enabled:hover:shadow-md disabled:opacity-35"
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </motion.div>

      {n < 2 ? (
        <EmptyState one={spaces[0]} />
      ) : (
        <>
          <div ref={sentinelRef} className="h-6 sm:h-8" aria-hidden />

          {/* Space headers: sticky under the site header, scroll in step with the table. */}
          <div
            className={cn(
              "sticky z-30 -mx-4 px-4 transition-[background-color,box-shadow,backdrop-filter] duration-300 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
              compact
                ? "bg-[color:var(--color-page-bg)] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                : "bg-transparent",
            )}
            style={{ top: HEADER_OFFSET }}
          >
            <div
              ref={headRef}
              onScroll={onHeadScroll}
              onPointerDown={() => (driverRef.current = "head")}
              onTouchStart={() => (driverRef.current = "head")}
              onWheel={() => (driverRef.current = "head")}
              className="no-scrollbar overflow-x-auto"
            >
              <div className="compare-track compare-grid" style={gridStyle}>
                <div className="hidden lg:sticky lg:left-0 lg:z-10 lg:flex lg:flex-col lg:justify-end lg:bg-[color:var(--color-page-bg)] lg:pb-4 lg:pr-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Comparing</p>
                  <p className="text-[26px] font-extrabold tracking-[-0.03em] text-ink">
                    {n} <span className="text-[15px] font-semibold text-muted">of {COMPARE_MAX}</span>
                  </p>
                </div>
                <AnimatePresence initial={false} mode="popLayout">
                  {spaces.map((space, i) => (
                    <SpaceHeader
                      key={space.slug}
                      space={space}
                      index={i}
                      compact={compact}
                      onRemove={() => remove(space.slug)}
                      onQuote={() => setQuoteFor(space)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="relative mt-3">
            <div
              ref={bodyRef}
              onScroll={updateScroll}
              onPointerDown={() => (driverRef.current = "body")}
              onTouchStart={() => (driverRef.current = "body")}
              onWheel={() => (driverRef.current = "body")}
              className="no-scrollbar overflow-x-auto rounded-[24px] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.06]"
            >
              <div className="compare-track" style={gridStyle}>
                {sections.map((section, si) => {
                  const rows = onlyDiff ? section.rows.filter((r) => !rowIsSame(r)) : section.rows;
                  const Icon = SECTION_ICON[section.id];
                  return (
                    <AnimatePresence key={section.id} initial={false}>
                      {rows.length ? (
                        <motion.section
                          key={section.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.15 + si * 0.06 }}
                          className={cn(si > 0 && "border-t-[6px] border-[color:var(--color-page-bg)]")}
                        >
                          <div className="px-3 pb-3 pt-5 sm:px-5 lg:pt-6">
                            <h2 className="sticky left-3 inline-flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-0.01em] text-ink sm:left-5 sm:text-[17px]">
                              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#E8F8F1] text-[#0b9a6f]">
                                <Icon className="h-4 w-4" aria-hidden />
                              </span>
                              {section.title}
                            </h2>
                          </div>
                          <AnimatePresence initial={false}>
                            {rows.map((row) => (
                              <Row key={row.id} row={row} />
                            ))}
                          </AnimatePresence>
                        </motion.section>
                      ) : null}
                    </AnimatePresence>
                  );
                })}
                <AnimatePresence>
                  {onlyDiff && sections.every((s) => s.rows.every(rowIsSame)) ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="sticky left-0 w-[calc(100vw-2rem)] px-5 py-10 text-center text-[14px] text-muted sm:w-auto"
                    >
                      These spaces match on everything listed.
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {/* Edge fades hint that there is more to scroll. */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-[24px] bg-gradient-to-l from-white to-transparent transition-opacity duration-300",
                scroll.right ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          {scroll.right && n > 2 ? (
            <p className="mt-3 text-center text-[12.5px] font-medium text-muted sm:hidden">Swipe to see all {n} spaces →</p>
          ) : null}
        </>
      )}

      {quoteFor ? (
        <ContactFormModal
          open
          onOpenChange={(open) => {
            if (!open) setQuoteFor(null);
          }}
          leadTarget={{ city: quoteFor.citySlug, spaceId: quoteFor.id }}
          submitLabel="Get Quote"
          title="Get Quote"
          subtitle={`Share your details and we will follow up about ${quoteFor.name}.`}
          interestedInDefault={`${quoteFor.name} — quote`}
          mxSpaceType="Web Coworking"
          microlocation={quoteFor.area}
        />
      ) : null}
    </main>
  );
}
