import { Container } from "@/components/ui/container";
import { cn } from "@/utils/cn";
import { looksLikeEditorHtml, prepareCmsFooterHtml } from "@/lib/cms-html";

const editorProse = cn(
  "cms-footer-prose text-sm leading-relaxed text-ink/85 sm:text-base",
  "[&_p]:mb-4 [&_p:last-child]:mb-0",
  "[&_h1]:mb-3 [&_h1]:mt-0 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-semibold",
  "[&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:first:mt-0",
  "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_a]:font-medium [&_a]:!text-[#12B886] [&_a]:underline-offset-2 [&_a]:transition hover:[&_a]:underline hover:[&_a]:!text-[#0B3B2E]",
  "[&_ul]:my-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:text-ink/85",
  "[&_ol]:my-3 [&_ol]:ml-5 [&_ol]:list-decimal",
  "[&_li]:my-1",
  "[&_strong]:font-semibold [&_b]:font-semibold",
  "[&_em]:italic",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:text-ink/75 [&_blockquote]:italic",
  "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg",
  "[&_hr]:my-6 [&_hr]:border-slate-200",
  "[&_table]:my-4 [&_table]:w-full [&_table]:min-w-0 [&_table]:max-w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm",
  "[&_th]:border [&_th]:border-slate-200 [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:whitespace-normal",
  "[&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_td]:whitespace-normal",
  "[&_colgroup]:min-w-0",
);

type Props = {
  title?: string | null;
  description?: string | null;
  /** Render the editor's H2s as H3s, for pages that already have their own H2 sections. */
  demoteHeadings?: boolean;
};

/**
 * Renders SEO footer fields **above** the site `<Footer>`: title + rich HTML
 * from the editor (`footer_description`), with typographic classes for `p`, `h*`,
 * lists, links, blockquotes, etc.
 */
export function SeoFooterContentSection({ title, description, demoteHeadings = false }: Props) {
  const t = title?.trim() ?? "";
  const d = description?.trim() ?? "";
  if (!t && !d) return null;

  const hasHtml = d.length > 0 && looksLikeEditorHtml(d);
  const preparedHtml = hasHtml ? prepareCmsFooterHtml(d) : "";
  const safeHtml = demoteHeadings ? preparedHtml.replace(/<(\/?)h2\b/gi, "<$1h3") : preparedHtml;
  const plainForFallback = d.length > 0 && !hasHtml ? d : "";

  return (
    <section
      className="border-t border-slate-200/80 bg-white"
      aria-label={t || "About this page"}
    >
      <Container className="py-10 sm:py-12">
        {t ? (
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t}
          </h2>
        ) : null}
        {d ? (
          hasHtml ? (
            <div className={cn(t ? "mt-5" : "mt-0", "max-w-full overflow-x-auto")}>
              <div
                className={cn("min-w-0", editorProse)}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            </div>
          ) : (
            <p
              className={cn(
                t ? "mt-4" : "mt-0",
                "whitespace-pre-line text-sm leading-relaxed text-ink/85 sm:text-base",
              )}
            >
              {plainForFallback}
            </p>
          )
        ) : null}
      </Container>
    </section>
  );
}
