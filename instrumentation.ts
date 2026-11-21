/**
 * Runs once when the server starts. Warms the city page link directory (it calls the API for
 * every area page) so the first visitors and crawlers after a deploy already get those links.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { warmCityDirectories } = await import("@/lib/city-directory");
  // Let the server start answering first; never fail startup over a cold API.
  setTimeout(() => void warmCityDirectories().catch(() => {}), 5000);
}
