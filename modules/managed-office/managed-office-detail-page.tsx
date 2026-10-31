import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { WorkspacePlaceJsonLd } from "@/components/seo/listing-json-ld";
import { Container } from "@/components/ui/container";
import { listingTrail } from "@/lib/breadcrumb-trails";
import { listingAltBase } from "@/lib/image-alt";
import { CoworkingDetailAmenities } from "@/modules/coworking/components/coworking-detail/coworking-detail-amenities";
import {
  CoworkingDetailLeadQuiz,
  MANAGED_OFFICE_QUIZ,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz";
import { CoworkingLeadQuizProvider } from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz-context";
import { CoworkingDetailLocation } from "@/modules/coworking/components/coworking-detail/coworking-detail-location";
import { CoworkingDetailMobileBar } from "@/modules/coworking/components/coworking-detail/coworking-detail-mobile-bar";
import { ManagedOfficeCard } from "@/modules/managed-office/components/managed-office-card";
import { ManagedOfficeDetailAbout } from "@/modules/managed-office/components/detail/managed-office-detail-about";
import {
  managedOfficeAsLocationWorkspace,
  managedOfficeLockIn,
  managedOfficeMinSeats,
  managedOfficeTitle,
} from "@/modules/managed-office/components/detail/managed-office-detail-facts";
import { ManagedOfficeDetailHero } from "@/modules/managed-office/components/detail/managed-office-detail-hero";
import { ManagedOfficeDetailHighlights } from "@/modules/managed-office/components/detail/managed-office-detail-highlights";
import { ManagedOfficeDetailPricing } from "@/modules/managed-office/components/detail/managed-office-detail-pricing";
import { ManagedOfficeDetailSpecs } from "@/modules/managed-office/components/detail/managed-office-detail-specs";
import {
  managedOfficeCityName,
  managedOfficeCitySlugish,
  managedOfficeImages,
  managedOfficeLocality,
  managedOfficeStartingPrice,
} from "@/modules/managed-office/managed-office-format";
import { SpaceDetailGallery } from "@/modules/space-detail/components/space-detail-gallery";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { toTitleCase } from "@/utils/format";

/** Managed office detail, built from the same sections and layout as the coworking detail page. */
export function ManagedOfficeDetailPage({
  office,
  similarOffices = [],
}: {
  office: ManagedOfficeModel.ManagedOffice;
  similarOffices?: ManagedOfficeModel.ManagedOffice[];
}) {
  const title = managedOfficeTitle(office);
  const locality = managedOfficeLocality(office);
  const city = managedOfficeCityName(office);
  const price = managedOfficeStartingPrice(office) ?? 0;
  const { images, imageAdjustments } = managedOfficeImages(office);
  const minSeats = managedOfficeMinSeats(office);
  const lockIn = managedOfficeLockIn(office);
  const leadHint =
    [minSeats ? `From ${minSeats} seats` : "", lockIn ? `${lockIn} lock-in` : ""].filter(Boolean).join(" · ") ||
    "Zero brokerage";

  return (
    <CoworkingLeadQuizProvider>
      <WorkspacePlaceJsonLd
        name={title}
        path={`/managed-office/${office.slug}`}
        images={images}
        location={office.location}
        amenities={office.amenties}
      />
      <div className="bg-[color:var(--color-page-bg)]">
        <Container className="max-w-[1280px] pt-4 sm:pt-8 max-lg:px-4">
          <Breadcrumbs
            className="py-4 text-[13.5px] sm:py-5 sm:pb-[18px] sm:text-[13.5px]"
            items={listingTrail("office-space", {
              name: title,
              cityName: city,
              cityId: office.location?.city?.id,
              localityName: locality,
            })}
          />
          <ManagedOfficeDetailHero office={office} />
          <SpaceDetailGallery
            name={title}
            altBase={listingAltBase(title, "managed office", locality, city)}
            images={images}
            imageAdjustments={imageAdjustments}
          />
        </Container>

        <Container className="max-w-[1280px]">
          <div className="grid items-start gap-10 pb-14 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:pb-[70px]">
            <main className="min-w-0">
              <ManagedOfficeDetailPricing office={office} />
              <CoworkingDetailAmenities workspace={office} />
              <ManagedOfficeDetailAbout office={office} />
              <section id="overview" className="pt-2 sm:pt-[30px]">
                <ManagedOfficeDetailHighlights office={office} />
              </section>
              <ManagedOfficeDetailSpecs office={office} />
              <CoworkingDetailLocation workspace={managedOfficeAsLocationWorkspace(office)} />
            </main>

            <CoworkingDetailLeadQuiz
              config={MANAGED_OFFICE_QUIZ}
              workspaceName={title}
              citySlug={managedOfficeCitySlugish(office)}
              spaceId={office.id}
              microlocation={locality}
              startingFrom={price}
              priceSuffix="/ seat / mo"
              membershipHint={leadHint}
            />
          </div>
        </Container>

        {similarOffices.length > 0 ? (
          <section id="similar" className="border-t border-[#E7E9E6] pt-8 pb-5 sm:pt-11 sm:pb-6">
            <Container className="max-w-[1280px]">
              <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-brand)]">
                Keep exploring
              </p>
              <h2 className="mt-3 text-[1.65rem] font-extrabold tracking-[-0.03em] text-ink sm:text-[1.7rem]">
                Similar managed offices nearby
              </h2>
              <p className="mt-2 max-w-[60ch] text-[15.5px] text-muted">
                More verified managed offices around {toTitleCase(city || "this city")}.
              </p>

              <div className="no-scrollbar mt-6 flex snap-x gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {similarOffices.map((o) => (
                  <div key={o.id} className="w-[min(84vw,360px)] shrink-0 snap-start sm:w-[350px]">
                    <ManagedOfficeCard office={o} />
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        <CoworkingDetailMobileBar startingFrom={price} priceSuffix="/ seat / mo" ctaLabel="Book a Site Visit" />
      </div>
    </CoworkingLeadQuizProvider>
  );
}
