"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ContactFormModal } from "@/components/contact/contact-form-modal";
import { HeaderVerticalNav } from "@/components/layout/header-vertical-nav";
import { MobileMenuDrawer } from "@/components/layout/mobile-menu-drawer";
import { SearchBar } from "@/modules/home/components/search-bar";
import { SearchOption } from "@/types";
import { cn } from "@/utils/cn";
import { isSiteHeaderHidden } from "@/lib/header-visibility";

const headerSearchLocations: SearchOption[] = [
  { label: "Delhi", value: "delhi" },
  /** Same value as homepage `listHomepageCitiesFromAvailable` (label Gurugram, route slug gurgaon). */
  { label: "Gurugram", value: "gurgaon" },
  { label: "Noida", value: "noida" },
  { label: "Bangalore", value: "bangalore" },
  { label: "Hyderabad", value: "hyderabad" },
  { label: "Chennai", value: "chennai" },
  { label: "Pune", value: "pune" },
];

export function Header() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderSearchExpanded, setIsHeaderSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  /** Hosts with a valid listing cookie go to the dashboard; others to sign up. */
  const [listYourSpaceHref, setListYourSpaceHref] = useState("/list-your-space");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/listing/host-session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { isHost?: boolean } | null) => {
        if (cancelled || !data?.isHost) return;
        setListYourSpaceHref("/add/dashboard");
      })
      .catch(() => {
        // Keep default /list-your-space
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isHomepage) return undefined;

    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  useEffect(() => {
    if (!isScrolled) {
      setIsHeaderSearchExpanded(false);
    }
  }, [isScrolled]);

  const useSolidHeader = !isHomepage || isScrolled;
  const shouldExpandHeader = isHomepage && isScrolled && isHeaderSearchExpanded;
  const showFloatingHeroHeader = isHomepage && !isScrolled;
  if (isSiteHeaderHidden(pathname)) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 overflow-visible transition-all duration-700 ease-out",
        shouldExpandHeader ? "h-[18rem]" : "h-20",
        useSolidHeader
          ? "border-b border-slate-200/80 bg-white/92 backdrop-blur-xl"
          : "bg-transparent",
        shouldExpandHeader && "shadow-[0_20px_60px_rgba(15,23,42,0.12)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-20 hidden lg:flex",
          !isScrolled && "items-center",
        )}
      >
        <div
          className={cn(
            "pointer-events-none relative flex h-full w-full flex-col items-center justify-center",
          )}
        >
          <nav
            className={cn(
              "flex items-center justify-center gap-4 transition-all duration-300",
              isHomepage
                ? isScrolled
                  ? "pointer-events-none hidden -translate-y-2 opacity-0"
                  : "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-auto translate-y-0 opacity-100",
              "text-sm",
            )}
          >
            <HeaderVerticalNav useSolidHeader={useSolidHeader} pathname={pathname ?? "/"} />
          </nav>

          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-300",
              isHomepage
                ? isScrolled
                  ? "opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
                : "hidden",
              shouldExpandHeader && "pt-4",
            )}
          >
            <div
              className={cn(isHomepage && isScrolled ? "pointer-events-auto" : "pointer-events-none")}
            >
              <SearchBar
                locations={headerSearchLocations}
                teamSizes={[]}
                budgets={[]}
                variant="header"
                submitLabel="Search"
                className={cn("mx-auto", shouldExpandHeader ? "max-w-[48rem]" : "max-w-[48rem]")}
                onExpandedChange={setIsHeaderSearchExpanded}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-4 transition-all duration-700 ease-out sm:px-5 lg:px-8",
          showFloatingHeroHeader
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-6 opacity-0",
        )}
      >
        <div className="mx-auto max-w-[1450px] rounded-[9999px] border border-white/35 bg-[rgba(17,26,24,0.18)] shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur-md ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 lg:px-5">
            <Link href="/" className="flex shrink-0 items-center gap-3 text-[#f9f5ee]">
              <Image
                src="/spacewallah-logo-white.svg"
                alt="SpaceWallah"
                width={150}
                height={34}
                priority
                className="h-[30px] w-auto object-contain"
              />
            </Link>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <HeaderVerticalNav useSolidHeader={false} pathname={pathname ?? "/"} />
            </div>

            <Button
              href={listYourSpaceHref}
              variant="secondary"
              className="hidden rounded-full border-0 bg-[color:var(--color-brand)] px-5 py-2.5 text-[0.92rem] font-semibold text-white shadow-[0_12px_22px_rgba(18,184,134,0.28)] hover:bg-[color:var(--color-brand)]/90 hover:text-white lg:inline-flex"
            >
              List Your Space
            </Button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="site-mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              tabIndex={showFloatingHeroHeader ? 0 : -1}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-[#f9f5ee] shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:bg-white/20 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 flex h-full items-center justify-between gap-4 px-4 transition-all duration-700 ease-out",
          useSolidHeader ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Container className="flex h-full items-center justify-between gap-4">
          <Link
            href="/"
            className={cn(
              "z-30 flex shrink-0 items-center gap-3",
              useSolidHeader ? "text-ink" : "text-[#faf6ee]",
            )}
          >
            <span
              className={cn(
                "relative flex h-12 items-center",
                !useSolidHeader && "drop-shadow-[0_10px_28px_rgba(0,0,0,0.35)]",
              )}
            >
              <Image
                src={useSolidHeader ? "/spacewallah-logo-color.svg" : "/spacewallah-logo-white.svg"}
                alt="SpaceWallah"
                width={210}
                height={48}
                priority
                className="h-9 w-auto object-contain"
              />
            </span>
          </Link>

          <div
            className={cn(
              "z-30 ml-auto flex items-center gap-2 transition-all duration-300 sm:gap-3",
              shouldExpandHeader && "pointer-events-none opacity-0",
            )}
          >
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="site-mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition lg:hidden",
                useSolidHeader
                  ? "border-slate-200/90 bg-white text-ink shadow-[0_6px_20px_rgba(15,23,42,0.08)] hover:bg-slate-50"
                  : "border-[#f0e8d8]/40 bg-[rgba(22,18,14,0.32)] text-[#faf6ee] shadow-[0_10px_36px_rgba(8,6,5,0.35)] backdrop-blur-md hover:border-[#c9a962]/45 hover:bg-[rgba(32,26,20,0.48)]",
              )}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Button
              href={listYourSpaceHref}
              variant={useSolidHeader ? "primary" : "secondary"}
              className={cn(
                "hidden px-4 lg:inline-flex lg:px-5",
                !useSolidHeader &&
                  "border-[#f0e8d8]/40 bg-[rgba(22,18,14,0.32)] text-[#faf6ee] shadow-[0_10px_36px_rgba(8,6,5,0.35)] backdrop-blur-md hover:border-[#c9a962]/45 hover:bg-[rgba(32,26,20,0.48)] hover:text-[#fffcf5]",
              )}
            >
              List Your Space
            </Button>
          </div>
        </Container>
      </div>

      <div className="hidden lg:block">
        <ContactFormModal
          open={isContactOpen}
          onOpenChange={setIsContactOpen}
          leadTarget={{ city: "global", spaceId: "header" }}
          submitLabel="Enquire Now"
          title="Enquire Now"
          subtitle="Get best deals and availability in minutes."
          interestedInDefault="Site header enquiry"
          mxSpaceType="General enquiry"
        />
      </div>

      <MobileMenuDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        listYourSpaceHref={listYourSpaceHref}
        pathname={pathname ?? "/"}
      />

      <div className="lg:hidden">
        <ContactFormModal
          open={isContactOpen}
          onOpenChange={setIsContactOpen}
          leadTarget={{ city: "global", spaceId: "header" }}
          submitLabel="Enquire Now"
          title="Enquire Now"
          subtitle="Get best deals and availability in minutes."
          interestedInDefault="Site header enquiry"
          mxSpaceType="General enquiry"
        />
      </div>
    </header>
  );
}
