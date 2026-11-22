import { SPACE_IMAGE_CDN, toSpaceImageCdnUrl } from "@/lib/space-image-url";

/** Open Graph size that WhatsApp, LinkedIn, Facebook and X all show as a large preview. */
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

/** Brand image for hubs and for anything without a usable photo. */
export const DEFAULT_SHARE_IMAGE = "/share-default.jpg";

/** Converts a CDN photo to JPEG (app/share-image/[...path]/route.ts). Not under /api: robots.txt blocks that. */
export const SHARE_IMAGE_PATH = "/share-image";

/**
 * Share URL of a photo on our CDN. Photos on other hosts return null: the converter only fetches
 * from the CDN, and stock or third-party photos shouldn't represent a page.
 */
function sharePhotoPath(photo: string | null | undefined): string | null {
  if (!photo) return null;
  try {
    const url = new URL(toSpaceImageCdnUrl(photo));
    if (url.origin !== SPACE_IMAGE_CDN || url.pathname === "/") return null;
    // Always ends in .jpg: that is what it returns, and middleware skips paths with an extension.
    return `${SHARE_IMAGE_PATH}${url.pathname}.jpg`;
  } catch {
    return null;
  }
}

/** `og:image` / `twitter:image` value: the first usable photo, else the brand image. */
export function shareImages(photos: ReadonlyArray<string | null | undefined> = [], alt = "SpaceWallah") {
  let path: string | null = null;
  for (const photo of photos) {
    path = sharePhotoPath(photo);
    if (path) break;
  }
  return [
    {
      url: path ?? DEFAULT_SHARE_IMAGE,
      width: SHARE_IMAGE_WIDTH,
      height: SHARE_IMAGE_HEIGHT,
      type: "image/jpeg",
      alt,
    },
  ];
}
