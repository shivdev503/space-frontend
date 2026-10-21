import { Armchair, Clock, TrainFront, Users } from "lucide-react";

import {
  filterCoworkingPlansForStartingPrice,
} from "@/services/workspace-plan-pricing";
import { workspaceDescriptionText } from "@/lib/coworking-workspace-content";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

function highlightItems(workspace: CoworkingModel.WorkSpace) {
  const planCount = filterCoworkingPlansForStartingPrice(workspace.plans ?? []).length;
  const amenities = (workspace.amenties ?? []).map((a) => a.name.toLowerCase()).join(" ");
  const hours = workspace.hours_of_operation ?? {};
  const open24 = Object.values(hours).some((h) => h?.is_open_24);
  const nearMetro =
    workspace.location?.metro_detail?.is_near_metro ||
    amenities.includes("metro") ||
    workspaceDescriptionText(workspace).toLowerCase().includes("metro");

  return [
    {
      icon: Armchair,
      title: `${planCount || workspace.plans?.length || "Multiple"} Plan Types`,
      sub: "Desks to private cabins",
    },
    {
      icon: Clock,
      title: open24 ? "24×7 Access" : "Flexible Hours",
      sub: open24 ? "Power backup included" : "Book when you need",
    },
    {
      icon: TrainFront,
      title: nearMetro ? "Near Metro" : "Prime Location",
      sub: nearMetro
        ? workspace.location?.metro_detail?.name ||
          (typeof workspace.location?.landmark === "string" && workspace.location.landmark) ||
          "Quick connectivity"
        : workspace.location?.micro_location?.name || "Business district",
    },
    {
      icon: Users,
      title: "Move-in Ready",
      sub: "Fully furnished",
    },
  ];
}

export function CoworkingDetailHighlights({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const items = highlightItems(workspace);

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
            <p className="mt-0.5 text-[12.5px] text-muted sm:text-[13px]">{item.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
