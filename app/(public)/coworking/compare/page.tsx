import type { Metadata } from "next";

import { parseCompareSlugs, toCompareSpace, type CompareSpace } from "@/lib/coworking-compare";
import { CoworkingCompareView } from "@/modules/compare/coworking-compare-view";
import { loadCoworkingWorkspaceDetail } from "@/services/coworking-api";

export const metadata: Metadata = {
  title: "Compare Coworking Spaces | SpaceWallah",
  description: "Compare coworking spaces side by side: prices, ratings, location, opening hours and amenities.",
  // Every selection is its own URL; keep them out of the index.
  robots: { index: false, follow: true },
};

export default async function CoworkingComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const slugs = parseCompareSlugs((await searchParams).spaces);
  const workspaces = await Promise.all(slugs.map((slug) => loadCoworkingWorkspaceDetail(slug).catch(() => null)));
  const spaces: CompareSpace[] = workspaces.flatMap((ws) => (ws ? [toCompareSpace(ws)] : []));

  return <CoworkingCompareView spaces={spaces} />;
}
