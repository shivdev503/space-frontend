"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { isSiteHeaderHidden } from "@/lib/header-visibility";
import { cn } from "@/utils/cn";

/**
 * Offset page content below the fixed header (h-20). Homepage hero sits under
 * the transparent header instead, and pages without the site header need no offset.
 */
export function PublicContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noOffset = pathname === "/" || isSiteHeaderHidden(pathname);

  return (
    <div
      className={cn(
        // `clip`, not `hidden`: hidden creates a scroll container and breaks `position: sticky` below.
        "min-h-screen overflow-x-clip bg-[color:var(--color-page-bg)]",
        !noOffset && "pt-20",
      )}
    >
      {children}
    </div>
  );
}
