"use client";

import { COMPARE_MAX, type CompareItem } from "@/lib/coworking-compare";
import { createSavedListStore } from "@/lib/saved-list-store";

export const compareStore = createSavedListStore<CompareItem>("sw-compare-v1", COMPARE_MAX);

export function useCompareItems(): CompareItem[] {
  return compareStore.useItems();
}

/* ---- one-off UI events: the "fly into the tray" animation and the "tray is full" nudge ---- */

export type CompareEvent =
  | { type: "fly"; from: DOMRect; image: string }
  | { type: "full" };

const eventListeners = new Set<(e: CompareEvent) => void>();

export function emitCompareEvent(event: CompareEvent) {
  eventListeners.forEach((l) => l(event));
}

export function onCompareEvent(listener: (e: CompareEvent) => void) {
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
}
