import { resolveAppUrl } from "@/services/env-config";

/**
 * Remove trailing slashes from a path (not the origin). Root path becomes "".
 */
function stripTrailingPathSlashes(path: string): string {
  if (path === "" || path === "/") return "";
  return path.replace(/\/+$/, "");
}

/**
 * Returns the absolute canonical URL for the current page.
 *
 * - **Origin** always comes from `resolveAppUrl()` (APP_URL / NEXT_PUBLIC_APP_URL) so
 *   production uses `https://spacewallah.com` even if the CMS or request host differs.
 * - **Homepage** is `https://example.com` with no trailing slash.
 * - **CMS `seo.url`**: if absolute, path (and query/hash) are re-rooted to our origin;
 *   if relative, it is joined to the origin. Malformed values fall back to `pathname`.
 */
export function resolveCanonicalUrl(
  pathname: string,
  seoAbsOrPath?: string | null,
): string {
  const origin = resolveAppUrl();
  const pathFromRequest = (pathname || "/").split("?")[0] || "/";

  const fromSeo = seoAbsOrPath?.trim();
  if (fromSeo) {
    try {
      if (/^https?:\/\//i.test(fromSeo)) {
        const u = new URL(fromSeo);
        const pathPart = u.pathname === "/" ? "" : stripTrailingPathSlashes(u.pathname);
        return `${origin}${pathPart}${u.search}${u.hash}`;
      }
      if (fromSeo.startsWith("/")) {
        const pathOnly = fromSeo.split("?")[0] ?? fromSeo;
        const pathPart =
          pathOnly === "/" ? "" : stripTrailingPathSlashes(pathOnly);
        return pathPart === "" ? origin : `${origin}${pathPart}`;
      }
    } catch {
      // fall through to pathname
    }
  }

  let p = pathFromRequest;
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  const pathPart = p === "/" ? "" : stripTrailingPathSlashes(p);
  return pathPart === "" ? origin : `${origin}${pathPart}`;
}
