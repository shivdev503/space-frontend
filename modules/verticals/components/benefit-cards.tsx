import { BadgePercent, Building2, ShieldCheck, Sparkles } from "lucide-react";

import { WhySpaceWallahItem } from "@/types";

const icons = [Sparkles, ShieldCheck, BadgePercent, Building2];

type BenefitCardsProps = {
  items: WhySpaceWallahItem[];
  tone?: "light" | "dark";
  showDescription?: boolean;
};

export function BenefitCards({
  items,
  tone = "light",
  showDescription = true,
}: BenefitCardsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];

        return (
          <div
            key={item.id}
            className={
              tone === "dark"
                ? "rounded-[1.5rem] border border-white/10 bg-white/8 p-6 text-white backdrop-blur"
                : "rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft"
            }
          >
            <div
              className={
                tone === "dark"
                  ? "inline-flex rounded-2xl bg-white/10 p-3 text-white"
                  : "inline-flex rounded-2xl bg-[color:var(--color-brand-soft)] p-3 text-[color:var(--color-brand)]"
              }
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
            {showDescription ? (
              <p
                className={
                  tone === "dark"
                    ? "mt-3 text-sm leading-6 text-white/74"
                    : "mt-3 text-sm leading-6 text-muted"
                }
              >
                {item.description}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
