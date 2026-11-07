import type { Metadata } from "next";

import { parseCompareSlugs } from "@/lib/coworking-compare";
import { ShortlistView } from "@/modules/shortlist/shortlist-view";
import { coworkingCardRow, loadCoworkingWorkspaceDetail } from "@/services/coworking-api";
import type { CoworkingModel } from "@/types/coworking-workspace.model";

/** Same cap as the client-side shortlist (`SHORTLIST_MAX`). */
const MAX_SPACES = 30;

export const metadata: Metadata = {
  title: "Your Shortlist | SpaceWallah",
  description: "Coworking spaces you saved on SpaceWallah. Get quotes for all of them or share the list.",
  // Personal lists; keep them out of the index.
  robots: { index: false, follow: true },
};

export default async function CoworkingShortlistPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const slugs = parseCompareSlugs((await searchParams).spaces, MAX_SPACES);
  const loaded = await Promise.all(slugs.map((slug) => loadCoworkingWorkspaceDetail(slug).catch(() => null)));
  // Card fields only: the long copy and SEO blocks are not needed here.
  const workspaces: CoworkingModel.WorkSpace[] = loaded.flatMap((ws) =>
    ws ? [{ ...coworkingCardRow(ws), description: "", new_description: undefined, new_seo: undefined }] : [],
  );

  return <ShortlistView workspaces={workspaces} requestedSlugs={slugs} />;
}
