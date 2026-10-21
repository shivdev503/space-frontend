import Link from "next/link";

import { SpaceVertical } from "@/types";
import { toTitleCase } from "@/utils/format";
import { verticalPath } from "@/lib/vertical-path";

type BreadcrumbProps = {
  vertical: SpaceVertical;
  citySlug: string;
  locationName: string;
};

const verticalLabelMap: Record<SpaceVertical, string> = {
  coworking: "Coworking",
  "virtual-office": "Virtual Office",
  "office-space": "Managed Office",
  coliving: "Coliving Space",
};

export function Breadcrumb({ vertical, citySlug, locationName }: BreadcrumbProps) {
  return (
    <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Link href="/" className="hover:text-ink">
        Home
      </Link>
      <span>/</span>
      <Link href={`/${verticalPath(vertical)}`} className="hover:text-ink">
        {verticalLabelMap[vertical]}
      </Link>
      <span>/</span>
      <Link href={`/${verticalPath(vertical)}/${citySlug}`} className="hover:text-ink">
        {toTitleCase(citySlug)}
      </Link>
      <span>/</span>
      <span className="text-ink">{locationName}</span>
    </nav>
  );
}
