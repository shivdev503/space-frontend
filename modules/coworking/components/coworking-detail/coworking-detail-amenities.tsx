import { pickAmenityIcon } from "@/modules/space-detail/components/amenities-list";
import {
  CoworkingDetailBlock,
  CoworkingDetailEyebrow,
  CoworkingDetailSectionSub,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

export function CoworkingDetailAmenities({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  // The API can list the same amenity twice (e.g. "Workshops") — show each name once.
  const seen = new Set<string>();
  const amenities = (workspace.amenties ?? [])
    .map((a) => a.name?.trim())
    .filter((name): name is string => {
      if (!name) return false;
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  if (!amenities.length) return null;

  return (
    <CoworkingDetailBlock id="amenities">
      <CoworkingDetailEyebrow>What&apos;s included</CoworkingDetailEyebrow>
      <CoworkingDetailSectionTitle>Amenities &amp; facilities</CoworkingDetailSectionTitle>
      <CoworkingDetailSectionSub className="mb-6">
        Everything your team needs to plug in and get to work from day one.
      </CoworkingDetailSectionSub>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((amenity) => {
          const Icon = pickAmenityIcon(amenity);
          return (
            <div
              key={amenity}
              className="flex items-center gap-3 rounded-xl border border-[#E7E9E6] px-4 py-3.5 text-[14.5px] font-semibold text-ink transition hover:border-[color:var(--color-brand)] hover:bg-[#F5FAF5]"
            >
              <Icon className="h-5 w-5 shrink-0 text-[color:var(--color-brand)]" aria-hidden />
              <span>{amenity}</span>
            </div>
          );
        })}
      </div>
    </CoworkingDetailBlock>
  );
}
