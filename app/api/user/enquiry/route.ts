import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { postUpstreamUserEnquiry } from "@/services/user-enquiry-upstream";
import { enquiryJwtCookieName } from "@/services/enquiry-user-session";

/**
 * `POST /api/user/enquiry` — proxies to the backend `createEnquiry` handler.
 * Forwards the `token` header from the httpOnly `ENQUIRY_JWT_COOKIE_NAME` cookie
 * (default `spacewallah_user_enquiry_jwt`) so `req.user` is populated upstream.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
    return NextResponse.json({ message: "JSON body is required" }, { status: 400 });
  }

  const jar = await cookies();
  const cookieName = enquiryJwtCookieName();
  const fromCookie = jar.get(cookieName)?.value?.trim();
  const fromHeader = request.headers.get("x-user-token")?.trim();
  const token = fromCookie || fromHeader;

  const result = await postUpstreamUserEnquiry(body, token);

  if (!result.ok) {
    const status = result.status >= 400 && result.status < 600 ? result.status : 502;
    const data = (
      result.data && typeof result.data === "object" && result.data !== null
        ? result.data
        : { message: "Upstream error" }
    ) as { message?: string; need_login?: boolean };
    if (status === 401) {
      return NextResponse.json(
        {
          ...data,
          need_login: data.need_login ?? !token,
          message: data.message || "Sign in required",
        },
        { status: 401 },
      );
    }
    return NextResponse.json(data, { status });
  }

  if (result.data && typeof result.data === "object" && result.data !== null) {
    return NextResponse.json(result.data as object, { status: 200 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
