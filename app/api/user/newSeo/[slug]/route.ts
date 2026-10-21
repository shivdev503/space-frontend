import { type NextRequest, NextResponse } from "next/server";

import { buildApiClientHeaders } from "@/services/api-client-headers";
import { resolveApiBaseUrl } from "@/services/env-config";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const NO_CACHE_HEADERS = {
  "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
} as const;

/**
 * Proxies public SEO docs from the backend: `GET /api/user/newSeo/:pathSlug` (e.g. `home`).
 * Lets server components use same-origin fetches if needed, matching other `/api/...` patterns.
 */
export async function GET(_request: NextRequest, context: Ctx) {
  const { slug } = await context.params;
  if (!slug?.length) {
    return NextResponse.json({ message: "slug is required" }, { status: 400 });
  }

  const base = resolveApiBaseUrl();
  const url = `${base}/api/user/newSeo/${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: buildApiClientHeaders(),
  }).catch(() => null);

  if (!res) {
    return NextResponse.json({ message: "SEO service unavailable" }, { status: 502, headers: NO_CACHE_HEADERS });
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
      ...NO_CACHE_HEADERS,
    },
  });
}
