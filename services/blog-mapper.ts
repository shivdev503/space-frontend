import type { BlogContentBlock, BlogPost } from "@/types/blog";
import type { SpaceVertical } from "@/types";

const SLUG_KEYS = ["slug", "blog_slug", "url_slug", "seo_slug", "blogSlug"] as const;
const TITLE_KEYS = ["title", "blog_title", "name", "heading"] as const;
const EXCERPT_KEYS = [
  "excerpt",
  "short_description",
  "shortDescription",
  "summary",
  "meta_description",
  "metaDescription",
] as const;
const CONTENT_KEYS = [
  "content",
  "body",
  "blog_content",
  "blogContent",
  "html",
  "html_content",
  "full_content",
  "description",
] as const;
const IMAGE_KEYS = [
  "cover_image",
  "coverImage",
  "featured_image",
  "featuredImage",
  "thumbnail",
  "image",
  "banner",
  "hero_image",
] as const;
const TYPE_KEYS = ["type", "blog_type", "blogType", "space_type", "spaceType", "vertical"] as const;
const AUTHOR_KEYS = ["author", "author_name", "authorName", "written_by", "writtenBy"] as const;
const AUTHOR_ROLE_KEYS = ["author_role", "authorRole", "designation", "role"] as const;
const DATE_KEYS = [
  "published_at",
  "publishedAt",
  "publish_date",
  "publishDate",
  "added_on",
  "addedOn",
  "created_at",
  "createdAt",
  "updated_at",
  "updatedAt",
] as const;
const READ_KEYS = ["read_minutes", "readMinutes", "read_time", "readTime"] as const;
const TAG_KEYS = ["tags", "tag", "keywords", "labels"] as const;
const FEATURED_KEYS = ["featured", "is_featured", "isFeatured", "is_news", "isNews"] as const;
const ALT_KEYS = ["cover_image_alt", "coverImageAlt", "image_alt", "imageAlt", "alt_text", "altText"] as const;

export const BLOG_DEFAULT_AUTHOR = "SpaceWallah Editorial";

export const BLOG_DEFAULT_COVER =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80";

export const BLOG_API_TYPE_BY_VERTICAL: Record<SpaceVertical, string> = {
  coworking: "coworking",
  coliving: "coliving",
  "virtual-office": "virtual-office",
  "office-space": "office-space",
};

export const BLOG_VERTICALS: SpaceVertical[] = [
  "coworking",
  "coliving",
  "virtual-office",
  "office-space",
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function str(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v == null) return "";
  return String(v).trim();
}

function pickFirst(row: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = str(row[key]);
    if (value) return value;
  }
  return "";
}

function normalizeSlugSegment(value: string): string {
  const t = value.trim();
  if (!t) return "";
  if (t.includes("/")) {
    const parts = t.split("/").filter(Boolean);
    return (parts[parts.length - 1] ?? t).trim();
  }
  return t;
}

function pickSlug(row: Record<string, unknown>): string {
  for (const key of SLUG_KEYS) {
    const value = str(row[key]);
    if (value) return normalizeSlugSegment(value);
  }
  const blogId = str(row.blog_id ?? row.blogId);
  if (blogId && !/^[a-f0-9]{24}$/i.test(blogId)) return normalizeSlugSegment(blogId);
  return "";
}

