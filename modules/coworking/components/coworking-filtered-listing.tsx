"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  applyCoworkingListFiltersClient,
  COWORKING_LIST_PAGE_SIZE,
  countActiveCoworkingListFilters,
  coworkingFiltersToApiParams,
  coworkingFiltersToSearchParams,
  coworkingListQueryKey,
  DEFAULT_COWORKING_LIST_FILTERS,
  parseCoworkingListFiltersFromSearchParams,
  type CoworkingListFilterState,
} from "@/lib/coworking-list-filters";
import { PopularLocalitiesRail } from "@/modules/city-pages/components/popular-localities-rail";
import { CoworkingFiltersModal } from "@/modules/coworking/components/coworking-filters-modal";
import { CoworkingListingToolbar } from "@/modules/coworking/components/coworking-listing-toolbar";
import { SpaceGrid } from "@/modules/spaces/components/space-grid";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import { loadCoworkingWorkspacesPageForCity } from "@/services/coworking-api";
import { mapSeedSpaceToCoworkingWorkspace } from "@/services/coworking-workspace-mapper";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { InitialCoworkingListing, Space } from "@/types";

const PAGE_SIZE = COWORKING_LIST_PAGE_SIZE;

type CoworkingFilteredListingProps = {
  listBasePath: string;
  catalogCityId: string;
  locationLabel: string;
  microLocationId?: string;
  seedSpaces?: Space[];
  /** Page 1 rendered on the server — shown immediately and in the HTML for crawlers. */
  initialListing?: InitialCoworkingListing;
  showPopularLocalities?: boolean;
  popularLocalities?: {
    catalogCityId: string;
    citySlug: string;
    fallbackLocations: { name: string; slug: string }[];
  };
};

function resolveTotalRecords(
  meta: CoworkingModel.WorkSpacesListResponse["meta"],
  loadedCount: number,
  pageSize: number,
): number {
  const fromMeta = meta?.totalRecords ?? meta?.total;
  if (typeof fromMeta === "number" && Number.isFinite(fromMeta)) return fromMeta;
  return loadedCount >= pageSize ? loadedCount + pageSize : loadedCount;
}

