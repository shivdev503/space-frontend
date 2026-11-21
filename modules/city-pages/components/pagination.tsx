"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { PageNumbers } from "@/modules/city-pages/components/page-numbers";
import { SpaceGrid } from "@/modules/spaces/components/space-grid";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { Space } from "@/types";

type PaginationProps = {
  spaces: Space[];
  /** Coworking listing: wire workspaces for {@link CoworkingCard}; when set, pagination applies to this list. */
  coworkingWorkspaces?: CoworkingModel.WorkSpace[] | null;
  /** Virtual-office city listing: wire workspaces from `workSpaces?virtual=true`. */
  virtualOfficeWorkspaces?: CoworkingModel.WorkSpace[] | null;
  ctaLabel?: string;
  cardVariant?: "default" | "airbnb";
};

export function Pagination({
  spaces,
  coworkingWorkspaces,
  virtualOfficeWorkspaces,
  ctaLabel,
  cardVariant = "default",
}: PaginationProps) {
  const pageSize = 24;
  const [page, setPage] = useState(1);
  const pathname = usePathname();
  const topRef = useRef<HTMLDivElement>(null);

  const useVirtualOffice = Boolean(virtualOfficeWorkspaces?.length);
  const useCoworkingWorkspaces = Boolean(coworkingWorkspaces?.length) && !useVirtualOffice;
  const totalCount = useVirtualOffice
    ? virtualOfficeWorkspaces!.length
    : useCoworkingWorkspaces
      ? coworkingWorkspaces!.length
      : spaces.length;

  if (totalCount === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          No matches
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink">
          No spaces match these filters right now
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted">
          Try a wider budget or remove one filter to see more results.
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const end = current * pageSize;
  const visibleVirtualOffice = useVirtualOffice ? virtualOfficeWorkspaces!.slice(start, end) : null;
  const visibleCoworking = useCoworkingWorkspaces ? coworkingWorkspaces!.slice(start, end) : null;
  const visibleSpaces = spaces.slice(start, end);

  return (
    <div ref={topRef} className="scroll-mt-24">
      <SpaceGrid
        spaces={useCoworkingWorkspaces || useVirtualOffice ? [] : visibleSpaces}
        coworkingWorkspaces={visibleCoworking}
        virtualOfficeWorkspaces={visibleVirtualOffice}
        ctaLabel={ctaLabel}
        variant={cardVariant}
      />
      <PageNumbers
        page={current}
        totalPages={totalPages}
        basePath={pathname}
        onNavigate={(target) => {
          setPage(target);
          topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </div>
  );
}
