import type { SpaceVertical } from "@/types";

export type BlogContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  id: string;
  slug: string;
  vertical: SpaceVertical;
  /** Raw blog type from upstream API (for typed detail routes). */
  apiType?: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverImageAlt: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  /** False when the API sent no usable date and `publishedAt` is only a display fallback. */
  hasPublishDate?: boolean;
  readMinutes: number;
  tags: string[];
  featured?: boolean;
  body?: BlogContentBlock[];
  bodyHtml?: string;
};

export type BlogVerticalFilter = SpaceVertical | "all";
