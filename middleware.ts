import { NextResponse, type NextRequest } from "next/server";

import { isDemoListingPath } from "@/lib/demo-listings";
import { findListingRedirect, goneHtml, parseListingPath } from "@/lib/listing-redirects";
import { LISTING_TOKEN_COOKIE, LISTING_USER_COOKIE } from "@/lib/listing-auth-constants";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { resolveAppUrl } from "@/services/env-config";

const GONE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Listing removed | SpaceWallah</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#222"><h1>This listing is no longer available</h1><p>It has been permanently removed.</p><p><a href="/" style="color:#12b886">Browse verified spaces on SpaceWallah</a></p></body></html>`;

/**
 * Absolute URL on the public site for a redirect. Behind nginx the request URL is the internal
 * `localhost:3000`, so redirects are built from the public origin (APP_URL), falling back to the
 * proxy's forwarded host.
 */
function publicUrl(request: NextRequest, pathname: string, search = ""): URL {
  const configured = resolveAppUrl();
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = !/localhost|127\.0\.0\.1/.test(configured)
    ? configured
    : forwardedHost && !/^(localhost|127\.0\.0\.1)(:|$)/.test(forwardedHost)
      ? `${forwardedProto}://${forwardedHost}`
      : request.nextUrl.origin;
  const url = new URL(pathname, origin);
  url.search = search;
  return url;
}

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
export async function middleware(request: NextRequest) {
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

  // Old listing URLs: renamed listings and hidden duplicates redirect to the live page (301);
  // listings removed on purpose answer 410 Gone. The backend never lists a live URL here.
  const listing = parseListingPath(request.nextUrl.pathname);
  if (listing) {
    const hit = await findListingRedirect(listing.vertical, listing.slug);
    if (hit?.to) {
      return NextResponse.redirect(publicUrl(request, `/${listing.vertical}/${hit.to}`, request.nextUrl.search), 301);
    }
    if (hit?.gone) {
      return new NextResponse(goneHtml(listing.vertical, hit.city), {
        status: 410,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex",
          "cache-control": "public, max-age=600",
        },
      });
    }
  }

  // Signed-in hosts skip the sign-up page. `reason` means the dashboard just sent them back here
  // (expired session), so redirecting again would loop.
  if (
    request.nextUrl.pathname === "/list-your-space" &&
    !request.nextUrl.searchParams.has("reason") &&
    request.cookies.get(LISTING_TOKEN_COOKIE)?.value?.trim() &&
    request.cookies.get(LISTING_USER_COOKIE)?.value?.trim()
  ) {
    return NextResponse.redirect(publicUrl(request, "/add/dashboard"));
  }

  if (request.nextUrl.pathname.startsWith("/add")) {
    const token = request.cookies.get(LISTING_TOKEN_COOKIE)?.value?.trim();
    if (token) {
      return withPathnameHeader(request);
    }
    return NextResponse.redirect(publicUrl(request, "/list-your-space", "?reason=login-required"));
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
