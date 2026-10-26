import { ReactNode } from "react";

import { type BreadcrumbItem, Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { cn } from "@/utils/cn";

export function CityPageHero({
  eyebrow,
  title,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
}) {
  const hasRail = Boolean(children);
  return (
    <section
      className={cn(
        "relative overflow-hidden pt-6 sm:pt-14",
        hasRail ? "pb-2 sm:pb-4" : "pb-6 sm:pb-14",
      )}
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(48,88,215,0.12),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#ffffff_92%)]" />
      <Container>
        <div className="max-w-4xl">
          {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-3 sm:mb-4" /> : null}
          {eyebrow ? (
            <Badge className="bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
              {eyebrow}
            </Badge>
          ) : null}
          <h1 className="mt-3 font-display text-[1.5rem] leading-[1.12] tracking-[-0.04em] text-ink sm:mt-5 sm:text-5xl">
            {title}
          </h1>
        </div>
        {children ? (
          <div className="mt-4 w-full min-w-0 sm:mt-6">{children}</div>
        ) : null}
      </Container>
    </section>
  );
}
