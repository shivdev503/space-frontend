/**
 * Map current route pathname to the SEO API slug. `/` → `home`, otherwise
 * leading/trailing slashes are stripped and `/` is replaced with `-` (e.g.
 * `/sector-42/gurugram/co-living` → `sector-42-gurugram-co-living`).
 */
export function pathnameToSeoSlug(pathname: string): string {
  const path = pathname.split("?")[0] || "/";
  if (path === "/" || path === "") return "home";
  return path
    .replace(/^\/+/g, "")
    .replace(/\/+$/g, "")
    .replace(/\//g, "-");
}

/**
 * `/managed-office` replaced `/office-space`. Older CMS SEO entries still use the `office-space-…`
 * slug, newer ones `managed-office-…`: callers try the new slug first, then this one.
 */
export function legacySeoSlug(slug: string): string | null {
  return /^managed-office(?=-|$)/.test(slug) ? slug.replace(/^managed-office/, "office-space") : null;
}
