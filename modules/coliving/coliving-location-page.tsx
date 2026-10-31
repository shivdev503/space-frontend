import Link from "next/link";

import { ListingItemListJsonLd } from "@/components/seo/listing-json-ld";
import { Container } from "@/components/ui/container";
import { LeadCTA } from "@/modules/city-pages/components/lead-cta";
import { PopularLocalitiesRail } from "@/modules/city-pages/components/popular-localities-rail";
import { Breadcrumb } from "@/modules/location-pages/components/breadcrumb";
import { FAQSection } from "@/modules/location-pages/components/faq-section";
import { ColivingLocationListing } from "@/modules/coliving/components/coliving-location-listing";
import { getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import type { PgDetail } from "@/types/pg.model";
import type { LocationPageData } from "@/types";

export function ColivingLocationPage({
  data,
  pgList,
  pgTotal,
}: {
  data: LocationPageData;
  pgList: PgDetail[];
  pgTotal: number;
}) {
  const catalogCityId = data.catalogCityId ?? getCatalogCityIdBySlug(data.citySlug) ?? "";

  return (
    <>
      <ListingItemListJsonLd
        name={data.title}
        items={pgList.map((pg) => ({ name: pg.name, href: pg.slug ? `/coliving/${pg.slug}` : null }))}
      />
      <section className="relative overflow-hidden pb-4 pt-10 sm:pb-6 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(48,88,215,0.08),transparent_30%),linear-gradient(180deg,#f9f8f5_0%,#ffffff_94%)]" />
        <Container>
          <Breadcrumb
            vertical={data.vertical}
            citySlug={data.citySlug}
            cityName={data.city.name}
            locationName={data.locationName}
          />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
            Coliving Space discovery
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl leading-[1.06] tracking-[-0.04em] text-ink sm:text-5xl">
            {data.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">{data.subtitle}</p>
          <p className="mt-2 text-sm text-ink/80">
            {pgTotal} listing{pgTotal === 1 ? "" : "s"} in {data.locationName}
          </p>
          {catalogCityId ? (
            <div className="mt-5 w-full min-w-0 sm:mt-6">
              <PopularLocalitiesRail
                catalogCityId={catalogCityId}
                citySlug={data.citySlug}
                hrefPrefix="/coliving"
                spaceType="coliving"
                fallbackLocations={[]}
              />
            </div>
          ) : null}
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <ColivingLocationListing
            items={pgList}
            locality={data.locationName}
            city={data.city.name}
          />
          {pgTotal === 0 ? (
            <p className="mt-6 text-center text-sm text-muted">
              <Link href={`/coliving/${data.citySlug}`} className="font-medium text-[color:var(--color-brand)] underline">
                View all coliving in {data.city.name}
              </Link>
            </p>
          ) : null}
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <LeadCTA
            title={data.leadCta.title}
            description={data.leadCta.description}
            ctaLabel={data.leadCta.ctaLabel}
            citySlug={data.citySlug}
            vertical={data.vertical}
            microlocation={data.locationName}
          />
        </Container>
      </section>

      <FAQSection faqs={data.faqs} locationName={data.locationName} />
    </>
  );
}
