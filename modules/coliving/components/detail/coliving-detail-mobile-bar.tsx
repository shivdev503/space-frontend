"use client";

import { useColivingLeadQuiz } from "@/modules/coliving/components/detail/coliving-detail-lead-quiz-context";
import { ratingLabel } from "@/lib/rating-label";
import type { Space } from "@/types";
import { formatCurrency } from "@/utils/format";

type ColivingDetailMobileBarProps = {
  space: Space;
  reviewCount?: number;
};

export function ColivingDetailMobileBar({ space, reviewCount }: ColivingDetailMobileBarProps) {
  const { openQuiz } = useColivingLeadQuiz();
  const plans = space.plans?.length ? space.plans : [{ name: "Standard", price: space.price }];
  const minPrice = Math.min(...plans.map((p) => p.price));
  const rating = ratingLabel(space.rating, reviewCount);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-ink">
            {formatCurrency(minPrice)}
            <span className="text-xs font-normal text-muted"> /mo</span>
          </p>
          {rating ? (
            <p className="text-xs text-muted">
              <span className="text-amber-500">★</span> {rating}
            </p>
          ) : (
            <p className="text-xs text-muted">Zero brokerage</p>
          )}
        </div>
        <button
          type="button"
          onClick={openQuiz}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(18,184,134,0.32)] transition hover:bg-[color:var(--color-accent)]"
        >
          Get free details
        </button>
      </div>
    </div>
  );
}
