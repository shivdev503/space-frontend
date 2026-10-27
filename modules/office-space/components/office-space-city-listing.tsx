"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { OfficeSpaceCard } from "@/modules/office-space/components/office-space-card";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import { officeSpacesAsSpaces } from "@/services/office-space-api";
import type { OfficeSpaceModel } from "@/types/office-space.model";
import type { CityPageData } from "@/types";

export function OfficeSpaceCityListing({ data }: { data: CityPageData }) {
  const initialOffices = data.initialOfficeSpaces;
  const [offices, setOffices] = useState<OfficeSpaceModel.OfficeSpace[] | null>(initialOffices ?? null);
  const [visibleCount, setVisibleCount] = useState(24);
  // Server-loaded offices (in the HTML for crawlers) skip the client fetch.
  const needsRemote = Boolean(data.catalogCityId) && !initialOffices;
  const [loading, setLoading] = useState(needsRemote);

  useEffect(() => {
    if (!needsRemote) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setOffices(null);
    setVisibleCount(24);
    let cancelled = false;

    officeSpacesAsSpaces(data.catalogCityId!, 36)
      .then((rows) => {
        if (cancelled || rows === null) return;
        setOffices(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [needsRemote, data.catalogCityId]);

  if (loading) {
    return <SpaceGridSkeleton count={8} />;
  }

  return (
    <>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(offices ?? []).slice(0, visibleCount).map((office) => (
          <OfficeSpaceCard key={office.id || office._id} office={office} />
        ))}
      </div>
      {(offices ?? []).length > visibleCount ? (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="secondary" onClick={() => setVisibleCount((c) => c + 24)}>
            Load More
          </Button>
        </div>
      ) : null}
    </>
  );
}
