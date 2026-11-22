/**
 * The longitude the "List your space" form used to save on every listing (Anna Nagar, Chennai).
 * A listing that has it has no real pin, whatever its latitude.
 */
const OLD_FORM_DEFAULT_LNG = 80.204496;

export function isPlaceholderPin(longitude: unknown): boolean {
  return Math.abs(Number(longitude) - OLD_FORM_DEFAULT_LNG) < 1e-7;
}
