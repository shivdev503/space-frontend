import { CoworkingSelectForm } from "@/modules/coworking/homepage/coworking-select-form";
import type { SearchOption } from "@/types";

const CHECKS = [
  "Verified spaces only, no filler listings",
  "Real pricing confirmed before we share",
  "Zero brokerage. No catch.",
] as const;

type CoworkingSelectCtaProps = {
  cities: SearchOption[];
};

export function CoworkingSelectCta({ cities }: CoworkingSelectCtaProps) {
  return (
    <section id="cta" className="border-t border-slate-200/90">
      <div className="grid min-h-[500px] lg:grid-cols-2">
        <div className="flex flex-col justify-center border-b border-slate-200/90 bg-page px-7 py-14 sm:px-10 lg:border-b-0 lg:border-r lg:px-16 lg:py-[84px]">
          <p className="mb-[18px] flex items-center gap-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--color-accent)]">
            <span className="h-0.5 w-[26px] shrink-0 rounded-sm bg-[color:var(--color-brand)]" aria-hidden />
            SpaceWallah Select
          </p>
          <h2 className="font-display text-[clamp(1.875rem,2.9vw,2.75rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ink">
            Tell us what you need
            <br />
            We&apos;ll find it for you
          </h2>
          <p className="mt-5 max-w-[430px] text-base leading-relaxed text-muted sm:text-[16.5px]">
            Our experts shortlist verified spaces in your city within 2 hours. They compare,
            negotiate, and advise at zero cost to you.
          </p>
          <ul className="mt-8 flex flex-col gap-3.5">
            {CHECKS.map((line) => (
              <li key={line} className="flex items-center gap-3 text-sm font-medium text-ink sm:text-[14.5px]">
                <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-[color:var(--color-brand)] text-[11px] text-white">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#3FA059] to-[#57B574] px-7 py-14 sm:px-10 lg:px-16 lg:py-[84px]">
          <div
            className="pointer-events-none absolute -right-[120px] -top-[120px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]"
            aria-hidden
          />
          <h3 className="relative mb-8 text-[26px] font-bold leading-snug tracking-tight text-white">
            Get shortlisted spaces
            <br />
            in 2 hours free.
          </h3>
          <CoworkingSelectForm cities={cities} />
          <p className="relative mt-3.5 text-[12.5px] leading-relaxed text-white/85">
            No spam. Experts reply within 2 hours during business hours.
          </p>
        </div>
      </div>
    </section>
  );
}
