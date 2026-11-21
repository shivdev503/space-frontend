"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { PageNumbers } from "@/modules/city-pages/components/page-numbers";
import { ColivingCityFiltersModal } from "@/modules/coliving/components/coliving-city-filters-modal";
import { ColivingCityListingToolbar } from "@/modules/coliving/components/coliving-city-listing-toolbar";
import { buildPgColivingCityPageParams } from "@/lib/pg-list-priority";
import { pgListingReactKey } from "@/lib/pg-slug";
import { ColivingListingCard } from "@/modules/coliving/components/coliving-listing-card";
import {
  countActivePgFilters,
  DEFAULT_PG_FILTERS,
  filtersToParams,
  filtersToSearchParams,
  parseFiltersFromSearchParams,
  type PgFilterState,
} from "@/modules/coliving/components/coliving-listing-filters";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import { fetchPgList } from "@/services/pg-api";
import type { PgDetail } from "@/types/pg.model";
import type { CityPageData } from "@/types";

const PAGE_SIZE = 20;

type ColivingCityListingProps = {
  data: CityPageData;
  initialItems: PgDetail[];
  initialTotal: number;
  initialPage: number;
};

export function ColivingCityListing({
  data,
  initialItems,
  initialTotal,
  initialPage,
}: ColivingCityListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityName = data.city.name;

  const [filters, setFilters] = useState<PgFilterState>(() => {
    const parsed = parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString()));
    return { ...parsed, city: cityName };
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const localitySuggestions = useMemo(
    () => data.popularLocations.map((loc) => loc.name).filter(Boolean),
    [data.popularLocations],
  );

  const activeFilterCount = useMemo(
    () => countActivePgFilters(filters, { excludeCity: true, excludeSort: true }),
    [filters],
  );

  /** `history`: "replace" for filter changes, "push" for page links (Back returns to the last page), "none" when the URL already changed. */
  const load = useCallback(
    (nextFilters: PgFilterState, nextPage: number, history: "replace" | "push" | "none" = "replace") => {
      startTransition(async () => {
        setError(null);
        try {
          const res = await fetchPgList(
            buildPgColivingCityPageParams(
              data.catalogCityId,
              cityName,
              filtersToParams({ ...nextFilters, city: cityName }, nextPage, PAGE_SIZE),
            ),
          );
          setItems(res.data);
          setTotal(res.totalRecords);
          setPage(nextPage);
          const qs = filtersToSearchParams({ ...nextFilters, city: cityName }, nextPage);
          const base = `/coliving/${data.city.slug}`;
          const href = qs.toString() ? `${base}?${qs}` : base;
          if (history === "replace") router.replace(href, { scroll: false });
          // pushState: a history entry without a server round trip (Next keeps useSearchParams in sync).
          else if (history === "push") window.history.pushState(null, "", href);
        } catch {
          setError("Could not load listings. Please try again.");
        }
      });
    },
    [cityName, data.catalogCityId, data.city.slug, router],
  );

  const pageRef = useRef(page);
  pageRef.current = page;
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    const parsed = { ...parseFiltersFromSearchParams(sp), city: cityName };
    setFilters(parsed);
    // Back/forward between pages: show the page the URL now asks for.
    const urlPage = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
    if (urlPage !== pageRef.current) load(parsed, urlPage, "none");
  }, [searchParams, cityName, load]);

  const applyFilters = useCallback(
    (nextFilters: PgFilterState) => {
      const withCity = { ...nextFilters, city: cityName };
      setFilters(withCity);
      load(withCity, 1);
    },
    [cityName, load],
  );

  const clearFilters = useCallback(() => {
    const cleared = { ...DEFAULT_PG_FILTERS, city: cityName };
    applyFilters(cleared);
  }, [applyFilters, cityName]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const listTopRef = useRef<HTMLDivElement>(null);
  const pageQuery = useMemo(() => {
    const qs = filtersToSearchParams(filters, 1);
    qs.delete("city"); // The path already carries the city.
    qs.delete("page");
    return Object.fromEntries(qs.entries());
  }, [filters]);
  const goToPage = (target: number) => {
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!pending) {
      setPage(target); // So the URL change below is not read as Back/forward.
      pageRef.current = target;
      load(filters, target, "push");
    }
  };

  return (
    <div ref={listTopRef} className="scroll-mt-24 space-y-6">
      <ColivingCityListingToolbar
        filters={filters}
        activeFilterCount={activeFilterCount}
        total={total}
        cityName={cityName}
        pending={pending}
        onOpenFilters={() => setFiltersOpen(true)}
        onSortChange={(sortBy, orderBy) => applyFilters({ ...filters, sortBy, orderBy })}
        onClearFilters={clearFilters}
      />

      <ColivingCityFiltersModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={applyFilters}
        onClear={clearFilters}
        totalCount={total}
        pending={pending}
        localitySuggestions={localitySuggestions}
      />

      {error ? (
        <div className="rounded-2xl border border-red-200/80 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p>{error}</p>
          <button type="button" onClick={() => load(filters, page)} className="mt-2 font-semibold underline">
            Retry
          </button>
        </div>
      ) : null}

      {pending && !items.length ? <SpaceGridSkeleton count={8} /> : null}

      {!pending && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-ink">No PGs found in {cityName}</p>
          <p className="mt-2 text-sm text-muted">Try adjusting filters or check back soon.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-sm font-medium text-[color:var(--color-brand)] underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={`grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${pending ? "opacity-60" : ""}`}>
          {items.map((pg, index) => (
            <ColivingListingCard key={pgListingReactKey(pg, index)} pg={pg} priority={index === 0} />
          ))}
        </div>
      )}

      <PageNumbers
        page={page}
        totalPages={totalPages}
        basePath={`/coliving/${data.city.slug}`}
        query={pageQuery}
        onNavigate={goToPage}
        disabled={pending}
      />
    </div>
  );
}
