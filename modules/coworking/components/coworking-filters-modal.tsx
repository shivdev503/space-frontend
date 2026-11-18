"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IndianRupee, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  COWORKING_PRICE_RANGE_OPTIONS,
  COWORKING_SORT_OPTIONS,
  DEFAULT_COWORKING_LIST_FILTERS,
  minMaxFromPriceRange,
  type CoworkingListFilterState,
  type CoworkingPriceRangeKey,
} from "@/lib/coworking-list-filters";
import { cn } from "@/utils/cn";

type CoworkingFiltersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CoworkingListFilterState;
  onApply: (next: CoworkingListFilterState) => void;
  onClear: () => void;
  resultCount: number;
  pending?: boolean;
};

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm font-medium transition",
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      {label}
    </button>
  );
}

export function CoworkingFiltersModal({
  open,
  onOpenChange,
  filters,
  onApply,
  onClear,
  resultCount,
  pending = false,
}: CoworkingFiltersModalProps) {
  const [draft, setDraft] = useState(filters);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const patch = useCallback((partial: Partial<CoworkingListFilterState>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const selectPriceRange = (key: CoworkingPriceRangeKey) => {
    const nextKey = draft.priceRange === key ? "" : key;
    const { minPrice, maxPrice } = minMaxFromPriceRange(nextKey);
    patch({ priceRange: nextKey, minPrice, maxPrice });
  };

  const selectSort = (value: string) => {
    const opt = COWORKING_SORT_OPTIONS.find((o) => o.value === value);
    if (!opt) return;
    patch({ sortBy: opt.sortBy, orderBy: opt.orderBy });
  };

  const sortValue = `${draft.sortBy}:${draft.orderBy}`;

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const handleClear = () => {
    const cleared = { ...DEFAULT_COWORKING_LIST_FILTERS };
    setDraft(cleared);
    onClear();
    onOpenChange(false);
  };

  const resultLabel =
    resultCount === 1 ? "Show 1 space" : `Show ${resultCount.toLocaleString("en-IN")} spaces`;

  if (!portalReady) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-slate-950/45 sm:items-center sm:justify-center sm:p-5 sm:backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="coworking-filters-title"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className={cn(
              "flex h-[100dvh] w-full flex-col bg-[#f9f8f5] shadow-[0_32px_80px_rgba(15,23,42,0.22)]",
              "sm:h-auto sm:max-h-[min(640px,92vh)] sm:max-w-[min(100%,34rem)] sm:rounded-[1.75rem] sm:border sm:border-slate-200/80",
            )}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-[#f9f8f5]/95 px-4 py-3 backdrop-blur-md sm:rounded-t-[1.75rem] sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:hidden"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
              <h2
                id="coworking-filters-title"
                className="flex-1 text-center text-lg font-semibold text-slate-950 sm:text-left"
              >
                Filters
              </h2>
              <button
                type="button"
                onClick={handleClear}
                className="text-sm font-semibold text-slate-600 underline-offset-2 transition hover:text-slate-950 hover:underline"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              <div className="space-y-8 pb-4">
                <section>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-slate-950">
                    Price range
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">Monthly starting price per seat</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {COWORKING_PRICE_RANGE_OPTIONS.map((row) => (
                      <FilterChip
                        key={row.key || "any"}
                        label={row.label}
                        active={draft.priceRange === row.key}
                        onClick={() => selectPriceRange(row.key)}
                      />
                    ))}
                  </div>
                  {(draft.minPrice || draft.maxPrice) ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                      {draft.minPrice && draft.maxPrice
                        ? `₹${Number(draft.minPrice).toLocaleString("en-IN")} – ₹${Number(draft.maxPrice).toLocaleString("en-IN")}`
                        : draft.maxPrice
                          ? `Up to ₹${Number(draft.maxPrice).toLocaleString("en-IN")}`
                          : `From ₹${Number(draft.minPrice).toLocaleString("en-IN")}`}
                    </p>
                  ) : null}
                </section>

                <section>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-slate-950">Sort by</h3>
                  <p className="mt-1 text-sm text-slate-500">Recommended order, or by price</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {COWORKING_SORT_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        active={sortValue === opt.value}
                        onClick={() => selectSort(opt.value)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200/70 bg-[#f9f8f5] p-4 sm:rounded-b-[1.75rem] sm:px-6 sm:py-5">
              <button
                type="button"
                disabled={pending}
                onClick={handleApply}
                className="flex h-12 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:opacity-60"
              >
                {pending ? "Updating…" : resultLabel}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
