import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  Home,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { cn } from "@/utils/cn";

const VERTICALS = [
  {
    href: "/add/coliving-space",
    title: "PG & Co-living",
    description: "Rooms, meals, amenities, rules & photos.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Furnished coliving bedroom",
    Icon: Home,
    features: ["Room pricing", "Food & amenities", "Photo upload"],
    eta: "12 min",
  },
  {
    href: "/add/coworking-space",
    title: "Coworking",
    description: "Desks, cabins, meeting rooms & day passes.",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Modern coworking interior",
    Icon: Users,
    features: ["Seating plans", "Location", "Gallery"],
    eta: "10 min",
  },
  {
    href: "/add/office-space",
    title: "Managed Office",
    description: "Rent per sq ft, area, furnishing & location.",
    image:
      "https://img.spacewallah.com/images/original/29f7c32fae7798c9733f5b891af3e0ded7031a85.jpg",
    imageAlt: "Corporate managed office",
    Icon: Building2,
    features: ["Rent & area", "Furnishing", "Gallery"],
    eta: "10 min",
  },
] as const;

const TRUST_POINTS = [
  { icon: Zap, label: "Free to list" },
  { icon: Clock3, label: "Live in 24h" },
  { icon: ShieldCheck, label: "Verified badge" },
  { icon: Sparkles, label: "India-wide reach" },
] as const;

type Props = {
  hostName?: string | null;
  hasListings?: boolean;
};

export function AddVerticalChooser({ hostName, hasListings }: Props) {
  const firstName = hostName?.trim().split(/\s+/)[0];

  return (
    <div className="min-w-0 overflow-x-hidden bg-[#f9f8f5]">
      <Container className="py-7 sm:py-9">
        <div className="mx-auto min-w-0 max-w-5xl">
          {/* Hero */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">
                Host panel
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {firstName ? (
                  <>
                    Hi {firstName}, what are you listing?
                  </>
                ) : (
                  "What would you like to list?"
                )}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink/65 sm:text-base">
                Pick a category below. Each guided flow auto-saves your progress.
              </p>
            </div>
            {hasListings ? (
              <Link
                href="/add/dashboard"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10 transition hover:ring-[color:var(--color-brand)]/40"
              >
                <LayoutGrid className="h-4 w-4 text-[color:var(--color-brand)]" aria-hidden />
                My listings
              </Link>
            ) : null}
          </div>

          {/* Trust pills */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-ink/8"
              >
                <Icon className="h-3.5 w-3.5 text-[color:var(--color-brand)]" strokeWidth={2} aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          {/* Cards — stack on mobile, 3 cols only when there's room */}
          <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {VERTICALS.map((v) => (
              <VerticalCard key={v.href} {...v} />
            ))}
          </div>

          {/* Compact how-it-works */}
          <div className="mt-8 rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-brand)]">
              How it works
            </p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                { n: "1", t: "Choose category", d: "PG, coworking, or office." },
                { n: "2", t: "Fill the wizard", d: "Location, pricing, photos." },
                { n: "3", t: "We review & publish", d: "Usually within 24 hours." },
              ].map((s) => (
                <li key={s.n} className="flex gap-3 sm:flex-col sm:gap-1.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-soft)] text-xs font-bold text-[color:var(--color-brand)]">
                    {s.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{s.t}</p>
                    <p className="text-xs text-ink/55">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </div>
  );
}

function VerticalCard({
  href,
  title,
  description,
  image,
  imageAlt,
  Icon,
  features,
  eta,
}: (typeof VERTICALS)[number]) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-ink/10",
        "transition hover:ring-[color:var(--color-brand)]/50 hover:shadow-[0_8px_30px_rgba(76,175,80,0.12)]",
      )}
    >
      {/* Photo strip — light fade only */}
      <div className="relative h-[5.5rem] w-full shrink-0 overflow-hidden sm:h-24">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[0.65rem] font-semibold text-ink/80 shadow-sm">
          <Clock3 className="h-3 w-3 text-ink/50" aria-hidden />
          {eta}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="font-display text-lg font-semibold leading-tight text-ink">{title}</h2>
            <p className="mt-1 text-sm leading-snug text-ink/60">{description}</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink/50">
          {features.join(" · ")}
        </p>

        <span className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[color:var(--color-accent)]">
          Start listing
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
