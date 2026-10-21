import { SpaceVertical } from "@/types";

export const APP_NAME = "SpaceWallah";

/** Markets listed under every vertical (header dropdown + footer columns). */
export const siteCities: ReadonlyArray<{ name: string; slug: string }> = [
  { name: "Gurgaon", slug: "gurgaon" },
  { name: "Noida", slug: "noida" },
  { name: "Delhi", slug: "delhi" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "Pune", slug: "pune" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Ahmedabad", slug: "ahmedabad" },
  { name: "Jaipur", slug: "jaipur" },
  { name: "Chennai", slug: "chennai" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Indore", slug: "indore" },
];

export const verticals: Array<{
  key: SpaceVertical;
  label: string;
  href: string;
  description: string;
}> = [
  {
    key: "coworking",
    label: "Coworking Spaces",
    href: "/coworking",
    description: "Flexible, premium workspaces for teams and solo professionals.",
  },
  {
    key: "virtual-office",
    label: "Virtual Offices",
    href: "/virtual-office",
    description: "Compliance-ready business addresses built for modern operators.",
  },
  {
    key: "office-space",
    label: "Managed Office",
    href: "/managed-office",
    description: "Fully managed office solutions for growing teams across India.",
  },
  {
    key: "coliving",
    label: "Coliving Space",
    href: "/coliving",
    description: "Furnished coliving rooms and PG options near campuses and business hubs.",
  },
];
