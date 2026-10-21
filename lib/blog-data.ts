import type { SpaceVertical } from "@/types";

export const BLOG_VERTICAL_LABELS: Record<SpaceVertical, string> = {
  coworking: "Coworking",
  coliving: "Coliving Space",
  "virtual-office": "Virtual Office",
  "office-space": "Managed Office",
};

export const BLOG_VERTICAL_HREF: Record<SpaceVertical, string> = {
  coworking: "/coworking",
  coliving: "/coliving",
  "virtual-office": "/virtual-office",
  "office-space": "/managed-office",
};

export function formatBlogDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}
