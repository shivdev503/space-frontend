import { ArrowRight, BedDouble, Building2, FileText, Mail, MapPin, Phone, Users } from "lucide-react";
import Link from "next/link";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { Container } from "@/components/ui/container";
import { COMPANY, OFFICE_MAP_HREF } from "@/lib/company-data";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_HOURS,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
} from "@/lib/contact-data";
import type { AboutStat } from "@/modules/about/about-stats";

const SERVICES = [
  {
    icon: Users,
    title: "Coworking spaces",
    href: "/coworking",
    text: "Hot desks, dedicated desks, private cabins and day passes for individuals and teams.",
  },
  {
    icon: Building2,
    title: "Managed offices",
    href: "/managed-office",
    text: "Private offices fitted out and run by an operator, for teams that want their own floor or suite.",
  },
  {
    icon: FileText,
    title: "Virtual offices",
    href: "/virtual-office",
    text: "A business address with the documents needed for GST or company registration.",
  },
  {
    icon: BedDouble,
    title: "PG and coliving",
    href: "/coliving",
    text: "PG rooms and coliving homes for students and working professionals.",
  },
] as const;

const STEPS = [
  ["Tell us what you need", "Share your city, area, team size or room type, and your budget."],
  ["Get a shortlist", "An advisor suggests spaces that fit, so you can compare prices, plans and amenities."],
  ["Visit the space", "We connect you with the operator or owner and help you arrange a visit."],
  ["Move in", "We help you negotiate. You then sign directly with the operator or owner."],
] as const;

/** These repeat the Terms of Use; change both together. */
const PRINCIPLES = [
  ["It is free if you are looking for a space", "Searching, enquiries and advice cost nothing, and we charge you no brokerage."],
  [
    "How we earn",
    "Operators and owners may pay us a fee or commission when you take a space through us. It does not increase the price you pay them.",
  ],
  [
    "What we do not do",
    "We do not own, manage or operate the listed spaces. Your agreement is always with the operator or owner of the space.",
  ],
  [
    "Where listing details come from",
    "Prices, photos and amenities come from operators, owners and our own research. They can change, so confirm them before you pay.",
  ],
] as const;

const H2 = "font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl";
const LINK = "font-medium text-[color:var(--color-brand)] hover:underline";

export function AboutPage({ stats }: { stats: AboutStat[] }) {
  const { office, registered } = COMPANY;

  return (
    <>
      <OrganizationJsonLd aboutPath="/about-us" />

      <section className="bg-[linear-gradient(180deg,#f3f8f3_0%,#ffffff_100%)] pb-12 pt-6 sm:pb-16 sm:pt-10">
        <Container className="max-w-[1100px]">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About Us" }]} />
          <h1 className="mt-6 font-display text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl">
            About {COMPANY.brand}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink/85 sm:text-lg">
            {COMPANY.brand} is a platform for finding and comparing coworking spaces, managed offices, virtual offices
            and PG and coliving homes in India. It is run by {COMPANY.legalName} from our office in Sector 38,{" "}
            {office.city}.
          </p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
            Finding a space usually means calling many operators and owners to learn the price and what is included. We
            put the options in one place, and an advisor helps you shortlist, visit and negotiate, free of charge.
          </p>

          {stats.length ? (
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {stats.map(({ value, label }) => (
                <div key={label} className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5">
                  <dt className="order-2 mt-1 text-sm text-muted">{label}</dt>
                  <dd className="order-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container className="max-w-[1100px]">
          <h2 className={H2}>What we help you find</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {SERVICES.map(({ icon: Icon, title, href, text }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group block h-full rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:border-[color:var(--color-brand)]"
                >
                  <Icon className="h-5 w-5 text-[color:var(--color-brand)]" aria-hidden />
                  <h3 className="mt-3 flex items-center gap-2 text-lg font-semibold text-ink">
                    {title}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-[#f9f8f5] py-10 sm:py-14">
        <Container className="max-w-[1100px]">
          <h2 className={H2}>How {COMPANY.brand} works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span
                  className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--color-brand)] text-sm font-bold text-white"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink sm:text-lg">{title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container className="max-w-[1100px]">
          <h2 className={H2}>What you can expect from us</h2>
          <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {PRINCIPLES.map(([title, text]) => (
              <div key={title}>
                <h3 className="text-base font-semibold text-ink sm:text-lg">{title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            The full details are in our{" "}
            <Link href="/terms" className={LINK}>
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className={LINK}>
              Privacy Policy
            </Link>
            .
          </p>
        </Container>
      </section>

      <section id="company-details" className="scroll-mt-28 bg-[#f9f8f5] py-10 sm:py-14">
        <Container className="max-w-[1100px]">
          <h2 className={H2}>Company details and office</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
              <dl className="space-y-4 text-[0.95rem] leading-relaxed">
                <div>
                  <dt className="text-sm text-muted">Company name</dt>
                  <dd className="font-semibold text-ink">{COMPANY.legalName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">GSTIN</dt>
                  <dd className="break-all font-semibold text-ink">{COMPANY.gstin}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Registered address</dt>
                  <dd className="text-ink">
                    {registered.street}, {registered.city}, {registered.state} {registered.postalCode}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 text-[0.95rem] leading-relaxed sm:p-6">
              <h3 className="text-sm text-muted">Office address</h3>
              <address className="mt-1 not-italic text-ink">
                {office.street}
                <br />
                {office.area}
                <br />
                {office.city}, {office.state} {office.postalCode}
              </address>
              <a href={OFFICE_MAP_HREF} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-flex items-center gap-1.5 ${LINK}`}>
                <MapPin className="h-4 w-4" aria-hidden />
                Get directions
              </a>
              <ul className="mt-5 space-y-2 border-t border-slate-200/70 pt-4">
                <li>
                  <a href={CONTACT_PHONE_HREF} className={`inline-flex items-center gap-2 ${LINK}`}>
                    <Phone className="h-4 w-4" aria-hidden />
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <a href={CONTACT_EMAIL_HREF} className={`inline-flex items-center gap-2 ${LINK}`}>
                    <Mail className="h-4 w-4" aria-hidden />
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li className="text-muted">{CONTACT_HOURS}</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-20 pt-10 sm:pb-24 sm:pt-14">
        <Container className="max-w-[1100px]">
          <h2 className={H2}>Looking for a space, or have one to list?</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-[color:var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent)]"
            >
              Talk to an advisor
            </Link>
            <Link
              href="/list-your-space"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-[color:var(--color-brand)]"
            >
              List your space
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
