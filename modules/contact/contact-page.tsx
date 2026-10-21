import { CheckCircle2, Headset, ShieldCheck } from "lucide-react";

import { Container } from "@/components/ui/container";
import { ContactEnquiryForm } from "@/modules/contact/components/contact-enquiry-form";
import { ContactInfoPanel } from "@/modules/contact/components/contact-info-panel";

const HIGHLIGHTS = [
  {
    icon: Headset,
    title: "Expert guidance",
    description: "Dedicated advisors for coworking, coliving, virtual office, and managed office.",
  },
  {
    icon: ShieldCheck,
    title: "Verified listings",
    description: "Every recommendation is vetted for quality, pricing transparency, and fit.",
  },
  {
    icon: CheckCircle2,
    title: "Zero consultation cost",
    description: "Shortlisting, site visits coordination, and deal support — at no charge to you.",
  },
] as const;

export function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-10 sm:pb-10 sm:pt-14">
        <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(76,175,80,0.14),transparent_34%),linear-gradient(180deg,#f8faf8_0%,#ffffff_92%)]" />
        <Container className="max-w-[1100px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-brand)]">
            Contact SpaceWallah
          </p>
          <h1 className="mt-4 max-w-[16ch] font-display text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl">
            Let&apos;s find your perfect space
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Whether you need a coworking desk, coliving room, virtual office address, or managed
            office — our team is here to help you compare options and move faster.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-[0_8px_28px_-18px_rgba(15,23,42,0.18)]"
              >
                <Icon className="h-5 w-5 text-[color:var(--color-brand)]" aria-hidden strokeWidth={2.25} />
                <h2 className="mt-3 text-sm font-semibold text-ink">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-28">
        <Container className="max-w-[1100px]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12">
            <ContactInfoPanel />
            <ContactEnquiryForm />
          </div>
        </Container>
      </section>
    </>
  );
}
