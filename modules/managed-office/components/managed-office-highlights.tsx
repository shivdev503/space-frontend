import { Building2, CalendarClock, Layers, Ruler, Tag, Users } from "lucide-react";

import { managedOfficeStartingPrice, seatTypeLabel } from "@/modules/managed-office/managed-office-format";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { formatCurrency } from "@/utils/format";

export function ManagedOfficeHighlights({ office }: { office: ManagedOfficeModel.ManagedOffice }) {
  const price = managedOfficeStartingPrice(office);
  const seatTypes = [...new Set((office.plans ?? []).map((p) => seatTypeLabel(p.seat_type)).filter(Boolean))];
  const building = office.building ?? {};
  const lease = office.lease_terms ?? {};

  const items = [
    { label: "Price per seat", value: price ? `${formatCurrency(price)} / month` : "On request", icon: Tag },
    { label: "Office type", value: seatTypes.join(", ") || "—", icon: Building2 },
    { label: "Minimum seats", value: lease.min_seats ? `${lease.min_seats} seats` : "—", icon: Users },
    {
      label: "Minimum lock-in",
      value: lease.min_duration_months ? `${lease.min_duration_months} months` : "—",
      icon: CalendarClock,
    },
    {
      label: "Super area",
      value: building.super_area ? `${building.super_area.toLocaleString("en-IN")} Sq. Ft.` : "—",
      icon: Ruler,
    },
    {
      label: "Total seats",
      value: building.total_seats ? building.total_seats.toLocaleString("en-IN") : "—",
      icon: Layers,
    },
  ];

  return (
    <section className="mt-6 rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-1 text-[0.98rem] font-semibold tracking-[-0.02em] text-ink">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
