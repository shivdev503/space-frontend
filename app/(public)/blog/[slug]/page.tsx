import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { BlogDetailPage } from "@/modules/blog/blog-detail-page";
import { loadBlogPostBySlug, loadRelatedBlogPosts } from "@/services/blog-api";
import { buildMetadata } from "@/utils/metadata";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadBlogPostBySlug(slug);
  if (!post) notFound();
  return buildMetadata(post.title, post.excerpt, `/blog/${post.slug}`);
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await loadBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await loadRelatedBlogPosts(post);

  return <BlogDetailPage post={post} related={related} />;
}
