import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { listingTrail } from "@/lib/breadcrumb-trails";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

export function CoworkingDetailBreadcrumb({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  return (
    <Breadcrumbs
      className="py-4 text-[13.5px] sm:py-5 sm:pb-[18px] sm:text-[13.5px]"
      items={listingTrail("coworking", {
        name: workspace.name,
        cityName: workspace.location?.city?.name,
        cityId: workspace.location?.city?.id,
        localityName: workspace.location?.micro_location?.name,
      })}
    />
  );
}
