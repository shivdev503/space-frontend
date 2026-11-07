"use client";

import type { CompareItem } from "@/lib/coworking-compare";
import { createSavedListStore } from "@/lib/saved-list-store";

/** Most spaces a user can keep in their shortlist. */
export const SHORTLIST_MAX = 30;

export const shortlistStore = createSavedListStore<CompareItem>("sw-shortlist-v1", SHORTLIST_MAX);

export function useShortlist(): CompareItem[] {
  return shortlistStore.useItems();
}

/** `/coworking/shortlist?spaces=a,b,c`; the list lives in the URL so it can be shared. */
export function shortlistHref(slugs: string[]): string {
  return slugs.length ? `/coworking/shortlist?spaces=${slugs.map(encodeURIComponent).join(",")}` : "/coworking/shortlist";
}

/* ---- toast events: "Saved to your shortlist" / "Removed" with undo ---- */

export type ShortlistEvent =
  | { type: "saved"; item: CompareItem }
  | { type: "removed"; item: CompareItem }
  | { type: "full" };

const listeners = new Set<(e: ShortlistEvent) => void>();

export function emitShortlistEvent(event: ShortlistEvent) {
  listeners.forEach((l) => l(event));
}

export function onShortlistEvent(listener: (e: ShortlistEvent) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Toggle a space in the shortlist and announce it (for the toast). */
export function toggleShortlist(item: CompareItem) {
  if (shortlistStore.has(item.slug)) {
    shortlistStore.remove(item.slug);
    emitShortlistEvent({ type: "removed", item });
    return;
  }
  const result = shortlistStore.add(item);
  emitShortlistEvent(result === "full" ? { type: "full" } : { type: "saved", item });
}
