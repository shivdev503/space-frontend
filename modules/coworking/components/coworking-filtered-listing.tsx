"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

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
import { PageNumbers } from "@/modules/city-pages/components/page-numbers";
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

function pageFromUrl(sp: URLSearchParams): number {
  const n = Number.parseInt(sp.get("page") ?? "", 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

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
  const [page, setPage] = useState(initialListing?.page ?? 1);
  const [seedMode, setSeedMode] = useState(false);
  const [seedPage, setSeedPage] = useState(1);
  const [loading, setLoading] = useState(needsRemote && !initialListing);
  /** Server page 1 is still valid until the URL's filters change. */
  const usingInitialRef = useRef(Boolean(initialListing));
  /** Set when this component changed the URL itself (page links): the rows are already loading. */
  const skipUrlFetchRef = useRef(false);
  const listTopRef = useRef<HTMLDivElement>(null);
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
    async (nextFilters: CoworkingListFilterState, pageNum: number) => {
      if (!catalogCityId) return;

      setError(null);
      setLoading(true);

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
          setRows(list);
        } else if (seedSpaces.length && pageNum === 1) {
          setSeedMode(true);
          setTotalRecords(seedFilteredRows.length);
          setPage(1);
          setSeedPage(1);
          setRows([]);
        } else {
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
          setSeedPage(1);
          setRows([]);
          setError(null);
        } else {
          setError("Could not load coworking spaces. Please try again.");
          setRows([]);
          setTotalRecords(0);
        }
      } finally {
        setLoading(false);
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
        setSeedPage(1);
      }
      return;
    }

    if (skipUrlFetchRef.current) {
      skipUrlFetchRef.current = false;
      return;
    }

    if (usingInitialRef.current) {
      usingInitialRef.current = false;
      if (initialListing?.query === coworkingListQueryKey(new URLSearchParams(searchParams.toString()))) {
        return;
      }
    }

    // Back/forward or a shared link: show the page the URL asks for.
    const urlPage = pageFromUrl(new URLSearchParams(searchParams.toString()));
    startTransition(() => {
      void fetchPage(parsed, urlPage);
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
    ? seedFilteredRows.slice((seedPage - 1) * PAGE_SIZE, seedPage * PAGE_SIZE)
    : rows;

  const resultCount = seedMode ? seedFilteredRows.length : totalRecords;
  const currentPage = seedMode ? seedPage : page;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const showGrid = !loading && !pending;

  /** Filters (and sort) carried on every page link. */
  const pageQuery = useMemo(
    () => Object.fromEntries(coworkingFiltersToSearchParams(filters).entries()),
    [filters],
  );

  const goToPage = useCallback(
    (target: number) => {
      listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (seedMode) {
        setSeedPage(target);
        return;
      }
      if (loading) return;
      const qs = coworkingFiltersToSearchParams(filters);
      if (target > 1) qs.set("page", String(target));
      skipUrlFetchRef.current = true;
      // A history entry per page (Back returns to the previous page) without a server round trip;
      // Next keeps useSearchParams in sync with pushState.
      window.history.pushState(null, "", qs.toString() ? `${listBasePath}?${qs}` : listBasePath);
      void fetchPage(filters, target);
    },
    [seedMode, loading, filters, listBasePath, fetchPage],
  );

  return (
    <div ref={listTopRef} className="scroll-mt-24 space-y-4 sm:space-y-6">
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
          <button type="button" onClick={() => void fetchPage(filters, page)} className="mt-2 font-semibold underline">
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
        <div>
          <SpaceGrid
            spaces={[]}
            coworkingWorkspaces={displayedRows}
            ctaLabel="View Details"
            variant="airbnb"
          />
          {/* Real links for crawlers; visitors stay on the page and the rows load in place. */}
          <PageNumbers
            page={currentPage}
            totalPages={totalPages}
            basePath={listBasePath}
            query={pageQuery}
            onNavigate={goToPage}
            disabled={loading}
          />
        </div>
      ) : null}
    </div>
  );
}
