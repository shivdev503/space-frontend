"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";

/**
 * Instant feedback for clicks inside the site, in the browser only (the HTML Google receives is
 * unchanged). A thin bar starts the moment a link is clicked; if the page has not arrived after a
 * moment, the content area shows a skeleton of the page being opened (listing grid or listing
 * detail) instead of the old page sitting still. Everything resets when the new URL commits.
 */

type SkeletonKind = "listing" | "detail" | null;

const VERTICALS = new Set(["coworking", "virtual-office", "managed-office", "coliving"]);
const NOT_CITY_OR_LISTING = new Set(["compare", "shortlist"]);
/** Below this the page usually came from the cache: the bar alone is enough. */
const SKELETON_DELAY_MS = 150;
/** Give up quietly if a click never turns into a navigation (e.g. a script cancelled it). */
const GIVE_UP_MS = 20_000;

function skeletonFor(pathname: string, citySlugs: Set<string>): SkeletonKind {
  const parts = pathname.split("/").filter(Boolean).map((p) => decodeURIComponent(p).toLowerCase());
  if (parts.length < 2) return null;
  if (parts[0] === "brand" || parts[0] === "building") return parts.length === 2 ? "listing" : null;
  if (!VERTICALS.has(parts[0]) || NOT_CITY_OR_LISTING.has(parts[1])) return null;
  if (parts.length === 3) return "listing"; // city / area
  if (parts.length === 2) return citySlugs.has(parts[1]) ? "listing" : "detail";
  return null;
}

/** The internal page a click is going to, or null when the click is not a page change we track. */
function clickTarget(event: MouseEvent): URL | null {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest("a");
  if (!anchor || !anchor.href) return null;
  // Buttons inside a card link (shortlist, compare, photo arrows) are not page changes.
  const control = target?.closest("button, input, select, textarea, label, [role='button']");
  if (control && anchor.contains(control)) return null;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return null;
  if (anchor.dataset.noProgress !== undefined) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname.startsWith("/api/") || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return null;
  // Same page (or only a #section on it): nothing to load.
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  return url;
}

/** Calls `onChange` after each committed URL change (path or query). Needs Suspense for useSearchParams. */
function RouteWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? "";
  const first = useRef(true);
  // Layout effect: clear the skeleton before the new page's first paint, so it never shows hidden.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange();
  }, [pathname, search, onChange]);
  return null;
}

function ListingPageSkeleton() {
  return (
    <section className="pb-14 pt-6 sm:pb-20 sm:pt-10" aria-busy="true" aria-label="Loading spaces">
      <Container>
        <div className="h-3 w-48 animate-pulse rounded-full bg-slate-200/70" />
        <div className="mt-5 h-8 w-4/5 max-w-xl animate-pulse rounded-xl bg-slate-200/80 sm:h-10" />
        <div className="mt-3 h-4 w-3/5 max-w-md animate-pulse rounded-lg bg-slate-200/60" />
        <div className="mt-6 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-slate-200/70" />
          ))}
        </div>
        <SpaceGridSkeleton className="mt-8" count={6} />
      </Container>
    </section>
  );
}

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse bg-slate-200/70 ${className}`} />;
}

/** Follows the listing detail pages: title, location, photos, then price cards and sections. */
function DetailPageSkeleton() {
  return (
    <section className="pb-14 pt-5 sm:pb-20 sm:pt-8" aria-busy="true" aria-label="Loading space details">
      <Container>
        <Bone className="h-3 w-56 max-w-full rounded-full" />
        <Bone className="mt-4 h-7 w-4/5 max-w-2xl rounded-lg sm:h-9" />
        <Bone className="mt-3 h-4 w-1/2 max-w-xs rounded-md" />
        <div className="mt-4 flex gap-2">
          <Bone className="h-8 w-24 rounded-full" />
          <Bone className="h-8 w-32 rounded-full" />
        </div>
        <div className="mt-5 grid gap-2 lg:h-[26rem] lg:grid-cols-4 lg:grid-rows-2">
          <Bone className="aspect-[5/4] w-full rounded-[1.2rem] lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:h-full" />
          {Array.from({ length: 4 }, (_, i) => (
            <Bone key={i} className="hidden h-full rounded-[1.2rem] lg:block" />
          ))}
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <Bone className="h-6 w-2/3 max-w-sm rounded-lg" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5">
                  <Bone className="h-8 w-8 rounded-xl" />
                  <Bone className="mt-4 h-4 w-32 rounded-md" />
                  <Bone className="mt-2 h-3 w-full rounded-md" />
                  <Bone className="mt-4 h-6 w-28 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden rounded-2xl border border-slate-200/80 bg-white p-6 lg:block">
            <Bone className="h-6 w-40 rounded-lg" />
            <Bone className="mt-5 h-12 w-full rounded-xl" />
            <Bone className="mt-3 h-12 w-full rounded-xl" />
            <Bone className="mt-5 h-12 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProgressBar({ progress, visible }: { progress: number; visible: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease 150ms" }}
    >
      <div
        className="h-full bg-[color:var(--color-brand)] shadow-[0_0_8px_rgba(18,184,134,0.6)]"
        style={{ width: `${progress}%`, transition: progress === 0 ? "none" : "width 250ms ease-out" }}
      />
    </div>
  );
}

export function NavigationFeedback({ children, citySlugs }: { children: ReactNode; citySlugs: string[] }) {
  const cities = useRef(new Set(citySlugs));
  const [progress, setProgress] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const [skeleton, setSkeleton] = useState<SkeletonKind>(null);
  const timers = useRef<number[]>([]);
  const trickle = useRef<number | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (trickle.current != null) window.clearInterval(trickle.current);
    trickle.current = null;
  };

  const finish = useCallback(() => {
    clearTimers();
    setSkeleton(null);
    setProgress((p) => (p > 0 ? 100 : 0));
    timers.current.push(
      window.setTimeout(() => setBarVisible(false), 200),
      window.setTimeout(() => setProgress(0), 650),
    );
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const url = clickTarget(event);
      if (!url) return;
      clearTimers();
      setBarVisible(true);
      setProgress(8);
      timers.current.push(window.setTimeout(() => setProgress(25), 30));
      // Creep towards 90% while waiting; the last stretch happens when the page arrives.
      trickle.current = window.setInterval(() => setProgress((p) => (p < 90 ? p + (90 - p) * 0.08 : p)), 300);
      const kind = skeletonFor(url.pathname, cities.current);
      if (kind) {
        timers.current.push(
          window.setTimeout(() => {
            setSkeleton(kind);
            window.scrollTo({ top: 0 });
          }, SKELETON_DELAY_MS),
        );
      }
      timers.current.push(window.setTimeout(finish, GIVE_UP_MS));
    };
    // Bubble phase on document: links whose click a card button stopped never reach here.
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimers();
    };
  }, [finish]);

  return (
    <>
      <ProgressBar progress={progress} visible={barVisible} />
      <Suspense fallback={null}>
        <RouteWatcher onChange={finish} />
      </Suspense>
      {skeleton === "listing" ? <ListingPageSkeleton /> : null}
      {skeleton === "detail" ? <DetailPageSkeleton /> : null}
      {/* Kept mounted (not replaced) so a cancelled click leaves the page exactly as it was. */}
      <div className={skeleton ? "hidden" : "contents"}>{children}</div>
    </>
  );
}
