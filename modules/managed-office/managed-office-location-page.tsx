import { ListingItemListJsonLd } from "@/components/seo/listing-json-ld";
import { Container } from "@/components/ui/container";
import { LeadCTA } from "@/modules/city-pages/components/lead-cta";
import { PopularLocalitiesRail } from "@/modules/city-pages/components/popular-localities-rail";
import { Breadcrumb } from "@/modules/location-pages/components/breadcrumb";
import { FAQSection } from "@/modules/location-pages/components/faq-section";
import { ManagedOfficeCard } from "@/modules/managed-office/components/managed-office-card";
import { managedOfficeCardRow } from "@/modules/managed-office/managed-office-format";
import type { ManagedOfficeLocality } from "@/services/managed-office-location";
import type { CityPageData, FAQItem } from "@/types";

type ManagedOfficeLocationPageProps = {
  cityData: CityPageData;
  locality: ManagedOfficeLocality;
  localities: ManagedOfficeLocality[];
  title: string;
  faqs: FAQItem[];
};

/** `/managed-office/{city}/{locality}`: every office in the locality, in the same layout as the city page. */
export function ManagedOfficeLocationPage({
  cityData,
  locality,
  localities,
  title,
  faqs,
}: ManagedOfficeLocationPageProps) {
  const { city, catalogCityId, leadCta, vertical } = cityData;
  const others = localities
    .filter((item) => item.slug !== locality.slug)
    .map((item) => ({ name: item.name, slug: item.slug }));

  return (
    <>
      <ListingItemListJsonLd
        name={title}
        items={locality.offices.map((office) => ({ name: office.name, href: `/managed-office/${office.slug}` }))}
      />
      <section className="relative overflow-hidden pb-4 pt-10 sm:pb-6 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(48,88,215,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_94%)]" />
        <Container>
          <Breadcrumb vertical={vertical} citySlug={city.slug} cityName={city.name} locationName={locality.name} />
          <h1 className="max-w-5xl font-display text-4xl leading-[1.06] tracking-[-0.04em] text-ink sm:text-5xl">
            {title}
          </h1>
          {catalogCityId && others.length ? (
            <div className="mt-5 w-full min-w-0 sm:mt-6">
              <PopularLocalitiesRail
                catalogCityId={catalogCityId}
                citySlug={city.slug}
                hrefPrefix="/managed-office"
                fallbackLocations={others}
                fixedLocations
              />
            </div>
          ) : null}
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {locality.offices.map((office) => (
              <ManagedOfficeCard key={office.id} office={managedOfficeCardRow(office)} />
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <LeadCTA
            title={leadCta.title}
            description={leadCta.description}
            ctaLabel={leadCta.ctaLabel}
            citySlug={city.slug}
            vertical={vertical}
            microlocation={locality.name}
          />
        </Container>
      </section>

      <FAQSection faqs={faqs} locationName={locality.name} />
    </>
  );
}
