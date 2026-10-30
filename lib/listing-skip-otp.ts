/**
 * Host login settings for list-your-space.
 *
 * "Continue with Google" is the main login. The mobile number + OTP form is kept as a backup
 * and only shown when NEXT_PUBLIC_ENABLE_OTP_LOGIN=true (turn it on once MSG91 SMS works).
 */

/** Client: show the mobile number + OTP form next to Google. */
export function isListingPhoneLoginEnabledPublic(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_OTP_LOGIN?.trim().toLowerCase() === "true";
}

/**
 * When true, list-your-space skips the OTP step and completes vendor auth server-side with
 * {@link listingBypassOtp}. Only for local testing: anyone who knows a host's number could
 * sign in as them, so it is off unless LISTING_SKIP_OTP=true.
 */
export function isListingOtpSkipped(): boolean {
  return process.env.LISTING_SKIP_OTP?.trim().toLowerCase() === "true";
}

/** OTP sent to upstream when {@link isListingOtpSkipped} (dev/staging bypass). */
export function listingBypassOtp(): string {
  return process.env.LISTING_BYPASS_OTP?.trim() || "000000";
}

/** Client mirror of {@link isListingOtpSkipped}. */
export function isListingOtpSkippedPublic(): boolean {
  return process.env.NEXT_PUBLIC_LISTING_SKIP_OTP?.trim().toLowerCase() === "true";
}
