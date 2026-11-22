import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { Container } from "@/components/ui/container";
import type { Building } from "@/services/building-api";

/** "More in JMD Megapolis": on a listing page, a link to its building's page (2+ centres). */
export function InThisBuilding({ building }: { building: Building | null }) {
  if (!building) return null;
  const others = building.totalCentres - 1;
  return (
    <section id="building" className="border-t border-[#E7E9E6] pt-8 pb-5 sm:pt-11 sm:pb-6">
      <Container className="max-w-[1280px]">
        <Link
          href={`/building/${building.slug}`}
          prefetch={false}
          className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-[color:var(--color-brand)] hover:shadow-sm sm:px-6 sm:py-5"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand)]/10 text-[color:var(--color-brand)]">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-[1.15rem] font-bold tracking-[-0.02em] text-ink">
                More office space in {building.name}
              </span>
              <span className="mt-0.5 block text-[14.5px] text-muted">
                {others} more {others === 1 ? "centre" : "centres"} in this building
                {building.areaName ? ` · ${building.areaName}` : ""}
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[color:var(--color-brand)]">
            Compare all {building.totalCentres}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </Container>
    </section>
  );
}
