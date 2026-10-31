"use client";

import Image from "next/image";
import Link from "next/link";

import type { Brand } from "@/types";
import { cn } from "@/utils/cn";

type TrustedBrandsMarqueeProps = {
  brands: Brand[];
  className?: string;
};

function BrandLogoCard({ brand }: { brand: Brand }) {
  const inner = (
    <div className="relative h-14 w-[10.5rem] sm:h-[4.85rem] sm:w-[11.5rem] md:h-[5.5rem] md:w-[12.75rem]">
      {brand.image ? (
        <Image
          src={brand.image}
          alt={brand.name}
          fill
          className="object-contain object-center"
          sizes="(max-width: 640px) 168px, 208px"
        />
      ) : (
        <span className="sr-only">{brand.name}</span>
      )}
    </div>
  );

  const wrapperClass = "flex shrink-0 items-center justify-center";

  if (brand.url) {
    return (
      <Link
        href={brand.url}
        className={wrapperClass}
        aria-label={`${brand.name} — ${brand.category}`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={wrapperClass}>{inner}</div>;
}

function BrandRow({ brands, "aria-hidden": ariaHidden }: { brands: Brand[]; "aria-hidden"?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 pr-8 sm:gap-8 sm:pr-8 md:gap-10 md:pr-10"
      aria-hidden={ariaHidden}
    >
      {brands.map((brand) => (
        <BrandLogoCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}

export function TrustedBrandsMarquee({ brands, className }: TrustedBrandsMarqueeProps) {
  if (!brands.length) return null;

  return (
    <div
      className={cn(
        "trusted-brands-marquee overflow-hidden border-y border-slate-200/90 bg-page py-7 sm:py-10",
        className,
      )}
    >
      <div className="trusted-brands-marquee-track">
        <BrandRow brands={brands} />
        <BrandRow brands={brands} aria-hidden />
      </div>
    </div>
  );
}
