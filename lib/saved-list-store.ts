"use client";

import { useSyncExternalStore } from "react";

/**
 * A small list of spaces kept in localStorage and shared by every component on the page
 * (and across tabs). Used by the compare tray and the shortlist.
 */
export type SavedListStore<T extends { slug: string }> = {
  subscribe: (listener: () => void) => () => void;
  get: () => T[];
  has: (slug: string) => boolean;
  add: (item: T) => "added" | "exists" | "full";
  remove: (slug: string) => void;
  clear: () => void;
  replace: (next: T[]) => void;
  useItems: () => T[];
};

export function createSavedListStore<T extends { slug: string; name: string }>(
  storageKey: string,
  max: number,
): SavedListStore<T> {
  const empty: T[] = [];
  let items: T[] = empty;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T[] => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed)
        ? parsed.filter((i) => i && typeof i.slug === "string" && typeof i.name === "string").slice(0, max)
        : empty;
    } catch {
      return empty;
    }
  };

  const ensureLoaded = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    items = read();
  };

  const notify = () => listeners.forEach((l) => l());

  const commit = (next: T[]) => {
    items = next;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Private mode / storage blocked: the list still works for this page view.
    }
    notify();
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key !== storageKey) return;
    items = read();
    notify();
  };

  const store: SavedListStore<T> = {
    subscribe(listener) {
      ensureLoaded();
      if (!listeners.size) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) window.removeEventListener("storage", onStorage);
      };
    },
    get() {
      ensureLoaded();
      return items;
    },
    has: (slug) => store.get().some((i) => i.slug === slug),
    add(item) {
      const current = store.get();
      if (current.some((i) => i.slug === item.slug)) return "exists";
      if (current.length >= max) return "full";
      commit([...current, item]);
      return "added";
    },
    remove: (slug) => commit(store.get().filter((i) => i.slug !== slug)),
    clear: () => commit(empty),
    replace: (next) => commit(next.slice(0, max)),
    // eslint-disable-next-line react-hooks/rules-of-hooks -- a hook bound to this store
    useItems: () => useSyncExternalStore(store.subscribe, store.get, () => empty),
  };
  return store;
}
