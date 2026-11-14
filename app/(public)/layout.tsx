import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { CompareTray } from "@/modules/compare/compare-tray";
import { ShortlistToast } from "@/modules/shortlist/shortlist-toast";
import { publicRouteExists, retiredAreaRedirect } from "@/lib/public-route-exists";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const retired = await retiredAreaRedirect(pathname);
  if (retired) permanentRedirect(retired);
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
