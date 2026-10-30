import { CalendarClock, Clock, IndianRupee, TrainFront, Users, type LucideIcon } from "lucide-react";

import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { formatCurrency, toTitleCase } from "@/utils/format";

import { managedOfficeLocality, managedOfficeStartingPrice } from "../../managed-office-format";
import {
  managedOfficeHoursSummary,
  managedOfficeLockIn,
  managedOfficeMetro,
  managedOfficeMinSeats,
  managedOfficeSeatTypes,
} from "./managed-office-detail-facts";

type Item = { icon: LucideIcon; title: string; sub: string };

/** Four headline facts, in the same card grid as the coworking highlights. */
export function ManagedOfficeDetailHighlights({ office }: { office: ManagedOfficeModel.ManagedOffice }) {
  const price = managedOfficeStartingPrice(office);
  const minSeats = managedOfficeMinSeats(office);
  const totalSeats = office.building?.total_seats ?? office.no_of_seats ?? 0;
  const lockIn = managedOfficeLockIn(office);
  const seatTypes = managedOfficeSeatTypes(office);
  const metro = managedOfficeMetro(office);
  const hours = managedOfficeHoursSummary(office);
  const locality = managedOfficeLocality(office);

  const candidates: (Item | false)[] = [
    price != null && { icon: IndianRupee, title: `${formatCurrency(price)} / seat`, sub: seatTypes[0] ? `${seatTypes[0]} · per month` : "Per month" },
    (minSeats > 0 || totalSeats > 0) && {
      icon: Users,
      title: minSeats > 0 ? `From ${minSeats} seats` : `${totalSeats} seats`,
      sub: totalSeats > 0 && minSeats > 0 ? `Up to ${totalSeats} seats` : "Private office for your team",
    },
    lockIn !== "" && { icon: CalendarClock, title: `${lockIn} lock-in`, sub: "Minimum agreement term" },
    metro
      ? { icon: TrainFront, title: "Near Metro", sub: metro.name }
      : hours !== ""
        ? { icon: Clock, title: "Office hours", sub: hours.split(" · ")[0] }
        : locality !== "" && { icon: TrainFront, title: "Prime location", sub: toTitleCase(locality) },
  ];
  const items = candidates.filter(Boolean) as Item[];
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="rounded-[14px] border border-[#E7E9E6] bg-white p-3.5 transition hover:border-[color:var(--color-brand)] hover:shadow-[0_1px_2px_rgba(20,24,29,0.04),0_2px_8px_rgba(20,24,29,0.04)] sm:p-4"
          >
            <div className="mb-3 grid h-9 w-9 place-items-center rounded-[10px] bg-[#EDF7EE] text-[#2f8035] sm:h-[38px] sm:w-[38px]">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <p className="text-[14px] font-bold text-ink sm:text-[14.5px]">{item.title}</p>
            <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted sm:text-[13px]">{item.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
