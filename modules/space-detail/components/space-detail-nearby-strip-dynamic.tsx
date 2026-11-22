"use client";

import { useEffect, useState } from "react";

import {
  buildGeocodeQuery,
  geocodeAddress,
  type MapCoordinates,
} from "@/lib/space-detail-map";
import { fetchNearbyPlacesFromOverpass } from "@/lib/pg-nearby";
import type { PgNearbyPlace } from "@/types/pg.model";
import { SpaceDetailNearbyStrip } from "@/modules/space-detail/components/space-detail-nearby-strip";

type SpaceDetailNearbyStripDynamicProps = {
  nearbyPlaces?: PgNearbyPlace[];
  coordinates?: MapCoordinates | null;
  address?: string;
  locality?: string;
  city?: string;
  className?: string;
};

function NearbySkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`mt-4 flex gap-3 overflow-x-auto pb-1 max-lg:-mx-4 max-lg:px-4 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 ${className ?? ""}`}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="min-w-[10.5rem] shrink-0 animate-pulse rounded-xl border border-slate-200/80 bg-white px-4 py-3 lg:min-w-0"
          aria-hidden
        >
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function SpaceDetailNearbyStripDynamic({
  nearbyPlaces,
  coordinates,
  address = "",
  locality = "",
  city = "",
  className,
}: SpaceDetailNearbyStripDynamicProps) {
  const [items, setItems] = useState<PgNearbyPlace[] | null>(nearbyPlaces?.length ? nearbyPlaces : null);
  const [loading, setLoading] = useState(!nearbyPlaces?.length);

  useEffect(() => {
    if (nearbyPlaces?.length) {
      setItems(nearbyPlaces);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function resolveNearby() {
      setLoading(true);

      let center: MapCoordinates | null = coordinates ?? null;
      if (!center) {
        center = await geocodeAddress(buildGeocodeQuery(address, locality, city));
      }

      if (!center) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      const fetched = await fetchNearbyPlacesFromOverpass(center);
      if (!cancelled) {
        setItems(fetched);
        setLoading(false);
      }
    }

    void resolveNearby();
    return () => {
      cancelled = true;
    };
  }, [nearbyPlaces, coordinates, address, locality, city]);

  if (loading) return <NearbySkeleton className={className} />;
  if (!items?.length) return null;

  return <SpaceDetailNearbyStrip items={items} className={className} />;
}
