/** Public image CDN for listing photos: `https://img.spacewallah.com/{folder_name}/{name}`. */
export const SPACE_IMAGE_CDN = "https://img.spacewallah.com";

/** Legacy hosts that serve the same `{folder}/{file}` paths as the CDN. */
const LEGACY_IMAGE_HOSTS = new Set([
  "img.spacehaat.com",
  "spacehaat-bucket.s3.ap-south-1.amazonaws.com",
]);

/** Third-party hosts whose photos are not shown on listings. */
const BLOCKED_IMAGE_HOSTS = ["pgdekhoprod.s3.amazonaws.com"];

/** True for URLs on hosts we don't display (e.g. `pgdekhoprod` S3). */
export function isBlockedImageUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.trim());
    return BLOCKED_IMAGE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

type ImageAssetLike = {
  folder_name?: string | null;
  name?: string | null;
  s3_link?: string | null;
};

function trimSlashes(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

/**
 * CDN URL for an image asset: `img.spacewallah.com/{folder}/{file}`.
 * The `s3_link` path is used when present — about a quarter of records have a `name`
 * (e.g. `.jpg` instead of `.webp`) or `folder_name` that doesn't match the stored file.
 * `folder_name` + `name` is only the fallback for assets without an `s3_link`.
 */
export function spaceImageUrl(asset: ImageAssetLike | null | undefined): string {
  if (!asset) return "";
  const fromLink = toSpaceImageCdnUrl(asset.s3_link ?? "");
  if (fromLink) return fromLink;
  const folder = trimSlashes(asset.folder_name ?? "");
  const name = trimSlashes(asset.name ?? "");
  return folder && name ? `${SPACE_IMAGE_CDN}/${folder}/${name}` : "";
}

/** Rewrites a full URL on a legacy image host to the CDN, keeping its `{folder}/{file}` path. */
export function toSpaceImageCdnUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (!LEGACY_IMAGE_HOSTS.has(parsed.hostname)) return trimmed;
    return `${SPACE_IMAGE_CDN}${parsed.pathname}`;
  } catch {
    return trimmed;
  }
}
