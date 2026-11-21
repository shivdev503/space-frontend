"use client";

import { useEffect, useMemo, useState } from "react";

import { VirtualOfficeCityListingCard } from "@/modules/virtual-office/components/virtual-office-city-listing-card";
import { PageNumbers } from "@/modules/city-pages/components/page-numbers";
import { VoBand, VoHeading, VoKicker, VoLead } from "@/modules/virtual-office/components/city-page/vo-city-design";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import { coworkingWorkspacesListForCity } from "@/services/coworking-api";
import { mapSeedSpaceToCoworkingWorkspace } from "@/services/coworking-workspace-mapper";
import type { CityPageData } from "@/types";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

/** Same page size as the server (`?page=N`) when the client has to fetch the list itself. */
const PAGE_SIZE = 12;
const FETCH_LIMIT = 36;

export function VoCityListingsSection({ data, cityDisplay }: { data: CityPageData; cityDisplay: string }) {
  const serverListing = data.initialVirtualOfficeListing;
  const [fromApi, setFromApi] = useState<CoworkingModel.WorkSpace[] | null>(null);
  // Server-loaded page (in the HTML for crawlers) skips the client fetch.
  const needsRemote = Boolean(data.catalogCityId) && !serverListing;
  const [loading, setLoading] = useState(needsRemote);
  const [localPage, setLocalPage] = useState(1);

  useEffect(() => {
    if (!needsRemote) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFromApi(null);
    let cancelled = false;
    coworkingWorkspacesListForCity(data.catalogCityId!, FETCH_LIMIT, undefined, true)
      .then((rows) => {
        if (!cancelled && rows) setFromApi(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [needsRemote, data.catalogCityId]);

  const workspaces = useMemo((): CoworkingModel.WorkSpace[] => {
    if (serverListing) return serverListing.rows;
    if (fromApi?.length) return fromApi;
    const catalogId = data.catalogCityId ?? data.city.id;
    if (data.spaces.length && catalogId) {
      return data.spaces.map((s) => mapSeedSpaceToCoworkingWorkspace(s, catalogId));
    }
    return [];
  }, [serverListing, data.catalogCityId, data.city.id, data.spaces, fromApi]);

  // Server pages: one `?page=N` URL per page. Client fallback: page through what was fetched.
  const page = serverListing ? serverListing.page : localPage;
  const totalPages = Math.max(
    1,
    Math.ceil((serverListing ? serverListing.totalRecords : workspaces.length) / PAGE_SIZE),
  );
  const shown = serverListing ? workspaces : workspaces.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <VoBand id="vo-listings">
      <VoKicker>Featured listings</VoKicker>
      <VoHeading>Verified Providers in {cityDisplay}</VoHeading>
      <VoLead>Compare real listings. Real pricing. Zero brokerage.</VoLead>

      {loading ? (
        <div className="mt-10">
          <SpaceGridSkeleton count={PAGE_SIZE} />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="mt-10 rounded-[20px] border border-dashed border-[#DCE7E2] bg-white p-10 text-center">
          <p className="text-[15px] text-muted">
            No virtual office listings in {cityDisplay} right now. Check back soon.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
            {shown.map((ws) => (
              <VirtualOfficeCityListingCard key={ws.id || ws._id} workspace={ws} className="min-w-0" />
            ))}
          </div>
          <PageNumbers
            page={page}
            totalPages={totalPages}
            basePath={`/virtual-office/${data.city.slug}`}
            anchor="vo-listings"
            onNavigate={
              serverListing
                ? undefined
                : (target) => {
                    setLocalPage(target);
                    document.getElementById("vo-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
            }
          />
        </>
      )}
    </VoBand>
  );
}
