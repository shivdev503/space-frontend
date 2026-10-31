import { ListingItemListJsonLd } from "@/components/seo/listing-json-ld";
import { cityTrail } from "@/lib/breadcrumb-trails";
import { Container } from "@/components/ui/container";
import { CityPageFaqSection } from "@/modules/city-pages/components/city-page-faq-section";
import { CityPageHero } from "@/modules/city-pages/components/city-page-hero";
import { CityPageLeadCtaBand } from "@/modules/city-pages/components/city-page-lead-cta-band";
import { PopularLocalitiesRail } from "@/modules/city-pages/components/popular-localities-rail";
import { ColivingCityListingShell } from "@/modules/coliving/components/coliving-city-listing-shell";
import type { PgDetail } from "@/types/pg.model";
import type { CityPageData } from "@/types";

export function ColivingCityPage({
  data,
  pgList = [],
  pgTotal = 0,
  pgPage = 1,
}: {
  data: CityPageData;
  pgList?: PgDetail[];
  pgTotal?: number;
  pgPage?: number;
}) {
  return (
    <>
      <ListingItemListJsonLd
        name={data.title}
        items={pgList.map((pg) => ({ name: pg.name, href: pg.slug ? `/coliving/${pg.slug}` : null }))}
      />
      <CityPageHero title={data.title} breadcrumbs={cityTrail(data.vertical, data.city.name)}>
        {data.catalogCityId ? (
          <PopularLocalitiesRail
            catalogCityId={data.catalogCityId}
            citySlug={data.city.slug}
            hrefPrefix="/coliving"
            spaceType="coliving"
            fallbackLocations={data.popularLocations.map((loc) => ({
              name: loc.name,
              slug: loc.slug,
            }))}
          />
        ) : null}
      </CityPageHero>
      <section className="pt-2 pb-14 sm:pt-3 sm:pb-20">
        <Container>
          <ColivingCityListingShell
            data={data}
            initialItems={pgList}
            initialTotal={pgTotal}
            initialPage={pgPage}
          />
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
