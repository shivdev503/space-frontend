"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MouseEvent } from "react";

import { cn } from "@/utils/cn";

type PageNumbersProps = {
  page: number;
  totalPages: number;
  /** Listing path without query, e.g. "/coworking/gurgaon". */
  basePath: string;
  /** Other query params to keep on every page link (filters, sort). `page` is set per link. */
  query?: Record<string, string>;
  /**
   * Load the page in place instead of navigating (client listings that fetch their own rows).
   * The links stay real `href`s either way, so crawlers can follow every page.
   */
  onNavigate?: (page: number) => void;
  disabled?: boolean;
  /** Element id to land on (e.g. "vo-listings") when a page link opens a new page. */
  anchor?: string;
  className?: string;
};

/** 1 … 4 5 6 … 12: always the first and last page, and one either side of the current one. */
export function pageWindow(page: number, totalPages: number): Array<number | "gap"> {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  // Show 2 or (n-1) instead of a gap that would hide just one number.
  if (page <= 4) for (let p = 2; p <= Math.min(5, totalPages); p++) pages.add(p);
  if (page >= totalPages - 3) for (let p = Math.max(1, totalPages - 4); p < totalPages; p++) pages.add(p);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function pageHref(basePath: string, page: number, query: Record<string, string> = {}): string {
  const qs = new URLSearchParams(query);
  qs.delete("page");
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

const ITEM =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition";

/** Numbered pagination for listing pages: real links to `?page=N`, so every page is crawlable. */
export function PageNumbers({
  page,
  totalPages,
  basePath,
  query,
  onNavigate,
  disabled,
  anchor,
  className,
}: PageNumbersProps) {
  if (totalPages <= 1) return null;

  const click = (target: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (!disabled && target !== page) onNavigate(target);
  };

  const link = (target: number, label: React.ReactNode, extra: string, aria?: string) => (
    <Link
      href={pageHref(basePath, target, query) + (anchor && !onNavigate ? `#${anchor}` : "")}
      prefetch={false}
      scroll={!onNavigate}
      onClick={click(target)}
      aria-label={aria}
      aria-current={target === page && !aria ? "page" : undefined}
      className={cn(ITEM, extra, disabled && "pointer-events-none opacity-60")}
    >
      {label}
    </Link>
  );

  const muted = "border-slate-200 bg-white text-slate-300";
  const normal = "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50";
  const current = "border-slate-900 bg-slate-900 text-white";

  return (
    <nav aria-label="Pagination" className={cn("flex flex-wrap items-center justify-center gap-2 pt-6", className)}>
      {page > 1 ? (
        link(page - 1, <><ChevronLeft className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">Prev</span></>, cn(normal, "gap-1"), "Previous page")
      ) : (
        <span className={cn(ITEM, muted, "gap-1")} aria-hidden>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400" aria-hidden>
            …
          </span>
        ) : (
          <span key={p}>{link(p, p, p === page ? current : normal)}</span>
        ),
      )}
      {page < totalPages ? (
        link(page + 1, <><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" aria-hidden /></>, cn(normal, "gap-1"), "Next page")
      ) : (
        <span className={cn(ITEM, muted, "gap-1")} aria-hidden>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
