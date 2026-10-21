import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Home, Shield } from "lucide-react";

import { Container } from "@/components/ui/container";

/** Warm kitchen / living scene — visible on the right through a lighter overlay */
const CTA_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85";

const TRUST_ITEMS = [
  { icon: Check, label: "Trusted by 10,000+ residents" },
  { icon: Shield, label: "100% inspected & operator-verified" },
  { icon: Home, label: "Zero brokerage · No spam guarantee" },
] as const;

export function ColivingFindYourHomeCta() {
  return (
    <section className="bg-[linear-gradient(180deg,rgba(244,248,255,0.45)_0%,#f9f8f5_40%,#ffffff_100%)] py-14 sm:py-20">
      <Container>
        <div className="relative isolate min-h-[32rem] overflow-hidden rounded-[1.75rem] border border-slate-200/60 shadow-[0_36px_90px_-24px_rgba(15,23,42,0.28)] sm:min-h-[34rem] sm:rounded-[2rem] lg:min-h-[28rem] lg:rounded-[2.25rem]">
          <Image
            src={CTA_IMAGE}
            alt=""
            fill
            priority={false}
            className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-[right_center]"
            sizes="(min-width: 1024px) 1260px, 100vw"
            aria-hidden
          />

          {/* Readability on the left; photo breathes on the right */}
          <div
            className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,48,38,0.97)_0%,rgba(18,72,55,0.88)_38%,rgba(22,78,60,0.52)_62%,rgba(15,59,46,0.22)_82%,rgba(12,48,38,0.35)_100%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-accent)]/55 via-transparent to-black/10 lg:bg-gradient-to-t lg:from-[color:var(--color-accent)]/35 lg:via-transparent lg:to-transparent"
            aria-hidden
          />

          <div className="relative z-10 flex min-h-[32rem] flex-col justify-end gap-10 p-7 sm:min-h-[34rem] sm:p-10 lg:grid lg:min-h-[28rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch lg:gap-8 lg:p-12 xl:p-14">
            <div className="flex min-w-0 flex-col justify-center lg:py-2">
              <p className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-xs">
                <span className="h-px w-7 bg-gradient-to-r from-white/40 to-white/75" aria-hidden />
                Find your home
              </p>

              <h2 className="mt-4 max-w-xl font-display text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.035em] text-white sm:mt-5 sm:text-4xl sm:leading-[1.08] lg:max-w-lg lg:text-[2.45rem] lg:leading-[1.06] xl:text-[2.6rem]">
                Move into a home you&apos;ll{" "}
                <span className="font-serif text-[1.06em] font-semibold italic text-[#e8d9c4]">
                  genuinely
                </span>{" "}
                want to come back to
              </h2>

              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85 sm:mt-5 sm:text-lg">
                Tell us where you&apos;re going. We&apos;ll have a verified shortlist on your screen before the end of
                the day and a real human on call until you have your keys.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="#select-living"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--color-accent)] shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition hover:-translate-y-px hover:bg-white/98 hover:shadow-[0_18px_44px_rgba(0,0,0,0.26)] active:translate-y-0 sm:w-auto"
                >
                  Get a free shortlist
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="#cities"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/50 bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/70 hover:bg-white/[0.14] sm:w-auto"
                >
                  Browse all homes
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-end lg:items-end lg:pb-1">
              <div className="w-full rounded-2xl border border-white/20 bg-white/[0.1] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:p-6 lg:max-w-sm lg:rounded-2xl">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/65">
                  Why SpaceWallah Living
                </p>
                <ul className="mt-4 flex flex-col gap-3.5">
                  {TRUST_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.label}
                        className="flex items-start gap-3 text-left text-sm font-medium leading-snug text-white/92"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/20">
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        </span>
                        <span>{item.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
