/**
 * Descriptive alt text for listing photos, built from listing data because the CMS
 * `alt` fields are empty. e.g. "91springboard Augusta Point coworking space in Sector 53, Gurugram".
 */

function mentions(haystack: string, needle: string): boolean {
  return Boolean(needle) && haystack.toLowerCase().includes(needle.toLowerCase());
}

export function listingAltBase(
  name: string,
  kind: string,
  locality?: string | null,
  city?: string | null,
): string {
  const loc = locality?.trim() ?? "";
  const cty = city?.trim() ?? "";
  const place = [
    loc && !mentions(name, loc) ? loc : "",
    cty && !mentions(name, cty) && !mentions(loc, cty) ? cty : "",
  ]
    .filter(Boolean)
    .join(", ");
  const label = mentions(name, kind) ? name.trim() : `${name.trim()} ${kind}`;
  return place ? `${label} in ${place}` : label;
}

/** First photo gets the plain description; later ones are numbered so each alt is unique. */
export function listingPhotoAlt(base: string, index: number): string {
  return index === 0 ? base : `${base}, photo ${index + 1}`;
}
