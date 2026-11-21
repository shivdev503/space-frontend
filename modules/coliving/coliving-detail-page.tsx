import { PgPlaceJsonLd } from "@/components/seo/listing-json-ld";
import { Container } from "@/components/ui/container";
import { listingAltBase } from "@/lib/image-alt";
import { ColivingDetailAnchorBar } from "@/modules/coliving/components/detail/coliving-detail-anchor-bar";
import { ColivingDetailGallery } from "@/modules/coliving/components/detail/coliving-detail-gallery";
import { ColivingDetailHeader } from "@/modules/coliving/components/detail/coliving-detail-header";
import { ColivingDetailLeadQuiz } from "@/modules/coliving/components/detail/coliving-detail-lead-quiz";
import { ColivingLeadQuizProvider } from "@/modules/coliving/components/detail/coliving-detail-lead-quiz-context";
import { ColivingDetailMain } from "@/modules/coliving/components/detail/coliving-detail-main";
import { ColivingDetailMobileBar } from "@/modules/coliving/components/detail/coliving-detail-mobile-bar";
import { ColivingDetailSimilarGrid } from "@/modules/coliving/components/detail/coliving-detail-similar-grid";
import { routeCitySlug } from "@/lib/breadcrumb-trails";
import { getVerticalCityPageContent } from "@/services/cities";
import { getColivingLocationPageContent } from "@/services/coliving-location";
import { slugifyMicroLocationName } from "@/services/location-api";
import { pgDetailToSpace, pgImagesSorted, pgStartingRent } from "@/services/pg-mapper";
import type { PgDetail, PgDetailResponse } from "@/types/pg.model";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

function buildGalleryImages(pg: PgDetail): string[] {
  const base = pgImagesSorted(pg.images);
  return base.length ? base : [FALLBACK_IMAGE];
}

type ColivingDetailPageProps = {
  response: PgDetailResponse;
  similar: PgDetail[];
};

/**
 * Links to the PG's city and area pages, only when those pages exist. PGs in cities with no PG
 * city page (Ghaziabad, Faridabad…) or areas with no area page would otherwise link to a 404.
 * Uses the same lookups as the city and area routes, so a link is shown exactly when its page loads.
 */
async function colivingAreaLinks(cityName: string, localityName: string) {
  const citySlug = routeCitySlug(cityName);
  if (!citySlug || !(await getVerticalCityPageContent("coliving", citySlug))) {
    return { cityHref: null, localityHref: null };
  }
  const cityHref = `/coliving/${citySlug}`;
  const localitySegment = slugifyMicroLocationName(localityName.trim());
  if (!localitySegment) return { cityHref, localityHref: null };
  const area = await getColivingLocationPageContent(citySlug, localitySegment).catch(() => null);
  const areaSlug = area?.locationSlug || localitySegment;
  return { cityHref, localityHref: area ? `${cityHref}/${areaSlug}` : null };
}

export async function ColivingDetailPage({ response, similar }: ColivingDetailPageProps) {
  const { data: pg, id, slug } = response;
  const { cityHref, localityHref } = await colivingAreaLinks(pg.city ?? "", pg.locality ?? "");
  const space = pgDetailToSpace(pg, id, slug);
  const images = buildGalleryImages(pg);
  const startingPrice = pgStartingRent(pg);

  return (
    <ColivingLeadQuizProvider>
      <PgPlaceJsonLd pg={pg} path={`/coliving/${slug}`} />
      <div className="bg-[#f9f8f5] pb-24 lg:pb-0">
        <Container className="max-w-[1280px] pt-4 sm:pt-8 max-lg:px-4">
          <ColivingDetailHeader pg={pg} slug={slug} cityHref={cityHref} localityHref={localityHref} />
          <ColivingDetailGallery name={pg.name} altBase={listingAltBase(pg.name, "PG", pg.locality, pg.city)} images={images} />
        </Container>

        <ColivingDetailAnchorBar startingPrice={startingPrice} />

        <Container className="max-w-[1280px]">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
            <ColivingDetailMain pg={pg} />
            <ColivingDetailLeadQuiz
              space={space}
              spaceListingId={id}
              localityLabel={pg.locality}
              ownerNameFallback={pg.postedBy}
              reviewCount={pg.reviews.length}
            />
          </div>
        </Container>

        <ColivingDetailSimilarGrid
          items={similar}
          browseHref={localityHref ?? cityHref ?? "/coliving"}
          locality={pg.locality}
          currentName={pg.name}
        />
        <ColivingDetailMobileBar space={space} reviewCount={pg.reviews.length} />
      </div>
    </ColivingLeadQuizProvider>
  );
}
