import Image from "next/image";
import {
  Armchair,
  BedDouble,
  Headphones,
  Sparkles,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { cn } from "@/utils/cn";

/** Warm living-room visual aligned with “what’s inside” marketing (sofa / lounge). */
const WHATS_INSIDE_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85";

const AVATAR_SRC = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
] as const;

type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FEATURES: FeatureItem[] = [
  {
    title: "High-speed Wi-Fi",
    description: "300 Mbps fibre, dual router redundancy, calls-grade uptime.",
    icon: Wifi,
  },
  {
    title: "Chef-led meals",
    description: "Three home meals daily with monthly rotating menus and dietary options.",
    icon: UtensilsCrossed,
  },
  {
    title: "Furnished rooms",
    description: "Bed, mattress, wardrobe, study desk, AC, blackout curtains. Bring a suitcase.",
    icon: BedDouble,
  },
  {
    title: "Housekeeping",
    description: "Daily room tidy, common-area deep clean, weekly laundry pick-up.",
    icon: Sparkles,
  },
  {
    title: "24x7 on-site team",
    description: "Live manager + maintenance, security at the gate, app to log requests.",
    icon: Headphones,
  },
  {
    title: "Community spaces",
    description: "Rooftop lounge, library nook, coworking floor, gym at most properties.",
    icon: Armchair,
  },
];

function FeatureGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-200/55 p-px shadow-soft",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white px-5 py-6 sm:px-6 sm:py-7"
            >
              <Icon
                className="h-5 w-5 text-[color:var(--color-brand)]"
                strokeWidth={1.35}
                aria-hidden
              />
              <h3 className="mt-4 font-display text-base font-semibold tracking-[-0.02em] text-ink sm:text-[1.05rem]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LivingImagePanel({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full max-w-md lg:max-w-none", className)}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-soft ring-1 ring-slate-900/[0.04]">
        <Image
          src={WHATS_INSIDE_IMAGE}
          alt="Furnished coliving lounge with sofa and soft lighting"
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 42vw, 100vw"
          priority={false}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent"
          aria-hidden
        />

        <div className="absolute inset-x-4 bottom-5 sm:inset-x-6 sm:bottom-6">
          <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <div className="flex shrink-0 -space-x-2.5" aria-hidden>
              {AVATAR_SRC.map((src, i) => (
                <div
                  key={src}
                  className={cn(
                    "relative h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-slate-100 ring-1 ring-slate-200/80",
                    i === 0 && "z-40",
                    i === 1 && "z-30",
                    i === 2 && "z-20",
                    i === 3 && "z-10",
                  )}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="36px" />
                </div>
              ))}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold tracking-[-0.01em] text-ink">1,840+ residents this year</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">Live, work, weekend brunches included.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ColivingWhatsInside() {
  return (
    <section className="relative bg-[linear-gradient(180deg,#f9f8f5_0%,#ffffff_48%,rgba(244,248,255,0.88)_100%)] bg-hero-glow py-14 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="min-w-0 lg:pr-4">
            <p className="inline-flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted sm:text-xs">
              <span className="h-px w-7 bg-gradient-to-r from-transparent via-slate-400/80 to-slate-400/80" aria-hidden />
              <span className="text-brand">What&apos;s inside</span>
            </p>

            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:mt-5 sm:text-4xl sm:leading-[1.06] lg:text-[2.35rem] lg:leading-[1.05]">
              Everything you&apos;d set up{" "}
              <span className="font-serif text-[1.05em] font-semibold italic text-[color:var(--color-accent)]">
                yourself,
              </span>{" "}
              already done
            </h2>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">
              Every SpaceWallah Living home arrives with the basics handled and the upgrades thought through. So your
              first night feels like your hundredth.
            </p>

            <div className="mt-8 sm:mt-10 lg:hidden">
              <LivingImagePanel className="mx-auto" />
            </div>

            <FeatureGrid className="mt-8 sm:mt-10" />
          </div>

          <div className="relative hidden min-h-0 lg:sticky lg:top-28 lg:block lg:self-start">
            <LivingImagePanel />
          </div>
        </div>
      </Container>
    </section>
  );
}
