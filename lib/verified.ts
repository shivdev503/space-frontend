/**
 * "Verified on <date>" badge, set by the SpaceWallah team in the admin after confirming a listing's
 * address, prices and availability with the operator. No date → no badge.
 */
const METHOD_TEXT: Record<string, string> = {
  call: "by phone with the operator",
  visit: "with a site visit by our team",
  documents: "with documents from the operator",
};

/** "16 Nov 2026", or null when the listing has no (valid) verification date. */
export function verifiedOnDate(at: string | null | undefined): string | null {
  if (!at) return null;
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

/** Explanation shown with the badge (tooltip / small text). */
export function verifiedExplanation(at: string | null | undefined, method?: string | null): string {
  const date = verifiedOnDate(at);
  if (!date) return "";
  const how = method && METHOD_TEXT[method] ? ` ${METHOD_TEXT[method]}` : "";
  return `SpaceWallah confirmed the address, prices and availability${how} on ${date}.`;
}
