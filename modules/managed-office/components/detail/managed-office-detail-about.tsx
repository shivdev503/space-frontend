"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { toSpaceImageCdnUrl } from "@/lib/space-image-url";
import {
  CoworkingDetailBlock,
  CoworkingDetailEyebrow,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { cn } from "@/utils/cn";
import { toTitleCase } from "@/utils/format";

import { managedOfficeCityName, managedOfficeDescription, managedOfficeLocality } from "../../managed-office-format";
import { managedOfficeLockIn, managedOfficeMinSeats, managedOfficeSeatTypes } from "./managed-office-detail-facts";

function plainParagraphs(raw: string): string[] {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Same layout as the coworking "About the space": brand card, then the description with Read more. */
export function ManagedOfficeDetailAbout({ office }: { office: ManagedOfficeModel.ManagedOffice }) {
  const [open, setOpen] = useState(false);
  const locality = managedOfficeLocality(office);
  const city = managedOfficeCityName(office);
  const building = office.location?.building_name?.replace(/\s+/g, " ").trim() || "";
  const brandName = office.brand?.name?.trim() || "";
  const brandLine =
    office.brand?.brand_tag_line?.trim() || office.brand?.logo_tag_line?.trim() || "Managed office operator";
  const logo = toSpaceImageCdnUrl(office.brand?.image?.s3_link ?? "");

  const paragraphs = useMemo(() => {
    const fromApi = plainParagraphs(managedOfficeDescription(office));
    if (fromApi.length) return fromApi;
    // No description yet: a factual summary from the listing fields.
    const seatType = managedOfficeSeatTypes(office)[0]?.toLowerCase();
    const minSeats = managedOfficeMinSeats(office);
    const lockIn = managedOfficeLockIn(office);
    const where = [building, locality ? toTitleCase(locality) : "", city ? toTitleCase(city) : ""].filter(Boolean).join(", ");
    return [
      `${brandName || "This operator"} offers a managed office${where ? ` at ${where}` : ""}${seatType ? `, available as ${seatType}` : ""}.` +
        (minSeats || lockIn
          ? ` Plans start${minSeats ? ` at ${minSeats} seats` : ""}${lockIn ? ` with a ${lockIn} lock-in` : ""}.`
          : "") +
        " Talk to a SpaceWallah expert for a site visit, a custom layout and the best price.",
    ];
  }, [office, brandName, building, locality, city]);

  const canExpand = paragraphs.join(" ").split(/\s+/).length > 45;
  const place = locality ? toTitleCase(locality) : city ? toTitleCase(city) : "";

  return (
    <CoworkingDetailBlock id="about">
      <CoworkingDetailEyebrow>About the office</CoworkingDetailEyebrow>
      <CoworkingDetailSectionTitle>
        {brandName ? `A managed ${brandName} office` : "A managed office"}
        {place ? ` in ${place}` : ""}
      </CoworkingDetailSectionTitle>

      {brandName ? (
        <div className="mt-5 flex items-center gap-4 rounded-[14px] border border-[#E7E9E6] bg-[#F3F1EA] p-4">
          {logo ? (
            <Image
              src={logo}
              alt={brandName}
              width={62}
              height={62}
              className="h-[62px] w-[62px] shrink-0 rounded-xl border border-[#E7E9E6] bg-white object-contain p-2"
            />
          ) : (
            <div className="grid h-[62px] w-[62px] shrink-0 place-items-center rounded-xl bg-ink text-[17px] font-extrabold text-white">
              {brandName.slice(0, 4)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-ink">{brandName}</p>
            <p className="text-[13.5px] text-muted">{brandLine}</p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "relative mt-5 text-[15.5px] leading-[1.7] text-[#3b4048] sm:text-[16.5px]",
          !open && canExpand && "max-h-[155px] overflow-hidden",
        )}
      >
        {paragraphs.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-4" : undefined}>
            {p}
          </p>
        ))}
        {!open && canExpand ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-[color:var(--color-page-bg)] to-transparent" />
        ) : null}
      </div>

      {canExpand ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-bold text-[color:var(--color-brand)]"
        >
          {open ? "Read less" : "Read more"}
          <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} aria-hidden />
        </button>
      ) : null}
    </CoworkingDetailBlock>
  );
}
