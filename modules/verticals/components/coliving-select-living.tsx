import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { cn } from "@/utils/cn";

const AVATAR_ADITI =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80";
const AVATAR_VIKRAM =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80";

const OPTION_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    alt: "Sunlit dining and living area in a verified coliving home",
  },
  {
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    alt: "Bright furnished lounge in a coliving residence",
  },
] as const;

const STATS = [
  { value: "2 hrs", label: "Average time to first shortlist" },
  { value: "₹0", label: "Brokerage, ever — even on long leases" },
  { value: "48 hr", label: "Typical sign-to-move-in window" },
] as const;

function ChatMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full rounded-[1.65rem] border border-slate-200/80 bg-white p-4 shadow-soft ring-1 ring-slate-900/[0.04] sm:p-5",
        className,
      )}
      role="region"
      aria-label="Example chat with a SpaceWallah Living concierge"
    >
      <div className="flex max-h-[min(32rem,70vh)] flex-col gap-5 overflow-y-auto pr-1 sm:gap-6">
        {/* Aditi 1 */}
        <div className="flex gap-2.5">
          <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100">
            <Image src={AVATAR_ADITI} alt="Aditi" fill className="object-cover" sizes="36px" />
          </div>
          <div className="min-w-0 max-w-[min(100%,20rem)] sm:max-w-[22rem]">
            <div className="rounded-2xl rounded-tl-md bg-[#ede8e0] px-3.5 py-3 text-sm leading-relaxed text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] sm:px-4">
              Hi! I&apos;m Aditi from the SpaceWallah Living desk. Tell me your city, budget, and move-in date
              I&apos;ll shortlist verified homes before we book any tours.
            </div>
            <p className="mt-1.5 text-[0.7rem] leading-snug text-muted">Aditi · 2:21 PM</p>
          </div>
        </div>

        {/* Vikram */}
        <div className="ml-auto flex max-w-[min(100%,20rem)] flex-row-reverse gap-2.5 sm:max-w-[22rem]">
          <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/30 bg-slate-800">
            <Image src={AVATAR_VIKRAM} alt="Vikram" fill className="object-cover" sizes="36px" />
          </div>
          <div className="min-w-0">
            <div className="rounded-2xl rounded-tr-md bg-[color:var(--color-accent)] px-3.5 py-3 text-sm leading-relaxed text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)] sm:px-4">
              Single occupancy in Koramangala, all-inclusive under ₹30k. Moving April 5. Prefer somewhere with a
              coworking floor on-site.
            </div>
            <p className="mt-1.5 text-right text-[0.7rem] leading-snug text-muted">Vikram · 2:22 PM</p>
          </div>
        </div>

        {/* Aditi 2 + images */}
        <div className="flex gap-2.5">
          <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100">
            <Image src={AVATAR_ADITI} alt="Aditi" fill className="object-cover" sizes="36px" />
          </div>
          <div className="min-w-0 max-w-[min(100%,20rem)] sm:max-w-[22rem]">
            <div className="overflow-hidden rounded-2xl rounded-tl-md bg-[#ede8e0] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <div className="px-3.5 py-3 text-sm leading-relaxed text-ink sm:px-4">
                Here are two operator-verified options. Both toured this month, all-inclusive, single rooms available
                from your date.
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-black/[0.04] px-2 pb-2 pt-2">
                {OPTION_IMAGES.map((img) => (
                  <div
                    key={img.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/[0.05]"
                  >
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="160px" />
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-1.5 text-[0.7rem] leading-snug text-muted">Aditi · 2:23 PM</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-200/80 pt-4">
        <span className="min-w-0 flex-1 truncate pl-1 text-sm text-muted">Type a message…</span>
        <button
          type="button"
          disabled
          className="shrink-0 cursor-default rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold text-white opacity-95 sm:text-sm"
          aria-label="Send (preview only — scroll down to the form to reach us)"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export function ColivingSelectLiving() {
  return (
    <section
      id="select-living"
      className="relative bg-[linear-gradient(180deg,#f5f1eb_0%,#f9f8f5_42%,rgba(255,255,255,0.97)_100%)] bg-hero-glow py-14 sm:py-20"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="min-w-0">
            <p className="inline-flex flex-wrap items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted sm:text-xs">
              <span className="h-px w-7 shrink-0 bg-gradient-to-r from-transparent via-slate-400/80 to-slate-400/80" aria-hidden />
              <span className="text-brand">SpaceWallah Select</span>
              <span className="font-normal text-slate-400/90">·</span>
              <span>Living</span>
            </p>

            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:mt-5 sm:text-4xl sm:leading-[1.06] lg:text-[2.4rem] lg:leading-[1.05]">
              A real human, on the phone,{" "}
              <span className="font-serif text-[1.06em] font-semibold italic text-[color:var(--color-accent)]">
                helping you move
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">
              Tell us your city, budget, and timeline and a Living specialist shortlists verified coliving and PG
              options, confirms what&apos;s included, and helps you tour with confidence. Same Select rigor you know
              from workspace search.
            </p>

            <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="#lead-form"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-accent)] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_14px_36px_-10px_rgba(46,125,50,0.45)] transition hover:opacity-[0.94] active:scale-[0.99] sm:w-auto"
              >
                Talk to a concierge
                <ArrowRight className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
              </Link>
              <Link
                href="#why-spacewallah-living"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300/90 bg-white/70 px-6 py-3.5 text-center text-sm font-semibold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm transition hover:border-slate-400 hover:bg-white sm:w-auto"
              >
                How Select works
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-8 border-t border-slate-200/60 pt-10 sm:mt-14 sm:grid-cols-3 sm:gap-6 sm:pt-12">
              {STATS.map((s) => (
                <div key={s.value} className="min-w-0">
                  <dt className="font-serif text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-[2rem] lg:text-4xl">
                    {s.value}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <ChatMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}
