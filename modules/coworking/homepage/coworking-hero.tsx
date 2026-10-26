"use client";

import { useEffect, useMemo, useState } from "react";

import type { SearchOption } from "@/types";
import { CoworkingHeroSearch } from "@/modules/coworking/homepage/coworking-hero-search";
import { cn } from "@/utils/cn";

const TRUST_PILLS = [
  "1000+ coworking spaces",
  "Real pricing",
  "Zero brokerage",
  "Free expert consultation",
] as const;

const ROTATE_CITIES = ["Gurugram", "Delhi", "Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai"];

type CoworkingHeroProps = {
  cities: SearchOption[];
  className?: string;
};

export function CoworkingHero({ cities, className }: CoworkingHeroProps) {
  const cityLabels = useMemo(() => {
    const fromData = cities.map((c) => c.label).filter(Boolean);
    return fromData.length > 0 ? fromData : [...ROTATE_CITIES];
  }, [cities]);

  const [cityIndex, setCityIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (cityLabels.length <= 1) return;
    const id = window.setInterval(() => {
      setFade(false);
      window.setTimeout(() => {
        setCityIndex((i) => (i + 1) % cityLabels.length);
        setFade(true);
      }, 250);
    }, 3200);
    return () => window.clearInterval(id);
  }, [cityLabels.length]);

  const activeCity = cityLabels[cityIndex] ?? "Gurugram";

  return (
    <header
      className={cn(
        "relative overflow-hidden pb-16 pt-14 sm:pb-[104px] sm:pt-24",
        "bg-[radial-gradient(ellipse_70%_60%_at_78%_0%,var(--color-brand-soft)_0%,transparent_55%),radial-gradient(ellipse_60%_50%_at_10%_100%,rgba(76,175,80,0.06)_0%,transparent_60%),var(--color-page-bg)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 75% 70% at 50% 38%, #000 25%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 38%, #000 25%, transparent 72%)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-5 sm:px-10">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-[13px] font-medium text-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:mb-[26px] sm:py-2 sm:pl-2 sm:pr-4">
          <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[color:var(--color-brand)] text-[9px] text-white">
            ✦
          </span>
          India&apos;s verified workspace discovery platform
        </span>

        <h1 className="max-w-[880px] font-display text-[1.65rem] font-bold leading-[1.12] tracking-[-0.03em] min-[400px]:text-[1.85rem] sm:text-[clamp(2.25rem,5vw,4.875rem)] sm:leading-[1.05] sm:tracking-[-0.035em]">
          <span className="block text-ink sm:whitespace-nowrap">Find the Right Workspace</span>{" "}
          <span
            className={cn(
              "mt-0.5 block text-[color:var(--color-accent)] transition duration-250 sm:mt-0",
              fade ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            in {activeCity}
          </span>
        </h1>

        <p className="mt-6 max-w-[560px] text-base leading-relaxed text-muted sm:text-[19px]">
          1000+ coworking spaces. Real pricing. Zero brokerage. The destination for teams done with
          mediocre offices.
        </p>

        <div className="mt-8 sm:mt-10">
          <CoworkingHeroSearch cities={cities} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-6">
          {TRUST_PILLS.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-2 text-[13.5px] font-medium text-ink shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:pl-2 sm:pr-4"
            >
              <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[color:var(--color-brand)] text-[10px] text-white">
                ✓
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
