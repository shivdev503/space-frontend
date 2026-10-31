"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, Phone, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { isHostTopBarHidden } from "@/lib/header-visibility";
import { CONTACT_PHONE_HREF } from "@/lib/contact-data";
import { HostLogoutButton } from "@/modules/listing/components/host-logout-button";
import { cn } from "@/utils/cn";

import "@/modules/listing/components/host-listings-dashboard.css";

const DASHBOARD_PATH = "/add/dashboard";

/**
 * Header for signed-in hosts: only what they need to manage listings, so nothing leads them away
 * from the panel. The logo stays inside the panel too, unlike the site header.
 */
export function HostHeader() {
  const pathname = usePathname();
  if (isHostTopBarHidden(pathname)) return null;

  const onDashboard = pathname === DASHBOARD_PATH;

  return (
    <header className="host-bar sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href={DASHBOARD_PATH} className="flex min-w-0 items-center gap-2.5" aria-label="SpaceWallah host dashboard">
          <Image
            src="/spacewallah-app-icon.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 sm:hidden"
          />
          <Image
            src="/spacewallah-logo-color.svg"
            alt="SpaceWallah"
            width={150}
            height={34}
            className="hidden h-[30px] w-auto object-contain sm:block"
          />
          <span className="hidden rounded-full bg-[#EDF7EE] px-2.5 py-1 text-xs font-semibold text-[#2f8035] md:inline">
            Host
          </span>
        </Link>

        <nav aria-label="Host panel" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href={DASHBOARD_PATH}
            aria-label="My listings"
            aria-current={onDashboard ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition",
              onDashboard ? "bg-slate-100 text-ink" : "text-slate-600 hover:bg-slate-50 hover:text-ink",
            )}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">My listings</span>
          </Link>
          <Link
            href="/add"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[color:var(--color-brand)] px-3.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent)]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            <span className="hidden sm:inline">Add listing</span>
            <span className="sm:hidden">Add</span>
          </Link>
          <a
            href={CONTACT_PHONE_HREF}
            aria-label="Call SpaceWallah for help"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ink"
          >
            <Phone className="h-4 w-4" aria-hidden />
            <span className="hidden lg:inline">Help</span>
          </a>
          <HostLogoutButton variant="light" />
        </nav>
      </div>
    </header>
  );
}
