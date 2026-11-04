"use client";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { cityTrail } from "@/lib/breadcrumb-trails";
import type { VirtualOfficeCatalogCity } from "@/lib/virtual-office-city-catalog";
import type { VoCitySummary } from "@/modules/virtual-office/components/city-page/vo-city-content";
import { VoCheck, VoWrap } from "@/modules/virtual-office/components/city-page/vo-city-design";
import { VoCityLeadWizard } from "@/modules/virtual-office/components/city-page/vo-city-lead-wizard";

type VoCityHeroProps = {
  citySlug: string;
  cityDisplay: string;
  catalog: VirtualOfficeCatalogCity;
  summary: VoCitySummary;
};

export function VoCityHero({ citySlug, cityDisplay, catalog, summary }: VoCityHeroProps) {
  return (
    <section className="bg-[#F5F9F7] pb-16 pt-5 sm:pb-20 lg:pb-24">
      <VoWrap>
        <Breadcrumbs items={cityTrail("virtual-office", cityDisplay)} separator="›" className="sm:text-sm" />

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_0.98fr] lg:gap-12">
          <div className="min-w-0">
            <h1 className="vo-displaytext-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[3.75rem] lg:text-[4.35rem]">
              Virtual Office in {cityDisplay}{" "}
              <span className="block text-brand">
                from {summary.lowestLabel}/month
              </span>
            </h1>

            <p className="mt-7 max-w-[33rem] text-lg leading-[1.7] text-muted sm:text-[1.3rem]">
              A GST ready business address with NOC + rent agreement + utility bill. Documents in 48 hours. Zero
              brokerage.
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-muted">
              {["Accepted for GST and MCA", "GST visit handled for you", "Free expert help"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <VoCheck />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <VoCityLeadWizard
            citySlug={citySlug}
            cityDisplay={cityDisplay}
            catalog={catalog}
            className="mx-auto w-full max-w-[480px] lg:mr-0"
          />
        </div>
      </VoWrap>
    </section>
  );
}
