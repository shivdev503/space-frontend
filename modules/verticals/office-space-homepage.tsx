import { SectionWrapper } from "@/components/sections/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { CityCard } from "@/modules/home/components/city-card";
import { BenefitCards } from "@/modules/verticals/components/benefit-cards";
import { CaseStudyCard } from "@/modules/verticals/components/case-study-card";
import { SpaceRail } from "@/modules/verticals/components/space-rail";
import { VerticalHero } from "@/modules/verticals/components/vertical-hero";
import { listHomepageCitiesFromAvailable } from "@/services/homepage-available-cities";
import { listSpaces } from "@/services/mock-db";
import { VerticalLandingData } from "@/types";

type OfficeSpaceHomepageProps = {
  data: VerticalLandingData;
};

export function OfficeSpaceHomepage({ data }: OfficeSpaceHomepageProps) {
  const homepageCities = listHomepageCitiesFromAvailable("office-space").map((city) => ({
    ...city,
    spaceCount: listSpaces({ vertical: "office-space", city: city.slug }).length,
  }));

  return (
    <>
      <VerticalHero data={data} />

      <SectionWrapper id="cities" className="pt-6 sm:pt-10">
        <SectionHeading
          title="Top cities across India"
        />
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:grid-cols-4">
          {homepageCities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              basePath="/managed-office"
              variant="compact"
            />
          ))}
        </div>
      </SectionWrapper>

      {data.enterpriseSolutions ? (
        <SectionWrapper className="pt-4 sm:pt-6">
          <SectionHeading
            title="Premium managed offices across India for teams that need polish and scale."
          />
          <div className="mt-10">
            <BenefitCards items={data.enterpriseSolutions} showDescription={false} />
          </div>
        </SectionWrapper>
      ) : null}

      <SectionWrapper>
        <SectionHeading
          title="Explore Premium Managed Offices"
        />
        <SpaceRail spaces={data.featuredSpaces} />
      </SectionWrapper>

      {data.caseStudies ? (
        <SectionWrapper>
          <SectionHeading
            title="How teams use SpaceWallah to evaluate premium managed office options."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {data.caseStudies.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      <SectionWrapper className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <SectionHeading
          title="Built for premium, scalable managed office requirements."
        />
        <div className="mt-10">
          <BenefitCards items={data.benefits} showDescription={false} />
        </div>
      </SectionWrapper>

    </>
  );
}
