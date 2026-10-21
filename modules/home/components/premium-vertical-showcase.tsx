"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, Building2, Home, Landmark, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type VerticalId = "coworking" | "office-space" | "virtual-office" | "coliving";

/** Long enough that the ~1.5s image crossfade can finish before the next tick feels rushed. */
const ROTATE_MS = 6400;

/** Slow, seamless highlight glide between stack items (shared layout). */
const STACK_HIGHLIGHT_TRANSITION = {
  duration: 1.05,
  ease: [0.16, 1, 0.3, 1] as const,
};

/** Image crossfade: long overlap, no harsh slide — matches stack pacing. */
const IMAGE_CROSSFADE_EASE = [0.16, 1, 0.3, 1] as const;
const IMAGE_LAYER_TRANSITION = {
  duration: 1.5,
  ease: IMAGE_CROSSFADE_EASE,
};
const IMAGE_KEN_BURNS_TRANSITION = {
  duration: 2.1,
  ease: IMAGE_CROSSFADE_EASE,
};

const VERTICALS: {
  id: VerticalId;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  Icon: typeof Users;
}[] = [
  {
    id: "coworking",
    title: "Coworking Space",
    description: "Flexible desks and shared spaces for teams that move fast.",
    href: "/coworking",
    imageSrc:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Modern coworking interior",
    Icon: Users,
  },
  {
    id: "office-space",
    title: "Managed Office",
    description: "Private offices and suites sized for how you work today.",
    href: "/managed-office",
    imageSrc:
      "https://img.spacewallah.com/images/original/29f7c32fae7798c9733f5b891af3e0ded7031a85.jpg",
    imageAlt: "Corporate office setup",
    Icon: Building2,
  },
  {
    id: "virtual-office",
    title: "Virtual Office",
    description: "Professional address and mail handling without a full-time desk.",
    href: "/virtual-office",
    imageSrc:
      "https://img.spacewallah.com/images/original/475b4b5ecc2f03baf8973403555fb8167ca0c4fb.jpg",
    imageAlt: "Remote work and business desk concept",
    Icon: Landmark,
  },
  {
    id: "coliving",
    title: "Coliving Space",
    description: "Furnished rooms and managed stays for students and professionals.",
    href: "/coliving",
    imageSrc:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Bright furnished coliving bedroom",
    Icon: Home,
  },
];

function nextId(current: VerticalId): VerticalId {
  const idx = VERTICALS.findIndex((v) => v.id === current);
  const nextIndex = (idx + 1) % VERTICALS.length;
  return VERTICALS[nextIndex]?.id ?? "coworking";
}

export function PremiumVerticalShowcase() {
  const [activeId, setActiveId] = useState<VerticalId>("coworking");
  const [isPaused, setIsPaused] = useState(false);

  const active = useMemo(
    () => VERTICALS.find((v) => v.id === activeId) ?? VERTICALS[0],
    [activeId],
  );

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = window.setInterval(() => {
      setActiveId((prev) => nextId(prev));
    }, ROTATE_MS);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPaused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mobile: only show the vertical stacks (no image) */}
      <div className="lg:hidden">
        <div
          className={cn(
            "rounded-3xl border border-black/[0.06] p-3 shadow-[0_22px_56px_rgba(15,23,42,0.08)]",
            "bg-[#f9f8f5d9] supports-[backdrop-filter]:backdrop-blur-[16px]",
          )}
          aria-label="Workspace verticals"
        >
          {VERTICALS.map((item, index) => (
            <div
              key={item.id}
              className={cn("relative", index > 0 && "border-t border-black/[0.06]")}
            >
              <Link
                href={item.href}
                className={cn(
                  "relative flex w-full gap-4 rounded-2xl px-5 py-5 text-left outline-none",
                  "transition-colors duration-300 ease-out",
                  "focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9f8f5d9]",
                  "hover:bg-white/35",
                )}
              >
                <span
                  className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-ink/80"
                  aria-hidden
                >
                  <item.Icon className="h-6 w-6 stroke-[1.5]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-semibold tracking-[-0.02em] text-ink">
                    {item.title}
                  </span>
                  <span className="mt-1.5 block text-base leading-relaxed text-muted">
                    {item.description}
                  </span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 overflow-visible lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-8 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-10">
        {/* Right (mobile top): Image — wider track + slight bleed into section padding */}
        <div className="order-1 hidden min-w-0 lg:order-2 lg:block lg:-mr-4 lg:w-[calc(100%+1rem)] lg:max-w-none xl:-mr-10 xl:w-[calc(100%+2.5rem)]">
          <div className="relative min-h-[min(78vw,32rem)] w-full overflow-hidden rounded-3xl bg-[#eae7df] shadow-[0_24px_64px_rgba(15,23,42,0.14)] lg:min-h-[38rem] xl:min-h-[42rem]">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={active.id}
              className="absolute inset-0"
              style={{ willChange: "opacity, transform" }}
              initial={{ opacity: 0, scale: 1.045 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={IMAGE_LAYER_TRANSITION}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={IMAGE_KEN_BURNS_TRANSITION}
              >
                <Image
                  src={active.imageSrc}
                  alt={active.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 72vw, 75vw"
                  priority={activeId === "coworking"}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0)_35%,rgba(0,0,0,0.28)_100%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.08),rgba(0,0,0,0)_55%)]"
            aria-hidden
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Premium inventory curated for{" "}
            <span className="font-medium text-ink">{active.title.toLowerCase()}</span>.
          </p>
          <Button href={active.href} variant="secondary" className="shrink-0 gap-2">
            Explore
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        </div>

        {/* Left: Picker (overlaps onto the image — ~30% of stack width shifted right on lg+) */}
        <div className="order-2 hidden min-w-0 lg:order-1 lg:block lg:overflow-visible">
          <div className="relative w-full max-w-none lg:z-10 lg:w-[32rem] lg:translate-x-[15%] xl:w-[36rem] xl:translate-x-[15%]">
            <LayoutGroup id="premium-vertical-stack">
              <div
                className={cn(
                  "rounded-3xl border border-black/[0.06] p-3 shadow-[0_22px_56px_rgba(15,23,42,0.08)] sm:p-3.5",
                  "bg-[#f9f8f5d9] supports-[backdrop-filter]:backdrop-blur-[16px]",
                )}
                role="tablist"
                aria-label="Workspace verticals"
              >
                {VERTICALS.map((item, index) => {
                  const isActive = item.id === activeId;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "relative",
                        index > 0 && "border-t border-black/[0.06]",
                      )}
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={cn(
                          "relative flex w-full gap-5 rounded-2xl px-5 py-5 text-left outline-none sm:px-6 sm:py-5",
                          "transition-colors duration-[1050ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                          "focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9f8f5d9]",
                          !isActive && "hover:bg-white/35",
                        )}
                        onMouseEnter={() => setActiveId(item.id)}
                        onFocus={() => setActiveId(item.id)}
                        onClick={() => setActiveId(item.id)}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="premium-vertical-active-pill"
                            className="absolute inset-0 -z-10 rounded-2xl bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.05]"
                            transition={STACK_HIGHLIGHT_TRANSITION}
                          />
                        )}
                        <span
                          className={cn(
                            "mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-opacity duration-[1050ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                            isActive ? "text-ink" : "text-ink/80",
                          )}
                          aria-hidden
                        >
                          <item.Icon className="h-6 w-6 stroke-[1.5]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-lg font-semibold tracking-[-0.02em] text-ink sm:text-xl">
                            {item.title}
                          </span>
                          <span className="mt-1.5 block text-base leading-relaxed text-muted sm:text-[1.05rem]">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

