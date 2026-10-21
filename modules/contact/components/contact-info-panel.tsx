import {
  Building2,
  Clock3,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_HOURS,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_SOCIAL_LINKS,
  CONTACT_TRUST_POINTS,
} from "@/lib/contact-data";
import { verticals } from "@/utils/constants";
import { cn } from "@/utils/cn";

const SOCIAL_ICONS = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
} as const;

function InfoCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: typeof Phone;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_32px_-20px_rgba(15,23,42,0.25)]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[rgba(76,175,80,0.12)] text-[color:var(--color-brand)]">
          <Icon className="h-5 w-5" aria-hidden strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <div className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ContactInfoPanel() {
  return (
    <div className="flex flex-col gap-5">
      <InfoCard icon={Phone} title="Call us">
        <a href={CONTACT_PHONE_HREF} className="font-semibold text-ink transition hover:text-[color:var(--color-brand)]">
          {CONTACT_PHONE_DISPLAY}
        </a>
        <p className="mt-1 text-xs text-slate-500">Speak with a workspace advisor</p>
      </InfoCard>

      <InfoCard icon={Mail} title="Email us">
        <a
          href={CONTACT_EMAIL_HREF}
          className="font-semibold text-ink break-all transition hover:text-[color:var(--color-brand)] sm:break-normal"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-1 text-xs text-slate-500">We typically respond within one business day</p>
      </InfoCard>

      <InfoCard icon={Clock3} title="Working hours">
        {CONTACT_HOURS}
      </InfoCard>

      <InfoCard icon={Building2} title="Coverage">
        Pan-India — coworking, coliving, virtual office, and managed office across major cities.
      </InfoCard>

      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-[#f8faf8] via-white to-white p-5">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[color:var(--color-brand)]" aria-hidden />
          <h3 className="text-sm font-semibold text-ink">Explore by vertical</h3>
        </div>
        <ul className="mt-3 grid gap-2">
          {verticals.map((vertical) => (
            <li key={vertical.key}>
              <Link
                href={vertical.href}
                className="group flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5 text-sm transition hover:border-[color:var(--color-brand)]/40 hover:bg-[rgba(76,175,80,0.04)]"
              >
                <span className="font-medium text-slate-700 group-hover:text-ink">{vertical.label}</span>
                <span className="text-xs font-semibold text-[color:var(--color-brand)]">View →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Follow us</p>
        <ul className="mt-3 flex items-center gap-3">
          {CONTACT_SOCIAL_LINKS.map(({ label, href }) => {
            const Icon = SOCIAL_ICONS[label as keyof typeof SOCIAL_ICONS];
            return (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
                >
                  <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="grid gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-4">
        {CONTACT_TRUST_POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-brand)]" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
