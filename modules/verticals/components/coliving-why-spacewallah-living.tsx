import { CreditCard, PlusCircle, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { cn } from "@/utils/cn";

type WhyItem = {
  index: string;
  label: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

const ITEMS: WhyItem[] = [
  {
    index: "01",
    label: "Verified",
    title: "Every home inspected, in person.",
    body: "Our team tours each residence, photographs it, and confirms pricing with the operator before it goes live. What you see is exactly what you'll find.",
    icon: ShieldCheck,
  },
  {
    index: "02",
    label: "All-inclusive",
    title: "One bill. Rent, food, Wi-Fi, housekeeping.",
    body: "No deposits to chase, no electricity arguments, no last-minute add-ons. Every plan lists exactly what's included and what isn't upfront.",
    icon: CreditCard,
  },
  {
    index: "03",
    label: "Community",
    title: "Live near your people, not just your office.",
    body: "Curated houses for working professionals, women-only residences, founder pods. Find a home that matches your stage of life, not just your budget.",
    icon: Users,
  },
  {
    index: "04",
    label: "Flexible",
    title: "One month or one year. You choose.",
    body: "From short stays for relocation to long leases for the year ahead fully flexible terms across our network, with zero brokerage at any tenure.",
    icon: PlusCircle,
  },
];

export function ColivingWhySpaceWallahLiving() {
  return (
    <section id="why-spacewallah-living" className="bg-[#f9f8f5] bg-hero-glow py-14 sm:py-20">
      <Container>
        <header className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-x-16 xl:gap-x-24">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted sm:text-xs">
              <span className="h-px w-7 bg-gradient-to-r from-transparent via-slate-400/80 to-slate-400/80" aria-hidden />
              <span className="text-brand">Why SpaceWallah Living</span>
            </p>
            <h2 className="mt-4 max-w-[20ch] font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:mt-5 sm:max-w-none sm:text-4xl sm:leading-[1.06] lg:text-[2.5rem] lg:leading-[1.05] xl:text-[2.65rem]">
              The discovery standard,{" "}
              <span className="font-serif text-[1.06em] font-semibold italic text-[color:var(--color-accent)]">
                now for where you live
              </span>
            </h2>
          </div>
          <div className="flex min-w-0 lg:justify-end lg:pt-7">
            <p className="max-w-md text-left text-base leading-relaxed text-muted sm:text-lg lg:max-w-lg lg:text-right">
              Same verified, no-broker approach you trust for workspaces applied to the home you wake up in. Curated.
              Transparent. Move-in ready.
            </p>
          </div>
        </header>

        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft sm:mt-14 lg:mt-16">
          <div className="grid grid-cols-1 divide-y divide-slate-200/80 lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:divide-slate-200/80">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.index}
                  className={cn(
                    "flex flex-col px-6 py-10 sm:px-8 sm:py-12 lg:min-h-[22rem] lg:px-8 lg:py-14",
                  )}
                >
                  <div className="inline-flex w-fit rounded-2xl bg-[color:var(--color-brand-soft)] p-3 text-[color:var(--color-brand)]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <p className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.index} / {item.label}
                  </p>
                  <h3 className="mt-4 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted sm:mt-4 sm:text-[0.9375rem] sm:leading-7">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
