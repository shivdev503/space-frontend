const DEFAULT_TTL_MS = 60 * 60 * 1000;
/** After a failed refresh, wait this long before trying again (the last good value is served meanwhile). */
const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;
/** With no good value yet, a failed load is retried after this long instead of on the next request. */
const RETRY_WITHOUT_DATA_MS = 60 * 1000;

type Entry<T> = {
  /** When the current value (or in-flight load) started; it is fresh for `ttlMs` from here. */
  at: number;
  promise: Promise<T>;
  /** Last value that loaded successfully, served while a refresh is failing. */
  lastGood?: { value: T };
};

/**
 * Loaders with a `key` keep their entry on `globalThis`: Next.js bundles route handlers, pages and
 * instrumentation separately, and each bundle would otherwise load (and pay for) its own copy.
 */
const SHARED_KEY = Symbol.for("spacewallah.cachedLoaders");
const shared: Map<string, Entry<unknown>> = ((globalThis as Record<symbol, Map<string, Entry<unknown>> | undefined>)[
  SHARED_KEY
] ??= new Map());

/**
 * Memoize an async loader in memory (per server instance) for `ttlMs`.
 * Concurrent callers share one in-flight promise. A failed refresh never discards the last good
 * value: callers get that copy and the next attempt waits `RETRY_AFTER_FAILURE_MS`, so an API that
 * is down or slow isn't asked again on every request. With no good value yet, callers get the error
 * for `RETRY_WITHOUT_DATA_MS` before the next attempt.
 */
export function cachedLoader<T>(load: () => Promise<T>, ttlMs = DEFAULT_TTL_MS, key?: string): () => Promise<T> {
  let local: Entry<T> | undefined;
  const read = (): Entry<T> | undefined => (key ? (shared.get(key) as Entry<T> | undefined) : local);
  const write = (entry: Entry<T>) => {
    if (key) shared.set(key, entry as Entry<unknown>);
    else local = entry;
  };

  return () => {
    const current = read();
    if (current && Date.now() - current.at < ttlMs) return current.promise;

    const lastGood = current?.lastGood;
    const entry: Entry<T> = { at: Date.now(), promise: Promise.resolve() as Promise<T>, lastGood };
    entry.promise = load().then(
      (value) => {
        entry.lastGood = { value };
        return value;
      },
      (error: unknown) => {
        if (read() === entry) {
          if (lastGood) {
            // Keep serving the last good copy; try again after a pause instead of on the next request.
            write({ at: Date.now() - ttlMs + RETRY_AFTER_FAILURE_MS, promise: Promise.resolve(lastGood.value), lastGood });
          } else {
            // Nothing to fall back to: fail fast for a minute rather than retrying on every request.
            const failed = Promise.reject(error) as Promise<T>;
            failed.catch(() => {});
            write({ at: Date.now() - ttlMs + RETRY_WITHOUT_DATA_MS, promise: failed });
          }
        }
        if (lastGood) return lastGood.value;
        throw error;
      },
    );
    write(entry);
    return entry.promise;
  };
}
