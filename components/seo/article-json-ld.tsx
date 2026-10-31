import { absoluteUrl } from "@/components/seo/breadcrumbs";
import { BLOG_DEFAULT_COVER, BLOG_DEFAULT_AUTHOR } from "@/services/blog-mapper";
import type { BlogPost } from "@/types/blog";
import { APP_NAME } from "@/utils/constants";

/** Article structured data for a blog post. Fallback values (stock cover, default byline, today's date) are not claimed as the post's own. */
export function ArticleJsonLd({ post }: { post: BlogPost }) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const publisher = {
    "@type": "Organization",
    name: APP_NAME,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") },
  };

  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.coverImage && post.coverImage !== BLOG_DEFAULT_COVER ? { image: [post.coverImage] } : {}),
    ...(post.hasPublishDate ? { datePublished: post.publishedAt } : {}),
    author:
      post.author === BLOG_DEFAULT_AUTHOR
        ? { "@type": "Organization", name: APP_NAME, url: absoluteUrl("/") }
        : { "@type": "Person", name: post.author },
    publisher,
  }).replace(/</g, "\\u003c");

  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: json }} />;
}
