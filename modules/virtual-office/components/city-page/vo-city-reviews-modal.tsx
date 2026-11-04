"use client";

import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type VoCityReviewsModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function VoCityReviewsModal({ open, onClose, title, children }: VoCityReviewsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[rgba(20,20,20,0.55)] backdrop-blur-[3px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[24px] bg-[#F5F9F7] sm:rounded-[24px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#E2EBE7] bg-white px-6 py-5">
          <h2 className="vo-display text-[1.35rem] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reviews"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F5F9F7] text-ink transition hover:bg-[#E3F5EC]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="grid gap-4 overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
