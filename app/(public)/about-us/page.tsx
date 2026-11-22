import type { Metadata } from "next";

import { AboutPage } from "@/modules/about/about-page";
import { loadAboutStats } from "@/modules/about/about-stats";
import { buildMetadata } from "@/utils/metadata";

/** Rendered on request, so the counts come from live listings (loaders cache for an hour), not the build. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata(
  "About Us: Who Runs SpaceWallah | SpaceWallah",
  "Meet SpaceWallah founder Komal Raj and Spacewallah Enterprises in Sector 38, Gurugram: what we do, how we earn, and our company details.",
  "/about-us",
);

export default async function AboutUsRoutePage() {
  return <AboutPage stats={await loadAboutStats()} />;
}
