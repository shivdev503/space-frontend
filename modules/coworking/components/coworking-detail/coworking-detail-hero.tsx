import { MapPin, Star } from "lucide-react";

import {
  workspaceAddress,
  workspaceRating,
} from "@/modules/coworking/components/coworking-detail-header";
import { toCompareItem } from "@/lib/coworking-compare";
import { CompareToggle } from "@/modules/compare/compare-toggle";
import { ShortlistHeart } from "@/modules/shortlist/shortlist-heart";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { toTitleCase } from "@/utils/format";

export function CoworkingDetailHero({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const micro = workspace.location?.micro_location?.name?.trim();
  const city = workspace.location?.city?.name?.trim();
  const landmark =
    workspace.location?.metro_detail?.name?.trim() ||
    (typeof workspace.location?.landmark === "string" ? workspace.location.landmark.trim() : "");
  const rating = workspaceRating(workspace);
  const locParts = [micro || workspaceAddress(workspace), city].filter(Boolean);
  const locLine = locParts.join(", ");

  return (
    <header className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pb-[22px]">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3 sm:block">
          <h1 className="min-w-0 text-[1.55rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[2.65rem]">
            {workspace.name}
          </h1>
          {rating > 0 ? (
            <div
              className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[1.35rem] font-extrabold tracking-[-0.03em] text-ink sm:hidden"
              aria-label={`Rating ${rating.toFixed(1)} out of 5`}
            >
              <Star className="h-[18px] w-[18px] fill-[#f2b01e] text-[#f2b01e]" aria-hidden />
              {rating.toFixed(1)}
            </div>
          ) : null}
        </div>
        <p className="mt-2.5 flex items-start gap-2 text-[14.5px] font-medium leading-snug text-muted sm:mt-3 sm:text-base">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-brand)]" aria-hidden />
          <span className="min-w-0">
            {locLine || `${toTitleCase(micro || "Location")}, ${toTitleCase(city || "City")}`}
            {landmark ? ` · Near ${landmark}` : null}
          </span>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <ShortlistHeart item={toCompareItem(workspace)} variant="button" />
          <CompareToggle item={toCompareItem(workspace)} variant="button" />
        </div>
      </div>

      {rating > 0 ? (
        <div className="hidden shrink-0 sm:flex sm:items-center sm:gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-[30px] font-extrabold tracking-[-0.03em] text-ink">
              <Star className="h-6 w-6 fill-[#f2b01e] text-[#f2b01e]" aria-hidden />
              {rating.toFixed(1)}
            </div>
            <p className="text-[13px] font-medium text-muted">Loved by India · Premium-rated</p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
