import type { Metadata } from "next";

type SearchParams = Record<string, string | string[] | undefined>;

export function pageFromSearchParams(searchParams: SearchParams): number {
  const raw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const page = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(page) && page > 1 ? page : 1;
}

/**
 * `?page=2` of a listing is its own page for Google: self canonical and a distinct title.
 * Filtered URLs keep the clean canonical, so filters never create indexable pages.
 */
export function withPageMetadata(metadata: Metadata, searchParams: SearchParams): Metadata {
  const page = pageFromSearchParams(searchParams);
  const canonical = metadata.alternates?.canonical;
  if (page === 1 || typeof canonical !== "string" || Object.keys(searchParams).length > 1) return metadata;

  const title =
    typeof metadata.title === "object" && metadata.title && "absolute" in metadata.title
      ? metadata.title.absolute
      : String(metadata.title ?? "");
  return {
    ...metadata,
    title: { absolute: `${title} | Page ${page}` },
    alternates: { ...metadata.alternates, canonical: `${canonical}?page=${page}` },
  };
}
