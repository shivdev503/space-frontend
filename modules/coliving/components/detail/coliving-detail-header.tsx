"use client";

import { ColivingPropertyHeader } from "@/modules/coliving/components/detail/coliving-property-header";
import type { PgDetail } from "@/types/pg.model";

type ColivingDetailHeaderProps = {
  pg: PgDetail;
  slug: string;
  /** City and area page links, or null when that page does not exist (see ColivingDetailPage). */
  cityHref: string | null;
  localityHref: string | null;
};

export function ColivingDetailHeader({ pg, slug, cityHref, localityHref }: ColivingDetailHeaderProps) {
  return (
    <ColivingPropertyHeader
      name={pg.name}
      locality={pg.locality}
      city={pg.city}
      cityHref={cityHref}
      localityHref={localityHref}
      address={pg.address}
      rating={pg.rating}
      reviewCount={pg.reviews.length}
      verifiedAt={pg.verified_at}
      verifiedMethod={pg.verified_method}
      shareSlug={slug}
    />
  );
}
