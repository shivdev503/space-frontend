import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import { Suspense, type ReactNode } from "react";

import "./globals.css";

import { GtmPageView } from "@/components/analytics/gtm-page-view";
import { GTM_ID, isGtmEnabled } from "@/lib/gtm";
import { resolveAppUrl } from "@/services/env-config";
import { APP_NAME } from "@/utils/constants";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(resolveAppUrl()),
  title: {
    default: `Coworking Space, Office Space & PG in India | ${APP_NAME}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Discover coworking spaces, virtual offices, and managed offices across India with a premium lead-generation experience.",
  manifest: "/site.webmanifest",
  // app/favicon.ico (16/32/48) is added by Next automatically. Google Search wants a square icon
  // whose size is a multiple of 48px; iOS ignores SVG touch icons, so both get PNGs.
  icons: {
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/spacewallah-app-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    // Browser extensions (Grammarly, ColorZilla, password managers) add attributes to <html>/<body>
    // before React hydrates; ignore those attribute differences on these two tags only.
    <html lang="en" suppressHydrationWarning>
      {isGtmEnabled() ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      <body className={inter.variable} suppressHydrationWarning>
        {isGtmEnabled() ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <Suspense fallback={null}>
          <GtmPageView />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
