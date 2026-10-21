import { SectionWrapper } from "@/components/sections/section-wrapper";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CityRail } from "@/modules/home/components/city-rail";
import { HomeAdvisorFlow } from "@/modules/home/components/home-advisor-flow";
import { HomeFaqSection } from "@/modules/home/components/home-faq-section";
import { HostListingCtaBanner } from "@/modules/home/components/host-listing-cta-banner";
import { WorkspaceFitComparison } from "@/modules/home/components/workspace-fit-comparison";
import { AnimatedCounter } from "@/modules/home/components/animated-counter";
import { HomeHero } from "@/modules/home/hero";
import { VerticalSpaceCard } from "@/modules/spaces/components/vertical-space-card";
import { TrustedBrandsMarquee } from "@/modules/verticals/components/trusted-brands-marquee";
import { FEATURED_CITY_SLUG } from "@/services/home";
import { HomepageData } from "@/types";
import { cn } from "@/utils/cn";

type HomepageProps = {
  data: HomepageData;
};

/** Space between section heading and content (replaces visual weight of removed descriptions). */
const headingGap = "mt-8 sm:mt-10";

export function Homepage({ data }: HomepageProps) {
  return (
    <>
      <HomeHero
        searchOptions={data.searchOptions}
        featuredSpaces={data.featuredSpaces}
      />
      <SectionWrapper id="cities">
        <SectionHeading
          title="Coworking Spaces Across India"
        />
        <CityRail cities={data.cities} />
      </SectionWrapper>

      <SectionWrapper>
        <SectionHeading
          title="Explore Premium Coworking Spaces"
          action={
            <Button href={`/coworking/${FEATURED_CITY_SLUG}`} variant="secondary">
              Browse all listings
            </Button>
          }
        />
        <div
          className={cn(
            "no-scrollbar flex snap-x items-stretch gap-4 overflow-x-auto pb-2",
            headingGap,
          )}
        >
          {data.featuredSpaces.map((space) => (
            <div
              key={space.id}
              className="flex h-full w-[16.75rem] shrink-0 snap-start flex-col sm:w-[19.5rem] lg:w-[21rem]"
            >
              <VerticalSpaceCard space={space} className="min-h-0 flex-1" />
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <WorkspaceFitComparison />
      </SectionWrapper>

      <SectionWrapper>
        <HomeAdvisorFlow />
      </SectionWrapper>

      <SectionWrapper>
        <HostListingCtaBanner />
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-4 md:grid-cols-3">
          {data.trustMetrics.map((metric) => (
            <div
              key={metric.id}
              className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft"
            >
              <p className="font-display text-4xl text-ink sm:text-5xl">
                <AnimatedCounter value={metric.value} suffix={metric.suffix} />
              </p>
              <p className="mt-3 max-w-[16rem] text-sm leading-6 text-muted">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {data.brands?.length ? (
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-10">
            <SectionHeading title="Trusted Operators & Brands" />
          </div>
          <TrustedBrandsMarquee brands={data.brands} className="mt-8 sm:mt-10" />
        </section>
      ) : null}

      <SectionWrapper className="pb-24 sm:pb-28">
        <HomeFaqSection />
      </SectionWrapper>

    </>
  );
}
