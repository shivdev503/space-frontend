import { Building2, Clock, Layers, Maximize2, Users } from "lucide-react";
import type { ComponentType } from "react";

import {
  CoworkingDetailBlock,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const SHORT: Record<(typeof DAYS)[number], string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

/** "09:00 AM" → "9 AM", "09:30 PM" → "9:30 PM". */
function cleanTime(t: string): string {
  const m = /^\s*0?(\d{1,2}):(\d{2})\s*([AP]M)\s*$/i.exec(t || "");
  if (!m) return (t || "").trim();
  return `${m[1]}${m[2] === "00" ? "" : `:${m[2]}`} ${m[3].toUpperCase()}`;
}

/**
 * Opening hours as short lines, consecutive days with the same times grouped:
 * ["Mon–Sat: 9 AM – 9 PM", "Sun: Closed"]. Empty when the space has no usable hours.
 */
export function openingHoursLines(hours: CoworkingModel.WorkSpace["hours_of_operation"] | undefined): string[] {
  if (!hours) return [];
  // Older admin saves put the weekday hours on Monday only and leave Tue–Fri empty/closed.
  const empty = (d: (typeof DAYS)[number]) => {
    const h = hours[d];
    return !h || (!h.from && !h.to && !h.is_open_24);
  };
  const mondayOnly = !empty("monday") && (["tuesday", "wednesday", "thursday", "friday"] as const).every(empty);
  const slot = (d: (typeof DAYS)[number]) =>
    mondayOnly && ["tuesday", "wednesday", "thursday", "friday"].includes(d) ? hours.monday : hours[d];

  const label = DAYS.map((d) => {
    const h = slot(d);
    if (!h || h.is_closed || (!h.should_show && !h.from && !h.is_open_24)) return "Closed";
    if (h.is_open_24) return "Open 24 hours";
    const from = cleanTime(h.from);
    const to = cleanTime(h.to);
    return from && to ? `${from} – ${to}` : "";
  });
  // Nothing open, or an open day without times: don't show half-filled hours.
  if (label.every((l) => l === "Closed") || label.some((l) => l === "")) return [];

  const lines: string[] = [];
  let start = 0;
  for (let i = 1; i <= DAYS.length; i += 1) {
    if (i === DAYS.length || label[i] !== label[start]) {
      const days = i - 1 === start ? SHORT[DAYS[start]] : `${SHORT[DAYS[start]]}–${SHORT[DAYS[i - 1]]}`;
      lines.push(`${days}: ${label[start]}`);
      start = i;
    }
  }
  return lines;
}

type Fact = { icon: ComponentType<{ className?: string }>; label: string; value: string | string[] };

/** Building, floor, size, seats and opening hours — only the ones the space has. */
export function CoworkingDetailFacts({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const loc = workspace.location;
  const building = typeof loc?.name1 === "string" ? loc.name1.trim() : "";
  const floor = loc?.floor !== undefined && loc?.floor !== null ? String(loc.floor).trim() : "";
  const area = Number(workspace.area_sqft) || 0;
  const seats = Number(workspace.no_of_seats) || 0;
  const hours = openingHoursLines(workspace.hours_of_operation);

  const facts: Fact[] = [];
  if (building) facts.push({ icon: Building2, label: "Building", value: building });
  if (floor && floor !== "0") facts.push({ icon: Layers, label: "Floor", value: floor });
  if (area > 0) facts.push({ icon: Maximize2, label: "Centre size", value: `${area.toLocaleString("en-IN")} sq ft` });
  if (seats > 0) facts.push({ icon: Users, label: "Seats", value: `${seats.toLocaleString("en-IN")}` });
  if (hours.length) facts.push({ icon: Clock, label: "Opening hours", value: hours });
  if (!facts.length) return null;

  return (
    <CoworkingDetailBlock id="details">
      <CoworkingDetailSectionTitle className="mb-5">About this centre</CoworkingDetailSectionTitle>
      <dl className="grid gap-3 sm:grid-cols-2">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 rounded-[14px] border border-[#E7E9E6] bg-white p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#EDF7EE] text-[#2f8035]">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <div className="min-w-0">
              <dt className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</dt>
              {Array.isArray(value) ? (
                value.map((line) => (
                  <dd key={line} className="mt-0.5 text-[15px] font-semibold text-ink">
                    {line}
                  </dd>
                ))
              ) : (
                <dd className="mt-0.5 text-[15px] font-semibold text-ink">{value}</dd>
              )}
            </div>
          </div>
        ))}
      </dl>
    </CoworkingDetailBlock>
  );
}
