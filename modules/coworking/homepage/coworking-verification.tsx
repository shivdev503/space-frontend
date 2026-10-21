import { Calendar, CheckSquare, IndianRupee, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { voBodyFont, voDisplayFont } from "@/modules/virtual-office/components/city-page/vo-city-fonts";
import { cn } from "@/utils/cn";

const TILES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Wifi,
    title: "Internet tested at peak",
    description: "Checked on a busy working day. Under 50 Mbps fails.",
  },
  {
    icon: Calendar,
    title: "Meeting rooms really bookable",
    description: "We try to book one ourselves before we list a space.",
  },
  {
    icon: IndianRupee,
    title: "Price confirmed with operator",
    description: "What you see is what you pay. No old promo rates.",
  },
  {
    icon: CheckSquare,
    title: "Walked in person",
    description: "Seen on a normal weekday. Not just a staged photo shoot.",
  },
];

const COMPARISON: { label: string; us: string; alone: string }[] = [
  { label: "Spaces compared", us: "Many at once", alone: "One call at a time" },
  { label: "Price", us: "Negotiated for you", alone: "List price" },
  { label: "Tours", us: "Planned in one day", alone: "Many trips" },
  { label: "Brokerage", us: "₹0", alone: "Often charged by brokers" },
];

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2E8B62]">{children}</p>;
}

function Heading({ children }: { children: string }) {
  return (
    <h2 className="mt-3 font-[family-name:var(--font-vo-display)] text-[2rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#1a3a2f] sm:text-[2.5rem] lg:text-[2.6rem]">
      {children}
    </h2>
  );
}

export function CoworkingVerification() {
  return (
    <section
      className={cn(
        voBodyFont.variable,
        voDisplayFont.variable,
        "border-y border-slate-200/90 bg-white py-16 font-[family-name:var(--font-vo-body)] sm:py-[104px]",
      )}
    >
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 sm:px-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <Eyebrow>Our Standard</Eyebrow>
          <Heading>Every Listing Is Verified. Here Is What That Means.</Heading>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.title} className="rounded-[20px] bg-[#f6f9f7] p-6 sm:p-7">
                  <Icon className="h-6 w-6 text-[#2E8B62]" strokeWidth={1.8} aria-hidden />
                  <h3 className="mt-5 text-[17px] font-bold leading-snug text-[#1a3a2f]">{tile.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#3D4F49]">{tile.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Eyebrow>Why Book With Us</Eyebrow>
          <Heading>SpaceWallah vs Searching Alone</Heading>

          <div className="mt-9 overflow-hidden rounded-[20px] border border-[#E2EBE7] text-[15px]">
            <div className="grid grid-cols-[1.05fr_1.12fr_1fr] text-xs font-bold uppercase tracking-[0.1em]">
              <span className="bg-[#f6f9f7] px-4 py-4 sm:px-5" />
              <span className="bg-[#1a3a2f] px-4 py-4 text-[#87e3c0] sm:px-5">SpaceWallah</span>
              <span className="bg-[#f6f9f7] px-4 py-4 text-[#3D4F49] sm:px-5">On your own</span>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.label} className="grid grid-cols-[1.05fr_1.12fr_1fr] border-t border-[#E2EBE7]">
                <span className="px-4 py-4 font-bold text-[#1a3a2f] sm:px-5">{row.label}</span>
                <span className="bg-[#f2faf6] px-4 py-4 font-bold text-[#1a3a2f] sm:px-5">{row.us}</span>
                <span className="px-4 py-4 text-[#3D4F49] sm:px-5">{row.alone}</span>
              </div>
            ))}
          </div>

          <a
            href="#cta"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#55b58a] px-7 py-3.5 text-[16px] font-bold text-[#1a3a2f] transition hover:bg-[#4aa77d]"
          >
            Let Our Expert Compare for Me →
          </a>
        </div>
      </div>
    </section>
  );
}
