import { Container } from "@/components/ui/container";
import { ColivingDetailAnchorBar } from "@/modules/coliving/components/detail/coliving-detail-anchor-bar";
import { ColivingDetailGallery } from "@/modules/coliving/components/detail/coliving-detail-gallery";
import { ColivingDetailHeader } from "@/modules/coliving/components/detail/coliving-detail-header";
import { ColivingDetailLeadQuiz } from "@/modules/coliving/components/detail/coliving-detail-lead-quiz";
import { ColivingLeadQuizProvider } from "@/modules/coliving/components/detail/coliving-detail-lead-quiz-context";
import { ColivingDetailMain } from "@/modules/coliving/components/detail/coliving-detail-main";
import { ColivingDetailMobileBar } from "@/modules/coliving/components/detail/coliving-detail-mobile-bar";
import { ColivingDetailSimilarGrid } from "@/modules/coliving/components/detail/coliving-detail-similar-grid";
import { routeCitySlug } from "@/lib/breadcrumb-trails";
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

export function ColivingDetailPage({ response, similar }: ColivingDetailPageProps) {
  const { data: pg, id, slug } = response;
  const space = pgDetailToSpace(pg, id, slug);
  const images = buildGalleryImages(pg);
  const startingPrice = pgStartingRent(pg);

  return (
    <ColivingLeadQuizProvider>
      <div className="bg-[#f9f8f5] pb-24 lg:pb-0">
        <Container className="max-w-[1280px] pt-4 sm:pt-8 max-lg:px-4">
          <ColivingDetailHeader pg={pg} slug={slug} />
          <ColivingDetailGallery name={pg.name} images={images} />
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
          city={pg.city}
          citySlug={routeCitySlug(pg.city)}
          locality={pg.locality}
          currentName={pg.name}
        />
        <ColivingDetailMobileBar space={space} reviewCount={pg.reviews.length} />
      </div>
    </ColivingLeadQuizProvider>
  );
}
