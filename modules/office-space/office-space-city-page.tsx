import { ListingItemListJsonLd } from "@/components/seo/listing-json-ld";
import { cityTrail } from "@/lib/breadcrumb-trails";
import { Container } from "@/components/ui/container";
import { CityPageFaqSection } from "@/modules/city-pages/components/city-page-faq-section";
import { CityPageHero } from "@/modules/city-pages/components/city-page-hero";
import { CityPageLeadCtaBand } from "@/modules/city-pages/components/city-page-lead-cta-band";
import { PopularLocalitiesRail } from "@/modules/city-pages/components/popular-localities-rail";
import { ManagedOfficeCityListing } from "@/modules/managed-office/components/managed-office-city-listing";
import { managedOfficeLocalities } from "@/services/managed-office-location";
import type { CityPageData } from "@/types";

export function OfficeSpaceCityPage({ data }: { data: CityPageData }) {
  return (
    <>
      <ListingItemListJsonLd
        name={data.title}
        items={(data.initialManagedOffices ?? []).map((o) => ({ name: o.name, href: `/managed-office/${o.slug}` }))}
      />
      <CityPageHero title={data.title} breadcrumbs={cityTrail(data.vertical, data.city.name)}>
        {data.catalogCityId ? (
          <PopularLocalitiesRail
            catalogCityId={data.catalogCityId}
            citySlug={data.city.slug}
            hrefPrefix="/managed-office"
            fallbackLocations={managedOfficeLocalities(data.initialManagedOffices ?? []).map(({ name, slug }) => ({
              name,
              slug,
            }))}
            fixedLocations
          />
        ) : null}
      </CityPageHero>
      <section className="pt-2 pb-14 sm:pt-3 sm:pb-20">
        <Container>
          <ManagedOfficeCityListing data={data} />
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
