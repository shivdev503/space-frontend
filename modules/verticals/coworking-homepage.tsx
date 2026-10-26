import { SectionWrapper } from "@/components/sections/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { CoworkingHero } from "@/modules/coworking/homepage/coworking-hero";
import { CoworkingHowItWorks } from "@/modules/coworking/homepage/coworking-how-it-works";
import { CoworkingSectionHeader } from "@/modules/coworking/homepage/coworking-section-header";
import { CoworkingSelectCta } from "@/modules/coworking/homepage/coworking-select-cta";
import { CoworkingStatsBar } from "@/modules/coworking/homepage/coworking-stats-bar";
import { CoworkingVerification } from "@/modules/coworking/homepage/coworking-verification";
import { CoworkingWorkspaceTypes } from "@/modules/coworking/homepage/coworking-workspace-types";
import { CityRail } from "@/modules/home/components/city-rail";
import { SpaceRail } from "@/modules/verticals/components/space-rail";
import { listHomepageCitiesFromAvailable } from "@/services/homepage-available-cities";
import { listSpaces } from "@/services/mock-db";
import { TrustedBrandsMarquee } from "@/modules/verticals/components/trusted-brands-marquee";
import { VerticalLandingData } from "@/types";

type CoworkingHomepageProps = {
  data: VerticalLandingData;
};

export function CoworkingHomepage({ data }: CoworkingHomepageProps) {
  const homepageCities = listHomepageCitiesFromAvailable().map((city) => ({
    ...city,
    spaceCount: listSpaces({ vertical: "coworking", city: city.slug }).length,
  }));

  const searchCities = data.searchOptions.locations;

  return (
    <>
      <CoworkingHero cities={searchCities} />
      <CoworkingStatsBar />

      <SectionWrapper id="cities" className="py-16 sm:py-[104px]" contentClassName="max-w-[1240px]">
        <CoworkingSectionHeader
          layout="row"
          eyebrow="Top Cities"
          title="Where India works best"
          description="Verified workspaces across the country's biggest business hubs."
          actionHref="/coworking/gurgaon"
          actionLabel="View all cities →"
        />
        <CityRail cities={homepageCities} basePath="/coworking" />
      </SectionWrapper>

      <CoworkingWorkspaceTypes />
      <CoworkingHowItWorks />

      {data.featuredSpaces.length > 0 ? (
        <SectionWrapper
          id="featured"
          className="border-y border-slate-200/90 bg-page py-16 sm:py-[104px]"
          contentClassName="max-w-[1240px]"
        >
          <CoworkingSectionHeader
            layout="row"
            eyebrow="Featured Spaces"
            title="Explore Premium Spaces"
            description="Hand-picked spaces toured and verified by SpaceWallah consultants."
            actionHref="/coworking/gurgaon"
            actionLabel="Browse all spaces →"
          />
          <SpaceRail spaces={data.featuredSpaces} />
        </SectionWrapper>
      ) : null}

      <CoworkingVerification />

      {data.brands?.length ? (
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-10">
            <SectionHeading title="Trusted Operators & Brands" />
          </div>
          <TrustedBrandsMarquee brands={data.brands} className="mt-8 sm:mt-10" />
        </section>
      ) : null}

      <CoworkingSelectCta cities={searchCities} />
    </>
  );
}
