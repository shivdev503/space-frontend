"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Building2,
  Home,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

import {
  formatListingDate,
  kindLabel,
  statusTone,
  type HostListingCard,
  type HostListingKind,
  type StatusTone,
} from "@/lib/host-listing-dashboard";

import "./host-listings-dashboard.css";
import { HostLogoutButton } from "./host-logout-button";

const KIND_ICONS: Record<HostListingKind, typeof Users> = {
  coworking: Users,
  office: Building2,
  coliving: Home,
};

type FilterKey = "all" | HostListingKind;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "coworking", label: "Coworking" },
  { key: "office", label: "Office" },
  { key: "coliving", label: "PG & Co-living" },
];

function StatusPill({ status }: { status: string }) {
  const tone: StatusTone = statusTone(status);
  return (
    <span className={`host-status host-status--${tone}`}>
      <span className="host-status__dot" aria-hidden />
      {status || "—"}
    </span>
  );
}

function ListingCard({ row }: { row: HostListingCard }) {
  const Icon = KIND_ICONS[row.kind];
  const locationLine = [row.locality, row.city].filter(Boolean).join(", ") || "Location not set";
  const added = formatListingDate(row.sortDate);

  return (
    <li className="host-card">
      <div className="host-card__media">
        <Image
          src={row.imageUrl}
          alt={row.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="host-card__media-overlay" aria-hidden />
        <span className="host-card__kind">
          <Icon size={13} strokeWidth={2.2} aria-hidden />
          {kindLabel(row.kind)}
        </span>
        <div className="host-card__status-wrap">
          <StatusPill status={row.status} />
        </div>
      </div>

      <div className="host-card__body">
        <h2 className="host-card__name">{row.name}</h2>
        <p className="host-card__loc">
          <MapPin size={14} strokeWidth={2} aria-hidden />
          <span>{locationLine}</span>
        </p>
        {added ? <p className="host-card__date">Listed {added}</p> : null}
      </div>

      <div className="host-card__foot">
        <Link href={row.editHref} className="host-card__btn host-card__btn--primary">
          <Pencil size={15} strokeWidth={2} aria-hidden />
          Edit
        </Link>
        <Link href={row.editHref} className="host-card__btn host-card__btn--ghost">
          Manage
        </Link>
      </div>
    </li>
  );
}

type Props = {
  hostName?: string | null;
  listings: HostListingCard[];
  loadError?: string | null;
};

export function HostListingsDashboard({ hostName, listings, loadError }: Props) {
  const firstName = hostName?.trim().split(/\s+/)[0];
  const [filter, setFilter] = useState<FilterKey>("all");

  const total = listings.length;
  const activeCount = listings.filter((r) => statusTone(r.status) === "active").length;
  const pendingCount = listings.filter((r) => statusTone(r.status) === "pending").length;

  const filtered = useMemo(() => {
    if (filter === "all") return listings;
    return listings.filter((r) => r.kind === filter);
  }, [listings, filter]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: listings.length,
      coworking: 0,
      office: 0,
      coliving: 0,
    };
    for (const r of listings) counts[r.kind] += 1;
    return counts;
  }, [listings]);

  return (
    <div className="host-dash">
      <div className="host-dash__bg" aria-hidden />

      <div className="host-dash__inner">
        {/* Top bar — Add / Logout live here, not in the hero banner */}
        <div className="host-dash__topbar">
          <span className="host-dash__brand">
            <span className="host-dash__brand-dot" aria-hidden />
            Host
          </span>
          <div className="host-dash__top-actions">
            <Link href="/add" className="host-dash__btn-add">
              <Plus size={16} strokeWidth={2.5} aria-hidden />
              <span className="hidden sm:inline">Add listing</span>
              <span className="sm:hidden">Add</span>
            </Link>
            <HostLogoutButton variant="light" />
          </div>
        </div>

        {/* Hero */}
        <header className="host-dash__hero">
          <div className="host-dash__hero-glow" aria-hidden />
          <div className="host-dash__hero-grid">
            <div>
              <p className="host-dash__eyebrow">
                <Sparkles size={12} className="text-[#7ee081]" aria-hidden />
                SpaceWallah Host Panel
              </p>
              <h1 className="host-dash__title">
                {firstName ? (
                  <>
                    Welcome back, <em>{firstName}</em>
                  </>
                ) : (
                  <>Your listings</>
                )}
              </h1>
              <p className="host-dash__subtitle">
                Manage coworking, office, and PG properties. Update photos, pricing, and rules in
                minutes.
              </p>
            </div>
          </div>

          {total > 0 ? (
            <dl className="host-dash__stats">
              {[
                { label: "Total", value: total },
                { label: "Active", value: activeCount },
                { label: "Pending", value: pendingCount },
              ].map((s) => (
                <div key={s.label} className="host-dash__stat">
                  <dt className="host-dash__stat-label">{s.label}</dt>
                  <dd className="host-dash__stat-value">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        {loadError ? <div className="host-dash__alert">{loadError} Try refreshing.</div> : null}

        {total === 0 ? (
          <div className="host-dash__empty">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(76,175,80,0.12)] text-[#4caf50]">
              <LayoutGrid size={28} strokeWidth={1.6} aria-hidden />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-[var(--hd-ink)]">
              No listings yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--hd-muted)]">
              Publish your first space in under 15 minutes — we&apos;ll review and go live within
              24 hours.
            </p>
            <Link href="/add" className="host-dash__btn-add mt-7 inline-flex">
              <Plus size={16} strokeWidth={2.5} aria-hidden />
              Create your first listing
            </Link>
          </div>
        ) : (
          <>
            <p className="host-dash__section-title">
              {filtered.length} listing{filtered.length === 1 ? "" : "s"}
            </p>

            <div className="host-dash__filters" role="tablist" aria-label="Filter listings">
              {FILTERS.map((f) => {
                const count = filterCounts[f.key];
                if (f.key !== "all" && count === 0) return null;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.key}
                    className={`host-dash__filter${filter === f.key ? " is-active" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                    <span style={{ opacity: 0.65, marginLeft: 4 }}>({count})</span>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="host-dash__empty" style={{ marginTop: "1rem" }}>
                <p className="text-sm text-[var(--hd-muted)]">No listings in this category.</p>
                <button
                  type="button"
                  className="host-dash__filter is-active mt-4"
                  onClick={() => setFilter("all")}
                >
                  Show all
                </button>
              </div>
            ) : (
              <ul className="host-dash__grid">
                {filtered.map((row) => (
                  <ListingCard key={`${row.kind}-${row.id}`} row={row} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
