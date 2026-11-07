"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Columns3, Heart, Link2, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ContactFormModal } from "@/components/contact/contact-form-modal";
import { COMPARE_MAX, compareHref, toCompareItem } from "@/lib/coworking-compare";
import { shortlistHref, shortlistStore, useShortlist } from "@/lib/shortlist-store";
import { CoworkingCard } from "@/modules/coworking/components/coworking-card";
import { workspaceCitySlugish } from "@/modules/coworking/components/coworking-detail-header";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { cn } from "@/utils/cn";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

function ShareMenu({ url, names }: { url: string; names: string[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const text = `Coworking spaces I shortlisted on SpaceWallah:\n${names.map((n) => `• ${n}`).join("\n")}\n\n${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1400);
    } catch {
      setOpen(false);
    }
  };

  const nativeShare = async () => {
    setOpen(false);
    try {
      await navigator.share({ title: "My coworking shortlist · SpaceWallah", text, url });
    } catch {
      // Share sheet dismissed.
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-ink transition hover:border-ink"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-[250px] origin-top-right overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.18)] ring-1 ring-black/5 sm:left-auto"
          >
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-ink transition hover:bg-slate-50"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366] text-white">
                <MessageCircle className="h-4 w-4" aria-hidden />
              </span>
              WhatsApp
            </a>
            <button
              type="button"
              onClick={copy}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-ink transition hover:bg-slate-50"
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full transition-colors",
                  copied ? "bg-[color:var(--color-brand)] text-white" : "bg-slate-100 text-ink",
                )}
              >
                {copied ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
              </span>
              {copied ? "Link copied" : "Copy link"}
            </button>
            {canNativeShare ? (
              <button
                type="button"
                onClick={nativeShare}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-ink transition hover:bg-slate-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink">
                  <Share2 className="h-4 w-4" aria-hidden />
                </span>
                More options
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="mx-auto mt-10 max-w-[520px] rounded-[28px] bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-10"
    >
      <motion.span
        initial={{ scale: 0.6, rotate: -12 }}
        animate={{ scale: [0.6, 1.15, 1], rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#fff1f3]"
      >
        <Heart className="h-7 w-7 fill-[#ff385c] text-[#ff385c]" aria-hidden />
      </motion.span>
      <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">Your shortlist is empty</h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
        Tap the <b className="text-ink">heart</b> on any coworking space to save it here. Then get quotes for all of them
        at once, or share the list with your team.
      </p>
      <Link
        href="/coworking"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-black"
      >
        Browse coworking spaces
      </Link>
    </motion.div>
  );
}

export function ShortlistView({
  workspaces,
  requestedSlugs,
}: {
  workspaces: CoworkingModel.WorkSpace[];
  requestedSlugs: string[];
}) {
  const router = useRouter();
  const saved = useShortlist();
  const savedSlugs = useMemo(() => saved.map((i) => i.slug), [saved]);
  const [hydrated, setHydrated] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  // Decided once on load: a link whose spaces are all in this visitor's shortlist is their own list;
  // anything else was shared with them. Un-hearting a card later must not flip this.
  const [own, setOwn] = useState(true);

  useEffect(() => {
    setHydrated(true);
    setOrigin(window.location.origin);
    const mine = new Set(shortlistStore.get().map((i) => i.slug));
    setOwn(requestedSlugs.every((s) => mine.has(s)));
  }, [requestedSlugs]);

  // "/coworking/shortlist" with no list in the URL: open the visitor's own shortlist.
  useEffect(() => {
    if (!hydrated || requestedSlugs.length) return;
    const own = shortlistStore.get().map((i) => i.slug);
    if (own.length) router.replace(shortlistHref(own), { scroll: false });
  }, [hydrated, requestedSlugs.length, router]);

  const isShared = hydrated && requestedSlugs.length > 0 && !own;

  // On your own list, un-hearting a space removes its card straight away.
  const visible = isShared ? workspaces : workspaces.filter((ws) => !hydrated || savedSlugs.includes(ws.slug));
  const visibleSlugs = visible.map((ws) => ws.slug);

  // Keep the address bar shareable as cards are removed, without a reload.
  useEffect(() => {
    if (!hydrated || isShared || !requestedSlugs.length || sameSet(visibleSlugs, requestedSlugs)) return;
    window.history.replaceState(null, "", shortlistHref(visibleSlugs));
  }, [hydrated, isShared, requestedSlugs, visibleSlugs]);

  const saveAll = () => {
    const have = new Set(shortlistStore.get().map((i) => i.slug));
    shortlistStore.replace([...shortlistStore.get(), ...workspaces.filter((ws) => !have.has(ws.slug)).map(toCompareItem)]);
    setOwn(true);
  };

  const names = visible.map((ws) => ws.name);
  const cities = [...new Set(visible.map((ws) => ws.location?.city?.name?.trim()).filter(Boolean))];
  const shareUrl = `${origin}${shortlistHref(visibleSlugs)}`;
  const n = visible.length;
  const waitingForRedirect = !requestedSlugs.length && (!hydrated || saved.length > 0);

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-36 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[40px]">
              {isShared ? "Shortlist shared with you" : "Your shortlist"}
            </h1>
            {n ? (
              <p className="mt-2 text-[14.5px] text-muted sm:text-[15.5px]">
                {n} coworking space{n === 1 ? "" : "s"}
                {cities.length ? ` in ${cities.join(" & ")}` : ""}
              </p>
            ) : null}
          </div>

          {n ? (
            <div className="flex flex-wrap items-center gap-2">
              {n >= 2 ? (
                <Link
                  href={compareHref(visibleSlugs.slice(0, COMPARE_MAX))}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-ink transition hover:border-ink"
                >
                  <Columns3 className="h-4 w-4" aria-hidden />
                  Compare{n > COMPARE_MAX ? ` first ${COMPARE_MAX}` : ""}
                </Link>
              ) : null}
              <ShareMenu url={shareUrl} names={names} />
              <motion.button
                type="button"
                onClick={() => setQuoteOpen(true)}
                whileTap={{ scale: 0.97 }}
                className="hidden items-center gap-2 rounded-full bg-[linear-gradient(135deg,#12b886,#0b9a6f)] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(18,184,134,0.32)] transition hover:shadow-[0_14px_30px_rgba(18,184,134,0.42)] sm:inline-flex"
              >
                Get quotes for all {n}
              </motion.button>
            </div>
          ) : null}
        </div>
      </motion.div>

      <AnimatePresence>
        {isShared && n ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#fff1f3] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="flex items-center gap-3 text-[14px] font-medium text-ink">
                <Heart className="h-5 w-5 shrink-0 fill-[#ff385c] text-[#ff385c]" aria-hidden />
                Someone shared these spaces with you. Save them to keep them in your own shortlist.
              </p>
              <motion.button
                type="button"
                onClick={saveAll}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-black"
              >
                Save all to my shortlist
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {waitingForRedirect ? null : n ? (
        <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((ws, i) => (
              <motion.div
                key={ws.slug}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: Math.min(i, 8) * 0.05 } }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
                className="min-w-0"
              >
                <CoworkingCard workspace={ws} className="h-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState />
      )}

      {/* Phones: the main action stays in reach. */}
      {n ? (
        <div
          data-bottom-bar
          className="fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(15,23,42,0.1)] backdrop-blur sm:hidden"
        >
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#12b886,#0b9a6f)] py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(18,184,134,0.32)]"
          >
            Get quotes for all {n} space{n === 1 ? "" : "s"}
          </button>
        </div>
      ) : null}

      {visible[0] ? (
        <ContactFormModal
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          leadTarget={{ city: workspaceCitySlugish(visible[0]), spaceId: "shortlist" }}
          submitLabel="Get Quotes"
          title={`Get quotes for ${n} space${n === 1 ? "" : "s"}`}
          subtitle="Share your details and we will send you the best prices for every space in your shortlist."
          interestedInDefault={`Shortlist quote: ${names.join(", ")}`.slice(0, 480)}
          mxSpaceType="Web Coworking"
          microlocation={visible[0].location?.micro_location?.name?.trim() || ""}
        />
      ) : null}
    </main>
  );
}
