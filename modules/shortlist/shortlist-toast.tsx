"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  onShortlistEvent,
  SHORTLIST_MAX,
  shortlistHref,
  shortlistStore,
  type ShortlistEvent,
} from "@/lib/shortlist-store";

type Toast = ShortlistEvent & { id: number };

/** "Saved to your shortlist · View" / "Removed · Undo", just under the site header. */
export function ShortlistToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let id = 0;
    const off = onShortlistEvent((e) => {
      setToast({ ...e, id: ++id });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 3800);
    });
    return () => {
      off();
      clearTimeout(timer.current);
    };
  }, []);

  const close = () => setToast(null);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[92px] z-[95] flex justify-center px-3">
      <AnimatePresence mode="popLayout">
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            role="status"
            className="pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-2xl bg-white p-2.5 pr-3 shadow-[0_18px_50px_rgba(15,23,42,0.2),0_2px_6px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
          >
            {toast.type === "full" ? (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff1f3]">
                <Heart className="h-5 w-5 fill-[#ff385c] text-[#ff385c]" aria-hidden />
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toast.item.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-ink">
                {toast.type === "saved"
                  ? "Saved to your shortlist"
                  : toast.type === "removed"
                    ? "Removed from shortlist"
                    : "Your shortlist is full"}
              </p>
              <p className="line-clamp-1 text-[12.5px] text-muted">
                {toast.type === "full" ? `You can save up to ${SHORTLIST_MAX} spaces.` : toast.item.name}
              </p>
            </div>
            {toast.type === "removed" ? (
              <button
                type="button"
                onClick={() => {
                  shortlistStore.add(toast.item);
                  close();
                }}
                className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold text-ink underline underline-offset-4 transition hover:bg-slate-100"
              >
                Undo
              </button>
            ) : (
              <Link
                href={shortlistHref(shortlistStore.get().map((i) => i.slug))}
                onClick={close}
                className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
              >
                View
              </Link>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
