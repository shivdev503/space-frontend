import type { Metadata } from "next";

import { BlogIndexPage } from "@/modules/blog/blog-index-page";
import { buildMetadata } from "@/utils/metadata";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata(
  "Blog | Workspace insights by SpaceWallah",
  "Read premium guides on coworking, coliving, virtual office, and managed office across India.",
  "/blog",
);

export default async function BlogPage() {
  return <BlogIndexPage />;
}
