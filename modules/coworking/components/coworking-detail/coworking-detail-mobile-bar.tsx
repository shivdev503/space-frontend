"use client";

import { useCoworkingLeadQuiz } from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz-context";
import { formatCurrency } from "@/utils/format";

type CoworkingDetailMobileBarProps = {
  startingFrom: number;
  priceSuffix: string;
  ctaLabel?: string;
};

export function CoworkingDetailMobileBar({
  startingFrom,
  priceSuffix,
  ctaLabel = "Book a Free Tour",
}: CoworkingDetailMobileBarProps) {
  const { openQuiz } = useCoworkingLeadQuiz();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] flex items-center justify-between gap-3.5 border-t border-[#E7E9E6] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(20,24,29,0.1)] lg:hidden">
      <p className="text-xs font-semibold text-muted">
        From{" "}
        <b className="block text-xl font-extrabold tracking-[-0.02em] text-ink">
          {startingFrom > 0 ? formatCurrency(startingFrom) : "On request"}
          {startingFrom > 0 ? (
            <span className="text-[13px] font-semibold text-muted">{priceSuffix}</span>
          ) : null}
        </b>
      </p>
      <button
        type="button"
        onClick={openQuiz}
        className="inline-flex max-w-[230px] flex-1 items-center justify-center rounded-[13px] bg-[color:var(--color-brand)] px-5 py-3.5 text-base font-semibold text-white shadow-[0_6px_16px_rgba(18,184,134,0.32)] transition hover:bg-[color:var(--color-accent)]"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
