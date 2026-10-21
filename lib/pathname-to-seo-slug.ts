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
    // `/managed-office` replaced `/office-space`; CMS SEO entries keep the old slug prefix.
    .replace(/^managed-office(?=\/|$)/, "office-space")
    .replace(/\/+$/g, "")
    .replace(/\//g, "-");
}
