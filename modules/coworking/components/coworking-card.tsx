"use client";

import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { ContactFormModal } from "@/components/contact/contact-form-modal";
import { verifiedExplanation, verifiedOnDate } from "@/lib/verified";
import { ListingPhotoCarousel } from "@/components/ui/listing-photo-carousel";
import {
  workspaceCitySlugish,
  workspaceRating,
} from "@/modules/coworking/components/coworking-detail-header";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { listingAltBase } from "@/lib/image-alt";
import { CARD_PHOTO_MAX } from "@/lib/listing-photos";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import { spaceImageUrl, toSpaceImageCdnUrl } from "@/lib/space-image-url";
import { CompareToggle } from "@/modules/compare/compare-toggle";
import { ShortlistHeart } from "@/modules/shortlist/shortlist-heart";

const LISTING_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=72";

/** Hero first, then gallery photos in their saved order, without repeats. */
function cardImages(workspace: CoworkingModel.WorkSpace): string[] {
  const hero = typeof workspace.image === "string" ? toSpaceImageCdnUrl(workspace.image) : "";
  const gallery = [...(workspace.images ?? [])]
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    .map((img) => spaceImageUrl(img?.image));
  const unique = [...new Set([hero, ...gallery].filter(Boolean))].slice(0, CARD_PHOTO_MAX);
  return unique.length ? unique : [LISTING_IMAGE_FALLBACK];
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
  priority = false,
}: {
  workspace: CoworkingModel.WorkSpace;
  className?: string;
  /** First card in view on load: its first photo is the page's largest paint, so load it at once. */
  priority?: boolean;
}) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const rating = workspaceRating(workspace);
  const price = workspace.starting_price ?? 0;
  const micro = cardLocationLine(workspace);
  const verifiedOn = verifiedOnDate(workspace.verified_at);
  const spaceId = workspace.id || workspace._id || workspace.slug;
  const photoRef = useRef<HTMLDivElement>(null);
  const images = useMemo(() => cardImages(workspace), [workspace]);
  const image = images[0];
  const compareItem = useMemo(
    () => ({
      slug: workspace.slug,
      name: workspace.name,
      image,
      area: micro,
      city: workspace.location?.city?.name?.trim() || "",
    }),
    [workspace.slug, workspace.name, workspace.location?.city?.name, image, micro],
  );

  return (
    <>
      <article className={cn("group flex h-full min-h-0 flex-col", className)}>
        <div className="relative shrink-0">
          <ListingPhotoCarousel
            ref={photoRef}
            images={images}
            href={`/coworking/${workspace.slug.trim()}`}
            name={workspace.name}
            altBase={listingAltBase(workspace.name, "coworking space", workspace.location?.micro_location?.name, workspace.location?.city?.name)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="aspect-[16/11] rounded-lg sm:aspect-square sm:rounded-2xl"
            priority={priority}
          />

          {workspace.slug ? (
            <CompareToggle item={compareItem} flyFrom={photoRef} className="absolute left-2 top-2 sm:left-3 sm:top-3" />
          ) : null}

          {workspace.slug ? (
            <ShortlistHeart item={compareItem} className="absolute right-2 top-2 sm:right-3 sm:top-3" />
          ) : null}
        </div>

        <div className="mt-1.5 flex flex-1 flex-col gap-1.5 sm:mt-3 sm:gap-2">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/coworking/${workspace.slug.trim()}`}
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

            {/* "Verified" (date in the tooltip) shares the location row (right side, like the rating above it), so every
                card has the same rows and no gap opens under cards without it. */}
            <div className="flex items-center justify-between gap-2 text-[0.85rem] text-muted sm:text-[0.92rem]">
              <div className="flex min-w-0 items-center gap-2" title={micro}>
                <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <p className="truncate">{micro}</p>
              </div>
              {verifiedOn ? (
                <p
                  className="flex shrink-0 items-center gap-1 text-[0.75rem] font-semibold text-[color:var(--color-brand)] sm:text-[0.78rem]"
                  title={verifiedExplanation(workspace.verified_at, workspace.verified_method)}
                >
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
                  Verified
                  <span className="sr-only"> on {verifiedOn}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <p className="min-w-0 text-[0.88rem] text-ink sm:text-[0.95rem]">
              {price > 0 ? (
                <>
                  <span className="font-semibold">{formatCurrency(price)}</span>
                  <span className="text-muted"> /month</span>
                </>
              ) : (
                <span className="font-semibold">Price on request</span>
              )}
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
