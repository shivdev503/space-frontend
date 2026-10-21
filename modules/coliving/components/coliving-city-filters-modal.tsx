"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Car, IndianRupee, MapPin, Search, UtensilsCrossed, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  DEFAULT_PG_FILTERS,
  type PgFilterState,
} from "@/modules/coliving/components/coliving-listing-filters";
import { cn } from "@/utils/cn";

const PROPERTY_TYPES = ["Co-living", "PG", "Hostel"] as const;

const GUEST_OPTIONS = [
  { value: "", label: "Any" },
  { value: "Both", label: "All guests" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
] as const;

const SORT_OPTIONS = [
  { value: "added_on:-1", label: "Newest first" },
  { value: "rating:-1", label: "Top rated" },
  { value: "minMonthlyRent:1", label: "Price: low to high" },
  { value: "maxMonthlyRent:-1", label: "Price: high to low" },
  { value: "name:1", label: "Name (A–Z)" },
] as const;

const AMENITY_TOGGLES = [
  { key: "verified" as const, label: "Verified", icon: BadgeCheck },
  { key: "foodIncluded" as const, label: "Food included", icon: UtensilsCrossed },
  { key: "parking" as const, label: "Parking", icon: Car },
] as const;

type ColivingCityFiltersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PgFilterState;
  onApply: (next: PgFilterState) => void;
  onClear: () => void;
  totalCount: number;
  pending?: boolean;
  localitySuggestions?: string[];
};

function FilterChip({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
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
        className,
      )}
    >
      {label}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold tracking-[-0.02em] text-slate-950">{children}</h3>;
}

function SectionHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-slate-500">{children}</p>;
}

export function ColivingCityFiltersModal({
  open,
  onOpenChange,
  filters,
  onApply,
  onClear,
  totalCount,
  pending = false,
  localitySuggestions = [],
}: ColivingCityFiltersModalProps) {
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

  const patch = useCallback((partial: Partial<PgFilterState>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const sortValue = `${draft.sortBy}:${draft.orderBy}`;

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const handleClear = () => {
    const cleared = { ...DEFAULT_PG_FILTERS, city: filters.city };
    setDraft(cleared);
    onClear();
    onOpenChange(false);
  };

  const resultLabel =
    totalCount === 1 ? "Show 1 home" : `Show ${totalCount.toLocaleString("en-IN")} homes`;

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
          aria-labelledby="coliving-filters-title"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className={cn(
              "flex h-[100dvh] w-full flex-col bg-[#f9f8f5] shadow-[0_32px_80px_rgba(15,23,42,0.22)]",
              "sm:h-auto sm:max-h-[min(720px,92vh)] sm:max-w-[min(100%,34rem)] sm:rounded-[1.75rem] sm:border sm:border-slate-200/80",
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
              <h2 id="coliving-filters-title" className="flex-1 text-center text-lg font-semibold text-slate-950 sm:text-left">
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
                  <SectionTitle>Locality</SectionTitle>
                  <SectionHint>Neighbourhood or sector in the city</SectionHint>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] focus-within:border-[#4CAF50] focus-within:ring-4 focus-within:ring-[rgba(76,175,80,0.14)]">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      type="text"
                      value={draft.locality}
                      onChange={(e) => patch({ locality: e.target.value })}
                      placeholder="e.g. Sector 39, Koramangala"
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  {localitySuggestions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {localitySuggestions.slice(0, 10).map((name) => (
                        <FilterChip
                          key={name}
                          label={name}
                          active={draft.locality.toLowerCase() === name.toLowerCase()}
                          onClick={() =>
                            patch({
                              locality: draft.locality.toLowerCase() === name.toLowerCase() ? "" : name,
                            })
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                </section>

                <section>
                  <SectionTitle>Monthly rent</SectionTitle>
                  <SectionHint>Set a minimum and maximum budget per month</SectionHint>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Min
                      </span>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-[#4CAF50] focus-within:ring-4 focus-within:ring-[rgba(76,175,80,0.14)]">
                        <IndianRupee className="h-4 w-4 shrink-0 text-slate-400" />
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={draft.minPrice}
                          onChange={(e) => patch({ minPrice: e.target.value })}
                          placeholder="5,000"
                          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Max
                      </span>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-[#4CAF50] focus-within:ring-4 focus-within:ring-[rgba(76,175,80,0.14)]">
                        <IndianRupee className="h-4 w-4 shrink-0 text-slate-400" />
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={draft.maxPrice}
                          onChange={(e) => patch({ maxPrice: e.target.value })}
                          placeholder="20,000"
                          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
                        />
                      </div>
                    </label>
                  </div>
                </section>

                <section>
                  <SectionTitle>Property type</SectionTitle>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <FilterChip
                        key={type}
                        label={type}
                        active={draft.type === type}
                        onClick={() => patch({ type: draft.type === type ? "" : type })}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle>Amenities</SectionTitle>
                  <div className="mt-4 space-y-2">
                    {AMENITY_TOGGLES.map(({ key, label, icon: Icon }) => {
                      const active = draft[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => patch({ [key]: !active })}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition",
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-900 hover:border-slate-300",
                          )}
                        >
                          <span className="inline-flex items-center gap-3">
                            <Icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-500")} />
                            <span className="text-sm font-semibold">{label}</span>
                          </span>
                          <span
                            className={cn(
                              "h-5 w-9 rounded-full p-0.5 transition",
                              active ? "bg-white/25" : "bg-slate-200",
                            )}
                          >
                            <span
                              className={cn(
                                "block h-4 w-4 rounded-full bg-white shadow transition",
                                active ? "translate-x-4" : "translate-x-0",
                              )}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <SectionTitle>Preferred guests</SectionTitle>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {GUEST_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value || "any"}
                        label={opt.label}
                        active={draft.preferredGuest === opt.value}
                        onClick={() => patch({ preferredGuest: opt.value })}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle>Search by name</SectionTitle>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] focus-within:border-[#4CAF50] focus-within:ring-4 focus-within:ring-[rgba(76,175,80,0.14)]">
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      type="search"
                      value={draft.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      placeholder="PG or coliving name"
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle>Sort by</SectionTitle>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        active={sortValue === opt.value}
                        onClick={() => {
                          const [sortBy, orderBy] = opt.value.split(":");
                          patch({ sortBy, orderBy: orderBy as "1" | "-1" });
                        }}
                        className="text-[0.82rem]"
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <footer className="sticky bottom-0 shrink-0 border-t border-slate-200/70 bg-[#f9f8f5]/95 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-[1.75rem] sm:px-6 sm:py-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="hidden flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:inline-flex"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={pending}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[color:var(--color-brand)] py-3.5 text-sm font-semibold text-white shadow-[0_14px_38px_rgba(18,184,134,0.30)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)] hover:shadow-[0_18px_48px_rgba(11,59,46,0.30)] active:translate-y-0 disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
                >
                  {pending ? "Loading…" : resultLabel}
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
