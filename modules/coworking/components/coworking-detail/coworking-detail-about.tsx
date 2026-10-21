"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import {
  CoworkingDetailBlock,
  CoworkingDetailEyebrow,
  CoworkingDetailSectionTitle,
} from "@/modules/coworking/components/coworking-detail/coworking-detail-ui";
import { workspaceDescriptionHtml } from "@/lib/coworking-workspace-content";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { cn } from "@/utils/cn";
import { toTitleCase } from "@/utils/format";
import { toSpaceImageCdnUrl } from "@/lib/space-image-url";

function plainDescription(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function CoworkingDetailAbout({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const [open, setOpen] = useState(false);
  const micro = workspace.location?.micro_location?.name?.trim() || "this location";
  const city = workspace.location?.city?.name?.trim() || "";
  const brandName = workspace.brand?.name?.trim() || "Coworking operator";
  const brandLine =
    workspace.brand?.brand_tag_line?.trim() ||
    workspace.brand?.logo_tag_line?.trim() ||
    "Premium workspace for growing teams";
  // Brand logos keep their stored path (their `folder_name` doesn't match where the file lives).
  const logo = toSpaceImageCdnUrl(workspace.brand?.image?.s3_link ?? "");

  const paragraphs = useMemo(() => {
    const text = plainDescription(workspaceDescriptionHtml(workspace));
    if (!text) {
      return [
        `${workspace.name} offers flexible coworking on ${toTitleCase(micro)}${city ? `, ${toTitleCase(city)}` : ""} with desks, meeting rooms, and managed office support.`,
      ];
    }
    return text.split(/\n+/).filter(Boolean);
  }, [workspace, micro, city]);

  const canExpand = paragraphs.join(" ").split(/\s+/).length > 45;

  return (
    <CoworkingDetailBlock>
      <CoworkingDetailEyebrow>About the space</CoworkingDetailEyebrow>
      <CoworkingDetailSectionTitle>
        A premium {brandName} address on {toTitleCase(micro)}
      </CoworkingDetailSectionTitle>

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
          className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-bold text-[color:var(--color-brand)]"
        >
          {open ? "Read less" : "Read more"}
          <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} aria-hidden />
        </button>
      ) : null}
    </CoworkingDetailBlock>
  );
}
