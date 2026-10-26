"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { FormEvent, useState } from "react";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { cityTrail } from "@/lib/breadcrumb-trails";
import { formatInrPrice } from "@/lib/virtual-office-city-catalog";
import type { VoCityArea, VoCitySummary } from "@/modules/virtual-office/components/city-page/vo-city-content";
import { VoCheck, VoWrap } from "@/modules/virtual-office/components/city-page/vo-city-design";
import { useVoQuickEnquiry } from "@/modules/virtual-office/components/city-page/vo-city-quick-enquiry";
import { cn } from "@/utils/cn";

const NEEDS = ["Business Address", "GST Registration", "Company Registration"] as const;

/** Pin spots on the decorative map, as % of the card (left, top). */
const PIN_SLOTS = [
  { left: 40, top: 57 },
  { left: 58, top: 33 },
  { left: 18, top: 43 },
  { left: 64, top: 50 },
  { left: 5, top: 27 },
  { left: 32, top: 15 },
  { left: 66, top: 16 },
] as const;

type VoCityHeroProps = {
  citySlug: string;
  cityDisplay: string;
  areas: VoCityArea[];
  summary: VoCitySummary;
};

function areaPriceLabel(area: VoCityArea) {
  return area.price != null ? `from ${formatInrPrice(area.price)}` : "Get price";
}

