"use client";

import {
  Briefcase,
  FileCheck2,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState, type ReactNode } from "react";

import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from "@/lib/contact-data";
import { formatInrPrice } from "@/lib/virtual-office-city-catalog";
import {
  VO_OTHER_CITIES,
  VO_REVIEWS,
  VO_SHARE_DOCS,
  type VoCityArea,
  type VoCitySummary,
  type VoShareDocKey,
} from "@/modules/virtual-office/components/city-page/vo-city-content";
import {
  VO_WHATSAPP_HREF,
  VoBand,
  VoCheck,
  VoCross,
  VoDarkButton,
  VoGreenButton,
  VoHeading,
  VoKicker,
  VoLead,
  VoWrap,
} from "@/modules/virtual-office/components/city-page/vo-city-design";
import { useVoCityLead } from "@/modules/virtual-office/components/city-page/vo-city-lead-context";
import { useVoQuickEnquiry } from "@/modules/virtual-office/components/city-page/vo-city-quick-enquiry";
import { cn } from "@/utils/cn";

/* ───────────────────────── Stats ───────────────────────── */

export function VoCityStatsBar({
  cityDisplay,
  summary,
  areaCount,
}: {
  cityDisplay: string;
  summary: VoCitySummary;
  areaCount: number;
}) {
  const stats = [
    { value: summary.lowestLabel, label: "Lowest monthly price" },
    { value: `${areaCount} areas`, label: `Prime ${cityDisplay} locations` },
    { value: "24 to 48 hrs", label: "Documents after KYC" },
    { value: "₹0", label: "Brokerage. Always free for you" },
  ];

  return (
    <section className="bg-[#0B3B2E] py-8">
      <VoWrap className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="vo-display text-[1.6rem] font-extrabold tracking-[-0.03em] text-[#5EE6B4] sm:text-[2rem]">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[14px] font-medium text-white/90 sm:text-[15px]">{stat.label}</p>
          </div>
        ))}
      </VoWrap>
    </section>
  );
}

/* ───────────────────────── Area price table ───────────────────────── */