function resolveImageUrl(raw: unknown): string {
  if (typeof raw === "string") {
    const s = raw.trim();
    if (/^https?:\/\//i.test(s)) return s;
  }
  if (!isRecord(raw)) return "";

  const direct = pickFirst(raw, ["s3_link", "url", "image_url", "link"]);
  if (direct && /^https?:\/\//i.test(direct)) return direct;

  for (const key of ["image", "cover_image", "featured_image", "thumbnail"]) {
    const nested = raw[key];
    const nestedUrl = resolveImageUrl(nested);
    if (nestedUrl) return nestedUrl;
  }

  return "";
}

function pickCoverImage(row: Record<string, unknown>): string {
  for (const key of IMAGE_KEYS) {
    const url = resolveImageUrl(row[key]);
    if (url) return url;
  }
  return BLOG_DEFAULT_COVER;
}

export function normalizeApiBlogType(raw: unknown): SpaceVertical | null {
  const s = str(raw).toLowerCase().replace(/_/g, "-");
  if (!s) return null;
  if (s.includes("cowork")) return "coworking";
  if (s.includes("coliv") || s === "pg") return "coliving";
  if (s.includes("virtual")) return "virtual-office";
  if (s.includes("office")) return "office-space";
  return null;
}

export function verticalToApiBlogType(vertical: SpaceVertical): string {
  return BLOG_API_TYPE_BY_VERTICAL[vertical];
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => str(item)).filter(Boolean);
  }
  const text = str(raw);
  if (!text) return [];
  if (text.includes(",")) {
    return text
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [text];
}

function parseBoolean(raw: unknown): boolean {
  return raw === true || raw === "true" || raw === 1 || raw === "1";
}

function parseDate(raw: unknown): string {
  const value = str(raw);
  if (!value) return new Date().toISOString();
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
  return new Date().toISOString();
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadMinutes(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function looksLikeHtml(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

function htmlToBlocks(html: string): BlogContentBlock[] {
  const text = stripHtml(html);
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({ type: "p" as const, text: part }));
}

function pickContent(row: Record<string, unknown>): { bodyHtml?: string; body: BlogContentBlock[] } {
  const content = pickFirst(row, CONTENT_KEYS);
  if (!content) return { body: [] };

  if (looksLikeHtml(content)) {
    return {
      bodyHtml: content,
      body: htmlToBlocks(content),
    };
  }

  return {
    body: [{ type: "p", text: content }],
  };
}

function mergeBlogRow(raw: unknown): Record<string, unknown> | null {
  if (!isRecord(raw)) return null;
  const nested =
    raw.data != null && isRecord(raw.data) && !Array.isArray(raw.data) ? raw.data : null;
  return nested ? { ...nested, ...raw } : { ...raw };
}

export function normalizeBlogListItem(raw: unknown): BlogPost | null {
  const row = mergeBlogRow(raw);
  if (!row) return null;

  const title = pickFirst(row, TITLE_KEYS);
  const slug = pickSlug(row);
  const id = str(row._id ?? row.id ?? slug);
  if (!title || !slug) return null;

  const apiType = pickFirst(row, TYPE_KEYS);
  const vertical = normalizeApiBlogType(apiType) ?? "coworking";
  const { body, bodyHtml } = pickContent(row);
  const contentForRead = bodyHtml ?? body.map((block) => ("text" in block ? block.text : "")).join(" ");
  const readMinutesRaw = pickFirst(row, READ_KEYS);
  const readMinutes = readMinutesRaw
    ? Math.max(1, Number.parseInt(readMinutesRaw, 10) || 1)
    : estimateReadMinutes(contentForRead);

  const excerpt =
    pickFirst(row, EXCERPT_KEYS) ||
    stripHtml(contentForRead).slice(0, 180).trim() ||
    title;

  return {
    id,
    slug,
    vertical,
    apiType: apiType || verticalToApiBlogType(vertical),
    title,
    excerpt,
    coverImage: pickCoverImage(row),
    coverImageAlt: pickFirst(row, ALT_KEYS) || title,
    author: pickFirst(row, AUTHOR_KEYS) || BLOG_DEFAULT_AUTHOR,
    authorRole: pickFirst(row, AUTHOR_ROLE_KEYS) || "Workspace advisors",
    publishedAt: parseDate(pickFirst(row, DATE_KEYS)),
    hasPublishDate: Number.isFinite(Date.parse(pickFirst(row, DATE_KEYS))),
    readMinutes,
    tags: (() => {
      for (const key of TAG_KEYS) {
        const parsed = parseTags(row[key]);
        if (parsed.length) return parsed;
      }
      return [];
    })(),
    featured: FEATURED_KEYS.some((key) => parseBoolean(row[key])),
    body,
    bodyHtml,
  };
}

export function normalizeBlogList(raw: unknown): BlogPost[] {
  const rows = Array.isArray(raw) ? raw : [];
  const posts: BlogPost[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const post = normalizeBlogListItem(row);
    if (!post || seen.has(post.slug)) continue;
    seen.add(post.slug);
    posts.push(post);
  }

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function normalizeBlogDetail(raw: unknown): BlogPost | null {
  return normalizeBlogListItem(raw);
}
