import { CoworkingCard } from "@/modules/coworking/components/coworking-card";
import { VirtualOfficeCityListingCard } from "@/modules/virtual-office/components/virtual-office-city-listing-card";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { Space } from "@/types";

import { VerticalSpaceCard } from "./vertical-space-card";

type SpaceGridProps = {
  spaces: Space[];
  /** When provided (non-empty), renders coworking cards from wire workspaces and ignores `spaces` for coworking rows. */
  coworkingWorkspaces?: CoworkingModel.WorkSpace[] | null;
  /** Virtual-office city listing: horizontal cards from `/api/user/workSpaces?virtual=true`. */
  virtualOfficeWorkspaces?: CoworkingModel.WorkSpace[] | null;
  ctaLabel?: string;
  variant?: "default" | "airbnb";
};

export function SpaceGrid({
  spaces,
  coworkingWorkspaces,
  virtualOfficeWorkspaces,
  ctaLabel: _ctaLabel,
  variant = "default",
}: SpaceGridProps) {
  const useVirtualOffice = Boolean(virtualOfficeWorkspaces?.length);
  const useCoworkingWorkspaces = Boolean(coworkingWorkspaces?.length) && !useVirtualOffice;

  if (useVirtualOffice) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        {virtualOfficeWorkspaces!.map((ws) => (
          <VirtualOfficeCityListingCard key={ws.id || ws._id} workspace={ws} className="min-w-0" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        variant === "airbnb"
          ? "grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
          : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      }
    >
      {useCoworkingWorkspaces
        ? coworkingWorkspaces!.map((ws) => (
            <CoworkingCard key={ws.id || ws._id} workspace={ws} />
          ))
        : spaces.map((space) => <VerticalSpaceCard key={space.id} space={space} />)}
    </div>
  );
}
