import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";

import { Container } from "@/components/ui/container";

const FOOTER_BG = "#f9f8f5";

import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
} from "@/lib/contact-data";

const FOOTER_EMAIL = CONTACT_EMAIL;
const FOOTER_PHONE_DISPLAY = CONTACT_PHONE_DISPLAY;
const FOOTER_PHONE_HREF = CONTACT_PHONE_HREF;

/** Social profile URLs for the upper footer. */
export const FOOTER_SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61595877574456",
    Icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/space.wallah",
    Icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/spacewallah",
    Icon: Linkedin,
  },
] as const;

const PRIMARY_LINKS = [
  { label: "Coworking Space", href: "/coworking" },
  { label: "Coliving Space", href: "/coliving" },
  { label: "Virtual Office", href: "/virtual-office" },
  { label: "Managed Office", href: "/managed-office" },
] as const;

const COMPANY_LINKS = [
  { label: "List Your Space", href: "/list-your-space" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
] as const;

function LinkRow({
  items,
}: {
  items: readonly { label: string; href: string }[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.875rem] font-medium text-slate-700 sm:text-[0.9375rem]">
      {items.map((item, index) => (
        <li key={item.href + item.label} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span className="text-slate-300" aria-hidden>
              •
            </span>
          ) : null}
          <Link href={item.href} className="transition hover:text-ink">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Upper footer — promo layout (logo, links, business plans, contact, socials)
 * on the existing cream page background. City grid is in {@link FooterMarketingSection}.
 */
export function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t border-slate-900/[0.06]"
      style={{ backgroundColor: FOOTER_BG }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(76, 175, 80, 0.07), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-900/10 to-transparent"
        aria-hidden
      />

      <Container className="relative py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] lg:gap-14 xl:gap-20">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center transition-opacity hover:opacity-85"
              aria-label="SpaceWallah — home"
            >
              <span className="relative block h-10 w-[11.5rem] sm:h-11 sm:w-[13rem]">
                <Image
                  src="/spacewallah-logo-color.svg"
                  alt="SpaceWallah"
                  fill
                  className="object-contain object-left"
                  sizes="208px"
                  priority={false}
                />
              </span>
            </Link>

            <p className="mt-3 text-sm font-medium text-slate-600 sm:text-[0.9375rem]">
              Find the right space across India
            </p>

            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
              SpaceWallah helps you compare verified coworking spaces, managed offices, virtual offices and coliving homes in cities across India, with a free advisor to shortlist, negotiate and get you moved in.
            </p>

            <nav aria-label="Footer quick links" className="mt-8">
              <LinkRow items={PRIMARY_LINKS} />
            </nav>
          </div>

          <div className="min-w-0 lg:pt-1">
            <div>
              <p className="text-base font-bold tracking-tight text-ink sm:text-lg">
                Company
              </p>
              <ul className="mt-3 space-y-2">
                {COMPANY_LINKS.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-slate-700 transition hover:text-ink sm:text-[0.9375rem]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <p className="text-base font-bold tracking-tight text-ink sm:text-lg">
                Feel free to connect with us
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
                <a
                  href={FOOTER_PHONE_HREF}
                  className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-700 transition hover:text-ink sm:text-[0.9375rem]"
                >
                  <Phone
                    className="h-4 w-4 shrink-0 text-[color:var(--color-brand)]"
                    aria-hidden
                    strokeWidth={2.25}
                  />
                  {FOOTER_PHONE_DISPLAY}
                </a>
                <a
                  href={CONTACT_EMAIL_HREF}
                  className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-700 transition hover:text-ink sm:text-[0.9375rem]"
                >
                  <Mail
                    className="h-4 w-4 shrink-0 text-[color:var(--color-brand)]"
                    aria-hidden
                    strokeWidth={2.25}
                  />
                  {FOOTER_EMAIL}
                </a>
              </div>
            </div>

            <ul className="mt-7 flex items-center gap-3" aria-label="Social media">
              {FOOTER_SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
                  >
                    <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
