import type { SpaceVertical } from "@/types";

export const CONTACT_PHONE = "9457777791";
export const CONTACT_PHONE_DISPLAY = "+91 94577 77791";
export const CONTACT_PHONE_HREF = `tel:+91${CONTACT_PHONE}`;
export const CONTACT_EMAIL = "info@spacewallah.com";
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;

export const CONTACT_HOURS = "Mon – Sat, 9:00 AM – 7:00 PM IST";

export const CONTACT_SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/spacewallah/",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/spacewallah",
  },
] as const;

export const CONTACT_VERTICAL_OPTIONS: Array<{
  value: SpaceVertical | "general";
  label: string;
  mxSpaceType: string;
}> = [
  { value: "coworking", label: "Coworking space", mxSpaceType: "Web Coworking" },
  { value: "coliving", label: "Coliving Space", mxSpaceType: "Web Coliving" },
  { value: "virtual-office", label: "Virtual office", mxSpaceType: "Web Virtual Office" },
  { value: "office-space", label: "Managed office", mxSpaceType: "Web Office Space" },
  { value: "general", label: "General enquiry", mxSpaceType: "Contact page enquiry" },
];

export const CONTACT_TRUST_POINTS = [
  "Zero consultation cost",
  "Verified listings across India",
  "Expert shortlisting in 24 hours",
  "No spam — genuine leads only",
] as const;
