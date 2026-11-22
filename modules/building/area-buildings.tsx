import Link from "next/link";
import { Building2 } from "lucide-react";

import { Container } from "@/components/ui/container";
import { routeCitySlug } from "@/lib/breadcrumb-trails";
import { loadBuildingsOrEmpty } from "@/services/building-api";
import { slugifyMicroLocationName } from "@/services/location-api";

/** "Office buildings in Sector 62": links to building pages in this area (coworking & managed office area pages). */
export async function AreaBuildings({ citySlug, areaSlug, areaName }: { citySlug: string; areaSlug: string; areaName: string }) {
  const buildings = (await loadBuildingsOrEmpty())
    .filter(
      (b) =>
        routeCitySlug(b.cityName, b.cityId) === citySlug &&
        b.areaName &&
        slugifyMicroLocationName(b.areaName) === areaSlug,
    )
    .sort((a, b) => b.totalCentres - a.totalCentres || a.name.localeCompare(b.name));
  if (!buildings.length) return null;

  return (
    <section className="pb-14 sm:pb-20">
      <Container>
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Office buildings in {areaName}</h2>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/building/${b.slug}`}
                prefetch={false}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <Building2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{b.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">{b.totalCentres} centres</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
