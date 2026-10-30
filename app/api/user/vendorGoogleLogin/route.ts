import { NextResponse } from "next/server";

import { jsonWithVendorSession } from "@/lib/listing-vendor-auth-response";
import { vendorGoogleLogin } from "@/services/listing-api";

/**
 * "Continue with Google" on list-your-space. Forwards the Google ID token to the backend,
 * which verifies it with Google. Returns `needs_phone` for a new host, otherwise sets the
 * same listing session cookies as the OTP login.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as null | {
    credential?: string;
    name?: string;
    phone_number?: string;
  };

  const credential = String(body?.credential ?? "").trim();
  if (!credential) {
    return NextResponse.json({ message: "Google sign-in failed. Please try again." }, { status: 400 });
  }

  const phone = String(body?.phone_number ?? "").replace(/\D/g, "").slice(-10);
  const result = await vendorGoogleLogin({
    credential,
    name: String(body?.name ?? "").trim() || undefined,
    phone_number: phone || undefined,
    dial_code: phone ? "+91" : undefined,
  });

  if (!result.ok || !result.data) {
    return NextResponse.json(result.data ?? { message: result.message }, { status: result.status || 502 });
  }

  if (result.data.needs_phone) {
    return NextResponse.json({ needs_phone: true, profile: result.data.profile ?? {} });
  }

  const { token, data: user } = result.data;
  if (!token || !user) {
    return NextResponse.json({ message: "Google sign-in failed. Please try again." }, { status: 502 });
  }
  return jsonWithVendorSession(user, token);
}
