import { NextResponse } from "next/server";

import { uploadListingImage } from "@/services/listing-api";
import {
  clearListingCookies,
  getListingSession,
  respondListing,
} from "@/services/listing-session";

/**
 * Angular reference: `CoworkingserviceService.uploadImage(formData, headers)` →
 *   POST `{base}admin/upload` (multipart/form-data, field `file`)
 *   → `{ data: [{ id, s3_link }] }`
 *
 * This proxy authenticates via the `spacewallah_listing_token` cookie and
 * forwards the raw file bytes to the upstream. We rebuild a fresh
 * `FormData` to avoid ReadableStream reuse issues between Next's request
 * parsing and the outgoing fetch.
 *
 * Any 401 from the upstream (e.g. token minted against a different backend
 * origin) wipes the session cookies via `respondListing` so the client is
 * forced to re-authenticate on a clean slate.
 */
export async function POST(request: Request) {
  const session = await getListingSession();
  if (!session?.token) {
    const res = NextResponse.json(
      { message: "Please sign in to upload photos.", session_expired: true },
      { status: 401 },
    );
    return clearListingCookies(res);
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Expected multipart/form-data body" },
      { status: 400 },
    );
  }

  const file = incoming.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { message: "'file' field is required" },
      { status: 400 },
    );
  }

  const outgoing = new FormData();
  outgoing.append("file", file, file.name);

  const result = await uploadListingImage(outgoing, session.token);
  return respondListing(result);
}
