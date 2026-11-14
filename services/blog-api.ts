/**
 * Blog HTTP client — upstream user API:
 * - `GET /api/user/blog`
 * - `GET /api/user/blog/news`
 * - `GET /api/user/blog/:findKey`
 * - `GET /api/user/blog/:type/:findKey`
 * - `GET /api/user/blogByType/:type`
 */

import axios, { type AxiosInstance } from "axios";
import { cachingAdapter } from "@/lib/api-response-cache";
import { cache } from "react";

import {
  normalizeBlogDetail,
  normalizeBlogList,
  verticalToApiBlogType,
  BLOG_VERTICALS,
} from "@/services/blog-mapper";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { resolveApiBaseUrl, resolveCoworkingApiTimeoutMs } from "@/services/env-config";
import type { BlogPost, BlogVerticalFilter } from "@/types/blog";
import type { BlogDetailResponse, BlogListResponse } from "@/types/blog.model";
import type { SpaceVertical } from "@/types";

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  const ms = resolveCoworkingApiTimeoutMs();
  if (!client) {
    client = axios.create({
      // Public listing reads: short server-side cache (lib/api-response-cache.ts).
      adapter: cachingAdapter,
      baseURL: resolveApiBaseUrl(),
      timeout: ms,
      headers: buildApiClientHeaders(),
    });
  } else {
    client.defaults.baseURL = resolveApiBaseUrl();
    client.defaults.timeout = ms;
  }
  return client;
}

async function fetchBlogListRaw(path: string): Promise<BlogPost[]> {
  try {
    const { data } = await getClient().get<BlogListResponse>(path);
    return normalizeBlogList(Array.isArray(data?.data) ? data.data : []);
  } catch {
    return [];
  }
}

export async function fetchBlogList(): Promise<BlogPost[]> {
  return fetchBlogListRaw("/api/user/blog");
}

export async function fetchBlogNewsList(): Promise<BlogPost[]> {
  return fetchBlogListRaw("/api/user/blog/news");
}

export async function fetchBlogsByType(type: string): Promise<BlogPost[]> {
  const key = type.trim();
  if (!key) return [];
  return fetchBlogListRaw(`/api/user/blogByType/${encodeURIComponent(key)}`);
}

export async function fetchBlogDetail(findKey: string): Promise<BlogPost | null> {
  const key = findKey.trim();
  if (!key) return null;

  try {
    const { data, status } = await getClient().get<BlogDetailResponse>(
      `/api/user/blog/${encodeURIComponent(key)}`,
    );
    if (status === 404) return null;
    const post = normalizeBlogDetail(data?.data ?? data);
    return post;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    return null;
  }
}

export async function fetchBlogDetailByType(type: string, findKey: string): Promise<BlogPost | null> {
  const blogType = type.trim();
  const key = findKey.trim();
  if (!blogType || !key) return null;

  try {
    const { data, status } = await getClient().get<BlogDetailResponse>(
      `/api/user/blog/${encodeURIComponent(blogType)}/${encodeURIComponent(key)}`,
    );
    if (status === 404) return null;
    return normalizeBlogDetail(data?.data ?? data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    return null;
  }
}

export async function resolveBlogDetail(findKey: string): Promise<BlogPost | null> {
  const direct = await fetchBlogDetail(findKey);
  if (direct) return direct;

  for (const vertical of BLOG_VERTICALS) {
    const apiType = verticalToApiBlogType(vertical);
    const typed = await fetchBlogDetailByType(apiType, findKey);
    if (typed) return typed;
  }

  return null;
}

export async function loadBlogPosts(filter: BlogVerticalFilter = "all"): Promise<BlogPost[]> {
  if (filter === "all") return fetchBlogList();
  return fetchBlogsByType(verticalToApiBlogType(filter));
}

function dedupeBlogPosts(posts: BlogPost[]): BlogPost[] {
  const seen = new Set<string>();
  const merged: BlogPost[] = [];
  for (const post of posts) {
    if (seen.has(post.slug)) continue;
    seen.add(post.slug);
    merged.push(post);
  }
  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export const loadBlogIndexData = cache(async () => {
  const [posts, news, ...byVerticalLists] = await Promise.all([
    fetchBlogList(),
    fetchBlogNewsList(),
    ...BLOG_VERTICALS.map((vertical) => fetchBlogsByType(verticalToApiBlogType(vertical))),
  ]);

  const mergedPosts = dedupeBlogPosts([...posts, ...byVerticalLists.flat()]);
  const mergedNews = dedupeBlogPosts(news);
  const featured =
    mergedNews.find((post) => post.featured) ??
    mergedNews[0] ??
    mergedPosts.find((post) => post.featured) ??
    mergedPosts[0] ??
    null;

  return { posts: mergedPosts, news: mergedNews, featured };
});

export const loadBlogPostBySlug = cache(async (slug: string) => resolveBlogDetail(slug));

export const loadBlogSlugs = cache(async () => {
  const posts = await fetchBlogList();
  return posts.map((post) => post.slug);
});

export function listRelatedBlogPosts(post: BlogPost, candidates: BlogPost[], limit = 3): BlogPost[] {
  return candidates
    .filter((item) => item.vertical === post.vertical && item.slug !== post.slug)
    .slice(0, limit);
}

export async function loadRelatedBlogPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const byType = await fetchBlogsByType(post.apiType ?? verticalToApiBlogType(post.vertical));
  const related = listRelatedBlogPosts(post, byType, limit);
  if (related.length >= limit) return related;

  const all = await fetchBlogList();
  const merged = [...related];
  for (const item of listRelatedBlogPosts(post, all, limit)) {
    if (merged.some((row) => row.slug === item.slug)) continue;
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}
