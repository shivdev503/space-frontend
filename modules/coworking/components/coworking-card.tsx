"use client";

import { RemoteImage as Image } from "@/components/ui/remote-image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";

import { ContactFormModal } from "@/components/contact/contact-form-modal";
import {
  workspaceCitySlugish,
  workspaceRating,
} from "@/modules/coworking/components/coworking-detail-header";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { listingAltBase } from "@/lib/image-alt";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import { spaceImageUrl, toSpaceImageCdnUrl } from "@/lib/space-image-url";

const LISTING_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=72";

function cardImageSrc(workspace: CoworkingModel.WorkSpace): string {
  const hero = typeof workspace.image === "string" ? toSpaceImageCdnUrl(workspace.image) : "";
  if (hero) return hero;
  const link = spaceImageUrl(workspace.images?.[0]?.image);
  return link || LISTING_IMAGE_FALLBACK;
}

function cardLocationLine(workspace: CoworkingModel.WorkSpace): string {
  return (
    workspace.location?.micro_location?.name?.trim() ||
    workspace.location?.micro_location?.id ||
    ""
  );
}

export function CoworkingCard({
  workspace,
  className,
}: {
  workspace: CoworkingModel.WorkSpace;
  className?: string;
}) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const rating = workspaceRating(workspace);
  const price = workspace.starting_price ?? 0;
  const micro = cardLocationLine(workspace);
  const spaceId = workspace.id || workspace._id || workspace.slug;

  return (
    <>
      <article className={cn("group flex h-full min-h-0 flex-col", className)}>
        <div className="relative shrink-0">
          <Link href={`/coworking/${workspace.slug}`} className="block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={cardImageSrc(workspace)}
                alt={listingAltBase(workspace.name, "coworking space", workspace.location?.micro_location?.name, workspace.location?.city?.name)}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          </Link>

          <button
            type="button"
            aria-label={`Save ${workspace.name}`}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur transition hover:scale-105 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-1.5 sm:gap-2">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/coworking/${workspace.slug}`}
                className="min-w-0 text-[0.9rem] font-semibold leading-snug text-ink sm:text-[0.98rem]"
              >
                <span className="line-clamp-1">{workspace.name}</span>
              </Link>
              {rating > 0 ? (
                <div className="inline-flex shrink-0 items-center gap-1 text-[0.85rem] font-medium text-ink sm:text-[0.92rem]">
                  <Star className="h-3.5 w-3.5 fill-[#f4a621] text-[#f4a621] sm:h-4 sm:w-4" />
                  <span>{rating}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-start gap-2 text-[0.85rem] text-muted sm:text-[0.92rem]">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <p className="line-clamp-1">{micro}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-[0.88rem] text-ink sm:text-[0.95rem]">
              <span className="font-semibold">{formatCurrency(price)}</span>
              <span className="text-muted"> /month</span>
            </p>
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="shrink-0 rounded-full bg-[color:var(--color-brand)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-white shadow-[0_8px_18px_rgba(76,175,80,0.28)] transition hover:bg-[color:var(--color-accent)] sm:px-4 sm:py-2 sm:text-[0.8125rem]"
            >
              Get Quote
            </button>
          </div>
        </div>
      </article>

      <ContactFormModal
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        leadTarget={{
          city: workspaceCitySlugish(workspace),
          spaceId,
        }}
        submitLabel="Get Quote"
        title="Get Quote"
        subtitle={`Share your details and we will follow up about ${workspace.name}.`}
        interestedInDefault={`${workspace.name} — quote`}
        mxSpaceType="Web Coworking"
        microlocation={micro}
      />
    </>
  );
}
