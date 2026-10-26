"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import type { VerticalLandingData } from "@/types";
import { cn } from "@/utils/cn";

const TRUSTED_CITIES = [
  { label: "Bangalore", slug: "bangalore" },
  { label: "Gurugram", slug: "gurgaon" },
  { label: "Mumbai", slug: "mumbai" },
  { label: "Hyderabad", slug: "hyderabad" },
  { label: "Pune", slug: "pune" },
  { label: "Noida", slug: "noida" },
] as const;

const FEATURE_PILLS = [
  { dot: "bg-blue-600", text: "10000+ coliving & PG options" },
  { dot: "bg-amber-500", text: "Move-in in 48 hours" },
  { dot: "bg-emerald-600/90", text: "Zero brokerage" },
] as const;

type ColivingHeroProps = {
  data: VerticalLandingData;
};

export function ColivingHero({ data }: ColivingHeroProps) {
  const heroImage = data.hero.image;
  const heroImageLabel = data.hero.imageLabel;

  return (
    <section className="relative overflow-hidden bg-[#f9f8f5] bg-hero-glow pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-24 lg:pt-14">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[min(52rem,90vh)] w-[min(48rem,70vw)] rounded-full bg-[radial-gradient(circle_at_center,rgba(76,175,80,0.07)_0%,transparent_68%)]"
        aria-hidden
      />
      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 xl:gap-14">
          <div className="min-w-0">
            <FadeIn>
              <p className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted sm:text-[0.72rem]">
                <span className="h-px w-7 bg-gradient-to-r from-transparent via-slate-400/80 to-slate-400/80" aria-hidden />
                <span className="text-[color:var(--color-accent)]/90">Premium coliving</span>
                <span className="font-normal text-slate-400/90">·</span>
                <span>Verified PG</span>
              </p>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h1 className="mt-4 max-w-[22ch] font-display text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.038em] text-ink sm:mt-5 sm:max-w-none sm:text-4xl sm:leading-[1.07] lg:mt-6 lg:text-[2.65rem] lg:leading-[1.06] xl:text-[2.85rem] xl:leading-[1.05]">
                A home that{" "}
                <span className="font-serif text-[1.05em] font-semibold not-italic text-[color:var(--color-accent)] lg:text-[1.12em]">
                  feels like home
                </span>
                , the day you move in
              </h1>
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="mt-4 max-w-xl text-[0.98rem] leading-[1.65] text-muted sm:mt-5 hidden sm:block sm:text-lg sm:leading-relaxed">
                Compare verified coliving residences and premium PGs across India fully furnished, all-inclusive
                bills, real photos and confirmed pricing. No brokers. No surprises.
              </p>
            </FadeIn>

            <FadeIn delay={0.16}>
              <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5">
                {FEATURE_PILLS.map((pill) => (
                  <li
                    key={pill.text}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-ink/95 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-[2px] sm:px-4 sm:py-2 sm:text-[0.8125rem]"
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full ring-2 ring-white/80", pill.dot)} aria-hidden />
                    {pill.text}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-8 border-t border-slate-200/50 pt-7 hidden sm:block sm:mt-10 sm:pt-8">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500/95">
                  Trusted in
                </p>
                <p className="mt-2.5 flex flex-wrap items-center gap-x-1 gap-y-1 font-display text-[0.95rem] font-medium tracking-[-0.02em] text-ink/88 sm:text-[1.05rem]">
                  {TRUSTED_CITIES.map((c, i) => (
                    <span key={c.slug} className="inline-flex items-center">
                      {i > 0 ? <span className="mx-1.5 text-slate-300" aria-hidden>·</span> : null}
                      <Link
                        href={`/coliving/${c.slug}`}
                        className="rounded-md px-0.5 transition hover:bg-slate-900/[0.04] hover:text-[color:var(--color-accent)]"
                      >
                        {c.label}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.1}
            className="hidden min-w-0 self-center pl-3 pt-1 lg:flex lg:flex-col lg:items-end lg:pr-2 xl:pl-6 xl:pr-4"
          >
            <div className="relative w-[17.25rem] shrink-0 xl:w-[19rem]">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-white/90 via-slate-100/30 to-[color:var(--color-brand-soft)] opacity-95 blur-2xl"
                aria-hidden
              />
              <div className="relative rounded-[1.5rem] border border-white/90 bg-gradient-to-b from-white via-white to-slate-100/85 p-1 shadow-[0_32px_72px_-18px_rgba(15,23,42,0.2)] ring-1 ring-slate-900/[0.05]">
                <div className="relative overflow-hidden rounded-[1.25rem] bg-slate-950/5 ring-1 ring-black/[0.04]">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={heroImage}
                      alt={heroImageLabel}
                      fill
                      priority
                      className="object-cover"
                      sizes="(min-width: 1280px) 304px, 276px"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/12 to-slate-950/0" />

                    <div className="absolute left-3 top-3 sm:left-3.5 sm:top-3.5">
                      <span className="inline-flex rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink shadow-sm backdrop-blur-sm sm:text-[0.65rem]">
                        Operator
                      </span>
                    </div>

                    <div className="absolute right-3 top-3 max-w-[11.5rem] rounded-xl border border-white/25 bg-slate-950/45 px-3 py-2.5 text-right text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:right-3.5 sm:top-3.5">
                      <p className="text-lg font-semibold leading-none tracking-tight sm:text-xl">₹24,500</p>
                      <p className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/70">
                        per month
                      </p>
                      <p className="mt-2 text-[0.7rem] font-medium leading-snug text-white/85">
                        All-inclusive · Indiranagar
                      </p>
                    </div>

                    <div className="absolute inset-x-3 bottom-3 sm:inset-x-3.5 sm:bottom-3.5">
                      <div className="flex items-center gap-3 rounded-xl border border-white/30 bg-slate-950/40 px-3 py-2.5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/35 bg-white/10 ring-2 ring-black/15">
                          <Image
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
                            alt="Living concierge"
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold tracking-[-0.015em]">Aditi · Concierge</p>
                          <p className="mt-0.5 text-[0.7rem] leading-snug text-white/75">
                            Toured 38 homes in Bangalore
                          </p>
                        </div>
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-inner transition hover:bg-white/22"
                          aria-hidden
                        >
                          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
