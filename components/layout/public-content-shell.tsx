"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

/**
 * Offset page content below the fixed header (h-20). Homepage hero sits under
 * the transparent header instead, so it skips the padding.
 */
export function PublicContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <div
      className={cn(
        // `clip`, not `hidden`: hidden creates a scroll container and breaks `position: sticky` below.
        "min-h-screen overflow-x-clip bg-[color:var(--color-page-bg)]",
        !isHomepage && "pt-20",
      )}
    >
      {children}
    </div>
  );
}