export function VoCityHero({ citySlug, cityDisplay, areas, summary }: VoCityHeroProps) {
  const [selected, setSelected] = useState(areas[0]?.locality ?? "");
  const selectedArea = areas.find((a) => a.locality === selected);

  return (
    <section className="bg-[#F5F9F7] pb-16 pt-5 sm:pb-20 lg:pb-24">
      <VoWrap>
        <Breadcrumbs items={cityTrail("virtual-office", cityDisplay)} separator="›" className="sm:text-sm" />

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_0.98fr] lg:gap-12">
          <div className="min-w-0">
            <h1 className="vo-displaytext-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[3.75rem] lg:text-[4.35rem]">
              Virtual Office in {cityDisplay}{" "}
              <span className="block text-brand">
                from {summary.lowestLabel}/month
              </span>
            </h1>

            <p className="mt-7 max-w-[33rem] text-lg leading-[1.7] text-muted sm:text-[1.3rem]">
              A GST ready business address with NOC + rent agreement + utility bill. Documents in 48 hours. Zero
              brokerage.
            </p>

            <VoHeroForm
              citySlug={citySlug}
              areas={areas}
              selected={selected}
              onSelect={setSelected}
            />

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-muted">
              {["Accepted for GST and MCA", "GST visit handled for you", "Free expert help"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <VoCheck />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <VoAreaMap areas={areas} selected={selected} onSelect={setSelected} selectedArea={selectedArea} />
        </div>
      </VoWrap>
    </section>
  );
}

function VoHeroForm({
  citySlug,
  areas,
  selected,
  onSelect,
}: {
  citySlug: string;
  areas: VoCityArea[];
  selected: string;
  onSelect: (locality: string) => void;
}) {
  const [need, setNeed] = useState<(typeof NEEDS)[number]>("GST Registration");
  const [phone, setPhone] = useState("");
  const { submit, pending, error, success } = useVoQuickEnquiry("Virtual office price request");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit({
      phone,
      citySlug,
      requirement: `Need: ${need} · Area: ${selected || "Any"}`,
      locality: selected || undefined,
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-9 rounded-[22px] border border-[#DCE7E2] bg-white p-4 shadow-[0_18px_50px_rgba(11,59,46,0.08)] sm:p-5"
    >
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#F5F9F7] p-1" role="tablist" aria-label="What do you need?">
        {NEEDS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={need === item}
            onClick={() => setNeed(item)}
            className={cn(
              "rounded-[10px] px-2 py-2.5 text-[13px] font-semibold leading-tight transition sm:text-[15px]",
              need === item ? "bg-[#0B3B2E] text-white" : "text-ink hover:bg-white",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {success ? (
        <p className="mt-4 rounded-xl bg-[#E3F5EC] px-4 py-4 text-[15px] font-semibold text-ink">
          Thanks! We will send prices on WhatsApp within 2 working hours.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="relative block rounded-xl border-[1.5px] border-[#DCE7E2] px-4 pb-2 pt-2.5 focus-within:border-[#12B886]">
            <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Area</span>
            <select
              value={selected}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[17px] font-semibold text-ink outline-none"
            >
              {areas.map((area) => (
                <option key={area.locality} value={area.locality}>
                  {area.name}
                </option>
              ))}
              <option value="">Any area</option>
            </select>
            <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-ink" aria-hidden />
          </label>

          <label className="block rounded-xl border-[1.5px] border-[#DCE7E2] px-4 pb-2 pt-2.5 focus-within:border-[#12B886]">
            <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              WhatsApp number
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-transparent text-[17px] font-semibold text-ink outline-none placeholder:text-[#7D8A86]"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B3B2E] px-7 py-4 text-[17px] font-bold text-white transition hover:bg-[#0e4a3a] disabled:opacity-60"
          >
            {pending ? "Sending…" : "Get Prices"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {error ? <p className="mt-2 px-1 text-sm text-red-600">{error}</p> : null}
      <p className="mt-3 px-1 text-sm text-muted">Free · Prices on WhatsApp within 2 working hours · No spam</p>
    </form>
  );
}

function VoAreaMap({
  areas,
  selected,
  onSelect,
  selectedArea,
}: {
  areas: VoCityArea[];
  selected: string;
  onSelect: (locality: string) => void;
  selectedArea?: VoCityArea;
}) {
  const pins = areas.slice(0, PIN_SLOTS.length);

  return (
    <div
      className="relative overflow-hidden rounded-[28px] bg-[#0B3B2E] p-5 shadow-[0_30px_80px_rgba(11,59,46,0.28)] sm:min-h-[560px] sm:p-7"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 576 560"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path d="M-20 140 C 160 160, 330 250, 600 300" stroke="rgba(255,255,255,0.06)" strokeWidth="26" />
        <path d="M90 -20 C 120 200, 230 380, 210 600" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
        <path d="M600 160 C 450 260, 360 400, 330 600" stroke="rgba(255,255,255,0.06)" strokeWidth="22" />
        <path d="M-20 420 C 180 380, 380 420, 600 520" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
      </svg>

      <div className="relative flex items-center justify-between gap-3">
        <h2 className="vo-display text-xl font-extrabold tracking-[-0.02em] text-white">Pick your area</h2>
        <span className="rounded-full bg-[#12B886]/20 px-3 py-1 text-[13px] font-bold text-[#5EE6B4]">
          0% brokerage
        </span>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2 sm:absolute sm:inset-0 sm:mt-0 sm:block">
        {pins.map((area, index) => {
          const active = area.locality === selected;
          const slot = PIN_SLOTS[index];
          return (
            <button
              key={area.locality}
              type="button"
              onClick={() => onSelect(area.locality)}
              aria-pressed={active}
              style={{ ["--pin-l" as string]: `${slot.left}%`, ["--pin-t" as string]: `${slot.top}%` }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-left shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition sm:absolute sm:left-[var(--pin-l)] sm:top-[var(--pin-t)]",
                active ? "bg-[#12B886] text-ink" : "bg-white text-ink hover:-translate-y-0.5",
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  active ? "bg-[#0B3B2E]" : "bg-[#12B886] ring-4 ring-[#12B886]/20",
                )}
                aria-hidden
              />
              <span className="leading-tight">
                <span className="block whitespace-nowrap text-[14px] font-bold">{area.name}</span>
                <span className={cn("block text-[12px] font-bold", active ? "text-ink" : "text-brand")}>
                  {areaPriceLabel(area)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-5 flex flex-col gap-3 sm:absolute sm:inset-x-6 sm:bottom-6 sm:mt-0 sm:flex-row sm:items-end sm:justify-between">
        <div className="rounded-2xl bg-white p-5 sm:w-[286px]">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-ink">Your documents</p>
            <span className="rounded-full bg-[#E3F5EC] px-2.5 py-0.5 text-xs font-bold text-brand">48 hrs</span>
          </div>
          <ul className="mt-3 space-y-2 text-[14px] text-ink">
            {["NOC from owner", "Rent agreement", "Utility bill"].map((doc) => (
              <li key={doc} className="flex items-center gap-2.5">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#12B886]">
                  <VoCheck className="h-3 w-3 text-white" />
                </span>
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {selectedArea ? (
          <div className="rounded-2xl bg-[#12B886] px-4 py-3.5 text-ink sm:min-w-[144px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em]">Selected</p>
            <p className="vo-display text-lg font-extrabold leading-tight">{selectedArea.name}</p>
            <p className="text-[13px] font-semibold">
              {selectedArea.price != null ? `from ${formatInrPrice(selectedArea.price)}/mo` : "Price on request"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
