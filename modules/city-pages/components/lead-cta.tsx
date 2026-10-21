"use client";

import type { SpaceVertical } from "@/types";

type LeadCTAProps = {
  title: string;
  description: string;
  ctaLabel: string;
  citySlug: string;
  vertical?: SpaceVertical;
  microlocation?: string;
};

function leadModalConfig(vertical?: SpaceVertical) {
  if (vertical === "coliving") {
    return {
      mxSpaceType: "Coliving",
      spaceListingKey: "living_space" as const,
      interestedInDefault: "Coliving consultation",
    };
  }
  if (vertical === "virtual-office") {
    return {
      mxSpaceType: "Virtual Office",
      spaceListingKey: "work_space" as const,
      interestedInDefault: "Virtual office consultation",
    };
  }
  if (vertical === "office-space") {
    return {
      mxSpaceType: "Office Space",
      spaceListingKey: "office_space" as const,
      interestedInDefault: "Office space consultation",
    };
  }
  return {
    mxSpaceType: "Web Coworking",
    spaceListingKey: "work_space" as const,
    interestedInDefault: "Coworking consultation",
  };
}

export function LeadCTA({
  title,
  description,
  ctaLabel,
  citySlug,
  vertical,
  microlocation = "",
}: LeadCTAProps) {
  return null;
}
