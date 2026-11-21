"use client";

import { pgListingReactKey } from "@/lib/pg-slug";
import { ColivingListingCard } from "@/modules/coliving/components/coliving-listing-card";
import { SpaceGridSkeleton } from "@/modules/spaces/components/space-grid-skeleton";
import type { PgDetail } from "@/types/pg.model";

type ColivingLocationListingProps = {
  items: PgDetail[];
  locality: string;
  city: string;
  loading?: boolean;
};

export function ColivingLocationListing({
  items,
  locality,
  city,
  loading,
}: ColivingLocationListingProps) {
  if (loading) {
    return <SpaceGridSkeleton count={6} />;
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white px-6 py-14 text-center">
        <p className="text-lg font-semibold text-ink">No PGs found in {locality}</p>
        <p className="mt-2 text-sm text-muted">
          Try browsing all listings in {city} or adjust your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((pg, index) => (
        <ColivingListingCard key={pgListingReactKey(pg, index)} pg={pg} priority={index === 0} />
      ))}
    </div>
  );
}
