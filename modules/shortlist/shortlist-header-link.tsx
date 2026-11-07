"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";

import { shortlistHref, useShortlist } from "@/lib/shortlist-store";
import { cn } from "@/utils/cn";

/** Heart with a count in the site header; only shown once something is shortlisted. */
export function ShortlistHeaderLink({ solid }: { solid: boolean }) {
  const items = useShortlist();
  const count = items.length;

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
          <Link
            href={shortlistHref(items.map((i) => i.slug))}
            aria-label={`Your shortlist, ${count} space${count === 1 ? "" : "s"}`}
            className={cn(
              "relative inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-[14px] font-semibold transition",
              solid
                ? "border-slate-200/90 bg-white text-ink shadow-[0_6px_20px_rgba(15,23,42,0.08)] hover:bg-slate-50"
                : "border-[#f0e8d8]/40 bg-[rgba(22,18,14,0.32)] text-[#faf6ee] backdrop-blur-md hover:bg-[rgba(32,26,20,0.48)]",
            )}
          >
            <Heart className="h-[18px] w-[18px] fill-[#ff385c] text-[#ff385c]" aria-hidden />
            <span className="hidden 2xl:inline">Shortlist</span>
            <motion.span
              key={count}
              initial={{ scale: 1.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ff385c] px-1.5 text-[11px] font-bold text-white"
            >
              {count}
            </motion.span>
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
