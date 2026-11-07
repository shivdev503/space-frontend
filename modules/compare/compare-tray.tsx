"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { compareStore, onCompareEvent, useCompareItems } from "@/lib/compare-store";
import { COMPARE_MAX, compareHref } from "@/lib/coworking-compare";
import { cn } from "@/utils/cn";

type Flight = { id: number; from: DOMRect; image: string };

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Height of a fixed bottom bar on the page (detail / home CTA bars, mobile only), so the tray sits above it. */
function useBottomBarOffset(pathname: string) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const measure = () => {
      const bar = document.querySelector<HTMLElement>("[data-bottom-bar]");
      setOffset(bar ? bar.offsetHeight : 0);
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);
  return offset;
}

function FlyingPhoto({ flight, onDone }: { flight: Flight; onDone: () => void }) {
  const [to, setTo] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Two frames: let the tray mount / the new slot render before measuring where to land.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const slots = document.querySelectorAll<HTMLElement>("[data-compare-slot='filled']");
        const target = slots[slots.length - 1];
        if (!target) {
          setTo(new DOMRect(window.innerWidth / 2 - 24, window.innerHeight - 80, 48, 48));
          return;
        }
        // The slot is still scaling in, so land on its full size around its centre.
        const r = target.getBoundingClientRect();
        const w = target.offsetWidth;
        const h = target.offsetHeight;
        setTo(new DOMRect(r.left + r.width / 2 - w / 2, r.top + r.height / 2 - h / 2, w, h));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  if (!to) return null;
  const { from } = flight;
  const arcTop = Math.min(from.top, to.top) - 60;

  return (
    <motion.img
      src={flight.image}
      alt=""
      aria-hidden
      className="pointer-events-none fixed z-[200] object-cover shadow-[0_24px_60px_rgba(15,23,42,0.35)]"
      initial={{ left: from.left, top: from.top, width: from.width, height: from.height, borderRadius: 18, opacity: 1 }}
      animate={{
        left: to.left,
        top: [from.top, arcTop, to.top],
        width: to.width,
        height: to.height,
        borderRadius: 12,
        opacity: [1, 1, 0.85],
      }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1], times: [0, 0.35, 1] }}
      onAnimationComplete={onDone}
    />
  );
}

export function CompareTray() {
  const items = useCompareItems();
  const pathname = usePathname() ?? "";
  const bottomOffset = useBottomBarOffset(pathname);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [notice, setNotice] = useState("");
  const shake = useAnimationControls();
  const pulse = useAnimationControls();

  useEffect(() => {
    let id = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = onCompareEvent((e) => {
      if (e.type === "fly") {
        setFlights((f) => [...f, { id: ++id, from: e.from, image: e.image }]);
        return;
      }
      setNotice(`You can compare up to ${COMPARE_MAX} spaces. Remove one to add another.`);
      void shake.start({ x: [0, -12, 12, -8, 8, -3, 0], transition: { duration: 0.5 } });
      clearTimeout(timer);
      timer = setTimeout(() => setNotice(""), 2600);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [shake]);

  const landed = (flightId: number) => {
    setFlights((f) => f.filter((x) => x.id !== flightId));
    void pulse.start({ scale: [1, 1.035, 1], transition: { duration: 0.35, ease: EASE_OUT } });
  };

  const hidden = pathname.startsWith("/coworking/compare");
  const count = items.length;
  const ready = count >= 2;
  const emptySlots = Math.max(0, COMPARE_MAX - count);
  const status = notice || (ready ? `${count} spaces selected` : "Add 1 more space to compare");

  return (
    <>
      <AnimatePresence>
        {!hidden && count > 0 ? (
          <motion.div
            key="tray"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ bottom: `calc(${bottomOffset}px + max(12px, env(safe-area-inset-bottom)))` }}
            className="fixed inset-x-3 z-[90] mx-auto max-w-[760px] sm:inset-x-6"
            role="region"
            aria-label="Compare spaces"
          >
            <motion.div animate={shake}>
              <motion.div
                animate={pulse}
                className="flex items-center gap-3 rounded-[22px] border border-black/[0.06] bg-white/95 p-2.5 pl-3 shadow-[0_18px_50px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:gap-4 sm:p-3 sm:pl-4"
              >
                <div className="flex min-w-0 shrink-0 items-center">
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.slug}
                        layout
                        data-compare-slot="filled"
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.18 } }}
                        transition={{ type: "spring", stiffness: 500, damping: 30, delay: flights.length ? 0.7 : 0 }}
                        className={cn(
                          "group relative h-10 w-10 shrink-0 sm:h-12 sm:w-12",
                          index > 0 && "-ml-3 sm:ml-2",
                        )}
                        style={{ zIndex: COMPARE_MAX - index }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          title={item.name}
                          className="h-full w-full rounded-xl object-cover ring-2 ring-white"
                        />
                        <button
                          type="button"
                          onClick={() => compareStore.remove(item.slug)}
                          aria-label={`Remove ${item.name}`}
                          className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 place-items-center rounded-full bg-ink text-white shadow-md transition group-hover:grid sm:grid sm:scale-0 sm:group-hover:scale-100"
                        >
                          <X className="h-3 w-3" strokeWidth={3} aria-hidden />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      aria-hidden
                      className="ml-2 hidden h-12 w-12 shrink-0 rounded-xl border-[1.5px] border-dashed border-slate-300 bg-slate-50 sm:block"
                    />
                  ))}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="hidden text-[13px] font-semibold text-ink sm:block">Compare spaces</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={status}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        "line-clamp-2 text-[12px] leading-snug sm:text-[12.5px]",
                        notice ? "font-semibold text-[#c2410c]" : "text-muted",
                      )}
                    >
                      {status}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => compareStore.clear()}
                  className="hidden shrink-0 rounded-full px-3 py-2 text-[13px] font-semibold text-ink underline-offset-4 transition hover:bg-slate-100 hover:underline sm:block"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => compareStore.clear()}
                  aria-label="Clear compare"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-slate-100 sm:hidden"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>

                <motion.div
                  key={ready ? "ready" : "wait"}
                  initial={ready ? { scale: 0.9 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="shrink-0"
                >
                  {ready ? (
                    <Link
                      href={compareHref(items.map((i) => i.slug))}
                      className="group inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#12b886,#0b9a6f)] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(18,184,134,0.35)] transition hover:shadow-[0_14px_30px_rgba(18,184,134,0.45)] sm:px-5"
                    >
                      Compare
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/25 px-1.5 text-[12px]">
                        {count}
                      </span>
                      <ArrowRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
                    </Link>
                  ) : (
                    <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-[14px] font-semibold text-slate-400 sm:px-5">
                      Compare
                    </span>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {flights.map((flight) => (
        <FlyingPhoto key={flight.id} flight={flight} onDone={() => landed(flight.id)} />
      ))}
    </>
  );
}
