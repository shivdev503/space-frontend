import type { ReactNode } from "react";

import { HostHeader } from "@/components/layout/host-header";

/** Prevents wide host flows (wizard chrome, grids) from causing page-level horizontal scroll. */
export default function AddLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HostHeader />
      <div className="min-w-0 overflow-x-hidden">{children}</div>
    </>
  );
}
