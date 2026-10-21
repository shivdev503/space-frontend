/**
 * End-user session JWT for `POST /api/user/enquiry` (browser httpOnly cookie).
 * Set this cookie after your phone / Firebase (or other) `validate` flow.
 */

export const DEFAULT_ENQUIRY_JWT_COOKIE = "spacewallah_user_enquiry_jwt";

export function enquiryJwtCookieName(): string {
  const n = process.env.ENQUIRY_JWT_COOKIE_NAME?.trim();
  return n || DEFAULT_ENQUIRY_JWT_COOKIE;
}
