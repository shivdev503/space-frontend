"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import type { RefObject } from "react";

import { compareStore, emitCompareEvent, useCompareItems } from "@/lib/compare-store";
import type { CompareItem } from "@/lib/coworking-compare";
import { cn } from "@/utils/cn";

/**
 * Adds / removes a space from the compare tray. On add, the photo in `flyFrom` (or the button)
 * flies into the tray so the user sees where it went.
 */
export function CompareToggle({
  item,
  flyFrom,
  variant = "overlay",
  className,
}: {
  item: CompareItem;
  flyFrom?: RefObject<HTMLElement | null>;
  variant?: "overlay" | "button";
  className?: string;
}) {
  const selected = useCompareItems().some((i) => i.slug === item.slug);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      compareStore.remove(item.slug);
      return;
    }
    const result = compareStore.add(item);
    if (result === "full") {
      emitCompareEvent({ type: "full" });
      return;
    }
    const from = (flyFrom?.current ?? e.currentTarget).getBoundingClientRect();
    emitCompareEvent({ type: "fly", from, image: item.image });
  };

  const icon = (
    <span
      className={cn(
        "relative grid place-items-center rounded-full transition-colors duration-300",
        variant === "overlay" ? "h-[18px] w-[18px]" : "h-5 w-5",
        selected
          ? "bg-[color:var(--color-brand)] text-white"
          : "border-[1.5px] border-slate-400 bg-white text-transparent",
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {selected ? (
          <motion.span
            key="on"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
          >
            <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />
          </motion.span>
        ) : variant === "button" ? (
          <motion.span key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Plus className="h-3 w-3 text-slate-500" strokeWidth={3} aria-hidden />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );

  if (variant === "button") {
    return (
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.95 }}
        aria-pressed={selected}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors duration-300",
          selected
            ? "border-[color:var(--color-brand)] bg-[#EDF7EE] text-[#1f6e3a]"
            : "border-slate-300 bg-white text-ink hover:border-slate-900",
          className,
        )}
      >
        {icon}
        {selected ? "Added to compare" : "Add to compare"}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${item.name} from compare` : `Compare ${item.name}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-[12px] font-semibold shadow-[0_6px_18px_rgba(15,23,42,0.16)] backdrop-blur-md transition-colors duration-300 sm:text-[12.5px]",
        selected ? "bg-white text-ink" : "bg-white/90 text-ink hover:bg-white",
        className,
      )}
    >
      {icon}
      <span>{selected ? "Comparing" : "Compare"}</span>
    </motion.button>
  );
}
