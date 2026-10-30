import { MapPin, Sparkles, Star, TrainFront } from "lucide-react";

import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { toTitleCase } from "@/utils/format";

import { managedOfficePlace } from "../../managed-office-format";
import { managedOfficeMetro, managedOfficeTitle } from "./managed-office-detail-facts";

function ratingSource(source?: string): string {
  const s = source?.trim().toLowerCase();
  if (!s) return "";
  return s === "google" ? "Google" : toTitleCase(s);
}

/** Same layout as the coworking detail hero: title, place line, rating on the right. */
export function ManagedOfficeDetailHero({ office }: { office: ManagedOfficeModel.ManagedOffice }) {
  const place = managedOfficePlace(office);
  const building = office.location?.building_name?.replace(/\s+/g, " ").trim();
  const rating = office.rating?.average && office.rating.average > 0 ? office.rating.average : 0;
  const reviews = office.rating?.total ?? 0;
  const source = ratingSource(office.rating?.source);
  const metro = managedOfficeMetro(office);
  const reviewLine = reviews > 0 ? `${reviews} ${source ? `${source} ` : ""}review${reviews === 1 ? "" : "s"}` : "";

  return (
    <header className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pb-[22px]">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3 sm:block">
          <h1 className="min-w-0 text-[1.55rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[2.65rem]">
            {managedOfficeTitle(office)}
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
            {[building, place].filter(Boolean).join(", ") || "India"}
            {metro ? ` · Near ${metro.name}` : null}
          </span>
        </p>
        {office.is_new_launch || metro ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {office.is_new_launch ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(76,175,80,0.25)] bg-[#EDF7EE] px-3 py-1 text-[12.5px] font-semibold text-[#2f8035]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                New launch
              </span>
            ) : null}
            {metro ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E9E6] bg-white px-3 py-1 text-[12.5px] font-semibold text-ink">
                <TrainFront className="h-3.5 w-3.5 text-[color:var(--color-brand)]" aria-hidden />
                {metro.distance ? `${metro.distance} from ${metro.name}` : metro.name}
              </span>
            ) : null}
          </div>
        ) : null}
        {rating > 0 && reviewLine ? <p className="mt-2 text-[13px] text-muted sm:hidden">{reviewLine}</p> : null}
      </div>

      {rating > 0 ? (
        <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
          <div className="flex items-center gap-2 text-[30px] font-extrabold tracking-[-0.03em] text-ink">
            <Star className="h-6 w-6 fill-[#f2b01e] text-[#f2b01e]" aria-hidden />
            {rating.toFixed(1)}
          </div>
          {reviewLine ? <p className="text-[13px] font-medium text-muted">{reviewLine}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
