"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#rooms", label: "Rooms & pricing" },
  { href: "#amenities", label: "Amenities" },
  { href: "#meals", label: "Meals" },
  { href: "#rules", label: "House rules" },
  { href: "#location", label: "Location" },
  { href: "#reviews", label: "Reviews" },
] as const;

type ColivingDetailAnchorBarProps = {
  startingPrice: number;
};

export function ColivingDetailAnchorBar({ startingPrice }: ColivingDetailAnchorBarProps) {
  const [active, setActive] = useState<string>("#overview");

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f9f8f5]/95 backdrop-blur-md lg:top-[68px]">
      <div className="mx-auto flex max-w-[1280px] items-center gap-1 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:gap-1.5 sm:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition sm:px-3.5 sm:text-sm",
              active === link.href ? "bg-ink text-white" : "text-muted hover:bg-[color:var(--color-brand-soft)] hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        ))}
        <div className="ml-auto hidden shrink-0 items-baseline gap-2.5 lg:flex">
          <span className="text-xs uppercase tracking-[0.12em] text-muted">Starting from</span>
          <span className="text-lg font-semibold text-ink">
            {formatCurrency(startingPrice)}
            <span className="text-xs font-normal text-muted">/mo</span>
          </span>
          <Link
            href="#booking-panel"
            className="ml-3 inline-flex items-center justify-center rounded-full bg-[color:var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(18,184,134,0.28)] transition hover:bg-[color:var(--color-accent)]"
          >
            Schedule a visit
          </Link>
        </div>
      </div>
    </div>
  );
}
