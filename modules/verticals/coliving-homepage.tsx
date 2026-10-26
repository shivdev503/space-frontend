import { SectionWrapper } from "@/components/sections/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { CityRail } from "@/modules/home/components/city-rail";
import { ColivingFeaturedRail } from "@/modules/coliving/components/coliving-featured-rail";
import { SpaceRail } from "@/modules/verticals/components/space-rail";
import type { PgDetail } from "@/types/pg.model";
import { ColivingHero } from "@/modules/verticals/components/coliving-hero";
import { ColivingFindYourHomeCta } from "@/modules/verticals/components/coliving-find-your-home-cta";
import { ColivingResidentStories } from "@/modules/verticals/components/coliving-resident-stories";
import { ColivingSelectLiving } from "@/modules/verticals/components/coliving-select-living";
import { ColivingWhatsInside } from "@/modules/verticals/components/coliving-whats-inside";
import { ColivingWhySpaceWallahLiving } from "@/modules/verticals/components/coliving-why-spacewallah-living";
import { listHomepageCitiesFromAvailable } from "@/services/homepage-available-cities";
import { listSpaces } from "@/services/mock-db";
import { VerticalLandingData } from "@/types";

type ColivingHomepageProps = {
  data: VerticalLandingData;
  featuredPgs?: PgDetail[];
};

export function ColivingHomepage({ data, featuredPgs = [] }: ColivingHomepageProps) {
  const homepageCities = listHomepageCitiesFromAvailable("coliving").map((city) => ({
    ...city,
    spaceCount: listSpaces({ vertical: "coliving", city: city.slug }).length,
  }));

  return (
    <>
      <ColivingHero data={data} />

      <SectionWrapper id="cities" className="pt-6 sm:pt-10">
        <SectionHeading title="Top cities for coliving space" />
        <CityRail cities={homepageCities} basePath="/coliving" />
      </SectionWrapper>

      <ColivingWhySpaceWallahLiving />

      {featuredPgs.length > 0 || data.featuredSpaces.length > 0 ? (
        <SectionWrapper>
          <SectionHeading title="Featured coliving space listings" />
          {featuredPgs.length > 0 ? (
            <ColivingFeaturedRail listings={featuredPgs} />
          ) : (
            <SpaceRail spaces={data.featuredSpaces} />
          )}
        </SectionWrapper>
      ) : null}

      <ColivingWhatsInside />

      <ColivingSelectLiving />

      <ColivingResidentStories />

      <ColivingFindYourHomeCta />
    </>
  );
}
