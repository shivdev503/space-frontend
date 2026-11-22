import Link from "next/link";
import { Building2, IndianRupee, MapPin, Navigation, TrainFront } from "lucide-react";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/seo/breadcrumbs";
import { BuildingPlaceJsonLd, ListingItemListJsonLd } from "@/components/seo/listing-json-ld";
import { Container } from "@/components/ui/container";
import { LeadCTA } from "@/modules/city-pages/components/lead-cta";
import { CoworkingCard } from "@/modules/coworking/components/coworking-card";
import { FAQSection } from "@/modules/location-pages/components/faq-section";
import { ManagedOfficeCard } from "@/modules/managed-office/components/managed-office-card";
import { managedOfficeCardRow, managedOfficeStartingPrice } from "@/modules/managed-office/managed-office-format";
import {
  buildingFaqs,
  buildingIntro,
  buildingPlace,
  buildingTitle,
  type BuildingFacts,
} from "@/modules/building/building-content";
import type { Building } from "@/services/building-api";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { formatCurrency } from "@/utils/format";

type BuildingPageProps = {
  building: Building;
  facts: BuildingFacts;
  workspaces: CoworkingModel.WorkSpace[];
  offices: ManagedOfficeModel.ManagedOffice[];
  breadcrumbs: BreadcrumbItem[];
  /** Route slug of the building's city (lead form, links). */
  citySlug: string;
  nearby: Array<{ building: Building; distanceKm: number }>;
};

function Fact({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
      <Icon className="h-4 w-4 shrink-0 text-[color:var(--color-brand)]" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export function BuildingPage({ building, facts, workspaces, offices, breadcrumbs, citySlug, nearby }: BuildingPageProps) {
  const title = buildingTitle(building, facts);
  const path = `/building/${building.slug}`;
  const place = buildingPlace(building);
  const from = facts.coworkingFrom ?? facts.managedOfficeFrom;
  const mapsHref =
    building.latitude != null && building.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${building.latitude},${building.longitude}`
      : null;
  const priceRows = [
    ...workspaces.map((ws) => ({
      key: `cw-${ws.slug}`,
      name: ws.name,
      href: `/coworking/${ws.slug.trim()}`,
      type: "Coworking",
      price: ws.starting_price && ws.starting_price > 0 ? ws.starting_price : null,
    })),
    ...offices.map((o) => ({
      key: `mo-${o.slug}`,
      name: o.name,
      href: `/managed-office/${o.slug.trim()}`,
      type: "Managed office",
      price: managedOfficeStartingPrice(o),
    })),
  ];

  return (
    <>
      <BuildingPlaceJsonLd
        name={building.name}
        path={path}
        address={building.address}
        city={building.cityName}
        latitude={building.latitude}
        longitude={building.longitude}
        image={building.image}
      />
      <ListingItemListJsonLd name={title} items={priceRows.map((r) => ({ name: r.name, href: r.href }))} />

      <section className="relative overflow-hidden pb-6 pt-10 sm:pb-8 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(18,184,134,0.10),transparent_30%),linear-gradient(180deg,#f8fbf9_0%,#ffffff_94%)]" />
        <Container>
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
            Office building{place ? ` · ${place}` : ""}
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl leading-[1.06] tracking-[-0.04em] text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{buildingIntro(building, facts)}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            <Fact icon={Building2}>
              {facts.coworkingCount + facts.managedOfficeCount} centres
              {facts.operators.length > 1 ? ` · ${facts.operators.length} operators` : ""}
            </Fact>
            {from ? <Fact icon={IndianRupee}>From {formatCurrency(from)}/seat a month</Fact> : null}
            {building.address ? <Fact icon={MapPin}>{building.address}</Fact> : null}
            {facts.metro ? (
              <Fact icon={TrainFront}>
                {facts.metro.name}
                {facts.metro.distance ? ` · ${facts.metro.distance} km` : ""}
              </Fact>
            ) : null}
            {mapsHref ? (
              <li>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Navigation className="h-4 w-4" aria-hidden />
                  Open in Google Maps
                </a>
              </li>
            ) : null}
          </ul>
        </Container>
      </section>

      {workspaces.length ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Coworking spaces in {building.name}
            </h2>
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {workspaces.map((ws, index) => (
                <CoworkingCard key={ws.id || ws._id || ws.slug} workspace={ws} priority={index === 0} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {offices.length ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Managed offices in {building.name}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {offices.map((office, index) => (
                <ManagedOfficeCard
                  key={office.id}
                  office={managedOfficeCardRow(office)}
                  priority={!workspaces.length && index === 0}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="pb-12 sm:pb-16">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Price comparison: {building.name}
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Centre</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Price from (seat / month)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {priceRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-3">
                      <Link href={row.href} prefetch={false} className="font-medium text-ink hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{row.type}</td>
                    <td className="px-4 py-3 text-ink">{row.price ? formatCurrency(row.price) : "On request"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {nearby.length ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Other office buildings nearby</h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map(({ building: b, distanceKm }) => (
                <li key={b.slug}>
                  <Link
                    href={`/building/${b.slug}`}
                    prefetch={false}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{b.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {b.totalCentres} centres{b.areaName ? ` · ${b.areaName}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{distanceKm.toFixed(1)} km</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <section className="pb-14 sm:pb-20">
        <Container>
          <LeadCTA
            title={`Looking for office space in ${building.name}?`}
            description="Tell us your team size and budget. We'll share the best options in this building and nearby, and arrange free visits."
            ctaLabel="Get free options"
            citySlug={citySlug}
            vertical="coworking"
            microlocation={building.areaName}
          />
        </Container>
      </section>

      <FAQSection faqs={buildingFaqs(building, facts)} locationName={building.name} />
    </>
  );
}
