import { type NextRequest, NextResponse } from "next/server";

import { legacySeoSlug } from "@/lib/pathname-to-seo-slug";
import { normalizeSeoFromResponse } from "@/lib/seo-normalize";
import { buildApiClientHeaders } from "@/services/api-client-headers";
import { resolveApiBaseUrl } from "@/services/env-config";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

function hasSeoEntry(res: Response | null, text: string): boolean {
  if (!res?.ok || !text) return false;
  try {
    return normalizeSeoFromResponse(JSON.parse(text)) != null;
  } catch {
    return false;
  }
}

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
  const load = (s: string) =>
    fetch(`${base}/api/user/newSeo/${encodeURIComponent(s)}`, {
      cache: "no-store",
      headers: buildApiClientHeaders(),
    }).catch(() => null);

  let res = await load(slug);
  let text = res ? await res.text() : "";

  // Managed office URLs: fall back to the legacy `office-space-…` CMS slug when the new one has no entry.
  const legacy = legacySeoSlug(slug);
  if (legacy && !hasSeoEntry(res, text)) {
    const legacyRes = await load(legacy);
    const legacyText = legacyRes ? await legacyRes.text() : "";
    if (hasSeoEntry(legacyRes, legacyText)) {
      res = legacyRes;
      text = legacyText;
    }
  }

  if (!res) {
    return NextResponse.json({ message: "SEO service unavailable" }, { status: 502, headers: NO_CACHE_HEADERS });
  }

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
      ...NO_CACHE_HEADERS,
    },
  });
}
