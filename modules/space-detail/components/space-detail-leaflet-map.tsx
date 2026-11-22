"use client";

import Link from "next/link";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  buildGeocodeQuery,
  cityMapCenter,
  geocodeAddress,
  type MapCoordinates,
} from "@/lib/space-detail-map";
import { cn } from "@/utils/cn";

import "leaflet/dist/leaflet.css";

const MARKER_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type SpaceDetailLeafletMapProps = {
  name: string;
  locality: string;
  city: string;
  address: string;
  coordinates?: MapCoordinates | null;
  mapsLink: string;
  className?: string;
  shellClassName?: string;
  showAttribution?: boolean;
  showOverlayCard?: boolean;
};

export function SpaceDetailLeafletMap({
  name,
  locality,
  city,
  address,
  coordinates,
  mapsLink,
  className,
  shellClassName,
  showAttribution = true,
  showOverlayCard = true,
}: SpaceDetailLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveCenter(): Promise<MapCoordinates> {
      if (coordinates?.lat != null && coordinates?.lng != null) {
        return coordinates;
      }
      const geocoded = await geocodeAddress(buildGeocodeQuery(address, locality, city));
      if (geocoded) return geocoded;
      return cityMapCenter(city);
    }

    async function initMap() {
      const el = containerRef.current;
      if (!el || mapRef.current) return;

      const center = await resolveCenter();
      if (cancelled || !containerRef.current) return;

      const map = L.map(el, {
        center: [center.lat, center.lng],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Without a saved pin the map only shows the neighbourhood: a marker would claim an exact address.
      if (coordinates) {
        const marker = L.marker([center.lat, center.lng], { icon: MARKER_ICON }).addTo(map);
        marker.bindPopup(`<strong>${escapeHtml(name)}</strong><br/>${escapeHtml(locality)}, ${escapeHtml(city)}`);
        markerRef.current = marker;
      }

      mapRef.current = map;
      setReady(true);

      requestAnimationFrame(() => map.invalidateSize());
    }

    void initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [address, city, coordinates, locality, name]);

  return (
    <div className={className}>
      <div
        className={cn(
          "relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-[#ebe6dc] sm:h-72",
          shellClassName,
        )}
      >
        <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" aria-label={`Map showing ${name}`} />

        {!ready ? (
          <div className="absolute inset-0 z-[1] animate-pulse bg-[#ebe6dc]" aria-hidden />
        ) : null}

        {showOverlayCard && coordinates ? (
          <div className="pointer-events-none absolute left-1/2 top-[42%] z-[2] w-[min(16rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-full">
            <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-brand)] text-white">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{name}</p>
                  <p className="truncate text-xs text-muted">
                    {locality}, {city}
                  </p>
                </span>
              </div>
            </div>
            <span
              className="mx-auto mt-0 block h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-white"
              aria-hidden
            />
          </div>
        ) : null}

        <Link
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 z-[3] inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-ink shadow-sm transition hover:bg-[#f9f8f5] lg:bottom-4 lg:left-auto lg:right-4"
        >
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Open in Maps
        </Link>
      </div>

      {showAttribution ? (
        <p className="mt-2 text-[0.65rem] text-muted">
          Map data &copy;{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-300 underline-offset-2"
          >
            OpenStreetMap
          </a>
        </p>
      ) : null}
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
