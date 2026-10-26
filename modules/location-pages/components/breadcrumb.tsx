import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { localityTrail } from "@/lib/breadcrumb-trails";
import { SpaceVertical } from "@/types";
import { toTitleCase } from "@/utils/format";

type BreadcrumbProps = {
  vertical: SpaceVertical;
  citySlug: string;
  /** City display name; falls back to the title-cased slug. */
  cityName?: string;
  locationName: string;
};

export function Breadcrumb({ vertical, citySlug, cityName, locationName }: BreadcrumbProps) {
  return (
    <Breadcrumbs
      className="mb-5"
      items={localityTrail(vertical, { name: cityName || toTitleCase(citySlug), slug: citySlug }, locationName)}
    />
  );
}
