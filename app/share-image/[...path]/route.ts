import type { NextRequest } from "next/server";

import { DEFAULT_SHARE_IMAGE, SHARE_IMAGE_HEIGHT, SHARE_IMAGE_PATH, SHARE_IMAGE_WIDTH } from "@/lib/share-image";
import { SPACE_IMAGE_CDN } from "@/lib/space-image-url";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 8000;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 50_000_000;
/** Some WhatsApp clients drop previews above about 300 KB. */
const MAX_OUTPUT_BYTES = 300 * 1024;
const QUALITIES = [80, 65, 50, 35];

/** This server also runs the site and the API, so only a few photos are converted at a time. */
const MAX_ACTIVE = 2;
const MAX_WAITING = 40;
let active = 0;
const waiting: Array<() => void> = [];

async function takeSlot(): Promise<boolean> {
  if (active < MAX_ACTIVE) {
    active++;
    return true;
  }
  if (waiting.length >= MAX_WAITING) return false;
  // A finished conversion hands its slot straight to the next in line.
  await new Promise<void>((resolve) => waiting.push(resolve));
  return true;
}

function releaseSlot() {
  const next = waiting.shift();
  if (next) next();
  else active--;
}

/** Not cached by nginx (it caches 200/301/308/404), so a passing failure doesn't stick. */
function brandImage() {
  return new Response(null, { status: 302, headers: { location: DEFAULT_SHARE_IMAGE, "cache-control": "no-store" } });
}

async function toShareJpeg(source: URL): Promise<Uint8Array<ArrayBuffer> | null> {
  // No redirects: this route must never fetch from anywhere but the CDN.
  const res = await fetch(source, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok || Number(res.headers.get("content-length")) > MAX_SOURCE_BYTES) return null;
  const input = Buffer.from(await res.arrayBuffer());
  if (input.length > MAX_SOURCE_BYTES) return null;

  // Loaded here so a server without the native binary serves the brand image instead of erroring.
  const sharp = (await import("sharp")).default;
  const photo = sharp(input, { limitInputPixels: MAX_SOURCE_PIXELS });
  if ((await photo.metadata()).format === "svg") return null;

  const { data, info } = await photo
    .rotate()
    .resize(SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT, { fit: "cover" })
    .flatten({ background: "#ffffff" })
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (const quality of QUALITIES) {
    const jpeg = await sharp(data, { raw: info }).jpeg({ quality }).toBuffer();
    if (jpeg.length <= MAX_OUTPUT_BYTES) return new Uint8Array(jpeg);
  }
  return null;
}

/** GET /share-image/<CDN path>.jpg: that photo as a 1200x630 JPEG (nginx caches the result). */
export async function GET(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // A query string would be a new cache key for the same photo.
  if (search) return new Response(null, { status: 301, headers: { location: pathname } });

  const path = pathname.slice(SHARE_IMAGE_PATH.length);
  if (!path.startsWith("/") || !path.endsWith(".jpg")) return new Response("Not found", { status: 404 });
  // The path stays percent-encoded exactly as stored, so file names with spaces or "+" still match.
  const source = new URL(`${SPACE_IMAGE_CDN}${path.slice(0, -".jpg".length)}`);
  if (source.origin !== SPACE_IMAGE_CDN) return new Response("Not found", { status: 404 });

  if (!(await takeSlot())) return brandImage();
  try {
    const jpeg = await toShareJpeg(source);
    if (!jpeg) return brandImage();
    return new Response(jpeg, {
      headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" },
    });
  } catch (error) {
    console.error("[share-image]", source.pathname, error instanceof Error ? error.message : error);
    return brandImage();
  } finally {
    releaseSlot();
  }
}
