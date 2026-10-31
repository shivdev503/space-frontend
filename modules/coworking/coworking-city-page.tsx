import { ListingItemListJsonLd } from "@/components/seo/listing-json-ld";
import { cityTrail } from "@/lib/breadcrumb-trails";
import { Container } from "@/components/ui/container";
import { CityPageFaqSection } from "@/modules/city-pages/components/city-page-faq-section";
import { CityPageHero } from "@/modules/city-pages/components/city-page-hero";
import { CityPageLeadCtaBand } from "@/modules/city-pages/components/city-page-lead-cta-band";
import { PopularLocalitiesRail } from "@/modules/city-pages/components/popular-localities-rail";
import { CoworkingCityListing } from "@/modules/coworking/components/coworking-city-listing";
import type { CityPageData } from "@/types";

export function CoworkingCityPage({ data }: { data: CityPageData }) {
  return (
    <>
      <ListingItemListJsonLd
        name={data.title}
        items={(data.initialCoworkingListing?.rows ?? []).map((w) => ({ name: w.name, href: `/coworking/${w.slug}` }))}
      />
      <CityPageHero title={data.title} breadcrumbs={cityTrail(data.vertical, data.city.name)}>
        {data.catalogCityId ? (
          <PopularLocalitiesRail
            catalogCityId={data.catalogCityId}
            citySlug={data.city.slug}
            fallbackLocations={data.popularLocations.map((loc) => ({
              name: loc.name,
              slug: loc.slug,
            }))}
          />
        ) : null}
      </CityPageHero>
      <section className="pb-14 pt-0 sm:pb-20">
        <Container>
          <CoworkingCityListing data={data} showPopularLocalities={false} />
        </Container>
      </section>
      <CityPageLeadCtaBand
        title={data.leadCta.title}
        description={data.leadCta.description}
        ctaLabel={data.leadCta.ctaLabel}
        citySlug={data.city.slug}
        vertical={data.vertical}
      />
      <CityPageFaqSection pageTitle={data.title} faqs={data.faqs} />
    </>
  );
}
