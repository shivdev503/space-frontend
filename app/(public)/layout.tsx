import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { CompareTray } from "@/modules/compare/compare-tray";
import { ShortlistToast } from "@/modules/shortlist/shortlist-toast";
import { publicRouteExists } from "@/lib/public-route-exists";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (!(await publicRouteExists(pathname))) notFound();

  return (
    <>
      <Header />
      <PublicContentShell>{children}</PublicContentShell>
      <CompareTray />
      <ShortlistToast />
    </>
  );
}
