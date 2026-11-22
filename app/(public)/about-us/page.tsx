import type { Metadata } from "next";

import { AboutPage } from "@/modules/about/about-page";
import { loadAboutStats } from "@/modules/about/about-stats";
import { buildMetadata } from "@/utils/metadata";

/** Rendered on request, so the counts come from live listings (loaders cache for an hour), not the build. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata(
  "About Us: Who Runs SpaceWallah | SpaceWallah",
  "SpaceWallah is run by Spacewallah Enterprises from Sector 38, Gurugram. See what we do, how we earn, our office address and company details.",
  "/about-us",
);

export default async function AboutUsRoutePage() {
  return <AboutPage stats={await loadAboutStats()} />;
}
