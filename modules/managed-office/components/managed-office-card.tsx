"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Users } from "lucide-react";

import { listingAltBase } from "@/lib/image-alt";
import {
  managedOfficeCityName,
  managedOfficeImages,
  managedOfficeLocality,
  managedOfficePlace,
  managedOfficeStartingPrice,
} from "@/modules/managed-office/managed-office-format";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

const LISTING_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=72";

export function ManagedOfficeCard({
  office,
  className,
}: {
  office: ManagedOfficeModel.ManagedOffice;
  className?: string;
}) {
  const href = `/managed-office/${office.slug}`;
  const image = managedOfficeImages(office).images[0] || LISTING_IMAGE_FALLBACK;
  const price = managedOfficeStartingPrice(office);
  const rating = office.rating?.average ?? 0;
  const building = office.location?.building_name?.trim();
  const minSeats = office.lease_terms?.min_seats;

  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block">
        <div className="relative aspect-[16/11] overflow-hidden rounded-lg bg-slate-100 sm:aspect-square sm:rounded-2xl">
          <Image
            src={image}
            alt={listingAltBase(office.name, "managed office", managedOfficeLocality(office), managedOfficeCityName(office))}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {office.is_new_launch ? (
            <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-slate-950/85 px-3 py-1 text-[0.72rem] font-semibold text-white shadow-lg backdrop-blur-sm">
              New launch
            </div>
          ) : null}
        </div>
      </Link>

      <div className="mt-1.5 space-y-0.5 sm:mt-3 sm:space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="min-w-0 text-[0.9rem] font-semibold leading-snug text-ink sm:text-[0.98rem]">
            <span className="line-clamp-2">{building ? `${office.name}, ${building}` : office.name}</span>
          </Link>
          {rating > 0 ? (
            <div className="inline-flex shrink-0 items-center gap-1 text-[0.85rem] font-medium text-ink sm:text-[0.92rem]">
              <Star className="h-3.5 w-3.5 fill-[#f4a621] text-[#f4a621] sm:h-4 sm:w-4" />
              <span>{rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-start gap-2 text-[0.85rem] text-muted sm:text-[0.92rem]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <p className="line-clamp-2">{managedOfficePlace(office)}</p>
        </div>

        {minSeats ? (
          <div className="flex items-center gap-2 text-[0.82rem] text-muted sm:text-[0.88rem]">
            <Users className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span>From {minSeats} seats</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-0.5 sm:pt-1">
          <div className="text-[0.88rem] text-ink sm:text-[0.95rem]">
            {price ? (
              <>
                <span className="font-semibold">{formatCurrency(price)}</span>
                <span className="text-muted"> / seat / month</span>
              </>
            ) : (
              <span className="font-semibold">Price on request</span>
            )}
          </div>
          <Link
            href={href}
            className="shrink-0 text-[0.82rem] font-semibold text-[color:var(--color-brand)] underline-offset-4 transition hover:underline sm:text-[0.88rem]"
          >
            Get Quote
          </Link>
        </div>
      </div>
    </article>
  );
}
