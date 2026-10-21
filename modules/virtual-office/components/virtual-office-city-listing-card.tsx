"use client";

import { RemoteImage as Image } from "@/components/ui/remote-image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CreditCard,
  MapPin,
  RefreshCw,
  Star,
} from "lucide-react";

import { ContactFormModal } from "@/components/contact/contact-form-modal";
import { virtualOfficePlanRows } from "@/lib/virtual-office-workspace-plans";
import { deriveAppCitySlugFromWorkspace } from "@/services/coworking-workspace-mapper";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
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

function locationSubtitle(workspace: CoworkingModel.WorkSpace): string {
  const city = workspace.location?.city?.name?.trim() ?? "";
  const micro = workspace.location?.micro_location?.name?.trim() ?? "";
  if (city && micro) return `${city}, ${micro}`;
  return city || micro || workspace.location?.address?.trim() || "";
}

function isPopularWorkspace(workspace: CoworkingModel.WorkSpace): boolean {
  const tag = (workspace.spaceTag ?? "").toString().toLowerCase();
  if (tag.includes("popular")) return true;
  const r = Number(workspace.ratings);
  return Number.isFinite(r) && r >= 4.5;
}

export function VirtualOfficeCityListingCard({
  workspace,
  className,
}: {
  workspace: CoworkingModel.WorkSpace;
  className?: string;
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const rows = useMemo(() => virtualOfficePlanRows(workspace), [workspace]);
  const subtitle = useMemo(() => locationSubtitle(workspace), [workspace]);
  const leadTarget = useMemo(
    () => ({
      city: deriveAppCitySlugFromWorkspace(workspace),
      spaceId: workspace.id || workspace._id,
    }),
    [workspace],
  );
  const href = `/virtual-office/${workspace.slug}`;
  const popular = isPopularWorkspace(workspace);

  return (
    <>
    <article
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm sm:flex-row sm:shadow-[0_8px_28px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      <Link
        href={href}
        className="relative block aspect-[5/3] w-full shrink-0 sm:aspect-auto sm:w-[min(32%,240px)] sm:min-w-[160px] sm:max-w-[260px] sm:self-stretch sm:min-h-[168px]"
      >
        <Image
          src={cardImageSrc(workspace)}
          alt={workspace.name}
          fill
          className="object-cover transition duration-300 hover:opacity-95"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 50vw"
        />
        {popular ? (
          <div className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[0.65rem] font-semibold text-ink shadow-sm backdrop-blur">
            <Star className="h-3 w-3 fill-[#f4a621] text-[#f4a621]" aria-hidden />
            Popular
          </div>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5 sm:gap-2 sm:py-3 sm:pl-3.5 sm:pr-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50/90 px-2 py-0.5 text-[0.65rem] font-semibold leading-tight text-[color:var(--color-brand)]">
            <MapPin className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
            Premium Address
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50/90 px-2 py-0.5 text-[0.65rem] font-semibold leading-tight text-[color:var(--color-brand)]">
            <CreditCard className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
            Digital KYC & Agreement
          </span>
        </div>

        <div className="min-w-0">
          <Link
            href={href}
            className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-ink hover:text-[color:var(--color-brand)] sm:text-base"
          >
            {workspace.name}
          </Link>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">{subtitle}</p>
          ) : null}
        </div>

        <p className="flex items-center gap-1.5 text-xs leading-snug text-ink">
          <RefreshCw className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-brand)]" aria-hidden />
          <span>Get your documents in just 1 working day</span>
        </p>

        {rows.length > 0 ? (
          <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
            <div className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-slate-200/70 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted">
              <span>Solutions</span>
              <span className="text-right tabular-nums">Prices starting at</span>
            </div>
            <div className="mt-1.5 space-y-1">
              {rows.map((row, i) => (
                <div
                  key={`${workspace.id || workspace._id}-row-${i}`}
                  className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-slate-200/50 py-1 text-xs last:border-0 last:pb-0"
                >
                  <span className="text-ink">{row.label}</span>
                  <span className="text-right tabular-nums font-semibold text-ink">
                    {formatCurrency(row.price)}
                    <span className="whitespace-nowrap font-normal text-muted"> /month</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted">Contact us for package pricing.</p>
        )}

        <div className="mt-auto pt-0.5">
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="inline-flex max-w-full items-center gap-1 text-left text-xs font-semibold text-[color:var(--color-brand)] hover:underline sm:text-[0.8125rem]"
          >
            <span className="min-w-0 truncate">Get Quote for {workspace.name}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </button>
        </div>
      </div>
    </article>

    <ContactFormModal
      open={contactOpen}
      onOpenChange={setContactOpen}
      leadTarget={leadTarget}
      submitLabel="Get Quote"
      title="Get Quote"
      subtitle={`Share your details and we will follow up about ${workspace.name}.`}
      interestedInDefault={`${workspace.name} — quote`}
      mxSpaceType="Virtual Office"
    />
    </>
  );
}
