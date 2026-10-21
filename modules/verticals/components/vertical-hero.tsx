import Image from "next/image";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import {
  VirtualOfficeHeroDesktopLead,
  VirtualOfficeHeroLeadRoot,
} from "@/modules/verticals/components/virtual-office-hero-lead";
import { VirtualOfficeHeroEnquiryCta } from "@/modules/verticals/components/virtual-office-hero-enquiry-cta";
import { VerticalLandingData } from "@/types";

type VerticalHeroProps = {
  data: VerticalLandingData;
};

export function VerticalHero({ data }: VerticalHeroProps) {
  if (data.vertical === "coworking") {
    return (
      <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top_left,var(--color-brand-soft),transparent_32%),radial-gradient(circle_at_70%_12%,rgba(76,175,80,0.08),transparent_24%),linear-gradient(180deg,var(--color-page-bg)_0%,var(--color-page-bg)_90%)]" />
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-3xl">
              <FadeIn>
                <Badge className="bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
                  {data.hero.eyebrow}
                </Badge>
              </FadeIn>
              <FadeIn delay={0.08}>
                <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
                  {data.hero.title}
                </h1>
              </FadeIn>
              <FadeIn delay={0.14}>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                  {data.hero.subtitle}
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <div className="mt-8">
                  <Button href="#lead-form">Get Instant Details</Button>
                </div>
              </FadeIn>
            </div>
            <FadeIn delay={0.18}>
              <div className="hidden lg:block">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_40px_120px_rgba(15,23,42,0.14)]">
                  <div className="grid gap-3 lg:grid-cols-[1.06fr_0.94fr]">
                    <div className="relative min-h-[26rem] overflow-hidden rounded-[1.6rem]">
                      <Image
                        src={data.hero.image}
                        alt={data.hero.imageLabel}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 42vw"
                      />
                    </div>
                    <div className="grid gap-3">
                      {(data.hero.stats ?? []).map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[1.5rem] bg-[linear-gradient(135deg,#f7faff_0%,#eef4ff_100%)] p-5"
                        >
                          <Sparkles className="h-5 w-5 text-[color:var(--color-brand)]" />
                          <p className="mt-5 text-lg font-semibold text-ink">{item.value}</p>
                          <p className="mt-2 text-sm text-muted">{item.label}</p>
                        </div>
                      ))}
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

  if (data.vertical === "virtual-office") {
    const trustLines = data.hero.badges ?? [];

    return (
      <VirtualOfficeHeroLeadRoot>
      <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top_left,var(--color-brand-soft),transparent_32%),radial-gradient(circle_at_70%_12%,rgba(76,175,80,0.08),transparent_24%),linear-gradient(180deg,var(--color-page-bg)_0%,var(--color-page-bg)_90%)]" />

        <Container className="relative">
          <div className="grid min-w-0 items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] lg:gap-12 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,33rem)] xl:gap-14">
            <div className="min-w-0 max-w-full space-y-6 lg:space-y-8 lg:py-1">
              <FadeIn>
                <p className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-2 text-[0.8125rem] font-medium leading-snug text-ink shadow-sm backdrop-blur-sm sm:px-4 sm:py-2.5 sm:text-sm">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-brand)] shadow-[0_0_10px_rgba(76,175,80,0.45)]"
                    aria-hidden
                  />
                  {data.hero.eyebrow}
                </p>
              </FadeIn>

              <FadeIn delay={0.08}>
                <h1 className="max-w-[22ch] font-display text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.035em] text-ink sm:max-w-none sm:text-4xl sm:leading-[1.08] lg:text-[2.65rem] lg:leading-[1.06]">
                  {data.hero.title}
                </h1>
              </FadeIn>

              <FadeIn delay={0.14}>
                <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg sm:leading-relaxed">
                  {data.hero.subtitle}
                </p>
              </FadeIn>

              <FadeIn delay={0.18}>
                <ul className="mt-2 grid gap-3 sm:mt-4 sm:gap-3.5">
                  {trustLines.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 text-sm leading-snug text-slate-700 sm:text-[0.9375rem] sm:leading-relaxed"
                    >
                      <Check
                        className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-brand)]"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>

              <VirtualOfficeHeroEnquiryCta />
            </div>

            <FadeIn delay={0.1} className="hidden min-w-0 w-full lg:block lg:sticky lg:top-24">
              <div id="lead-form" className="scroll-mt-24">
                <VirtualOfficeHeroDesktopLead />
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
      </VirtualOfficeHeroLeadRoot>
    );
  }

  if (data.vertical === "office-space") {
    return (
    <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14">
      <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top_left,var(--color-brand-soft),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(76,175,80,0.08),transparent_22%),linear-gradient(180deg,var(--color-page-bg)_0%,var(--color-page-bg)_92%)]" />
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-3xl">
            <FadeIn>
              <Badge className="bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
                {data.hero.eyebrow}
              </Badge>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
                {data.hero.title}
              </h1>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                {data.hero.subtitle}
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#lead-form">{data.hero.ctaLabel}</Button>
                <Button href="/managed-office/gurgaon" variant="secondary">
                  Explore premium offices
                </Button>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.18}>
            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_40px_120px_rgba(15,23,42,0.16)]">
                <div className="relative min-h-[30rem] overflow-hidden rounded-[1.6rem]">
                  <Image
                    src={data.hero.image}
                    alt={data.hero.imageLabel}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 44vw"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
    );
  }

  return null;
}
