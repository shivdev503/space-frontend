import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Container } from "@/components/ui/container";
import { listingTrail } from "@/lib/breadcrumb-trails";
import { buildMapsLink } from "@/lib/space-detail-map";
import { VirtualOfficeDetailGallery } from "@/modules/virtual-office/components/virtual-office-detail-gallery";
import { VirtualOfficeDetailHeader } from "@/modules/virtual-office/components/virtual-office-detail-header";
import { VirtualOfficePricingCards } from "@/modules/virtual-office/components/virtual-office-pricing-cards";
import { AmenitiesList } from "@/modules/space-detail/components/amenities-list";
import { DetailBottomCtaBand } from "@/modules/space-detail/components/detail-bottom-cta-band";
import { DetailTrustMarkers } from "@/modules/space-detail/components/detail-trust-markers";
import { SpaceDetailLeafletMap } from "@/modules/space-detail/components/space-detail-leaflet-map-dynamic";
import { StickyLeadForm } from "@/modules/space-detail/components/sticky-lead-form";
import { WorkspaceDescription } from "@/modules/space-detail/components/workspace-description";
import { Highlights } from "@/modules/spaces/components/highlights";
import { SimilarSpaces } from "@/modules/spaces/components/similar-spaces";
import { NEARBY_LANDMARKS_BY_CITY } from "@/modules/space-detail/nearby-landmarks";
import type { Space } from "@/types";
import { toTitleCase } from "@/utils/format";

export function VirtualOfficeDetailPage({
  space,
  similarSpaces,
}: {
  space: Space;
  similarSpaces: Space[];
}) {
  const mapAddress = space.address || `${space.location}, ${space.city}`;
  const mapsLink = buildMapsLink(null, mapAddress);
  const nearbyLandmarks =
    NEARBY_LANDMARKS_BY_CITY[String(space.city || "").toLowerCase()] ??
    [toTitleCase(space.location || ""), toTitleCase(space.city || ""), "Business District"];

  const tone = {
    primaryCta: "Check Availability",
    finalCta: "Get Virtual Office Consultation",
    finalHeading: "Talk to an expert and set up your virtual office faster",
  };

  return (
    <>
      <Container>
        <Breadcrumbs
          className="pt-4 sm:pt-5"
          items={listingTrail("virtual-office", { name: space.name, cityName: space.city })}
        />
      </Container>
      <VirtualOfficeDetailGallery space={space} />

      <section className="pb-6">
        <Container>
          <VirtualOfficeDetailHeader space={space} />
        </Container>
      </section>
{/* 
      <section className="pb-12">
        <Container>
          <Highlights space={space} />
        </Container>
      </section> */}

      <section className="pb-14 sm:pb-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div className="space-y-8">
              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  Pricing plans
                </p>
                <div className="mt-6">
                  <VirtualOfficePricingCards space={space} />
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  Amenities
                </p>
                <div className="mt-6">
                  <AmenitiesList amenities={space.amenities ?? []} />
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  About this space
                </p>
                <WorkspaceDescription description={space.description ?? ""} className="mt-5" />
              </section>

              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  Location
                </p>
                <p className="mt-4 text-base text-muted">{space.address}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {nearbyLandmarks.map((landmark) => (
                    <span
                      key={landmark}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      Near {landmark}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <SpaceDetailLeafletMap
                    name={space.name}
                    locality={space.location}
                    city={space.city}
                    address={mapAddress}
                    mapsLink={mapsLink}
                  />
                </div>
              </section>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <StickyLeadForm
                leadTarget={{ city: space.city, spaceId: space.id }}
                submitLabel={tone.primaryCta}
                mxSpaceType="Virtual Office"
              />
            </div>
          </div>
        </Container>
      </section>

      <DetailTrustMarkers />

      <section className="pb-14 sm:pb-20">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
            Similar spaces
          </p>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            More premium options in {toTitleCase(space.city || "")}
          </h2>
          <SimilarSpaces spaces={similarSpaces} />
        </Container>
      </section>

      <DetailBottomCtaBand finalHeading={tone.finalHeading} finalCta={tone.finalCta} />

    </>
  );
}
