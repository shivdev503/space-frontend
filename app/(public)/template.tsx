import { Suspense, type ReactNode } from "react";

import { SeoCmsRouteSections } from "@/components/seo/seo-cms-route-sections";
import { SeoStructuredDataFromRequest } from "@/components/seo/seo-structured-data-from-request";
import { getResolvedSeoForRequest } from "@/lib/seo-for-request";

/** CMS footer/FAQ for the requested URL, resolved on the server so it is in the initial HTML. */
async function SeoCmsRouteSectionsFromRequest() {
  const { seo, pathname } = await getResolvedSeoForRequest();
  return <SeoCmsRouteSections initialSeo={seo} initialPathname={pathname} />;
}

/**
 * JSON-LD and the CMS footer/FAQ are server-rendered for crawlers; after a soft
 * navigation the CMS sections reload on the client pathname, without `router.refresh()`.
 */
export default function PublicTemplate({ children }: { children: ReactNode }) {
  return (
    <>
      <main>{children}</main>
      {/* No fallback: a fallback footer would be streamed into the HTML next to the real one. */}
      <Suspense fallback={null}>
        <SeoCmsRouteSectionsFromRequest />
      </Suspense>
      <SeoStructuredDataFromRequest />
    </>
  );
}
