import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import { Container } from "@/components/ui/container";
import { BLOG_VERTICAL_HREF, BLOG_VERTICAL_LABELS, formatBlogDate } from "@/lib/blog-data";
import { BlogProse } from "@/modules/blog/components/blog-prose";
import { BlogVerticalBadge } from "@/modules/blog/components/blog-vertical-badge";
import { RelatedBlogPosts } from "@/modules/blog/components/related-blog-posts";
import type { BlogPost } from "@/types/blog";

export function BlogDetailPage({
  post,
  related,
}: {
  post: BlogPost;
  related: BlogPost[];
}) {
  return (
    <article>
      <section className="relative overflow-hidden pb-8 pt-10 sm:pb-10 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(76,175,80,0.12),transparent_32%),linear-gradient(180deg,#f8faf8_0%,#ffffff_94%)]" />
        <Container className="max-w-[920px]">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="transition hover:text-ink">
                  Blog
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="line-clamp-1 text-ink">{post.title}</li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <BlogVerticalBadge vertical={post.vertical} />
            <span className="text-sm text-muted">{formatBlogDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <Clock className="h-4 w-4" aria-hidden />
              {post.readMinutes} min read
            </span>
          </div>

          <h1 className="mt-5 font-display text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.65rem]">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">{post.excerpt}</p>

          <p className="mt-6 text-sm text-muted">
            By <span className="font-medium text-ink">{post.author}</span>
            <span className="mx-2 text-slate-300">·</span>
            {post.authorRole}
          </p>
        </Container>
      </section>

      <Container className="max-w-[920px]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-slate-100 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)]">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 920px) 100vw, 920px"
          />
        </div>

        <div className="mt-10 sm:mt-12">
          <BlogProse blocks={post.body} bodyHtml={post.bodyHtml} />
        </div>

        {post.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-12 rounded-[1.35rem] border border-[color:var(--color-brand)]/20 bg-[linear-gradient(125deg,#16351a_0%,#2e7d32_100%)] p-7 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
            Explore on SpaceWallah
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-[1.75rem]">
            Ready to explore {BLOG_VERTICAL_LABELS[post.vertical].toLowerCase()} options?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            Browse verified listings, compare pricing, and talk to our advisors at zero consultation
            cost.
          </p>
          <Link
            href={BLOG_VERTICAL_HREF[post.vertical]}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-accent)] transition hover:bg-[#f1f8f1]"
          >
            Explore listings
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <RelatedBlogPosts posts={related} />
      </Container>
    </article>
  );
}
