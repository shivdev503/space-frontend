import { Container } from "@/components/ui/container";
import { BlogListingExperience } from "@/modules/blog/components/blog-listing-experience";
import { loadBlogIndexData } from "@/services/blog-api";

export async function BlogIndexPage() {
  const { posts, featured } = await loadBlogIndexData();

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-10 sm:pb-8 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(76,175,80,0.14),transparent_34%),linear-gradient(180deg,#f8faf8_0%,#ffffff_92%)]" />
        <Container className="max-w-[1100px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-brand)]">
            SpaceWallah Blog
          </p>
          <h1 className="mt-4 max-w-[18ch] font-display text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl">
            Insights for every workspace decision
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Practical guides on coworking, coliving, virtual offices, and managed office — written for
            founders, operators, and teams across India.
          </p>
        </Container>
      </section>

      <section className="pb-20 sm:pb-28">
        <Container className="max-w-[1100px]">
          <BlogListingExperience posts={posts} featured={featured} />
        </Container>
      </section>
    </>
  );
}
