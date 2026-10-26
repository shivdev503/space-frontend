import Link from "next/link";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Container } from "@/components/ui/container";
import { RemoteImage } from "@/components/ui/remote-image";
import { CoworkingCard } from "@/modules/coworking/components/coworking-card";
import type { BrandPageData } from "@/services/brand-api";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { cn } from "@/utils/cn";

type BrandPageProps = {
  data: BrandPageData;
  workspaces: CoworkingModel.WorkSpace[];
  activeCity?: string;
};

export function BrandPage({ data, workspaces, activeCity }: BrandPageProps) {
  const { brand, cities } = data;
  const total = data.workspaces.length;
  const active = cities.find((c) => c.slug === activeCity);
  const basePath = `/brand/${brand.slug}`;

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-6 sm:pb-10 sm:pt-12">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(48,88,215,0.12),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#ffffff_92%)]" />
        <Container>
          <Breadcrumbs
            separator="›"
            className="sm:text-sm"
            items={[
              { name: "Home", href: "/" },
              { name: "Coworking", href: "/coworking" },
              { name: brand.name },
            ]}
          />

          <div className="mt-4 flex items-center gap-6 sm:mt-6">
            {/* Logo only where it sits beside the heading; on phones it pushed the title down. */}
            {brand.logo ? (
              <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft sm:block">
                <RemoteImage src={brand.logo} alt={`${brand.name} logo`} fill sizes="96px" className="object-contain p-2" />
              </div>
            ) : null}
            <div className="min-w-0">
              <h1 className="font-display text-[1.75rem] leading-[1.1] tracking-[-0.04em] text-ink sm:text-5xl">
                {brand.name} Coworking Spaces{active ? ` in ${active.name}` : ""}
              </h1>
              {brand.tagLine ? <p className="mt-2 text-base text-muted sm:text-lg">{brand.tagLine}</p> : null}
              <p className="mt-3 text-sm font-semibold text-ink">
                {total} {total === 1 ? "centre" : "centres"} in {cities.length}{" "}
                {cities.length === 1 ? "city" : "cities"}
              </p>
            </div>
          </div>

          {cities.length > 1 ? (
            <div
              className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
              aria-label={`${brand.name} centres by city`}
            >
              <CityChip href={basePath} active={!active} label="All cities" count={total} />
              {/* Selected city first, so it is visible in the mobile scroll row. */}
              {[...cities].sort((a, b) => Number(b.slug === active?.slug) - Number(a.slug === active?.slug)).map((city) => (
                <CityChip
                  key={city.slug}
                  href={`${basePath}?city=${encodeURIComponent(city.slug)}`}
                  active={active?.slug === city.slug}
                  label={city.name}
                  count={city.count}
                />
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          {workspaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {workspaces.map((ws) => (
                <CoworkingCard key={ws.id || ws._id} workspace={ws} className="h-full" />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-muted">
              No {brand.name} centres in this city yet.{" "}
              <Link href={basePath} className="font-semibold text-[color:var(--color-brand)] hover:underline">
                See all {brand.name} centres
              </Link>
            </p>
          )}
        </Container>
      </section>
    </>
  );
}

function CityChip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white"
          : "border-slate-200 bg-white text-ink hover:border-[color:var(--color-brand)]",
      )}
    >
      {label}
      <span className={cn("text-xs", active ? "text-white/80" : "text-muted")}>{count}</span>
    </Link>
  );
}
