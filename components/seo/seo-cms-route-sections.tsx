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
import { isFaqOwningHubPath, isVerticalDetailPagePath } from "@/lib/vertical-detail-route";
import type { SeoContent } from "@/types/seo.model";

function isAddListingRoute(pathname: string) {
  return pathname === "/add" || pathname.startsWith("/add/");
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

function samePath(a: string, b: string): boolean {
  const norm = (p: string) => {
    let v = (p.split("?")[0] ?? "/").replace(/\/+$/, "") || "/";
    try {
      v = decodeURIComponent(v);
    } catch {
      /* keep as-is */
    }
    return v;
  };
  return norm(a) === norm(b);
}

/**
 * CMS footer/FAQ. The first page load renders with `initialSeo` resolved on the server
 * (so crawlers get it in the HTML); soft navigations refetch keyed off the **client**
 * pathname so they do not need a full `router.refresh()` (which doubled every page transition).
 */
export function SeoCmsRouteSections({
  initialSeo = null,
  initialPathname = "",
}: {
  initialSeo?: SeoContent | null;
  initialPathname?: string;
} = {}) {
  const pathname = usePathname() || "/";
  const pathSeg = pathname.split("?")[0] ?? "/";
  const slug = useMemo(() => pathnameToSeoSlug(pathSeg), [pathSeg]);
  const isDetailPage = useMemo(() => isVerticalDetailPagePath(pathSeg), [pathSeg]);
  const serverSeo = initialSeo && initialPathname && samePath(initialPathname, pathSeg) ? initialSeo : null;
  const [seo, setSeo] = useState<SeoContent | null>(serverSeo);

  useEffect(() => {
    if (isAddListingRoute(pathSeg) || isDetailPage) {
      setSeo(null);
      return;
    }
    if (serverSeo) {
      setSeo(serverSeo);
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
  }, [pathSeg, slug, isDetailPage, serverSeo]);

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
    hasFaqs && seo && !isFaqOwningHubPath(pathSeg);

  return (
    <>
      {seo ? (
        <SeoFooterContentSection
          title={seo.footer_title}
          description={seo.footer_description}
          demoteHeadings={pathSeg === "/"}
        />
      ) : null}
      <Footer />
      <FooterMarketingSection />
      {showBelowFooterFaqs ? <SeoFaqsSection faqs={seo.faqs} /> : null}
    </>
  );
}
