import type { SpaceVertical } from "@/types";

/** Public URL segment per vertical (internal key stays "office-space"; the route is /managed-office). */
const VERTICAL_PATH: Record<SpaceVertical, string> = {
  coworking: "coworking",
  "virtual-office": "virtual-office",
  "office-space": "managed-office",
  coliving: "coliving",
};

export function verticalPath(vertical: SpaceVertical | string): string {
  return VERTICAL_PATH[vertical as SpaceVertical] ?? vertical;
}
