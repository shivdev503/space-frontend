"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronDown,
  FileCheck2,
  Globe,
  Mail,
  Package,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, type ReactNode } from "react";

import { getVirtualOfficeHomepageCatalog } from "@/lib/virtual-office-city-catalog";
import {
  VoBand,
  VoCheck,
  VoDarkButton,
  VoGreenButton,
  VoHeading,
  VoKicker,
  VoLead,
  VoOutlineButton,
  VoWrap,
} from "@/modules/virtual-office/components/city-page/vo-city-design";
import { voBodyFont, voDisplayFont } from "@/modules/virtual-office/components/city-page/vo-city-fonts";
import { VoCityLeadProvider, useVoCityLead } from "@/modules/virtual-office/components/city-page/vo-city-lead-context";
import { useVoQuickEnquiry } from "@/modules/virtual-office/components/city-page/vo-city-quick-enquiry";
import {
  VoCityFaqSection,
  VoCityFinalCta,
  VoCityReviewsSection,
} from "@/modules/virtual-office/components/city-page/vo-city-sections";
import { VO_HOME_CITIES, VO_HOME_FAQS, type VoHomeCity } from "@/modules/virtual-office/homepage/vo-home-content";
import { cn } from "@/utils/cn";

const homeCatalog = getVirtualOfficeHomepageCatalog();

export function VoHomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: VO_HOME_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <VoCityLeadProvider citySlug="india" cityDisplay="India" catalog={homeCatalog}>
      <div
        className={cn(
          voBodyFont.variable,
          voDisplayFont.variable,
          "min-w-0 overflow-x-hidden bg-white pb-20 font-[family-name:var(--font-vo-body)] text-ink lg:pb-0",
          "[&_.vo-display]:font-[family-name:var(--font-vo-display)]",
        )}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <VoHomeHero />
        <VoHomeStats />
        <VoHomeCities />
        <VoHomePlans />
        <VoHomeMultiState />
        <VoHomeAudience />
        <VoHomeDocsAndSteps />
        <VoCityReviewsSection title="Loved by Founders Across India" tone="white" />
        <VoCityFaqSection cityDisplay="India" faqs={VO_HOME_FAQS} tone="soft" initialOpen={1} />
        <VoCityFinalCta
          title="Get your business address in any city this week"
          subtitle="Verified centres. Documents in 48 hours. Zero brokerage."
          ctaLabel="Get Free Quote"
          className="pt-16 sm:pt-24"
        />

        <VoHomeMobileBar />
      </div>
    </VoCityLeadProvider>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

const NEEDS = ["Business Address", "GST Registration", "Company Registration"] as const;

