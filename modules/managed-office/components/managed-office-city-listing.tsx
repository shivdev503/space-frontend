"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ManagedOfficeCard } from "@/modules/managed-office/components/managed-office-card";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import { managedOfficesByCity } from "@/services/managed-office-api";
import type { CityPageData } from "@/types";
import type { ManagedOfficeModel } from "@/types/managed-office.model";

const PAGE_SIZE = 24;

export function ManagedOfficeCityListing({ data }: { data: CityPageData }) {
  const initialOffices = data.initialManagedOffices;
  const [offices, setOffices] = useState<ManagedOfficeModel.ManagedOffice[] | null>(initialOffices ?? null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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
    setVisibleCount(PAGE_SIZE);
    let cancelled = false;

    managedOfficesByCity(data.catalogCityId!, 60)
      .then((rows) => {
        if (!cancelled && rows) setOffices(rows);
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

  const rows = offices ?? [];
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-muted">
        We are adding managed offices in {data.city.name} soon. Share your requirement below and our team will
        send you options.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {rows.slice(0, visibleCount).map((office) => (
          <ManagedOfficeCard key={office.id} office={office} />
        ))}
      </div>
      {rows.length > visibleCount ? (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="secondary" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Load More
          </Button>
        </div>
      ) : null}
    </>
  );
}
