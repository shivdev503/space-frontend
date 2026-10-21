"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Footer } from "@/components/layout/footer";
import { FooterMarketingSection } from "@/components/layout/footer-marketing-section";
import { SeoFaqsSection } from "@/components/seo/seo-faqs-section";
import { SeoFooterContentSection } from "@/components/seo/seo-footer-content-section";
import { getFallbackSeoContent } from "@/lib/seo-fallbacks";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { normalizeSeoFromResponse } from "@/lib/seo-normalize";
import { isKnownVerticalCitySlug, isVerticalDetailPagePath } from "@/lib/vertical-detail-route";
import type { SeoContent } from "@/types/seo.model";

function isAddListingRoute(pathname: string) {
  return pathname === "/add" || pathname.startsWith("/add/");
}

/** City/locality pages already render SEO faqs in-page — skip the below-footer duplicate. */
function isCoworkingOrColivingCityOrLocalityPath(pathname: string): boolean {
  const path = (pathname.split("?")[0] ?? "/").replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return false;
  const [vertical, segment] = parts;
  if (vertical !== "coworking" && vertical !== "coliving") return false;
  if (parts.length === 2) {
    return isKnownVerticalCitySlug(decodeURIComponent(segment));
  }
  return true;
}

async function fetchSeoForSlug(slug: string, pathname: string): Promise<SeoContent> {
  try {
    const res = await fetch(`/api/user/newSeo/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json().catch(() => null)) as unknown;
      const fromApi = normalizeSeoFromResponse(json);
      if (fromApi) return fromApi;
    }
  } catch {
    // fall through to vertical fallback
  }

  return getFallbackSeoContent(pathname, slug);
}

/**
 * CMS footer/FAQ keyed off the **client** pathname so soft navigations
 * do not need a full `router.refresh()` (which doubled every page transition).
 */
export function SeoCmsRouteSections() {
  const pathname = usePathname() || "/";
  const pathSeg = pathname.split("?")[0] ?? "/";
  const slug = useMemo(() => pathnameToSeoSlug(pathSeg), [pathSeg]);
  const isDetailPage = useMemo(() => isVerticalDetailPagePath(pathSeg), [pathSeg]);
  const [seo, setSeo] = useState<SeoContent | null>(null);

  useEffect(() => {
    if (isAddListingRoute(pathSeg) || isDetailPage) {
      setSeo(null);
      return;
    }

    let cancelled = false;
    setSeo(null);

    void fetchSeoForSlug(slug, pathSeg).then((doc) => {
      if (!cancelled) setSeo(doc);
    });

    return () => {
      cancelled = true;
    };
  }, [pathSeg, slug, isDetailPage]);

  if (isAddListingRoute(pathSeg)) {
    return null;
  }

  if (isDetailPage) {
    return (
      <>
        <Footer />
        <FooterMarketingSection />
      </>
    );
  }

  const hasFaqs = Boolean(seo?.faqs?.length);
  const showBelowFooterFaqs =
    hasFaqs && seo && !isCoworkingOrColivingCityOrLocalityPath(pathSeg);

  return (
    <>
      {seo ? (
        <SeoFooterContentSection title={seo.footer_title} description={seo.footer_description} />
      ) : null}
      <Footer />
      <FooterMarketingSection />
      {showBelowFooterFaqs ? <SeoFaqsSection faqs={seo.faqs} /> : null}
    </>
  );
}