export function VoCityAreaPriceSection({ cityDisplay, areas }: { cityDisplay: string; areas: VoCityArea[] }) {
  const { openLead } = useVoCityLead();
  if (!areas.length) return null;

  return (
    <VoBand id="areas">
      <VoKicker>Compare by location</VoKicker>
      <VoHeading>Virtual Office Price in {cityDisplay} by Area</VoHeading>
      <VoLead className="max-w-[44rem]">
        Every address is inside a registered commercial building that we check for GST use. Pick the area that suits
        your brand and your budget.
      </VoLead>

      <div className="mt-10 overflow-hidden rounded-[20px] border border-[#E2EBE7]">
        <div className="hidden grid-cols-[1.1fr_1.6fr_1fr_auto] gap-6 bg-[#F5F9F7] px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-muted md:grid">
          <span>Area</span>
          <span>Best for</span>
          <span>Starts at</span>
          <span className="w-[178px]" aria-hidden />
        </div>
        {areas.map((area) => (
          <div
            key={area.locality}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-[#E2EBE7] px-5 py-5 first:border-t-0 md:grid-cols-[1.1fr_1.6fr_1fr_auto] md:gap-6 md:px-6 md:first:border-t"
          >
            <div>
              <p className="vo-display text-lg font-extrabold tracking-[-0.01em] text-ink">{area.name}</p>
              {area.badge ? (
                <span
                  className={cn(
                    "mt-1.5 inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]",
                    area.badge.tone === "dark" ? "bg-[#0B3B2E] text-[#5EE6B4]" : "bg-[#E3F5EC] text-brand",
                  )}
                >
                  {area.badge.label}
                </span>
              ) : null}
            </div>
            <p className="col-span-2 row-start-2 text-[15px] text-muted md:col-span-1 md:row-start-auto">
              {area.bestFor}
            </p>
            <p className="text-right md:text-left">
              {area.price != null ? (
                <>
                  <span className="vo-display text-xl font-extrabold text-ink">{formatInrPrice(area.price)}</span>
                  <span className="text-sm text-muted">/mo</span>
                </>
              ) : (
                <span className="text-[15px] font-bold text-ink">On request</span>
              )}
            </p>
            <div className="col-span-2 md:col-span-1">
              {area.price != null ? (
                <VoGreenButton onClick={openLead} className="w-full px-5 py-3 md:w-[178px]">
                  Check Availability
                </VoGreenButton>
              ) : (
                <VoDarkButton onClick={openLead} className="w-full px-5 py-3 md:ml-auto md:flex md:w-auto">
                  Get Price
                </VoDarkButton>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[15px] text-muted">
        Prices exclude 18% GST. The final price depends on the centre and the plan you pick.
      </p>
    </VoBand>
  );
}

/* ───────────────────────── Plans ───────────────────────── */

type PlanFeature = { text: string; included: boolean };

export function VoCityPlansSection({ cityDisplay, summary }: { cityDisplay: string; summary: VoCitySummary }) {
  const { openLead } = useVoCityLead();
  const plans: Array<{
    label: string;
    price: number;
    blurb: string;
    features: PlanFeature[];
    featured?: boolean;
  }> = [
    {
      label: "Business Address",
      price: summary.plans.businessAddress,
      blurb: "Best for a mailing address on your website and visiting cards.",
      features: [
        { text: "NOC and rent agreement", included: true },
        { text: "Mail and courier handling", included: true },
        { text: "Documents in 24 to 48 hours", included: true },
        { text: "GST registration not included", included: false },
        { text: "Company registration not included", included: false },
      ],
    },
    {
      label: "GST Registration",
      price: summary.plans.gstRegistration,
      blurb: `Best for businesses that need a GST number in ${cityDisplay}.`,
      featured: true,
      features: [
        { text: "NOC + rent agreement + utility bill", included: true },
        { text: "GST registration support", included: true },
        { text: "GST officer visit handled by the centre", included: true },
        { text: "Mail and courier handling", included: true },
        { text: "Documents in 48 to 72 hours", included: true },
      ],
    },
    {
      label: "Company Registration",
      price: summary.plans.companyRegistration,
      blurb: "Best for Pvt Ltd · LLP or OPC registration.",
      features: [
        { text: "NOC + agreement + utility bill + ROC NOC", included: true },
        { text: "Company registration support", included: true },
        { text: "GST registration support", included: true },
        { text: "Mail and courier handling", included: true },
        { text: "Ready in 3 to 5 working days", included: true },
      ],
    },
  ];

  return (
    <VoBand id="plans" tone="soft">
      <div className="text-center">
        <VoKicker>Plans and pricing</VoKicker>
        <VoHeading className="mx-auto max-w-[46rem]">Choose Your Virtual Office Plan in {cityDisplay}</VoHeading>
        <VoLead className="mx-auto">
          Every plan comes with legal documents and support from the centre if a GST officer visits.
        </VoLead>
      </div>

      <div className="mt-12 grid items-center gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.label}
            className={cn(
              "relative flex flex-col rounded-[22px] p-8",
              plan.featured
                ? "bg-[#0B3B2E] text-white shadow-[0_30px_70px_rgba(11,59,46,0.28)] lg:py-10"
                : "border border-[#E2EBE7] bg-white text-ink",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p
                className={cn(
                  "text-[13px] font-bold uppercase tracking-[0.12em]",
                  plan.featured ? "text-white/85" : "text-muted",
                )}
              >
                {plan.label}
              </p>
              {plan.featured ? (
                <span className="-mt-1 rounded-full bg-[#5EE6B4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                  Most popular
                </span>
              ) : null}
            </div>
            <p className="mt-5">
              <span className="vo-display text-[3rem] font-extrabold leading-none tracking-[-0.04em]">
                {formatInrPrice(plan.price)}
              </span>
              <span className={cn("text-base", plan.featured ? "text-white/80" : "text-muted")}>/month</span>
            </p>
            <p className={cn("mt-4 min-h-[3rem] text-[15px] leading-relaxed", plan.featured ? "text-white/90" : "text-muted")}>
              {plan.blurb}
            </p>
            <ul className={cn("mt-6 space-y-3 border-t pt-6 text-[15px]", plan.featured ? "border-white/15" : "border-[#E2EBE7]")}>
              {plan.features.map((f) => (
                <li
                  key={f.text}
                  className={cn(
                    "flex items-center gap-3",
                    !f.included && "text-[#7D8A86]",
                    f.included && (plan.featured ? "text-white" : "text-ink"),
                  )}
                >
                  {f.included ? <VoCheck className={plan.featured ? "text-[#5EE6B4]" : undefined} /> : <VoCross />}
                  {f.text}
                </li>
              ))}
            </ul>
            {plan.featured ? (
              <VoGreenButton onClick={openLead} className="mt-8 w-full">
                Get This Plan
              </VoGreenButton>
            ) : (
              <VoDarkButton onClick={openLead} className="mt-8 w-full">
                Get This Plan
              </VoDarkButton>
            )}
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-2 rounded-2xl border border-[#E2EBE7] bg-white px-6 py-4 text-[15px] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted">Prices exclude 18% GST. Pay every quarter or once a year.</p>
        <button type="button" onClick={openLead} className="text-left font-bold text-brand hover:underline">
          Not sure which plan fits? Ask an expert →
        </button>
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Why SpaceWallah ───────────────────────── */

export function VoCityWhySpaceWallahSection() {
  const { openLead } = useVoCityLead();
  const rows = [
    ["Centres compared", "Many in one go", "One at a time"],
    ["Documents checked", "Before you pay", "You check alone"],
    ["Expert help", "Free at every step", "Sales calls"],
    ["Brokerage", "₹0", "₹0"],
  ];

  return (
    <VoBand>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <VoKicker>Why SpaceWallah</VoKicker>
          <VoHeading className="max-w-[32rem]">One Request. Many Centres. The Best Price.</VoHeading>
          <VoLead className="max-w-[36rem]">
            Booking direct means calling centres one by one. With SpaceWallah you tell us once and we compare
            verified centres for you. Free.
          </VoLead>
          <VoGreenButton onClick={openLead} className="mt-8">
            Compare Centres for Me →
          </VoGreenButton>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[#E2EBE7] text-[15px]">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] text-xs font-bold uppercase tracking-[0.1em]">
            <span className="bg-white px-5 py-4" />
            <span className="bg-[#0B3B2E] px-5 py-4 text-[#5EE6B4]">SpaceWallah</span>
            <span className="bg-[#F5F9F7] px-5 py-4 text-muted">Going direct</span>
          </div>
          {rows.map(([label, us, them]) => (
            <div key={label} className="grid grid-cols-[1.1fr_1fr_1fr] border-t border-[#E2EBE7]">
              <span className="px-5 py-4 font-bold text-ink">{label}</span>
              <span className="bg-[#EEF8F3] px-5 py-4 font-bold text-ink">{us}</span>
              <span className="px-5 py-4 text-muted">{them}</span>
            </div>
          ))}
        </div>
      </div>
    </VoBand>
  );
}

/* ───────────────────────── What you get ───────────────────────── */

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E3F5EC] text-brand">{children}</span>
  );
}

export function VoCityIncludedSection({ cityDisplay }: { cityDisplay: string }) {
  const items = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Premium business address",
      text: "Use it on GST and MCA forms · your website · invoices and your Google Business Profile.",
    },
    {
      icon: <FileCheck2 className="h-5 w-5" />,
      title: "Compliance documents",
      text: "NOC and rent agreement and a recent utility bill. Ready to upload on the GST portal.",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Mail and courier handling",
      text: "The centre receives your letters and parcels and lets you know when they arrive.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "GST visit support",
      text: "If a GST officer comes to check the address the centre team meets them for you.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Meeting rooms on demand",
      text: `Book a room by the hour when clients or investors visit you in ${cityDisplay}.`,
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Easy upgrade",
      text: "Move to a coworking desk or a private cabin when your team grows. Same partner.",
    },
  ];

  return (
    <VoBand tone="soft">
      <VoKicker>What is included</VoKicker>
      <VoHeading>What You Get With a Virtual Office in {cityDisplay}</VoHeading>
      <VoLead className="max-w-[46rem]">
        A real commercial address plus every paper the GST and MCA teams ask for. Not a PO box. You keep working
        from anywhere.
      </VoLead>
      <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-[20px] border border-[#E2EBE7] bg-white p-7">
            <IconTile>{item.icon}</IconTile>
            <h3 className="vo-display mt-5 text-xl font-extrabold tracking-[-0.015em] text-ink">{item.title}</h3>
            <p className="mt-3 text-[15px] leading-[1.7] text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Documents ───────────────────────── */

export function VoCityDocumentsSection({ cityDisplay }: { cityDisplay: string }) {
  const [tab, setTab] = useState<VoShareDocKey>("company");
  const given = [
    {
      title: "NOC (No Objection Certificate)",
      text: "The owner allows your business to use the address. Needed on the GST portal.",
      tag: "Issued within 24 hours",
    },
    {
      title: "Rent or Leave and Licence Agreement",
      text: "A stamped agreement that proves you can use the address. Valid for GST and ROC.",
      tag: "Stamped · Legally valid",
    },
    {
      title: "Utility Bill",
      text: "A recent electricity bill in the owner's name that shows the commercial address.",
      tag: "Less than 2 months old",
    },
  ];
  const checklist = VO_SHARE_DOCS[tab];
  const whatsappText = encodeURIComponent(
    `Hi, please send me the virtual office document checklist for ${checklist.label} in ${cityDisplay}.`,
  );

  return (
    <VoBand id="documents">
      <VoKicker>Documents</VoKicker>
      <VoHeading>Documents for a Virtual Office in {cityDisplay}</VoHeading>
      <VoLead>Here is what you get from us and what you need to share. Simple and clear.</VoLead>

      <div className="mt-11 grid items-start gap-6 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#E2EBE7] bg-white p-6 sm:p-8">
          <h3 className="vo-display text-[1.4rem] font-extrabold tracking-[-0.02em] text-ink">
            What you get from us
          </h3>
          <ol className="mt-6 space-y-4">
            {given.map((doc, index) => (
              <li key={doc.title} className="flex gap-4 rounded-2xl bg-[#F5F9F7] p-5">
                <span className="vo-display grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0B3B2E] text-base font-extrabold text-[#5EE6B4]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[17px] font-bold text-ink">{doc.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">{doc.text}</p>
                  <span className="mt-2.5 inline-block rounded-md bg-[#E3F5EC] px-2.5 py-0.5 text-[13px] font-bold text-brand">
                    {doc.tag}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[22px] border border-[#E2EBE7] bg-white p-6 sm:p-8">
          <h3 className="vo-display text-[1.4rem] font-extrabold tracking-[-0.02em] text-ink">
            What you need to share
          </h3>
          <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl bg-[#F5F9F7] p-1" role="tablist">
            {(Object.keys(VO_SHARE_DOCS) as VoShareDocKey[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-[10px] px-2 py-2.5 text-[13px] font-semibold leading-tight transition sm:text-[15px]",
                  tab === key ? "bg-white text-ink shadow-[0_4px_14px_rgba(11,59,46,0.08)]" : "text-muted",
                )}
              >
                {VO_SHARE_DOCS[key].label}
              </button>
            ))}
          </div>
          <ul className="mt-6 space-y-4 text-[16px] text-ink">
            {checklist.items.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#E3F5EC]">
                  <VoCheck className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <VoDarkButton href={`${VO_WHATSAPP_HREF}?text=${whatsappText}`} external className="mt-7 w-full">
            <MessageCircle className="h-5 w-5" aria-hidden />
            Get This Checklist on WhatsApp
          </VoDarkButton>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-4 rounded-2xl bg-[#E3F5EC] px-6 py-5 text-[16px] text-ink sm:items-center">
        <ShieldCheck className="h-7 w-7 shrink-0 text-brand" aria-hidden />
        <p>
          SpaceWallah only lists operators whose documents we check for GST use.{" "}
          <b className="font-bold">Checked documents mean fewer rejections.</b>
        </p>
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Steps ───────────────────────── */

export function VoCityStepsSection({ cityDisplay }: { cityDisplay: string }) {
  const { openLead } = useVoCityLead();
  const steps = [
    ["Tell us what you need", "Pick your plan and area. Get prices on WhatsApp in minutes."],
    ["Choose your centre", "Compare options with our expert. No brokerage and no pressure."],
    ["Complete online KYC", "Share PAN and Aadhaar and a photo. Fully online in 5 minutes."],
    ["Receive your documents", "NOC and rent agreement and utility bill in 24 to 72 hours."],
    ["Apply on the GST portal", "File on gst.gov.in with your new address. We check it before you submit."],
    ["Get your GSTIN", "The centre handles any officer visit. Most GST numbers arrive within 7 working days."],
  ];

  return (
    <VoBand tone="soft">
      <VoKicker>How it works</VoKicker>
      <VoHeading>Get Your Virtual Office in {cityDisplay} in 6 Simple Steps</VoHeading>
      <VoLead className="max-w-[44rem]">
        From your first message to your GST number in about 7 working days. SpaceWallah and the centre handle the
        work together.
      </VoLead>

      <ol className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(([title, text], index) => {
          const last = index === steps.length - 1;
          return (
            <li key={title} className="flex gap-4 rounded-[20px] border border-[#E2EBE7] bg-white p-7">
              <span
                className={cn(
                  "vo-display grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-extrabold",
                  last ? "bg-[#0B3B2E] text-[#5EE6B4]" : "bg-[#12B886] text-ink",
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-lg font-bold text-ink">{title}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-7 flex flex-col gap-4 rounded-[20px] bg-[#0B3B2E] px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-white">We help at every step. Our team checks each document before you file.</p>
        <VoGreenButton onClick={openLead} className="shrink-0">
          Start My Application →
        </VoGreenButton>
      </div>
    </VoBand>
  );
}

/* ───────────────────────── VO vs regular office ───────────────────────── */

export function VoCityVsRegularSection({ cityDisplay, summary }: { cityDisplay: string; summary: VoCitySummary }) {
  const rows = [
    ["Monthly cost", `From ${summary.lowestLabel}`, "Rent plus maintenance plus bills"],
    ["Upfront cost", "Only your plan fee", "Deposit and brokerage and interiors"],
    ["Time to start", "24 to 72 hours", "Many weeks"],
    ["Lock in", "Quarterly or yearly plans", "Often a long lease"],
    ["Valid for GST and MCA", "Yes", "Yes"],
    ["Work from anywhere", "Yes", "No"],
  ];

  return (
    <VoBand>
      <div className="text-center">
        <VoKicker>Save money</VoKicker>
        <VoHeading>Virtual Office vs Regular Office in {cityDisplay}</VoHeading>
        <VoLead className="mx-auto max-w-[40rem]">
          Need a {cityDisplay} address but not a desk? A virtual office in {cityDisplay} costs a small part of a
          regular office.
        </VoLead>
      </div>

      <div className="mx-auto mt-11 max-w-[1000px] overflow-x-auto rounded-[20px] border border-[#E2EBE7]">
        <div className="min-w-[560px] text-[15px]">
          <div className="grid grid-cols-[0.8fr_1fr_1.1fr]">
            <span className="bg-white px-6 py-4" />
            <span className="vo-display bg-[#0B3B2E] px-6 py-4 text-[17px] font-extrabold text-white">
              SpaceWallah virtual office
            </span>
            <span className="vo-display bg-white px-6 py-4 text-[17px] font-extrabold text-muted">
              Regular rented office
            </span>
          </div>
          {rows.map(([label, us, them]) => (
            <div key={label} className="grid grid-cols-[0.8fr_1fr_1.1fr] border-t border-[#E2EBE7]">
              <span className="px-6 py-3.5 font-bold text-ink">{label}</span>
              <span className="bg-[#EEF8F3] px-6 py-3.5 font-bold text-ink">{us}</span>
              <span className="px-6 py-3.5 text-muted">{them}</span>
            </div>
          ))}
        </div>
      </div>
    </VoBand>
  );
}

/* ───────────────────────── City advantage ───────────────────────── */

export function VoCityAdvantageSection({
  cityDisplay,
  state,
}: {
  cityDisplay: string;
  state: { state: string; code: string } | null;
}) {
  const { openLead } = useVoCityLead();
  const points = [
    ["A trusted business hub", `Big companies and fast growing startups work from ${cityDisplay}. Clients and banks know the address.`],
    ["GST ready papers", "NOC and rent agreement and utility bill from verified operators. Made for the GST portal."],
    ["Fast setup", "Online KYC and documents in 24 to 72 hours. File for GST or a company sooner."],
    ["A premium image", `A ${cityDisplay} address on your invoices and website builds trust with buyers and investors.`],
    ["Easy to reach", "Metro and main roads connect most business areas. Client visits are simple."],
    ["Room to grow", "Start with a virtual office. Move to coworking or a private office when your team grows."],
  ];

  return (
    <VoBand tone="dark">
      <VoKicker className="text-[#5EE6B4]">The {cityDisplay} advantage</VoKicker>
      <VoHeading className="text-white">Why a {cityDisplay} Address Helps Your Business Grow</VoHeading>

      <div className="mt-11 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {points.map(([title, text], index) => (
          <div key={title} className="flex gap-4">
            <span className="vo-display grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-base font-extrabold text-[#5EE6B4]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-lg font-bold text-white">{title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-white/85">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-5 rounded-[20px] border border-white/10 bg-white/[0.06] p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[42rem]">
          <p className="vo-display text-[1.3rem] font-extrabold tracking-[-0.015em] text-[#5EE6B4]">
            Selling online from {state?.state ?? cityDisplay}?
          </p>
          <p className="mt-2 text-[16px] leading-relaxed text-white/90">
            {state
              ? `A ${cityDisplay} virtual office gives you a ${state.state} GSTIN (state code ${state.code}). Already registered in ${state.state}? Add it as an additional place of business on your GST.`
              : `A ${cityDisplay} virtual office gives you a local GSTIN for this state. Already registered here? Add it as an additional place of business on your GST.`}
          </p>
        </div>
        <VoGreenButton onClick={openLead} className="shrink-0">
          Get a {state?.state ?? cityDisplay} GST Address
        </VoGreenButton>
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Audience ───────────────────────── */

export function VoCityAudienceSection({ cityDisplay }: { cityDisplay: string }) {
  const { openLead } = useVoCityLead();
  const items = [
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: "Freelancers and consultants",
      text: "Put a professional address on your invoices instead of your home address.",
      cta: "Business Address plan",
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: "Online sellers",
      text: "Get a local GSTIN to sell on Amazon · Flipkart and Meesho.",
      cta: "GST Registration plan",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Startups and founders",
      text: `Register your Pvt Ltd or LLP with a respected ${cityDisplay} address from day one.`,
      cta: "Company Registration plan",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Companies entering a new state",
      text: `Open a ${cityDisplay} branch for GST without signing a long lease.`,
      cta: "GST plus meeting rooms",
    },
  ];

  return (
    <VoBand>
      <VoKicker>Who it is for</VoKicker>
      <VoHeading>Who Should Get a Virtual Office in {cityDisplay}?</VoHeading>
      <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col rounded-[20px] border border-[#E2EBE7] bg-white p-7">
            <IconTile>{item.icon}</IconTile>
            <h3 className="vo-display mt-5 text-xl font-extrabold leading-tight tracking-[-0.015em] text-ink">
              {item.title}
            </h3>
            <p className="mt-3 flex-1 text-[15px] leading-[1.7] text-muted">{item.text}</p>
            <button
              type="button"
              onClick={openLead}
              className="mt-5 text-left text-[15px] font-bold text-brand hover:underline"
            >
              {item.cta} →
            </button>
          </div>
        ))}
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Reviews ───────────────────────── */

export function VoCityReviewsSection({
  title = "What Our Customers Say",
  tone = "soft",
}: {
  title?: string;
  tone?: "white" | "soft";
}) {
  return (
    <VoBand tone={tone}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <VoKicker>Customer reviews</VoKicker>
          <VoHeading>{title}</VoHeading>
        </div>
        <div className="flex items-center gap-4 self-start rounded-2xl border border-[#E2EBE7] bg-white px-5 py-3.5 sm:self-auto">
          <span className="vo-display text-[2rem] font-extrabold text-ink">4.8</span>
          <span className="text-[14px] leading-snug text-muted">
            out of 5 rating
            <b className="block font-bold text-ink">512 verified businesses</b>
          </span>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {VO_REVIEWS.map((review) => (
          <figure
            key={review.name}
            className={cn(
              "flex flex-col rounded-[20px] border p-7",
              tone === "white" ? "border-transparent bg-[#F5F9F7]" : "border-[#E2EBE7] bg-white",
            )}
          >
            <blockquote className="flex-1 text-[17px] leading-[1.65] text-ink">{review.quote}</blockquote>
            <figcaption className="mt-6 flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E3F5EC] text-[15px] font-bold text-brand">
                {review.initials}
              </span>
              <span>
                <span className="block text-[16px] font-bold text-ink">{review.name}</span>
                <span className="block text-[14px] text-muted">
                  {review.role} · {review.plan}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Callback ───────────────────────── */

export function VoCityCallbackSection({ citySlug, cityDisplay }: { citySlug: string; cityDisplay: string }) {
  const [phone, setPhone] = useState("");
  const { submit, pending, error, success } = useVoQuickEnquiry("Virtual office callback");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit({ phone, citySlug, requirement: "Free expert callback · Area and plan advice" });
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <VoWrap>
        <div className="relative overflow-hidden rounded-[32px] bg-[#0B3B2E] px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -bottom-10 right-28 h-36 w-32 rounded-[36px] bg-white/[0.05]" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 right-0 h-36 w-24 rounded-[36px] bg-white/[0.05]" aria-hidden />
          <div className="pointer-events-none absolute right-[-40px] top-1/2 h-32 w-32 rounded-full bg-white/[0.05]" aria-hidden />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <VoKicker className="text-[#5EE6B4]">Free expert call</VoKicker>
              <VoHeading className="max-w-[32rem] text-white">Not Sure Which Area or Plan Is Right?</VoHeading>
              <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.7] text-white/90">
                Share your number. A SpaceWallah expert calls you and picks the best virtual office in {cityDisplay} for
                your business and budget. Free of cost.
              </p>
              <ul className="mt-6 space-y-2.5 text-[16px] text-white">
                {[
                  "A shortlist for your area and budget",
                  "A clear plan comparison for GST or company",
                  "A document checklist before you file",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <VoCheck className="text-[#5EE6B4]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={onSubmit} className="rounded-[24px] bg-white p-7">
              <p className="vo-display text-[1.3rem] font-extrabold tracking-[-0.015em] text-ink">
                Get a free callback
              </p>
              {success ? (
                <p className="mt-5 rounded-xl bg-[#E3F5EC] px-4 py-4 text-[15px] font-semibold text-ink">
                  Thanks! An expert will call you within 2 working hours.
                </p>
              ) : (
                <>
                  <label className="mt-5 block text-[14px] font-bold text-ink" htmlFor="vo-callback-phone">
                    Mobile number
                  </label>
                  <div className="mt-2 flex overflow-hidden rounded-xl border-[1.5px] border-[#DCE7E2] focus-within:border-[#12B886]">
                    <span className="grid place-items-center border-r border-[#DCE7E2] bg-[#F5F9F7] px-4 text-[15px] font-bold text-ink">
                      +91
                    </span>
                    <input
                      id="vo-callback-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="min-w-0 flex-1 px-4 py-3.5 text-[16px] text-ink outline-none placeholder:text-[#7D8A86]"
                    />
                  </div>
                  <VoGreenButton type="submit" disabled={pending} className="mt-4 w-full">
                    {pending ? "Sending…" : "Call Me Back Free"}
                  </VoGreenButton>
                </>
              )}
              {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
              <p className="mt-3 text-center text-[14px] text-muted">We call within 2 working hours · No spam</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#E2EBE7] pt-5 text-[15px] font-bold text-brand">
                <a href={VO_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  WhatsApp us
                </a>
                <a href={CONTACT_PHONE_HREF} className="hover:underline">
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </form>
          </div>
        </div>
      </VoWrap>
    </section>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */

export function VoCityFaqSection({
  cityDisplay,
  faqs,
  tone = "white",
  initialOpen = 0,
}: {
  cityDisplay: string;
  faqs: Array<{ q: string; a: string }>;
  tone?: "white" | "soft";
  initialOpen?: number;
}) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <section
      id="faqs"
      className={cn(
        "scroll-mt-24",
        tone === "soft" ? "bg-[#F5F9F7] py-16 sm:py-24" : "bg-white pb-16 pt-6 sm:pb-20",
      )}
    >
      <VoWrap>
        <div className="text-center">
          <VoKicker>FAQ</VoKicker>
          <VoHeading className="mx-auto max-w-[46rem]">Virtual Office in {cityDisplay}: Common Questions</VoHeading>
        </div>

        <div className="mx-auto mt-11 max-w-[900px] space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div
                key={faq.q}
                className={cn(
                  "rounded-2xl border bg-white transition",
                  isOpen ? "border-[#12B886] shadow-[0_12px_30px_rgba(11,59,46,0.08)]" : "border-[#E2EBE7]",
                )}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-bold text-ink"
                  >
                    {faq.q}
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full transition",
                        isOpen ? "rotate-45 bg-[#12B886] text-ink" : "bg-[#E3F5EC] text-brand",
                      )}
                      aria-hidden
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                {/* Always in the HTML so crawlers can read every answer; closed ones are hidden with CSS. */}
                <p className={cn("px-6 pb-6 text-[16px] leading-[1.75] text-muted", !isOpen && "hidden")}>{faq.a}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[16px] text-muted">
          Still have a question?{" "}
          <a
            href={VO_WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand underline underline-offset-2"
          >
            Ask us on WhatsApp
          </a>
        </p>
      </VoWrap>
    </section>
  );
}

/* ───────────────────────── Final CTA ───────────────────────── */

export function VoCityFinalCta({
  title,
  subtitle,
  ctaLabel = "Get Today's Prices",
  className,
}: {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  className?: string;
}) {
  const { openLead } = useVoCityLead();

  return (
    <section className={cn("bg-white pb-16 pt-8 sm:pb-24", className)}>
      <VoWrap>
        <div className="flex flex-col gap-8 rounded-[32px] bg-[#12B886] px-7 py-11 sm:px-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="vo-display max-w-[34rem] text-[2rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.6rem]">
              {title}
            </h2>
            <p className="mt-4 text-[17px] text-ink">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <VoDarkButton onClick={openLead} className="py-4">
              {ctaLabel}
            </VoDarkButton>
            <a
              href={VO_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-white px-6 py-4 text-[15px] font-bold text-white transition hover:bg-white/15"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>
      </VoWrap>
    </section>
  );
}

/* ───────────────────────── Related links ───────────────────────── */

function Chip({ href, children, onClick }: { href?: string; children: ReactNode; onClick?: () => void }) {
  const classes =
    "inline-flex rounded-full border border-[#E2EBE7] bg-white px-4 py-2.5 text-[14px] font-bold text-ink transition hover:border-[#12B886]";
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function VoCityRelatedLinks({
  citySlug,
  cityDisplay,
  areas,
}: {
  citySlug: string;
  cityDisplay: string;
  areas: VoCityArea[];
}) {
  const { openLead } = useVoCityLead();
  const otherCities = VO_OTHER_CITIES.filter((c) => c.slug !== citySlug && c.name !== cityDisplay).slice(0, 6);

  return (
    <section className="border-t border-[#E2EBE7] bg-[#F5F9F7] py-14">
      <VoWrap className="grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="vo-display text-[1.3rem] font-extrabold tracking-[-0.015em] text-ink">
            Virtual Office by Area in {cityDisplay}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {areas.map((area) => (
              <Chip key={area.locality} href="#areas">
                {area.name}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <h2 className="vo-display text-[1.3rem] font-extrabold tracking-[-0.015em] text-ink">
            More Workspaces in {cityDisplay}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip href={`/coworking/${citySlug}`}>Coworking Space</Chip>
            <Chip href={`/managed-office/${citySlug}`}>Managed Office</Chip>
            <Chip href={`/coliving/${citySlug}`}>Coliving</Chip>
            <Chip onClick={openLead}>GST Registration</Chip>
          </div>
        </div>
        <div>
          <h2 className="vo-display text-[1.3rem] font-extrabold tracking-[-0.015em] text-ink">
            Virtual Office in Other Cities
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {otherCities.map((city) => (
              <Chip key={city.slug} href={`/virtual-office/${city.slug}`}>
                {city.name}
              </Chip>
            ))}
          </div>
        </div>
      </VoWrap>
    </section>
  );
}

