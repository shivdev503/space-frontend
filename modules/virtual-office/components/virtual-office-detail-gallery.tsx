import { Container } from "@/components/ui/container";
import { listingAltBase } from "@/lib/image-alt";
import { SpaceDetailGallery } from "@/modules/space-detail/components/space-detail-gallery";
import type { Space } from "@/types";
import { toTitleCase } from "@/utils/format";

type VirtualOfficeDetailGalleryProps = {
  space: Space;
};

/**
 * Lead section for virtual-office detail: photo grid / carousel via {@link SpaceDetailGallery},
 * with optional per-image tone metadata when the space comes from the workspace API.
 */
export function VirtualOfficeDetailGallery({ space }: VirtualOfficeDetailGalleryProps) {
  const images = space.images ?? [];
  const imageAdjustments =
    space.imageAdjustments && space.imageAdjustments.length === images.length
      ? space.imageAdjustments
      : undefined;
  const photoCount = images.filter((src) => src.trim()).length;

  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white pb-6 pt-6 sm:pb-10 sm:pt-10">
      <Container>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
              Gallery
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              Browse photos of the centre and workspace before you book a virtual office plan.
            </p>
          </div>
          {photoCount > 0 ? (
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
              {photoCount} photo{photoCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <SpaceDetailGallery
          name={space.name}
          altBase={listingAltBase(space.name, "virtual office", toTitleCase(space.location || ""), toTitleCase(space.city || ""))}
          images={images}
          imageAdjustments={imageAdjustments}
        />
      </Container>
    </section>
  );
}
