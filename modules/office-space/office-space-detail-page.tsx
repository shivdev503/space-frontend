import { MapPin, Star } from "lucide-react";

import { Container } from "@/components/ui/container";
import { buildMapsLink, normalizeMapCoordinates } from "@/lib/space-detail-map";
import { OfficeSpaceHighlights } from "@/modules/office-space/components/office-space-highlights";
import { OfficeSpaceCard } from "@/modules/office-space/components/office-space-card";
import { officeSpaceGalleryImages } from "@/modules/office-space/office-space-gallery-images";
import { AmenitiesList } from "@/modules/space-detail/components/amenities-list";
import { SpaceDetailGallery } from "@/modules/space-detail/components/space-detail-gallery";
import { SpaceDetailLeafletMap } from "@/modules/space-detail/components/space-detail-leaflet-map-dynamic";
import { StickyLeadForm } from "@/modules/space-detail/components/sticky-lead-form";
import { WorkspaceDescription } from "@/modules/space-detail/components/workspace-description";
import type { OfficeSpaceModel } from "@/types/office-space.model";
import { formatCurrency, toTitleCase } from "@/utils/format";

function officeTitle(office: OfficeSpaceModel.OfficeSpace): string {
  const sq = office.other_detail?.area_for_lease_in_sq_ft;
  if (typeof sq === "number" && Number.isFinite(sq) && sq > 0) {
    return `${sq.toLocaleString("en-IN")} sq. ft. managed office`;
  }
  return office.name ?? "Office space";
}

function officeAddress(office: OfficeSpaceModel.OfficeSpace): string {
  const micro = office.location?.micro_location?.name?.trim();
  const city = office.location?.city?.name?.trim();
  return [micro, city].filter(Boolean).join(", ");
}

function officeRating(office: OfficeSpaceModel.OfficeSpace): number {
  const raw = office.ratings;
  const n = raw ? Number.parseFloat(String(raw)) : NaN;
  return Number.isFinite(n) ? n : 0;
}

function officeCitySlugish(office: OfficeSpaceModel.OfficeSpace): string {
  const name = office.location?.city?.name?.trim() || "city";
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function OfficeSpaceDetailPage({
  office,
  similarOffices = [],
}: {
  office: OfficeSpaceModel.OfficeSpace;
  similarOffices?: OfficeSpaceModel.OfficeSpace[];
}) {
  const title = officeTitle(office);
  const address = officeAddress(office);
  const rating = officeRating(office);
  const cityName = office.location?.city?.name?.trim();

  const price = office.other_detail?.area_for_lease_in_sq_ft * office.other_detail?.rent_in_sq_ft;

  const micro = office.location?.micro_location?.name?.trim() || "";
  const city = office.location?.city?.name?.trim() || "";
  const coordinates = normalizeMapCoordinates(
    office.location?.latitude,
    office.location?.longitude,
  );
  const fullAddress =
    [office.location?.address, office.location?.address1, office.location?.city?.name]
      .filter(Boolean)
      .join(", ") || address;
  const mapsLink = buildMapsLink(coordinates, fullAddress);

  const { images: galleryImages, imageAdjustments } = officeSpaceGalleryImages(office);

  return (
    <>
      <section className="pb-8 pt-8 sm:pb-12 sm:pt-12">
        <Container>
          <SpaceDetailGallery
            name={office.name ?? "Office space"}
            images={galleryImages}
            imageAdjustments={imageAdjustments}
          />
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <header className="rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  Office space
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
                  {title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {address || toTitleCase(cityName || "India")}
                  </span>
                  {rating > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      <Star className="h-4 w-4 fill-current text-amber-500" />
                      {rating.toFixed(1)}
                    </span>
                  ) : null}
                  {office.spaceTag ? (
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      {office.spaceTag}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Starting from
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">{formatCurrency(price)}</p>
              </div>
            </div>
          </header>

          <OfficeSpaceHighlights office={office} />

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div className="space-y-8">
              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  Amenities
                </p>
                <div className="mt-6">
                  <AmenitiesList amenities={(office.amenties ?? []).map((a) => a.name).filter(Boolean)} />
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  About this office
                </p>
                <WorkspaceDescription description={office.description ?? ""} className="mt-5" />
                {office.other_detail?.how_to_reach?.trim() ? (
                  <div className="mt-5 rounded-[1.25rem] border border-slate-200/80 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-ink">How to reach: </span>
                    {office.other_detail.how_to_reach}
                  </div>
                ) : null}
              </section>

              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                  Location
                </p>
                <p className="mt-4 text-base text-muted">
                  {[office.location?.micro_location?.name, office.location?.city?.name]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <div className="mt-6">
                  <SpaceDetailLeafletMap
                    name={office.name ?? "Office space"}
                    locality={micro || address}
                    city={city}
                    address={fullAddress}
                    coordinates={coordinates}
                    mapsLink={mapsLink}
                  />
                </div>
              </section>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <StickyLeadForm
                leadTarget={{ city: officeCitySlugish(office), spaceId: office.id || office._id }}
                submitLabel="Get Quote"
                spaceListingKey="office_space"
                mxSpaceType="Web Office"
              />
            </div>
          </div>
        </Container>
      </section>

      {similarOffices.length ? (
        <section className="pb-14 sm:pb-20">
          <Container>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
              Similar managed offices
            </p>
            <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
              More options in {toTitleCase(officeCitySlugish(office))}
            </h2>
            <div className="no-scrollbar mt-8 flex snap-x gap-5 overflow-x-auto pb-2">
              {similarOffices.map((o) => (
                <div key={o.id || o._id} className="w-[18.5rem] shrink-0 snap-start sm:w-[21rem]">
                  <OfficeSpaceCard office={o} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}

