"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { verticals } from "@/utils/constants";
import { cn } from "@/utils/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

type MobileMenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  listYourSpaceHref: string;
  pathname: string;
};

function isVerticalActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileMenuDrawer({
  open,
  onClose,
  listYourSpaceHref,
  pathname,
}: MobileMenuDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const panelDuration = reduceMotion ? 0.01 : 0.44;
  const backdropDuration = reduceMotion ? 0.01 : 0.32;
  const stagger = reduceMotion ? 0 : 0.055;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-[3px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: backdropDuration, ease: EASE }}
            onClick={onClose}
          />

          <motion.div
            id="site-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed inset-y-0 right-0 z-[100] flex w-full flex-col bg-[#fafaf8] shadow-[-28px_0_80px_rgba(15,23,42,0.16)] lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: panelDuration, ease: EASE }}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <Link href="/" onClick={onClose} className="flex items-center">
                <Image
                  src="/spacewallah-logo-color.svg"
                  alt="SpaceWallah"
                  width={168}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white text-ink shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-6">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
                Explore
              </p>

              <ul className="mt-5 flex flex-col gap-1">
                {verticals.map((vertical, index) => {
                  const active = isVerticalActive(pathname, vertical.href);
                  return (
                    <motion.li
                      key={vertical.key}
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{
                        duration: reduceMotion ? 0.01 : 0.38,
                        delay: reduceMotion ? 0 : 0.1 + index * stagger,
                        ease: EASE,
                      }}
                    >
                      <Link
                        href={vertical.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-start justify-between gap-4 rounded-2xl px-4 py-4 transition",
                          active
                            ? "bg-white shadow-[0_8px_28px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/80"
                            : "hover:bg-white/80",
                        )}
                      >
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block font-display text-[1.125rem] font-semibold leading-snug tracking-tight",
                              active ? "text-ink" : "text-ink/90",
                            )}
                          >
                            {vertical.label}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted line-clamp-2">
                            {vertical.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
                            active
                              ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]"
                              : "border-slate-200/90 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-ink",
                          )}
                          aria-hidden
                        >
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              className="shrink-0 border-t border-slate-200/70 bg-white/60 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{
                duration: reduceMotion ? 0.01 : 0.36,
                delay: reduceMotion ? 0 : 0.28,
                ease: EASE,
              }}
            >
              <p className="text-sm text-muted">Own a workspace or coliving property?</p>
              <Link
                href={listYourSpaceHref}
                onClick={onClose}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,23,42,0.22)] transition hover:bg-slate-800"
              >
                List Your Space
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
