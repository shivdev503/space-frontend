const DEFAULT_TTL_MS = 60 * 60 * 1000;

/**
 * Memoize an async loader in memory (per server instance) for `ttlMs`.
 * Concurrent callers share one in-flight promise; failures are not cached.
 */
export function cachedLoader<T>(load: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): () => Promise<T> {
  let entry: { at: number; promise: Promise<T> } | null = null;
  return () => {
    if (entry && Date.now() - entry.at < ttlMs) return entry.promise;
    const promise = load();
    entry = { at: Date.now(), promise };
    promise.catch(() => {
      if (entry?.promise === promise) entry = null;
    });
    return promise;
  };
}
