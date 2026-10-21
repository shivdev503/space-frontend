"use client";

import { formatInrPrice, getCityLowestMonthlyPrice, type VirtualOfficeCatalogCity } from "@/lib/virtual-office-city-catalog";
import { VoDarkButton } from "@/modules/virtual-office/components/city-page/vo-city-design";
import { useVoCityLead } from "@/modules/virtual-office/components/city-page/vo-city-lead-context";

export function VoCityMobileBar({ catalog }: { catalog: VirtualOfficeCatalogCity }) {
  const { openLead } = useVoCityLead();
  const from = getCityLowestMonthlyPrice(catalog);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2.5 border-t border-[#E2EBE7] bg-white px-4 py-2.5 shadow-[0_-8px_30px_rgba(11,59,46,0.08)] lg:hidden">
      <div className="min-w-0 flex-1 text-xs leading-snug text-muted">
        From <b className="text-base font-extrabold text-ink">{formatInrPrice(from)}/mo</b>
      </div>
      <VoDarkButton onClick={openLead} className="shrink-0 px-5 py-2.5 text-sm">
        Get Prices
      </VoDarkButton>
    </div>
  );
}
