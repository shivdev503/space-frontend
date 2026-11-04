"use client";

import type { VirtualOfficeCatalogCity } from "@/lib/virtual-office-city-catalog";
import { VoCityMobileBar } from "@/modules/virtual-office/components/city-page/vo-city-chrome";
import {
  getVoCityAreas,
  getVoCityFaqs,
  getVoCityState,
  getVoCitySummary,
} from "@/modules/virtual-office/components/city-page/vo-city-content";
import { voBodyFont, voDisplayFont } from "@/modules/virtual-office/components/city-page/vo-city-fonts";
import { VoCityHero } from "@/modules/virtual-office/components/city-page/vo-city-hero";
import { VoCityLeadProvider } from "@/modules/virtual-office/components/city-page/vo-city-lead-context";
import { VoCityListingsSection } from "@/modules/virtual-office/components/city-page/vo-city-listings";
import { VoCityOtherCitiesSection } from "@/modules/virtual-office/components/city-page/vo-city-other-cities";
import {
  VoCityAdvantageSection,
  VoCityAreaPriceSection,
  VoCityAudienceSection,
  VoCityCallbackSection,
  VoCityDocumentsSection,
  VoCityFaqSection,
  VoCityFinalCta,
  VoCityIncludedSection,
  VoCityPlansSection,
  VoCityReviewsSection,
  VoCityStatsBar,
  VoCityStepsSection,
  VoCityVsRegularSection,
  VoCityWhySpaceWallahSection,
} from "@/modules/virtual-office/components/city-page/vo-city-sections";
import type { City, CityPageData } from "@/types";
import type { SeoReview } from "@/types/seo.model";
import { cn } from "@/utils/cn";

type VoCityPageExperienceProps = {
  data: CityPageData;
  catalog: VirtualOfficeCatalogCity;
  cityDisplay: string;
  otherCities: City[];
  reviews: SeoReview[];
};

export function VoCityPageExperience({ data, catalog, cityDisplay, otherCities, reviews }: VoCityPageExperienceProps) {
  const citySlug = data.city.slug;
  const areas = getVoCityAreas(catalog, cityDisplay);
  const summary = getVoCitySummary(catalog);
  const state = getVoCityState(citySlug);
  const faqs = getVoCityFaqs(cityDisplay, summary, state?.state);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <VoCityLeadProvider citySlug={citySlug} cityDisplay={cityDisplay} catalog={catalog}>
      <div
        className={cn(
          voBodyFont.variable,
          voDisplayFont.variable,
          "min-w-0 overflow-x-hidden bg-white pb-20 font-[family-name:var(--font-vo-body)] text-ink lg:pb-0",
          "[&_.vo-display]:font-[family-name:var(--font-vo-display)]",
        )}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <VoCityHero citySlug={citySlug} cityDisplay={cityDisplay} catalog={catalog} summary={summary} />
        <VoCityStatsBar cityDisplay={cityDisplay} summary={summary} areaCount={areas.length} />
        <VoCityAreaPriceSection cityDisplay={cityDisplay} areas={areas} />
        <VoCityDocumentsSection cityDisplay={cityDisplay} />
        <VoCityIncludedSection cityDisplay={cityDisplay} />
        <VoCityStepsSection cityDisplay={cityDisplay} />
        <VoCityPlansSection cityDisplay={cityDisplay} summary={summary} />
        <VoCityWhySpaceWallahSection />
        <VoCityVsRegularSection cityDisplay={cityDisplay} summary={summary} />
        <VoCityAdvantageSection cityDisplay={cityDisplay} state={state} />
        <VoCityAudienceSection cityDisplay={cityDisplay} />
        <VoCityReviewsSection reviews={reviews} />
        <VoCityListingsSection data={data} cityDisplay={cityDisplay} />
        <VoCityOtherCitiesSection cities={otherCities} />
        <VoCityCallbackSection citySlug={citySlug} cityDisplay={cityDisplay} />
        <VoCityFaqSection cityDisplay={cityDisplay} faqs={faqs} />
        <VoCityFinalCta
          title={`Get your ${cityDisplay} business address this week`}
          subtitle={`Prices from ${summary.lowestLabel} a month. Documents in 48 hours. Zero brokerage.`}
        />

        <VoCityMobileBar catalog={catalog} />
      </div>
    </VoCityLeadProvider>
  );
}
