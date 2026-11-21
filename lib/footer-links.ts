// Server only: imported from the public template, never from a client component.
import { cachedLoader } from "@/lib/cached-loader";
import { collectCityPagesSitemapEntries } from "@/lib/sitemap-public-urls";
import { fetchBlogList, fetchBlogNewsList } from "@/services/blog-api";

/**
 * Which footer links point at pages Google may index. Built from the same data as the city
 * sitemap, so the footer never links a city page the sitemap leaves out (e.g. a managed office
 * city with no offices, which is `noindex`).
 */
export type FooterLinkData = {
  /** URL segment (`coworking`, `managed-office`…) → city slugs with an indexable city page; null = unknown. */
  cityPages: Record<string, string[]> | null;
  /** The blog has at least one post; until then it is `noindex` and not linked. */
  hasBlog: boolean;
};

/** Never hold a page for the footer: a cold load keeps running in the background for later requests. */
const FOOTER_DATA_WAIT_MS = 2000;

const loadCityPages = cachedLoader(async (): Promise<Record<string, string[]>> => {
  const out: Record<string, string[]> = {};
  for (const entry of await collectCityPagesSitemapEntries()) {
    const [segment, city] = new URL(entry.loc).pathname.split("/").filter(Boolean);
    if (!segment || !city) continue;
    (out[segment] ??= []).push(decodeURIComponent(city));
  }
  return out;
});

const loadHasBlog = cachedLoader(async (): Promise<boolean> => {
  const [posts, news] = await Promise.all([fetchBlogList(), fetchBlogNewsList()]);
  return posts.length > 0 || news.length > 0;
});

function within<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function loadFooterLinkData(): Promise<FooterLinkData> {
  const [cityPages, hasBlog] = await Promise.all([
    within<Record<string, string[]> | null>(loadCityPages(), FOOTER_DATA_WAIT_MS, null),
    within(loadHasBlog(), FOOTER_DATA_WAIT_MS, false),
  ]);
  return { cityPages, hasBlog };
}
