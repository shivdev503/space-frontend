"use client";

import {
  Armchair,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Users,
} from "lucide-react";

import {
  CoworkingDetailBlock,
  CoworkingDetailEyebrow,
  CoworkingDetailSectionSub,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import { useCoworkingLeadQuiz } from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz-context";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

type PlanCategory = {
  name?: string;
  description?: string;
};

type WorkspacePlanLike = CoworkingModel.Plan & {
  category?: PlanCategory;
};

const EXCLUDED = new Set([
  "business address",
  "gst registration",
  "virtual office",
  "company registration",
  "day pass",
]);

function planName(plan: WorkspacePlanLike): string {
  const c = plan.category as PlanCategory | string | undefined;
  if (c && typeof c === "object" && "name" in c && c.name?.trim()) return c.name.trim();
  if (typeof c === "string" && c.trim()) return c.trim();
  return "Plan";
}

function planIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("hot")) return Users;
  if (n.includes("dedicated")) return Armchair;
  if (n.includes("cabin") || n.includes("private")) return Briefcase;
  if (n.includes("meeting")) return Building2;
  if (n.includes("day")) return Calendar;
  return Armchair;
}

function planUnit(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("day pass") || n === "day pass") return "/ day";
  return "/ mo";
}

export function CoworkingDetailPricing({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const { pickPlan } = useCoworkingLeadQuiz();
  const plans = ((workspace.plans ?? []) as WorkspacePlanLike[]).filter((p) => {
    if (p.should_show === false) return false;
    return !EXCLUDED.has(planName(p).toLowerCase());
  });

  if (!plans.length) return null;

  const featuredIndex = plans.findIndex((p) =>
    planName(p).toLowerCase().includes("dedicated"),
  );

  return (
    <CoworkingDetailBlock id="pricing">
      <CoworkingDetailEyebrow>Membership plans</CoworkingDetailEyebrow>
      <CoworkingDetailSectionTitle>Flexible pricing for every team</CoworkingDetailSectionTitle>
      <CoworkingDetailSectionSub className="mb-6">
        Transparent, all-inclusive rates. Pay for what you use — no booking fees, exclusive SpaceWallah
        deals.
      </CoworkingDetailSectionSub>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const name = planName(plan);
          const Icon = planIcon(name);
          const featured = index === (featuredIndex >= 0 ? featuredIndex : 0);
          const price = typeof plan.price === "number" ? plan.price : Number(plan.price) || 0;
          const showPrice = plan.should_show !== false && price > 0;
          const cat = plan.category as PlanCategory | undefined;
          const desc =
            (cat && typeof cat === "object" && cat.description?.trim()) ||
            (name.toLowerCase().includes("dedicated")
              ? "Fixed desk in open floor"
              : name.toLowerCase().includes("cabin")
                ? "Private team cabin"
                : "Flexible workspace access");

          return (
            <article
              key={`${name}-${index}`}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-5 transition sm:p-[22px]",
                "hover:-translate-y-0.5 hover:border-[color:var(--color-brand)] hover:shadow-[0_8px_30px_rgba(20,24,29,0.08)]",
                featured
                  ? "border-[color:var(--color-brand)] shadow-[0_0_0_1px_var(--color-brand)]"
                  : "border-[#E7E9E6]",
              )}
            >
              {featured ? (
                <span className="absolute -top-2.5 left-5 rounded-full bg-[color:var(--color-brand)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <div className="mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-[#EDF7EE] text-[#2f8035]">
                <Icon className="h-[21px] w-[21px]" aria-hidden />
              </div>
              <p className="text-[17px] font-bold text-ink">{name}</p>
              <p className="mb-4 mt-1 min-h-[34px] text-[13px] leading-snug text-muted">{desc}</p>
              <p className="mt-auto text-[15px] font-medium text-muted">
                From{" "}
                {showPrice ? (
                  <b className="text-[27px] font-extrabold tracking-[-0.02em] text-ink">
                    {formatCurrency(price)}
                  </b>
                ) : (
                  <b className="text-xl font-extrabold text-ink">On request</b>
                )}
                {showPrice ? <span>{planUnit(name)}</span> : null}
              </p>
              <button
                type="button"
                onClick={() => pickPlan(name)}
                className="mt-4 inline-flex items-center gap-1.5 text-[14.5px] font-bold text-[color:var(--color-brand)]"
              >
                Get quote
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted">
        *Prices mentioned above are starting prices &amp; as per availability
      </p>
    </CoworkingDetailBlock>
  );
}
