import {
  CoworkingDetailBlock,
  CoworkingDetailEyebrow,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { cn } from "@/utils/cn";
import { toTitleCase } from "@/utils/format";

import { managedOfficeCityName, managedOfficeHours, managedOfficeLocality } from "../../managed-office-format";
import {
  managedOfficeLockIn,
  managedOfficeMetro,
  managedOfficeMinSeats,
  managedOfficeSeatTypes,
} from "./managed-office-detail-facts";

const CENTRE_TYPE: Record<string, string> = { managed_office: "Managed office", coworking: "Coworking centre" };

function ordinalFloor(n: number): string {
  if (n === 0) return "Ground floor";
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix} floor`;
}

/** Every listing field in one list (rows without data are left out), plus floors and opening hours. */
export function ManagedOfficeDetailSpecs({ office }: { office: ManagedOfficeModel.ManagedOffice }) {
  const building = office.building;
  const metro = managedOfficeMetro(office);
  const minSeats = managedOfficeMinSeats(office);
  const address =
    office.location?.address1?.replace(/\s+/g, " ").trim() ||
    [office.location?.building_name, managedOfficeLocality(office), managedOfficeCityName(office)].filter(Boolean).join(", ");

  const rows = (
    [
      ["Operator", office.brand?.name?.trim() ?? ""],
      ["Building", office.location?.building_name?.replace(/\s+/g, " ").trim() ?? ""],
      ["Centre type", office.centre_type ? CENTRE_TYPE[office.centre_type] ?? toTitleCase(office.centre_type) : ""],
      ["Office type", managedOfficeSeatTypes(office).join(", ")],
      ["Minimum seats", minSeats > 0 ? `${minSeats} seats` : ""],
      ["Minimum lock-in", managedOfficeLockIn(office)],
      ["Total seats", building?.total_seats ? `${building.total_seats} seats` : office.no_of_seats ? `${office.no_of_seats} seats` : ""],
      ["Floors in building", building?.total_floors ? String(building.total_floors) : ""],
      ["Super area", building?.super_area ? `${building.super_area.toLocaleString("en-IN")} sq.ft` : ""],
      ["Nearest metro", metro ? (metro.distance ? `${metro.name} (${metro.distance})` : metro.name) : ""],
      ["Address", address],
    ] as [string, string][]
  ).filter(([, value]) => value);

  const floors = (building?.floors ?? []).filter((f) => f.floor_number != null && (f.area || f.seats));
  const hours = managedOfficeHours(office);

  if (rows.length < 3 && !floors.length && !hours.length) return null;

  return (
    <CoworkingDetailBlock id="details">
      <CoworkingDetailEyebrow>Office details</CoworkingDetailEyebrow>
      <CoworkingDetailSectionTitle>Everything about this office</CoworkingDetailSectionTitle>

      {rows.length ? (
        // 1px gaps over a grey background draw the dividers between cells.
        <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[#E7E9E6] bg-[#EEF0ED] sm:grid-cols-2">
          {rows.map(([label, value], i) => (
            <div
              key={label}
              className={cn(
                "flex flex-col gap-0.5 bg-white px-4 py-3.5 sm:px-5",
                rows.length % 2 === 1 && i === rows.length - 1 && "sm:col-span-2",
              )}
            >
              <dt className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</dt>
              <dd className="text-[15px] font-semibold leading-snug text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {floors.length ? (
        <div className="mt-6">
          <h3 className="text-[17px] font-bold text-ink">Available floors</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {floors.map((floor) => (
              <div key={floor.floor_number} className="rounded-xl border border-[#E7E9E6] bg-white px-4 py-3.5">
                <p className="text-[15px] font-bold text-ink">{ordinalFloor(floor.floor_number ?? 0)}</p>
                <p className="mt-0.5 text-[13.5px] text-muted">
                  {[floor.area ? `${floor.area.toLocaleString("en-IN")} sq.ft` : "", floor.seats ? `${floor.seats} seats` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hours.length ? (
        <div className="mt-6">
          <h3 className="text-[17px] font-bold text-ink">Opening hours</h3>
          <ul className="mt-3 overflow-hidden rounded-2xl border border-[#E7E9E6] bg-white">
            {hours.map((row) => (
              <li
                key={row.day}
                className="flex items-center justify-between gap-4 border-b border-[#EEF0ED] px-4 py-2.5 text-[14.5px] last:border-b-0 sm:px-5"
              >
                <span className="font-semibold text-ink">{row.day}</span>
                <span className={cn("text-right", row.value === "Closed" ? "text-muted" : "text-ink/85")}>{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </CoworkingDetailBlock>
  );
}
