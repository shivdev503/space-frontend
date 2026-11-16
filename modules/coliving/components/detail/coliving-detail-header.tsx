"use client";

import { ColivingPropertyHeader } from "@/modules/coliving/components/detail/coliving-property-header";
import { slugifyPgName } from "@/lib/pg-slug";
import type { PgDetail } from "@/types/pg.model";

type ColivingDetailHeaderProps = {
  pg: PgDetail;
  slug: string;
};

export function ColivingDetailHeader({ pg, slug }: ColivingDetailHeaderProps) {
  return (
    <ColivingPropertyHeader
      name={pg.name}
      locality={pg.locality}
      city={pg.city}
      citySlug={slugifyPgName(pg.city)}
      address={pg.address}
      rating={pg.rating}
      reviewCount={pg.reviews.length}
      verifiedAt={pg.verified_at}
      verifiedMethod={pg.verified_method}
      shareSlug={slug}
    />
  );
}
