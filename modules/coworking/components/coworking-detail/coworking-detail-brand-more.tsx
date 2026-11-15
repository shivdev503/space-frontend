import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { CoworkingCard } from "@/modules/coworking/components/coworking-card";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

export type BrandMore = {
  brandName: string;
  brandSlug: string;
  cityName: string;
  citySlug: string;
  /** The brand's other centres in this city (the current one excluded). */
  inCity: CoworkingModel.WorkSpace[];
  /** All of the brand's centres, every city, including this one. */
  total: number;
  cityCount: number;
  /** False when the brand's list wasn't loaded in time: links still work, counts/cards are skipped. */
  known: boolean;
};

/** Brand page for this city, and a label with live counts when known. */
export function brandMoreLink(more: BrandMore): { href: string; label: string } {
  const href = `/brand/${more.brandSlug}?city=${encodeURIComponent(more.citySlug)}`;
  if (more.known && more.inCity.length) return { href, label: `All ${more.inCity.length + 1} ${more.brandName} centres in ${more.cityName}` };
  if (more.known && more.cityCount > 1) return { href: `/brand/${more.brandSlug}`, label: `All ${more.total} ${more.brandName} centres` };
  return { href, label: `Explore all ${more.brandName} centres` };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Explore more from {brand}": the operator's other centres in this city, and a link to all of them. */
export function CoworkingDetailBrandMore({ more }: { more: BrandMore | null }) {
  if (!more || !more.known || more.total < 2) return null;
  const { brandName, brandSlug, cityName, citySlug, inCity, total, cityCount } = more;
  const cityHref = `/brand/${brandSlug}?city=${encodeURIComponent(citySlug)}`;
  const allHref = `/brand/${brandSlug}`;
  const shown = inCity.slice(0, 8);

  return (
    <section id="brand-more" className="border-t border-[#E7E9E6] pt-8 pb-5 sm:pt-11 sm:pb-6">
      <Container className="max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[1.65rem] font-extrabold tracking-[-0.03em] text-ink sm:text-[1.7rem]">
              Explore more from {brandName}
            </h2>
            <p className="mt-2 max-w-[60ch] text-[15.5px] text-muted">
              {inCity.length
                ? `${plural(inCity.length + 1, "centre", "centres")} in ${cityName}`
                : `This is the only ${brandName} centre in ${cityName}`}
              {cityCount > 1 ? ` · ${plural(total, "centre", "centres")} across ${plural(cityCount, "city", "cities")}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {inCity.length ? (
              <Link
                href={cityHref}
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand)] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[color:var(--color-accent)]"
              >
                All {brandName} in {cityName}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
            {cityCount > 1 ? (
              <Link
                href={allHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[14px] font-semibold text-ink transition hover:border-[color:var(--color-brand)]"
              >
                All {plural(total, "centre", "centres")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        {shown.length ? (
          <div className="no-scrollbar mt-6 flex snap-x gap-4 overflow-x-auto pb-2 sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shown.map((ws) => (
              <div key={ws.id} className="w-[min(78vw,300px)] shrink-0 snap-start sm:w-[287px]">
                <CoworkingCard workspace={ws} className="h-full" />
              </div>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
