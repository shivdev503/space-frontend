"use client";

import { useEffect, useMemo, useState } from "react";

import { VirtualOfficeCityListingCard } from "@/modules/virtual-office/components/virtual-office-city-listing-card";
import { VoBand, VoHeading, VoKicker, VoLead, VoOutlineButton } from "@/modules/virtual-office/components/city-page/vo-city-design";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import { coworkingWorkspacesListForCity } from "@/services/coworking-api";
import { mapSeedSpaceToCoworkingWorkspace } from "@/services/coworking-workspace-mapper";
import type { CityPageData } from "@/types";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

const PAGE_SIZE = 6;
const FETCH_LIMIT = 36;

export function VoCityListingsSection({ data, cityDisplay }: { data: CityPageData; cityDisplay: string }) {
  const [fromApi, setFromApi] = useState<CoworkingModel.WorkSpace[] | null>(null);
  const needsRemote = Boolean(data.catalogCityId);
  const [loading, setLoading] = useState(needsRemote);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
    if (fromApi?.length) return fromApi;
    const catalogId = data.catalogCityId ?? data.city.id;
    if (data.spaces.length && catalogId) {
      return data.spaces.map((s) => mapSeedSpaceToCoworkingWorkspace(s, catalogId));
    }
    return [];
  }, [data.catalogCityId, data.city.id, data.spaces, fromApi]);

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
            {workspaces.slice(0, visibleCount).map((ws) => (
              <VirtualOfficeCityListingCard key={ws.id || ws._id} workspace={ws} className="min-w-0" />
            ))}
          </div>
          {visibleCount < workspaces.length ? (
            <div className="mt-8 flex justify-center">
              <VoOutlineButton onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="px-8 py-3.5">
                Load More Providers
              </VoOutlineButton>
            </div>
          ) : null}
        </>
      )}
    </VoBand>
  );
}
