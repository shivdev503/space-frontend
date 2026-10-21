import Link from "next/link";

import { Container } from "@/components/ui/container";
import { generateMetadataForPublicRoute } from "@/lib/generate-public-seo-metadata";
import { OfficeWizard } from "@/modules/listing/components/office-wizard";
import { getListingSession } from "@/services/listing-session";

type PageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export const generateMetadata = generateMetadataForPublicRoute;

export default async function AddOfficeSpacePage({ searchParams }: PageProps) {
  const session = await getListingSession();
  const { edit } = await searchParams;
  const isEdit = Boolean(edit?.trim());

  return (
    <div className="bg-cream">
      <Container className="py-10 sm:py-14">
        <div className="mx-auto grid max-w-5xl gap-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">
                SpaceWallah Host Panel
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
                {isEdit ? "Edit Managed Office" : "Add Managed Office"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/add/dashboard"
                className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/30"
              >
                My listings
              </Link>
              <Link
                href="/add"
                className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/30"
              >
                Change vertical
              </Link>
              <Link
                href="/add/coworking-space"
                className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/30"
              >
                Add Coworking Space
              </Link>
            </div>
          </div>

          <OfficeWizard userName={session?.name} editId={edit?.trim() ?? null} />
        </div>
      </Container>
    </div>
  );
}
