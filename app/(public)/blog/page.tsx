import type { Metadata } from "next";

import { BlogIndexPage } from "@/modules/blog/blog-index-page";
import { loadBlogIndexData } from "@/services/blog-api";
import { buildMetadata } from "@/utils/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const metadata = buildMetadata(
    "Blog | Workspace insights by SpaceWallah",
    "Read premium guides on coworking, coliving, virtual office, and managed office across India.",
    "/blog",
  );
  // An empty blog is a thin page: keep it out of Google until the first post is published.
  const { posts, news } = await loadBlogIndexData();
  return posts.length || news.length ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function BlogPage() {
  return <BlogIndexPage />;
}
