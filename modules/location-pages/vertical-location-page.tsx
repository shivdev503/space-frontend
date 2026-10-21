import Link from "next/link";

import { Container } from "@/components/ui/container";
import { PopularLocalitiesRail } from "@/modules/city-pages/components/popular-localities-rail";
import { Breadcrumb } from "@/modules/location-pages/components/breadcrumb";
import { FAQSection } from "@/modules/location-pages/components/faq-section";
import { LocationListingExperience } from "@/modules/location-pages/components/location-listing-experience";
import { getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import { LocationPageData } from "@/types";
import { formatCurrency } from "@/utils/format";
import { verticalPath } from "@/lib/vertical-path";

type VerticalLocationPageProps = {
  data: LocationPageData;
};

const toneMap = {
  coworking: {
    eyebrow: "Hyper-local coworking discovery",
    description:
      "Flexible plans and productivity-first spaces curated for this location.",
  },
  "virtual-office": {
    eyebrow: "Location-level compliance search",
    description:
      "Trusted providers and documentation support in this business pocket.",
  },
  "office-space": {
    eyebrow: "Premium micro-market advisory",
    description:
      "Enterprise-ready office inventory focused on this location.",
  },
  coliving: {
    eyebrow: "Coliving Space discovery",
    description: "Furnished rooms and meal-inclusive options curated for this locality.",
  },
} as const;

export function VerticalLocationPage({
  data,
}: VerticalLocationPageProps) {
  const tone = toneMap[data.vertical];
  const catalogCityId = data.catalogCityId ?? getCatalogCityIdBySlug(data.citySlug) ?? "";
  const showLocalitiesRail =
    Boolean(catalogCityId) &&
    (data.vertical === "coworking" ||
      data.vertical === "coliving" ||
      data.vertical === "office-space");

  return (
    <>
      <section className="relative overflow-hidden pb-4 pt-10 sm:pb-6 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(48,88,215,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_94%)]" />
        <Container>
          <Breadcrumb
            vertical={data.vertical}
            citySlug={data.citySlug}
            locationName={data.locationName}
          />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
            {tone.eyebrow}
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl leading-[1.06] tracking-[-0.04em] text-ink sm:text-5xl">
            {data.title}
          </h1>
          {showLocalitiesRail ? (
            <div className="mt-5 w-full min-w-0 sm:mt-6">
              <PopularLocalitiesRail
                catalogCityId={catalogCityId}
                citySlug={data.citySlug}
                hrefPrefix={`/${verticalPath(data.vertical)}`}
                spaceType={data.vertical === "coliving" ? "coliving" : "coworking"}
                fallbackLocations={[]}
              />
            </div>
          ) : null}
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <LocationListingExperience data={data} />
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <div className="rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
              Quick location insights
            </p>
            <h2 className="mt-3 font-display text-[1.95rem] text-ink sm:text-3xl">
              Why {data.locationName} works for your workspace search
            </h2>
            <p className="mt-4 text-[0.98rem] leading-7 text-muted">{data.insights.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {data.insights.nearby.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                >
                  Near {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {data.insights.notes.map((note) => (
                <div
                  key={note}
                  className="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {data.vertical !== "coworking" ? (
        <section className="pb-14 sm:pb-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-brand)]">
                  SEO Guide
                </p>
                <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-[2rem]">
                  {data.seoSection.title}
                </h2>
                <div className="mt-5 space-y-4 text-[0.98rem] leading-7 text-muted">
                  {data.seoSection.paragraphs.map((paragraph, index) => (
                    <p key={`${data.seoSection.title}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Popular spaces in this location
                </p>
                <div className="mt-5 grid gap-3">
                  {data.popularSpaces.map((space) => (
                    <Link
                      key={space.id}
                      href={`/${verticalPath(space.vertical)}/${space.slug}`}
                      className="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                    >
                      <p className="font-semibold text-ink">{space.name}</p>
                      <p className="mt-1 text-sm text-muted">{space.brand}</p>
                      <p className="mt-2 text-sm text-slate-700">
                        Starting from {formatCurrency(space.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <FAQSection faqs={data.faqs} locationName={data.locationName} />

    </>
  );
}
