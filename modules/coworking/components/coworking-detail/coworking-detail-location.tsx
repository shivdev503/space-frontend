import { Bus, CarTaxiFront, MapPin, Ship, TrainFront, TramFront } from "lucide-react";

import { coworkingMetro } from "@/lib/metro-station";
import { buildMapsLink, normalizeMapCoordinates } from "@/lib/space-detail-map";
import { workspaceAddress } from "@/modules/coworking/components/coworking-detail-header";
import {
  CoworkingDetailBlock,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import { SpaceDetailLeafletMap } from "@/modules/space-detail/components/space-detail-leaflet-map-dynamic";
import type { SpaceDetailLocationHighlight } from "@/modules/space-detail/components/space-detail-location-highlights";
import { SpaceDetailLocationHighlights } from "@/modules/space-detail/components/space-detail-location-highlights";
import { SpaceDetailNearbyStripDynamic } from "@/modules/space-detail/components/space-detail-nearby-strip-dynamic";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { displayCityName, toTitleCase } from "@/utils/format";


type LocationLike = CoworkingModel.Location & Record<string, unknown>;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

/** "0.15" → "0.15 km"; values that already carry a unit ("500 m", "2 km walk") are kept. */
function distanceLabel(v: unknown): string {
  const d = text(v);
  if (!d) return "";
  return /^\d+(\.\d+)?$/.test(d) ? `${d} km` : d;
}

/** Transport saved on the listing: [flag, name field, distance field]. Only rows with a name are shown. */
const TRANSPORT = [
  { flag: "is_bus_stop", name: "bus_stop_landmark", distance: "bus_stop_distance", label: "Bus stop", icon: Bus },
  { flag: "is_taxi_stand", name: "taxi_stand_landmark", distance: "taxi_stand_distance", label: "Taxi stand", icon: CarTaxiFront },
  { flag: "is_tram", name: "tram_landmark", distance: "tram_distance", label: "Tram stop", icon: TramFront },
  { flag: "is_ferry_stop", name: "ferry_stop_landmark", distance: "ferry_stop_distance", label: "Ferry stop", icon: Ship },
] as const;

function buildConnectivityHighlights(
  workspace: CoworkingModel.WorkSpace,
  micro: string,
  city: string,
): SpaceDetailLocationHighlight[] {
  const loc = (workspace.location ?? {}) as LocationLike;
  const rows: SpaceDetailLocationHighlight[] = [
    { icon: MapPin, title: toTitleCase(micro), sub: city ? `${city}, India` : "India" },
  ];
  const metro = coworkingMetro(loc);
  if (metro) {
    const dist = distanceLabel(metro.distance);
    rows.push({ icon: TrainFront, title: metro.name, sub: dist ? `Metro station · ${dist} away` : "Metro station" });
  }
  for (const t of TRANSPORT) {
    const name = text(loc[t.name]);
    if (!loc[t.flag] || !name) continue;
    const dist = distanceLabel(loc[t.distance]);
    rows.push({ icon: t.icon, title: name, sub: dist ? `${t.label} · ${dist} away` : t.label });
  }
  return rows;
}

export function CoworkingDetailLocation({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const address = workspaceAddress(workspace);
  // Area names like "MG Road Gurugram" repeat the city that follows them in the heading.
  const micro =
    (workspace.location?.micro_location?.name?.trim() || "").replace(/\s+(gurugram|gurgaon)$/i, "").trim() ||
    "Location";
  const city = displayCityName(workspace.location?.city?.name);
  const coordinates = normalizeMapCoordinates(
    workspace.location?.latitude,
    workspace.location?.longitude,
  );
  const mapsLink = buildMapsLink(coordinates, address || `${micro}, ${city}`);
  const highlightRows = buildConnectivityHighlights(workspace, micro, city);
  const displayAddress = address || `${micro}, ${city}`;

  return (
    <CoworkingDetailBlock id="location">
      <CoworkingDetailSectionTitle>
        {toTitleCase(micro)}
        {city ? `, ${city}` : ""}
      </CoworkingDetailSectionTitle>

      {displayAddress ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{displayAddress}</p>
      ) : null}

      <SpaceDetailLeafletMap
        className="mt-6"
        name={workspace.name}
        locality={micro}
        city={city}
        address={displayAddress}
        coordinates={coordinates}
        mapsLink={mapsLink}
        showAttribution={false}
        shellClassName="relative min-h-[260px] w-full overflow-hidden rounded-2xl border border-[#E7E9E6] bg-[#ebe6dc] shadow-[0_1px_2px_rgba(20,24,29,0.04),0_2px_8px_rgba(20,24,29,0.04)] sm:min-h-[330px]"
      />

      <SpaceDetailLocationHighlights rows={highlightRows} className="mt-4 lg:mt-5" />

      <SpaceDetailNearbyStripDynamic
        coordinates={coordinates}
        address={displayAddress}
        locality={micro}
        city={city}
      />
    </CoworkingDetailBlock>
  );
}
