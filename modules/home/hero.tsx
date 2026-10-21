"use client";

import Image from "next/image";
import { BadgeCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { SearchBar } from "@/modules/home/components/search-bar";
import { HomepageData } from "@/types";

type HomeHeroProps = {
  searchOptions: HomepageData["searchOptions"];
  featuredSpaces: HomepageData["featuredSpaces"];
};

export function HomeHero({ searchOptions, featuredSpaces }: HomeHeroProps) {
  void featuredSpaces;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-[70vh]">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/background-hero.jpg"
          alt="Workspace background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.36)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.2)_38%,rgba(0,0,0,0.31)_68%,rgba(0,0,0,0.49)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[26rem] bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.14)_28%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <Container className="relative flex min-h-[70vh] items-center justify-center pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="w-full max-w-5xl text-center">
          <FadeIn>
            <Badge className="border border-[#c9a962]/35 bg-[rgba(22,18,14,0.42)] text-[#f5efe3] shadow-[0_8px_32px_rgba(12,9,7,0.35)] backdrop-blur-md">
              Premium Space Discovery
            </Badge>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-5 font-display text-3xl leading-[1.08] tracking-[-0.03em] text-[#faf6ee] drop-shadow-[0_6px_28px_rgba(8,6,5,0.55)] sm:text-4xl lg:text-5xl">
              Find Your Perfect Space With Ease
            </h1>
          </FadeIn>
          <div
            className={`relative z-20 mt-5 transition-opacity duration-500 ease-out ${
              isScrolled ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <SearchBar
              locations={searchOptions.locations}
              teamSizes={searchOptions.teamSizes}
              budgets={searchOptions.budgets}
              submitLabel="Search"
              variant="homepage"
            />
          </div>
          <FadeIn delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-5 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a962]/20 bg-[rgba(22,18,14,0.38)] px-4 py-2 text-[#ebe3d4] shadow-[0_12px_36px_rgba(8,6,5,0.28)] backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-[#12B886]" />
                Verified Space Only
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a962]/20 bg-[rgba(22,18,14,0.38)] px-4 py-2 text-[#ebe3d4] shadow-[0_12px_36px_rgba(8,6,5,0.28)] backdrop-blur-sm">
                <BadgeCheck className="h-4 w-4 text-[#12B886]" />
                 Zero Brokerage
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
