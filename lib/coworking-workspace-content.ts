import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { SeoContent } from "@/types/seo.model";

type WorkspaceCopy = Pick<CoworkingModel.WorkSpace, "description" | "new_description" | "new_seo">;

/** Listing copy (HTML): `new_description`, falling back to the legacy `description`. */
export function workspaceDescriptionHtml(workspace: WorkspaceCopy): string {
  return workspace.new_description?.trim() || workspace.description?.trim() || "";
}

/** Plain-text version of {@link workspaceDescriptionHtml} — tags stripped, whitespace collapsed. */
export function workspaceDescriptionText(workspace: WorkspaceCopy): string {
  return workspaceDescriptionHtml(workspace)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Per-space SEO from `new_seo`, or null when it is missing, disabled, or has no title. */
export function workspaceSeo(workspace: WorkspaceCopy): SeoContent | null {
  const seo = workspace.new_seo;
  if (!seo || seo.status === false || !seo.title?.trim()) return null;
  return seo;
}
