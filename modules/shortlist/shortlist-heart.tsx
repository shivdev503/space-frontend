"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

import type { CompareItem } from "@/lib/coworking-compare";
import { toggleShortlist, useShortlist } from "@/lib/shortlist-store";
import { cn } from "@/utils/cn";

const HEART_RED = "#ff385c";
const BURST_DOTS = 7;

/** Ring + dots that pop out of the heart when a space is saved. */
function Burst() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: HEART_RED }}
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
      {Array.from({ length: BURST_DOTS }).map((_, i) => {
        const angle = (i / BURST_DOTS) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: i % 2 ? HEART_RED : "#ffb400", marginLeft: -3, marginTop: -3 }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(angle) * 26, y: Math.sin(angle) * 26, scale: 0.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </span>
  );
}

export function ShortlistHeart({
  item,
  variant = "overlay",
  className,
}: {
  item: CompareItem;
  variant?: "overlay" | "button";
  className?: string;
}) {
  const saved = useShortlist().some((i) => i.slug === item.slug);
  const [burst, setBurst] = useState(0);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!saved) setBurst((b) => b + 1);
    toggleShortlist(item);
  };

  const heart = (
    <span className="relative grid place-items-center">
      <motion.span
        key={saved ? `on-${burst}` : "off"}
        initial={saved ? { scale: 0.6 } : false}
        animate={{ scale: saved ? [0.6, 1.3, 0.95, 1] : 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="grid place-items-center"
      >
        <Heart
          className={cn(variant === "overlay" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-[18px] w-[18px]", "transition-colors duration-200")}
          style={saved ? { fill: HEART_RED, color: HEART_RED } : undefined}
          strokeWidth={2.2}
          aria-hidden
        />
      </motion.span>
      <AnimatePresence>{saved && burst ? <Burst key={burst} /> : null}</AnimatePresence>
    </span>
  );

  if (variant === "button") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors duration-300",
          saved ? "border-[#ffc2cd] bg-[#fff1f3] text-[#d0103a]" : "border-slate-300 bg-white text-ink hover:border-slate-900",
          className,
        )}
      >
        {heart}
        {saved ? "Shortlisted" : "Shortlist"}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${item.name} from shortlist` : `Shortlist ${item.name}`}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur transition hover:scale-105 sm:h-10 sm:w-10",
        className,
      )}
    >
      {heart}
    </motion.button>
  );
}
