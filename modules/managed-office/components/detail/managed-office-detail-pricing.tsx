"use client";

import { ArrowRight, Building2, DoorOpen, HardHat } from "lucide-react";

import { useCoworkingLeadQuiz } from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz-context";
import {
  CoworkingDetailBlock,
  CoworkingDetailEyebrow,
  CoworkingDetailSectionSub,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

import { managedOfficeLockIn, managedOfficeMinSeats, managedOfficePlans } from "./managed-office-detail-facts";

function planIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("ready")) return DoorOpen;
  if (n.includes("bare")) return HardHat;
  return Building2;
}

const FALLBACK_DESCRIPTION: Record<string, string> = {
  "warm shell": "Fitted floor, customised to your layout before move-in",
  "ready to move in": "Fully furnished and serviced, move in right away",
  "bare shell": "Raw space you design and fit out yourself",
};

/** Per-seat plans, in the same card style as coworking membership plans. */
export function ManagedOfficeDetailPricing({ office }: { office: ManagedOfficeModel.ManagedOffice }) {
  const { pickPlan } = useCoworkingLeadQuiz();
  const plans = managedOfficePlans(office);
  if (!plans.length) return null;

  const minSeats = managedOfficeMinSeats(office);
  const lockIn = managedOfficeLockIn(office);
  const terms = [minSeats ? `minimum ${minSeats} seats` : "", lockIn ? `${lockIn} lock-in` : ""].filter(Boolean).join(" and ");

  return (
    <CoworkingDetailBlock id="pricing">
      <CoworkingDetailEyebrow>Office plans</CoworkingDetailEyebrow>
      <CoworkingDetailSectionTitle>Per-seat pricing for your team</CoworkingDetailSectionTitle>
      <CoworkingDetailSectionSub className="mb-6">
        Monthly price per seat, with the office designed, run and maintained by the operator.
        {terms ? ` Plans start at ${terms}.` : ""}
      </CoworkingDetailSectionSub>

      <div className={cn("grid gap-4", plans.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:max-w-[420px]")}>
        {plans.map((plan, index) => {
          const Icon = planIcon(plan.name);
          const featured = index === 0;
          const desc =
            plan.description || FALLBACK_DESCRIPTION[plan.name.toLowerCase()] || "Private office for your team";
          return (
            <article
              key={plan.key}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-5 transition sm:p-[22px]",
                "hover:-translate-y-0.5 hover:border-[color:var(--color-brand)] hover:shadow-[0_8px_30px_rgba(20,24,29,0.08)]",
                featured
                  ? "border-[color:var(--color-brand)] shadow-[0_0_0_1px_var(--color-brand)]"
                  : "border-[#E7E9E6]",
              )}
            >
              {featured && plans.length > 1 ? (
                <span className="absolute -top-2.5 left-5 rounded-full bg-[color:var(--color-brand)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Best value
                </span>
              ) : null}
              <div className="mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-[#EDF7EE] text-[#2f8035]">
                <Icon className="h-[21px] w-[21px]" aria-hidden />
              </div>
              <p className="text-[17px] font-bold text-ink">{plan.name}</p>
              {plan.category ? <p className="text-[12.5px] font-semibold text-muted">{plan.category}</p> : null}
              <p className="mb-4 mt-1 min-h-[34px] text-[13px] leading-snug text-muted">{desc}</p>
              <p className="mt-auto text-[15px] font-medium text-muted">
                From{" "}
                {plan.price ? (
                  <b className="text-[27px] font-extrabold tracking-[-0.02em] text-ink">{formatCurrency(plan.price)}</b>
                ) : (
                  <b className="text-xl font-extrabold text-ink">On request</b>
                )}
                {plan.price ? <span> {plan.unit}</span> : null}
              </p>
              <button
                type="button"
                onClick={() => pickPlan(plan.name)}
                className="mt-4 inline-flex items-center gap-1.5 self-start text-[14.5px] font-bold text-[color:var(--color-brand)]"
              >
                Get quote
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted">
        *Prices mentioned above are starting prices per seat &amp; as per availability
      </p>
    </CoworkingDetailBlock>
  );
}
