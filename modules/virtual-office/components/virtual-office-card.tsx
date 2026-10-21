"use client";

import { RemoteImage as Image } from "@/components/ui/remote-image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";

import type { Space } from "@/types";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import { verticalPath } from "@/lib/vertical-path";

const LISTING_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=72";

export function VirtualOfficeCard({
  space,
  className,
}: {
  space: Space;
  className?: string;
}) {
  const minPlanPrice = space.plans?.length
    ? space.plans.reduce<number | null>((min, plan) => {
        const price =
          typeof plan.price === "number" && Number.isFinite(plan.price) ? plan.price : null;
        if (price === null) return min;
        return min === null ? price : Math.min(min, price);
      }, null)
    : null;

  return (
    <article className={cn("group flex h-full min-h-0 flex-col", className)}>
      <div className="relative shrink-0">
        <Link href={`/${verticalPath(space.vertical)}/${space.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={space.images?.[0]?.trim() ? space.images[0] : LISTING_IMAGE_FALLBACK}
              alt={space.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </Link>

        <button
          type="button"
          aria-label={`Save ${space.name}`}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur transition hover:scale-105"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

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
            <p className="line-clamp-1">{space.location}</p>
          </div>
        </div>

        <div className="pt-1 text-[0.95rem] text-ink">
          <span className="font-semibold">{formatCurrency(minPlanPrice ?? space.price)}</span>
          <span className="text-muted"> /year</span>
        </div>
      </div>
    </article>
  );
}