function VoHomeHero() {
  const [selected, setSelected] = useState(VO_HOME_CITIES[0].slug);
  const city = VO_HOME_CITIES.find((c) => c.slug === selected) ?? VO_HOME_CITIES[0];

  return (
    <section className="bg-[#F5F9F7] pb-16 pt-5 sm:pb-20 lg:pb-14">
      <VoWrap>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span aria-hidden>›</span>
          <span className="font-medium text-ink">Virtual Office</span>
        </nav>

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_0.98fr] lg:gap-14">
          <div className="min-w-0">
            <h1 className="vo-display text-[2.5rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-ink sm:text-[3.25rem] lg:text-[3.1rem] xl:text-[3.4rem]">
              Virtual Office in India
              <span className="block text-brand">for GST and Company Registration</span>
            </h1>

            <p className="mt-5 max-w-[34rem] text-lg leading-[1.65] text-muted lg:text-[1.15rem]">
              Compare verified virtual offices in {VO_HOME_CITIES.length} top cities. Get NOC + rent agreement + utility
              bill in 48 hours. Zero brokerage.
            </p>

            <VoHomeHeroForm selected={selected} onSelect={setSelected} />

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-muted">
              {["Verified centres only", "GST in many states", "Free expert help"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <VoCheck />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <VoHomeCityPicker selected={selected} onSelect={setSelected} city={city} />
        </div>
      </VoWrap>
    </section>
  );
}

function VoHomeHeroForm({ selected, onSelect }: { selected: string; onSelect: (slug: string) => void }) {
  const [need, setNeed] = useState<(typeof NEEDS)[number]>("GST Registration");
  const [phone, setPhone] = useState("");
  const { submit, pending, error, success } = useVoQuickEnquiry("Virtual office price request");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit({ phone, citySlug: selected, requirement: `Need: ${need} · City: ${selected}` });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-7 rounded-[22px] border border-[#DCE7E2] bg-white p-4 shadow-[0_18px_50px_rgba(11,59,46,0.08)] sm:p-5"
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
            <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">City</span>
            <select
              value={selected}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[17px] font-semibold text-ink outline-none"
            >
              {VO_HOME_CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
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

function VoHomeCityPicker({
  selected,
  onSelect,
  city,
}: {
  selected: string;
  onSelect: (slug: string) => void;
  city: VoHomeCity;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#0B3B2E] p-5 shadow-[0_30px_80px_rgba(11,59,46,0.28)] sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-72 rounded-[48px] bg-white/[0.04]" aria-hidden />
      <div className="pointer-events-none absolute right-24 top-1/3 h-56 w-36 rounded-[48px] bg-white/[0.04]" aria-hidden />
      <div className="pointer-events-none absolute -right-8 top-1/3 h-56 w-28 rounded-[48px] bg-white/[0.04]" aria-hidden />

      <div className="relative flex items-center justify-between gap-3">
        <h2 className="vo-display text-[1.4rem] font-extrabold tracking-[-0.02em] text-white">Pick your city</h2>
        <span className="rounded-full bg-[#12B886]/20 px-3 py-1 text-[13px] font-bold text-[#5EE6B4]">
          0% brokerage
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {VO_HOME_CITIES.map((c) => {
          const active = c.slug === selected;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelect(c.slug)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-left transition",
                active
                  ? "border-[#12B886] bg-[#12B886] text-ink"
                  : "border-white/15 bg-white/[0.06] text-white hover:border-white/35",
              )}
            >
              <span className="block text-[15px] font-bold">{c.name}</span>
              <span className={cn("block text-[11px] font-bold", active ? "text-ink opacity-80" : "text-white/70")}>
                GST {c.code}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-6 flex flex-col gap-4 rounded-2xl bg-white p-5 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#12B886] text-ink">
          <span className="text-center leading-none">
            <span className="block text-[9px] font-bold uppercase tracking-wide">Code</span>
            <span className="vo-display block text-[1.5rem] font-extrabold">{city.code}</span>
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="vo-display text-[1.15rem] font-extrabold tracking-[-0.01em] text-ink">
            Virtual office in {city.name}
          </p>
          <p className="text-[14px] text-muted">{city.state} GST · Documents in 24 to 48 hrs</p>
        </div>
        <VoDarkButton href={`/virtual-office/${city.slug}`} className="shrink-0 px-4 py-3 text-[14px]">
          Get price
        </VoDarkButton>
      </div>
    </div>
  );
}

/* ───────────────────────── Stats ───────────────────────── */

function VoHomeStats() {
  const stats = [
    { value: `${VO_HOME_CITIES.length} cities`, label: "Top business hubs of India" },
    { value: "48 hrs", label: "Documents after KYC" },
    { value: "₹0", label: "Brokerage. Always free for you" },
    { value: "1 call", label: "To compare centres in many cities" },
  ];

  return (
    <section className="bg-[#0B3B2E] py-8">
      <VoWrap className="grid grid-cols-2 gap-6 lg:grid-cols-4">
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

/* ───────────────────────── Cities ───────────────────────── */

function IconTile({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-12 w-12 place-items-center rounded-xl",
        dark ? "bg-white/10 text-[#5EE6B4]" : "bg-[#E3F5EC] text-brand",
      )}
    >
      {children}
    </span>
  );
}

function VoHomeCities() {
  const { openLead } = useVoCityLead();

  return (
    <VoBand id="cities">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <VoKicker>Top cities</VoKicker>
          <VoHeading>Virtual Office in Top Indian Cities</VoHeading>
          <VoLead className="max-w-[40rem]">
            Pick a city to see verified centres and prices. Each city gives you a GSTIN for its state.
          </VoLead>
        </div>
        <button
          type="button"
          onClick={openLead}
          className="shrink-0 text-left text-[16px] font-bold text-brand hover:underline"
        >
          Need many cities? Get one quote →
        </button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VO_HOME_CITIES.map((city) => (
          <Link
            key={city.slug}
            href={`/virtual-office/${city.slug}`}
            className="group relative isolate flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[20px] bg-[#0B3B2E] p-5 shadow-[0_10px_30px_rgba(11,59,46,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(11,59,46,0.22)] sm:aspect-[5/4]"
          >
            {city.image ? (
              <Image
                src={city.image}
                alt={`Workspace in ${city.name}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="-z-20 object-cover transition duration-500 group-hover:scale-105"
              />
            ) : null}
            {/* Light at the top, deep at the bottom: the photo stays visible, the text stays readable. */}
            <span
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,42,34,0.10)_0%,rgba(7,42,34,0.12)_30%,rgba(7,42,34,0.62)_55%,rgba(7,42,34,0.94)_100%)]"
              aria-hidden
            />

            <span className="self-end rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-bold text-ink shadow-sm backdrop-blur">
              GST code {city.code}
            </span>

            <span className="block [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
              <span className="vo-display block text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] text-white">
                {city.name}
              </span>
              <span className="block text-[14px] text-white/80">{city.state}</span>
              <span className="mt-3 flex items-center justify-between border-t border-white/20 pt-3 text-[15px] font-bold text-[#5EE6B4]">
                View virtual offices
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Plans ───────────────────────── */

function VoHomePlans() {
  const { openLead } = useVoCityLead();
  const plans = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Business Address",
      text: "A prime address for your website · invoices and letterheads.",
      features: ["Professional business address", "Mail scanning and forwarding", "Use on invoices and Google profile"],
    },
    {
      icon: <FileCheck2 className="h-5 w-5" />,
      title: "GST Registration",
      text: "Get a GSTIN in a new state with a verified address and full papers.",
      features: [
        "NOC + rent agreement + utility bill",
        "New state GSTIN or APOB support",
        "GST officer visit handled by the centre",
      ],
      featured: true,
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Company Registration",
      text: "A registered office address for your Pvt Ltd · LLP or OPC.",
      features: ["Premium registered office address", "Papers for MCA incorporation", "GST support and mail handling"],
    },
  ];

  return (
    <VoBand id="plans" tone="soft">
      <div className="text-center">
        <VoKicker>Plans</VoKicker>
        <VoHeading className="mx-auto max-w-[44rem]">Choose a Virtual Office Plan for Your Need</VoHeading>
        <VoLead className="mx-auto">Three simple plans. Prices change by city so we send you live prices for yours.</VoLead>
      </div>

      <div className="mt-12 grid items-center gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={cn(
              "relative flex flex-col rounded-[22px] p-8",
              plan.featured
                ? "bg-[#0B3B2E] text-white shadow-[0_30px_70px_rgba(11,59,46,0.28)] lg:py-10"
                : "border border-[#E2EBE7] bg-white",
            )}
          >
            <div className="flex items-start justify-between">
              <IconTile dark={plan.featured}>{plan.icon}</IconTile>
              {plan.featured ? (
                <span className="rounded-full bg-[#5EE6B4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                  Most popular
                </span>
              ) : null}
            </div>
            <h3
              className={cn(
                "vo-display mt-6 text-[1.5rem] font-extrabold tracking-[-0.02em]",
                plan.featured ? "text-white" : "text-ink",
              )}
            >
              {plan.title}
            </h3>
            <p
              className={cn(
                "mt-3 min-h-[3rem] text-[15px] leading-relaxed",
                plan.featured ? "text-white/90" : "text-muted",
              )}
            >
              {plan.text}
            </p>
            <ul
              className={cn(
                "mt-6 space-y-3 border-t pt-6 text-[15px]",
                plan.featured ? "border-white/15 text-white" : "border-[#E2EBE7] text-ink",
              )}
            >
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <VoCheck className={plan.featured ? "text-[#5EE6B4]" : undefined} />
                  {f}
                </li>
              ))}
            </ul>
            {plan.featured ? (
              <VoGreenButton onClick={openLead} className="mt-8 w-full">
                Get Details and Pricing
              </VoGreenButton>
            ) : (
              <VoOutlineButton onClick={openLead} className="mt-8 w-full">
                Get Details and Pricing
              </VoOutlineButton>
            )}
          </div>
        ))}
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Multi-state GST ───────────────────────── */

function VoHomeMultiState() {
  const { openLead } = useVoCityLead();
  const points = [
    ["New state = new GSTIN", "Selling from a new state needs a separate GST registration there."],
    ["Same state = APOB", "A new city in your current state is added as an additional place of business."],
    ["One partner for every state", "We match addresses and documents in each city so your filings stay simple."],
  ];

  return (
    <section className="bg-white py-16 sm:py-24">
      <VoWrap>
        <div className="grid items-center gap-10 rounded-[32px] bg-[#0B3B2E] px-6 py-12 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-16">
          <div>
            <VoKicker className="text-[#5EE6B4]">For online sellers and growing brands</VoKicker>
            <VoHeading className="text-white">Need GST in More Than One State?</VoHeading>
            <p className="mt-5 max-w-[33rem] text-[17px] leading-[1.7] text-white/90">
              GST works state by state. Each new state needs its own GSTIN and a local address. We set up virtual
              offices in all your states with one expert and one plan.
            </p>
            <VoGreenButton onClick={openLead} className="mt-8">
              Plan My Multi State GST →
            </VoGreenButton>
          </div>
          <ol className="space-y-3">
            {points.map(([title, text], index) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <span className="vo-display text-[1.2rem] font-extrabold text-[#5EE6B4]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[17px] font-bold text-white">{title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/85">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </VoWrap>
    </section>
  );
}

/* ───────────────────────── Audience ───────────────────────── */

function VoHomeAudience() {
  const items = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Startups and small businesses",
      text: "Register at a trusted address without a long office lease.",
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: "Online sellers",
      text: "Get GST in new states to sell on Amazon · Flipkart and Meesho.",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: "Freelancers and consultants",
      text: "Keep your home address private and look professional to clients.",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Teams entering new cities",
      text: "Start in a new market with an address and mail handling from day one.",
    },
  ];

  return (
    <section className="bg-white pb-16 sm:pb-24">
      <VoWrap>
        <VoKicker>Who it is for</VoKicker>
        <VoHeading>Is a Virtual Office Right for You?</VoHeading>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-[20px] border border-[#E2EBE7] bg-white p-7">
              <IconTile>{item.icon}</IconTile>
              <h3 className="vo-display mt-5 text-xl font-extrabold leading-tight tracking-[-0.015em] text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </VoWrap>
    </section>
  );
}

/* ───────────────────────── Documents + steps ───────────────────────── */

function VoHomeDocsAndSteps() {
  const { openLead } = useVoCityLead();
  const docs = [
    { icon: <ShieldCheck className="h-6 w-6" />, title: "NOC from the owner", text: "Lets your business use the address for GST and MCA." },
    { icon: <FileCheck2 className="h-6 w-6" />, title: "Stamped rent agreement", text: "Proof that you can use the address legally." },
    { icon: <Zap className="h-6 w-6" />, title: "Recent utility bill", text: "An electricity bill that shows the commercial address." },
  ];
  const steps = [
    ["Tell us your city and plan", "Get live prices on WhatsApp in minutes."],
    ["Pick the best centre", "Our expert compares verified options for you."],
    ["Finish KYC online", "Takes about 5 minutes. No office visit needed."],
    ["Get documents and register", "Papers in 24 to 48 hours. Apply for GST or your company."],
  ];

  return (
    <VoBand id="documents" tone="soft">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
        <div>
          <VoKicker>Documents</VoKicker>
          <VoHeading>Documents You Get With Your Virtual Office</VoHeading>
          <ul className="mt-8 space-y-3">
            {docs.map((doc) => (
              <li key={doc.title} className="flex items-center gap-4 rounded-2xl border border-[#E2EBE7] bg-white px-5 py-4">
                <span className="text-brand">{doc.icon}</span>
                <div>
                  <p className="text-[17px] font-bold text-ink">{doc.title}</p>
                  <p className="text-[15px] text-muted">{doc.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            You share only PAN · Aadhaar and a photo. Companies also share their incorporation papers.
          </p>
        </div>

        <div>
          <VoKicker>How it works</VoKicker>
          <VoHeading>Get Your Virtual Office in 4 Steps</VoHeading>
          <ol className="relative mt-8 space-y-7">
            <span className="absolute bottom-6 left-[21px] top-6 w-px bg-[#CFE0D8]" aria-hidden />
            {steps.map(([title, text], index) => {
              const last = index === steps.length - 1;
              return (
                <li key={title} className="relative flex gap-5">
                  <span
                    className={cn(
                      "vo-display grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-extrabold",
                      last ? "bg-[#0B3B2E] text-[#5EE6B4]" : "bg-[#12B886] text-ink",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <p className="text-lg font-bold text-ink">{title}</p>
                    <p className="mt-0.5 text-[15px] text-muted">{text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <VoDarkButton onClick={openLead} className="mt-8">
            Start Now. It&apos;s Free →
          </VoDarkButton>
        </div>
      </div>
    </VoBand>
  );
}

/* ───────────────────────── Mobile bar ───────────────────────── */

function VoHomeMobileBar() {
  const { openLead } = useVoCityLead();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2.5 border-t border-[#E2EBE7] bg-white px-4 py-2.5 shadow-[0_-8px_30px_rgba(11,59,46,0.08)] lg:hidden">
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-muted">
        <b className="block text-[15px] font-extrabold text-ink">{VO_HOME_CITIES.length} cities · 0% brokerage</b>
        Free expert help
      </p>
      <VoDarkButton onClick={openLead} className="shrink-0 px-5 py-2.5 text-sm">
        Get Prices
      </VoDarkButton>
    </div>
  );
}
