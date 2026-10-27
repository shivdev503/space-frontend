import type { SeoContent } from "@/types/seo.model";
import { verticals, APP_NAME } from "@/utils/constants";

type VerticalKey = "home" | "coworking" | "office" | "virtual" | "coliving" | "listing" | "other";

function pickVertical(pathname: string, slug: string): VerticalKey {
  const s = slug.toLowerCase();
  const pathTrim = pathname?.trim() ?? "";
  if (!pathTrim) {
    if (s === "generic") return "other";
    if (s === "home") return "other";
    if (s === "coworking" || s.startsWith("coworking-")) return "coworking";
    if (s === "office-space" || s.startsWith("office-space-")) return "office";
    if (s === "coliving" || s.startsWith("coliving-")) return "coliving";
    if (s === "virtual-office" || s.startsWith("virtual-office-")) return "virtual";
    if (s.startsWith("list-your-space") || s.startsWith("add")) return "listing";
    return "other";
  }
  const p = pathTrim.split("?")[0] || "/";
  if (p === "/") return "home";
  if (p.startsWith("/coworking") || s === "coworking" || s.startsWith("coworking-")) {
    return "coworking";
  }
  if (p.startsWith("/managed-office") || s === "office-space" || s.startsWith("office-space-")) {
    return "office";
  }
  if (p.startsWith("/coliving") || s === "coliving" || s.startsWith("coliving-")) {
    return "coliving";
  }
  if (p.startsWith("/virtual-office") || s === "virtual-office" || s.startsWith("virtual-office-")) {
    return "virtual";
  }
  if (p.startsWith("/add") || p.startsWith("/list-your-space") || s.startsWith("list-your-space")) {
    return "listing";
  }
  return "other";
}

/**
 * Shown when `/api/user/newSeo/:slug` has no document. Uses the real URL path
 * (and slug) to pick a vertical-appropriate blurb — never the CMS `home` row
 * unless the request is actually for `/` / `home`.
 */
export function getFallbackSeoContent(pathname: string, slug: string): SeoContent {
  const p = pathname || "/";
  const v = pickVertical(pathname, slug);
  const coworking = verticals.find((x) => x.key === "coworking")!;
  const office = verticals.find((x) => x.key === "office-space")!;
  const virtual = verticals.find((x) => x.key === "virtual-office")!;
  const coliving = verticals.find((x) => x.key === "coliving")!;

  if (v === "home") {
    return {
      title: `Coworking Space, Office Space & PG in India | ${APP_NAME}`,
      description:
        "Compare coworking spaces, virtual offices, managed office options, and coliving/PG homes with SpaceWallah — find locations, plans, and deals that match your team.",
      path: "/",
      footer_title: `Why ${APP_NAME}`,
      footer_description: `<p>SpaceWallah helps you compare verified coworking spaces, managed offices, virtual offices and coliving homes in cities across India, with a free advisor to shortlist, negotiate and get you moved in.</p>`,
      keywords: "coworking, virtual office, managed office, coliving, PG, India, SpaceWallah",
    };
  }

  if (v === "coworking") {
    return {
      title: `Coworking Space in India | 1000+ Verified Spaces | ${APP_NAME}`,
      description: coworking.description,
      path: p,
      footer_title: `Coworking on ${APP_NAME}`,
      footer_description: `<p>${coworking.description} Compare locations, see plans, and get help choosing space that matches how you work.</p>`,
    };
  }
  if (v === "office") {
    return {
      title: `Office Space for Rent in India | Managed Offices | ${APP_NAME}`,
      description: office.description,
      path: p,
      footer_title: `Managed office on ${APP_NAME}`,
      footer_description: `<p>${office.description} Explore managed office options with clearer pricing context before you book a site visit.</p>`,
    };
  }
  if (v === "virtual") {
    return {
      title: `Virtual Office in India for GST & Company Registration | ${APP_NAME}`,
      description: virtual.description,
      path: p,
      footer_title: `Virtual office on ${APP_NAME}`,
      footer_description: `<p>${virtual.description} Get a credible business address, mail handling, and meeting-room access when you need a compliance-ready set-up.</p>`,
    };
  }
  if (v === "coliving") {
    return {
      title: `PG & Coliving in India | Furnished Rooms with Food | ${APP_NAME}`,
      description: coliving.description,
      path: p,
      footer_title: `Coliving Space on ${APP_NAME}`,
      footer_description: `<p>${coliving.description} Compare furnished rooms, meal plans, and security before you shortlist a move-in date.</p>`,
    };
  }
  if (v === "listing") {
    return {
      title: `List and manage your spaces | ${APP_NAME}`,
      description:
        "Create a host account to list coworking and managed office inventory, manage leads, and keep your listings up to date.",
      path: p,
      footer_title: "Hosts & property managers",
      footer_description: `<p>List coworking and managed office listings on ${APP_NAME}, track leads, and update availability — all from one place.</p>`,
    };
  }
  return {
    title: `${APP_NAME} | Workspace & office search`,
    description:
      "Search and compare modern workspaces, virtual addresses, and office listings across major Indian cities.",
    path: p,
    footer_title: `About ${APP_NAME}`,
    footer_description: `<p>Find the right working environment for your business — from flexible desks to full-scale offices — with a high-signal search on ${APP_NAME}.</p>`,
  };
}
