import { isAxiosError } from "axios";

/**
 * True on the server when the API failed (outage, timeout, rejected credentials) instead of answering
 * 404. Rethrow these so the page returns 500: Google retries a 500, a false 404 drops a real page.
 */
export function isUpstreamFailure(error: unknown): boolean {
  if (typeof window !== "undefined") return false;
  return !(isAxiosError(error) && error.response?.status === 404);
}
