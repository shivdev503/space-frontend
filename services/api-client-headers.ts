/**
 * Shared headers for upstream SpaceWallah API calls.
 *
 * Backend expects **both**:
 * - `x-client-key` — `NEXT_PUBLIC_API_KEY` / `API_KEY`
 * - `x-client-secret` — `NEXT_PUBLIC_API_SECRET` / `API_SECRET`
 */

export function resolveApiClientKey(): string | undefined {
  const key =
    process.env.NEXT_PUBLIC_API_KEY?.trim() ||
    process.env.VITE_PUBLIC_API_KEY?.trim() ||
    process.env.API_KEY?.trim();
  return key || undefined;
}

export function resolveApiClientSecret(): string | undefined {
  const secret =
    process.env.NEXT_PUBLIC_API_SECRET?.trim() ||
    process.env.VITE_PUBLIC_API_SECRET?.trim() ||
    process.env.API_SECRET?.trim();
  return secret || undefined;
}

function applyApiClientAuthHeaders(headers: Record<string, string>): void {
  const clientKey = resolveApiClientKey();
  const clientSecret = resolveApiClientSecret();
  if (clientKey) headers["x-client-key"] = clientKey;
  if (clientSecret) headers["x-client-secret"] = clientSecret;
}

export function buildApiClientHeaders(
  extra?: Record<string, string | undefined>,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  applyApiClientAuthHeaders(headers);

  if (extra) {
    for (const [name, value] of Object.entries(extra)) {
      if (value !== undefined) headers[name] = value;
    }
  }

  return headers;
}

/** For `FormData` uploads — do not set `Content-Type` (fetch sets multipart boundary). */
export function buildApiClientHeadersMultipart(
  extra?: Record<string, string | undefined>,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  applyApiClientAuthHeaders(headers);

  if (extra) {
    for (const [name, value] of Object.entries(extra)) {
      if (value !== undefined) headers[name] = value;
    }
  }

  return headers;
}