export function CoworkingFilteredListing({
  listBasePath,
  catalogCityId,
  locationLabel,
  microLocationId,
  seedSpaces = [],
  initialListing,
  showPopularLocalities = false,
  popularLocalities,
}: CoworkingFilteredListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const needsRemote = Boolean(catalogCityId);

  const [filters, setFilters] = useState<CoworkingListFilterState>(() =>
    parseCoworkingListFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rows, setRows] = useState<CoworkingModel.WorkSpace[]>(initialListing?.rows ?? []);
  const [totalRecords, setTotalRecords] = useState(initialListing?.totalRecords ?? 0);
  const [page, setPage] = useState(1);
  const [seedMode, setSeedMode] = useState(false);
  const [seedVisibleCount, setSeedVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(needsRemote && !initialListing);
  /** Server page 1 is still valid until the URL's filters change. */
  const usingInitialRef = useRef(Boolean(initialListing));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeFilterCount = useMemo(
    () => countActiveCoworkingListFilters(filters),
    [filters],
  );

  const seedFilteredRows = useMemo(() => {
    if (!catalogCityId || !seedSpaces.length) return [];
    const seeded = seedSpaces.map((s) => mapSeedSpaceToCoworkingWorkspace(s, catalogCityId));
    return applyCoworkingListFiltersClient(seeded, filters) as CoworkingModel.WorkSpace[];
  }, [catalogCityId, seedSpaces, filters]);

  const fetchPage = useCallback(
    async (nextFilters: CoworkingListFilterState, pageNum: number, append: boolean) => {
      if (!catalogCityId) return;

      setError(null);
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const includeSortInRequest = searchParams.has("sortBy");
        const apiFilters = coworkingFiltersToApiParams(nextFilters, { includeSortInRequest });
        const payload = await loadCoworkingWorkspacesPageForCity(
          catalogCityId,
          PAGE_SIZE,
          pageNum,
          microLocationId,
          false,
          apiFilters,
        );

        let list = payload.data ?? [];
        if (list.length) {
          list = applyCoworkingListFiltersClient(list, nextFilters) as CoworkingModel.WorkSpace[];
          const total = resolveTotalRecords(payload.meta, list.length, PAGE_SIZE);
          setSeedMode(false);
          setTotalRecords(total);
          setPage(pageNum);
          setRows((prev) => (append ? [...prev, ...list] : list));
        } else if (seedSpaces.length && pageNum === 1) {
          setSeedMode(true);
          setTotalRecords(seedFilteredRows.length);
          setPage(1);
          setSeedVisibleCount(PAGE_SIZE);
          setRows([]);
        } else if (!append) {
          setSeedMode(false);
          setTotalRecords(0);
          setPage(1);
          setRows([]);
        }
      } catch {
        if (seedSpaces.length && pageNum === 1) {
          setSeedMode(true);
          setTotalRecords(seedFilteredRows.length);
          setPage(1);
          setSeedVisibleCount(PAGE_SIZE);
          setRows([]);
          setError(null);
        } else {
          setError("Could not load coworking spaces. Please try again.");
          if (!append) {
            setRows([]);
            setTotalRecords(0);
          }
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [catalogCityId, microLocationId, searchParams, seedSpaces.length, seedFilteredRows.length],
  );

  useEffect(() => {
    const parsed = parseCoworkingListFiltersFromSearchParams(
      new URLSearchParams(searchParams.toString()),
    );
    setFilters(parsed);

    if (!needsRemote) {
      setLoading(false);
      setSeedMode(true);
      if (seedSpaces.length && catalogCityId) {
        const seeded = seedSpaces.map((s) => mapSeedSpaceToCoworkingWorkspace(s, catalogCityId));
        const filtered = applyCoworkingListFiltersClient(seeded, parsed) as CoworkingModel.WorkSpace[];
        setTotalRecords(filtered.length);
        setSeedVisibleCount(PAGE_SIZE);
      }
      return;
    }

    if (usingInitialRef.current) {
      usingInitialRef.current = false;
      if (initialListing?.query === coworkingListQueryKey(new URLSearchParams(searchParams.toString()))) {
        return;
      }
    }

    startTransition(() => {
      void fetchPage(parsed, 1, false);
    });
  }, [searchParams, needsRemote, catalogCityId, microLocationId, fetchPage, seedSpaces, initialListing]);

  useEffect(() => {
    if (!seedMode || !needsRemote) return;
    setTotalRecords(seedFilteredRows.length);
  }, [seedMode, needsRemote, seedFilteredRows.length]);

  const applyFilters = useCallback(
    (next: CoworkingListFilterState) => {
      setFilters(next);
      const qs = coworkingFiltersToSearchParams(next);
      const href = qs.toString() ? `${listBasePath}?${qs}` : listBasePath;
      router.replace(href, { scroll: false });
    },
    [listBasePath, router],
  );

  const clearFilters = useCallback(() => {
    applyFilters({ ...DEFAULT_COWORKING_LIST_FILTERS });
  }, [applyFilters]);

  const displayedRows = seedMode
    ? seedFilteredRows.slice(0, seedVisibleCount)
    : rows;

  const resultCount = seedMode ? seedFilteredRows.length : totalRecords;
  const hasMore = seedMode
    ? seedVisibleCount < seedFilteredRows.length
    : rows.length < totalRecords;
  const showGrid = !loading && !pending;
  const gridPending = loadingMore;

  const handleLoadMore = useCallback(() => {
    if (seedMode) {
      setSeedVisibleCount((current) => current + PAGE_SIZE);
      return;
    }
    if (loading || loadingMore || !hasMore) return;
    void fetchPage(filters, page + 1, true);
  }, [seedMode, loading, loadingMore, hasMore, fetchPage, filters, page]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {showPopularLocalities && popularLocalities ? (
        <PopularLocalitiesRail
          catalogCityId={popularLocalities.catalogCityId}
          citySlug={popularLocalities.citySlug}
          fallbackLocations={popularLocalities.fallbackLocations}
        />
      ) : null}

      <CoworkingListingToolbar
        filters={filters}
        activeFilterCount={activeFilterCount}
        resultCount={resultCount}
        locationLabel={locationLabel}
        pending={loading || pending}
        onOpenFilters={() => setFiltersOpen(true)}
        onSortChange={(sortBy, orderBy) => applyFilters({ ...filters, sortBy, orderBy })}
        onClearFilters={clearFilters}
      />

      <CoworkingFiltersModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={applyFilters}
        onClear={clearFilters}
        resultCount={resultCount}
        pending={loading || pending}
      />

      {error ? (
        <div className="rounded-2xl border border-red-200/80 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p>{error}</p>
          <button type="button" onClick={() => void fetchPage(filters, 1, false)} className="mt-2 font-semibold underline">
            Retry
          </button>
        </div>
      ) : null}

      {loading || pending ? <SpaceGridSkeleton count={8} /> : null}

      {showGrid && displayedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-ink">No coworking spaces match your filters</p>
          <p className="mt-2 text-sm text-muted">Try a wider price range or change the sort order.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-sm font-medium text-[color:var(--color-brand)] underline"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {showGrid && displayedRows.length > 0 ? (
        <div className={gridPending ? "opacity-60 transition-opacity" : undefined}>
          <SpaceGrid
            spaces={[]}
            coworkingWorkspaces={displayedRows}
            ctaLabel="View Details"
            variant="airbnb"
          />
          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                disabled={loadingMore}
                onClick={handleLoadMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
