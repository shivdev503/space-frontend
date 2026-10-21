import { Building2, Landmark, MapPin, TrainFront } from "lucide-react";

import { buildMapsLink, normalizeMapCoordinates } from "@/lib/space-detail-map";
import { workspaceAddress } from "@/modules/coworking/components/coworking-detail-header";
import {
  CoworkingDetailBlock,
  CoworkingDetailEyebrow,
  CoworkingDetailSectionSub,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import { NEARBY_LANDMARKS_BY_CITY } from "@/modules/space-detail/nearby-landmarks";
import { SpaceDetailLeafletMap } from "@/modules/space-detail/components/space-detail-leaflet-map-dynamic";
import type { SpaceDetailLocationHighlight } from "@/modules/space-detail/components/space-detail-location-highlights";
import { SpaceDetailLocationHighlights } from "@/modules/space-detail/components/space-detail-location-highlights";
import { SpaceDetailNearbyStripDynamic } from "@/modules/space-detail/components/space-detail-nearby-strip-dynamic";
import { workspaceDescriptionText } from "@/lib/coworking-workspace-content";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { toTitleCase } from "@/utils/format";

import { workspaceCitySlugish } from "../coworking-detail-header";

function nearMetro(workspace: CoworkingModel.WorkSpace): boolean {
  if (workspace.location?.metro_detail?.is_near_metro) return true;
  const hay = [
    ...(workspace.amenties ?? []).map((a) => a.name),
    workspaceDescriptionText(workspace),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes("metro");
}

function buildConnectivityHighlights(
  workspace: CoworkingModel.WorkSpace,
  micro: string,
  city: string,
  citySlug: string,
): SpaceDetailLocationHighlight[] {
  const landmarks =
    NEARBY_LANDMARKS_BY_CITY[citySlug] ?? [toTitleCase(micro), toTitleCase(city), "Business District"];
  const metroNearby = nearMetro(workspace);

  return [
    {
      icon: MapPin,
      title: micro,
      sub: city ? `${toTitleCase(city)}, India` : "India",
    },
    ...(metroNearby
      ? [
          {
            icon: TrainFront,
            title: workspace.location?.metro_detail?.name || "Nearest metro connectivity",
            sub: landmarks[0] ? `Near ${landmarks[0]}` : "Quick metro access",
            tag: "Near Metro",
          },
        ]
      : []),
    {
      icon: Landmark,
      title: "Landmark",
      sub: landmarks[0] || toTitleCase(micro),
    },
    {
      icon: Building2,
      title: "Business hub",
      sub: "Surrounded by MNCs & startups",
    },
  ];
}

export function CoworkingDetailLocation({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const address = workspaceAddress(workspace);
  const micro = workspace.location?.micro_location?.name?.trim() || "Location";
  const city = workspace.location?.city?.name?.trim() || "";
  const coordinates = normalizeMapCoordinates(
    workspace.location?.latitude,
    workspace.location?.longitude,
  );
  const mapsLink = buildMapsLink(coordinates, address || `${micro}, ${city}`);
  const citySlug = workspaceCitySlugish(workspace);
  const highlightRows = buildConnectivityHighlights(workspace, micro, city, citySlug);
  const displayAddress = address || `${micro}, ${city}`;

  return (
    <CoworkingDetailBlock id="location">
      <CoworkingDetailEyebrow>Location &amp; connectivity</CoworkingDetailEyebrow>
      <CoworkingDetailSectionTitle>
        {toTitleCase(micro)}
        {city ? `, ${toTitleCase(city)}` : ""}
      </CoworkingDetailSectionTitle>
      <CoworkingDetailSectionSub className="mb-0">
        A prime micro-market with quick access to the metro, expressway and the city&apos;s commercial
        hubs.
      </CoworkingDetailSectionSub>

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
