import Link from "next/link";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";

import { Container } from "@/components/ui/container";
import { loadCityDirectory } from "@/lib/city-directory";
import type { SpaceVertical } from "@/types";

const NOUN: Record<SpaceVertical, { one: string; many: string; listings: string }> = {
  coworking: { one: "space", many: "spaces", listings: "coworking spaces" },
  "virtual-office": { one: "provider", many: "providers", listings: "virtual office providers" },
  "office-space": { one: "office", many: "offices", listings: "managed offices" },
  coliving: { one: "PG", many: "PGs", listings: "PGs and coliving spaces" },
};

/** Collapse long listing lists behind a toggle; the links stay in the HTML either way. */
const OPEN_LISTINGS_UP_TO = 24;

type CityDirectorySectionProps = {
  vertical: SpaceVertical;
  citySlug: string;
  cityName: string;
};

/**
 * "Browse by area", "Top operators" and "All listings" for a city page: plain server-rendered links
 * to every area page and every listing not on one, so nothing under the city is more than two
 * clicks away from it.
 */
export async function CityDirectorySection({ vertical, citySlug, cityName }: CityDirectorySectionProps) {
  const dir = await loadCityDirectory(vertical, citySlug);
  if (!dir) return null;
  const noun = NOUN[vertical];
  const listingsHeading =
    dir.areas.length > 0 ? `More ${noun.listings} in ${cityName}` : `All ${noun.listings} in ${cityName}`;

  return (
    <section className="border-t border-slate-200/80 bg-slate-50/60 py-12 sm:py-16" aria-label={`Browse ${cityName}`}>
      <Container className="flex flex-col gap-12">
        {dir.areas.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Browse {noun.listings} by area in {cityName}
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dir.areas.map((area) => (
                <li key={area.href}>
                  <Link
                    href={area.href} prefetch={false}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span className="truncate">{area.name}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {area.count} {area.count === 1 ? noun.one : noun.many}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-900"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dir.buildings.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Popular office buildings in {cityName}
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dir.buildings.map((b) => (
                <li key={b.href}>
                  <Link
                    href={b.href}
                    prefetch={false}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span className="truncate">{b.name}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {b.count} centres{b.area ? ` · ${b.area}` : ""}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-900" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dir.brands.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Top coworking operators in {cityName}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {dir.brands.map((brand) => (
                <li key={brand.href}>
                  <Link
                    href={brand.href} prefetch={false}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Building2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    {brand.name}
                    <span className="text-xs text-muted">· {brand.count} centres</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dir.listings.length > 0 ? (
          <details className="group" open={dir.listings.length <= OPEN_LISTINGS_UP_TO}>
            <summary className="cursor-pointer list-none text-xl font-semibold tracking-tight text-ink sm:text-2xl [&::-webkit-details-marker]:hidden">
              <h2 className="inline">{listingsHeading}</h2>
              <span className="ml-2 align-middle text-sm font-normal text-muted">
                ({dir.listings.length})
                <span className="ml-2 text-[#12B886] group-open:hidden">Show all</span>
              </span>
            </summary>
            <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {dir.listings.map((listing) => (
                <li key={listing.href} className="min-w-0 truncate">
                  <Link href={listing.href} prefetch={false} className="text-slate-700 hover:text-ink hover:underline">
                    {listing.name}
                  </Link>
                  {listing.area ? <span className="text-muted">, {listing.area}</span> : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </Container>
    </section>
  );
}
