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
    default: `${APP_NAME} | Premium Space Discovery`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Discover coworking spaces, virtual offices, and managed offices across India with a premium lead-generation experience.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/spacewallah-app-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/spacewallah-app-icon.svg", sizes: "1024x1024", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      {isGtmEnabled() ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      <body className={inter.variable}>
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
