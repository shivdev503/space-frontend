import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";

/** Body copy for the virtual office city page. */
export const voBodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vo-body",
  display: "swap",
});

/** Tight, heavy display face for headings and prices. */
export const voDisplayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-vo-display",
  display: "swap",
});
