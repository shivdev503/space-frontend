"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import type { Space } from "@/types";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import { verticalPath } from "@/lib/vertical-path";

const LISTING_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=72";

export function OfficeSpaceSeedCard({
  space,
  className,
}: {
  space: Space;
  className?: string;
}) {
  return (
    <article className={cn("group flex h-full min-h-0 flex-col", className)}>
      <Link href={`/${verticalPath(space.vertical)}/${space.slug}`} className="block shrink-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={space.images?.[0]?.trim() ? space.images[0] : LISTING_IMAGE_FALLBACK}
            alt={space.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {space.spaceTag ? (
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-slate-950/85 px-3 py-1.5 text-[0.75rem] font-semibold text-white shadow-lg backdrop-blur-sm">
              {space.spaceTag}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-1">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/${verticalPath(space.vertical)}/${space.slug}`}
              className="min-w-0 text-[0.98rem] font-semibold leading-snug text-ink"
            >
              <span className="line-clamp-1">{space.name}</span>
            </Link>
            {space.rating > 0 ? (
              <div className="inline-flex shrink-0 items-center gap-1 text-[0.92rem] font-medium text-ink">
                <Star className="h-4 w-4 fill-[#f4a621] text-[#f4a621]" />
                <span>{space.rating}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-start gap-2 text-[0.92rem] text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="line-clamp-1">{space.address || space.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-[0.95rem] text-ink">
            <span className="font-semibold">{formatCurrency(space.price)}</span>
            <span className="text-muted"> / per month</span>
          </div>
          <Link
            href={`/${verticalPath(space.vertical)}/${space.slug}`}
            className="shrink-0 text-[0.88rem] font-semibold text-[color:var(--color-brand)] underline-offset-4 transition hover:underline"
          >
            Get Quote
          </Link>
        </div>
      </div>
    </article>
  );
}

