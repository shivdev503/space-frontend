import { NextResponse, type NextRequest } from "next/server";

import { isDemoListingPath } from "@/lib/demo-listings";
import { LISTING_TOKEN_COOKIE } from "@/lib/listing-auth-constants";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";

const GONE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Listing removed | SpaceWallah</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#222"><h1>This listing is no longer available</h1><p>It has been permanently removed.</p><p><a href="/" style="color:#12b886">Browse verified spaces on SpaceWallah</a></p></body></html>`;

function withPathnameHeader(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-seo-slug", pathnameToSeoSlug(pathname));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * 1) Passes `x-pathname` to Server Components (SEO) for every page request.
 * 2) Host / listing panel: require vendor session for `/add` routes.
 */
export function middleware(request: NextRequest) {
  // Demo listings were indexed by Google; 410 tells crawlers they are gone for good.
  if (isDemoListingPath(request.nextUrl.pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex",
        "cache-control": "public, max-age=86400",
      },
    });
  }

  if (request.nextUrl.pathname.startsWith("/add")) {
    const token = request.cookies.get(LISTING_TOKEN_COOKIE)?.value?.trim();
    if (token) {
      return withPathnameHeader(request);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/list-your-space";
    url.searchParams.set("reason", "login-required");
    return NextResponse.redirect(url);
  }

  return withPathnameHeader(request);
}

export const config = {
  matcher: [
    /*
     * Run on all page routes; skip Next internals, API routes, and static
     * files with an extension.
     */
    "/((?!api/|_next/|_vercel/|favicon\\.ico|.*\\..*).*)",
  ],
};
