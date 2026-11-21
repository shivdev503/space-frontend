"use client";

import { useEffect, useState } from "react";

import { PageNumbers } from "@/modules/city-pages/components/page-numbers";
import { ManagedOfficeCard } from "@/modules/managed-office/components/managed-office-card";
import { MANAGED_OFFICE_PAGE_SIZE as PAGE_SIZE } from "@/modules/managed-office/managed-office-format";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import { managedOfficesByCity } from "@/services/managed-office-api";
import type { CityPageData } from "@/types";
import type { ManagedOfficeModel } from "@/types/managed-office.model";

export function ManagedOfficeCityListing({ data }: { data: CityPageData }) {
  const initialOffices = data.initialManagedOffices;
  const [offices, setOffices] = useState<ManagedOfficeModel.ManagedOffice[] | null>(initialOffices ?? null);
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

  // Paged on the server (`?page=N`): each page is its own URL with its own HTML.
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, data.listingPage ?? 1), totalPages);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((office, index) => (
          <ManagedOfficeCard key={office.id} office={office} priority={index === 0} />
        ))}
      </div>
      <PageNumbers page={page} totalPages={totalPages} basePath={`/managed-office/${data.city.slug}`} />
    </>
  );
}
