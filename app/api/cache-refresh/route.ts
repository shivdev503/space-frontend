import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { forgetApiResponses } from "@/lib/api-response-cache";
import { legacySeoSlug, pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import {
  collectBuildingPagesSitemapEntries,
  collectCityPagesSitemapEntries,
  collectCoworkingSpacesSitemapEntries,
  collectLocalityPagesSitemapEntries,
  collectMainPagesSitemapEntries,
  collectOfficeSpaceSitemapEntries,
  collectVirtualOfficeSpacesSitemapEntries,
} from "@/lib/sitemap-public-urls";
import { resolveAppUrl } from "@/services/env-config";
import { seoCacheTag } from "@/services/seo-content";

export const dynamic = "force-dynamic";

/** Most pages one call may rebuild (a CMS entry maps to one page, sometimes a handful). */
const MAX_PAGES = 25;
const PAGE_TIMEOUT_MS = 30_000;

/** Every public page path the sitemaps list (coliving listings are left out: no CMS entries). */
async function publicPaths(): Promise<string[]> {
  const groups = await Promise.allSettled([
    collectMainPagesSitemapEntries(),
    collectCityPagesSitemapEntries(),
    collectLocalityPagesSitemapEntries(),
    collectCoworkingSpacesSitemapEntries(),
    collectVirtualOfficeSpacesSitemapEntries(),
    collectOfficeSpaceSitemapEntries(),
    collectBuildingPagesSitemapEntries(),
  ]);
  return groups.flatMap((g) => (g.status === "fulfilled" ? g.value : [])).map((e) => new URL(e.loc).pathname);
}

/**
 * `POST /api/cache-refresh` with `x-refresh-key` and `{ "paths": [...] }`, called by the backend when
 * the CMS saves. Each entry is a CMS slug (`coworking-gurgaon`, `home`) or a page path (`/blog/x`).
 * Clears the cached CMS text, then asks nginx to rebuild each matching page at once (the
 * `x-sw-refresh` header makes nginx skip its stored copy and store the new one), so visitors and
 * Google see the change straight away instead of after the cache time.
 */
export async function POST(request: NextRequest) {
  const key = process.env.PAGE_REFRESH_KEY?.trim();
  if (!key || request.headers.get("x-refresh-key") !== key) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { paths?: unknown } | null;
  const entries = Array.isArray(body?.paths)
    ? body.paths.filter((p): p is string => typeof p === "string" && p.trim() !== "").map((p) => p.trim())
    : [];
  if (!entries.length) return NextResponse.json({ message: "paths is required" }, { status: 400 });

  const pages = new Set<string>();
  const slugs = new Set<string>();
  let all: string[] | null = null;
  for (const entry of entries) {
    if (entry.startsWith("/")) {
      pages.add(entry.split("?")[0]);
      slugs.add(pathnameToSeoSlug(entry));
      continue;
    }
    slugs.add(entry);
    all ??= await publicPaths();
    for (const path of all) {
      const slug = pathnameToSeoSlug(path);
      if (slug === entry || legacySeoSlug(slug) === entry) pages.add(path);
    }
  }

  for (const slug of slugs) revalidateTag(seoCacheTag(slug));
  // Blog posts are read through the short-lived API response cache: drop them so the rebuild is fresh.
  if (Array.from(pages).some((p) => p === "/blog" || p.startsWith("/blog/"))) forgetApiResponses("/api/user/blog");

  const origin = resolveAppUrl().replace(/\/$/, "");
  const refreshed: string[] = [];
  for (const path of Array.from(pages).slice(0, MAX_PAGES)) {
    const res = await fetch(`${origin}${path}`, {
      headers: { "x-sw-refresh": key },
      cache: "no-store",
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    }).catch(() => null);
    if (res?.ok) refreshed.push(path);
  }

  return NextResponse.json({ message: "Refreshed", refreshed, notRefreshed: Array.from(pages).filter((p) => !refreshed.includes(p)) });
}
