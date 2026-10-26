import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/utils/cn";

type ComparisonColumn = {
  title: string;
  href: string;
  rows: Record<ComparisonRowKey, string>;
};

type ComparisonRowKey = "bestFor" | "teamSize" | "commitment" | "moveIn" | "price";

const ROWS: { key: ComparisonRowKey; label: string }[] = [
  { key: "bestFor", label: "Best for" },
  { key: "teamSize", label: "Team size" },
  { key: "commitment", label: "Commitment" },
  { key: "moveIn", label: "Time to move in" },
  { key: "price", label: "Starting price" },
];

const OPTIONS: ComparisonColumn[] = [
  {
    title: "Coworking",
    href: "/coworking",
    rows: {
      bestFor: "Freelancers, startups",
      teamSize: "1-50 seats",
      commitment: "Monthly",
      moveIn: "48 hours",
      price: "₹4,800/seat",
    },
  },
  {
    title: "Managed Office",
    href: "/managed-office",
    rows: {
      bestFor: "Scaling teams, enterprises",
      teamSize: "20-500 seats",
      commitment: "12-36 month lock-in",
      moveIn: "30-60 days",
      price: "₹9,500/seat",
    },
  },
  {
    // Figures from live PG listings: ~90% start at ₹6,500+/month, most ask 30 days' notice.
    title: "Coliving & PG",
    href: "/coliving",
    rows: {
      bestFor: "Students, working professionals",
      teamSize: "Single, double or triple sharing",
      commitment: "Monthly, 30-day notice",
      moveIn: "Same week",
      price: "₹6,500/month",
    },
  },
  {
    title: "Virtual Office",
    href: "/virtual-office",
    rows: {
      bestFor: "GST and company registration",
      teamSize: "No desk needed",
      commitment: "Yearly",
      moveIn: "Documents in 3 days",
      price: "₹9,999/year",
    },
  },
];

export function WorkspaceFitComparison() {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
        Which one fits you?
      </h2>

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <table className="w-full table-fixed border-collapse text-left text-ink">
          <thead className="bg-[#f8f8f7]">
            <tr>
              <th className="w-[13.5%] px-5 py-6 text-sm font-semibold text-transparent lg:px-7">
                Category
              </th>
              {OPTIONS.map((option, optionIndex) => (
                <th
                  key={`${option.title}-${optionIndex}`}
                  scope="col"
                  className="px-5 py-6 font-display text-lg font-semibold text-ink lg:px-7 lg:text-xl"
                >
                  {option.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {ROWS.map((row) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className="px-5 py-6 text-base font-medium text-muted lg:px-7 lg:text-lg"
                >
                  {row.label}
                </th>
                {OPTIONS.map((option, optionIndex) => (
                  <td
                    key={`${option.title}-${optionIndex}-${row.key}`}
                    className={cn(
                      "px-5 py-6 text-base leading-relaxed text-ink lg:px-7 lg:text-lg",
                      row.key === "price" && "font-semibold",
                    )}
                  >
                    {option.rows[row.key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-5 py-6 lg:px-7" aria-hidden />
              {OPTIONS.map((option, optionIndex) => (
                <td key={`${option.title}-${optionIndex}-cta`} className="px-5 py-6 lg:px-7">
                  <ExploreLink href={option.href} label={`Explore ${option.title}`} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-7 grid gap-4 md:hidden">
        {OPTIONS.map((option, optionIndex) => (
          <article
            key={`${option.title}-${optionIndex}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl font-semibold text-ink">{option.title}</h3>
              <ExploreLink href={option.href} label={`Explore ${option.title}`} compact />
            </div>
            <dl className="mt-5 divide-y divide-slate-100">
              {ROWS.map((row) => (
                <div key={row.key} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0">
                  <dt className="text-sm font-medium text-muted">{row.label}</dt>
                  <dd
                    className={cn(
                      "min-w-0 text-sm leading-6 text-ink",
                      row.key === "price" && "font-semibold",
                    )}
                  >
                    {option.rows[row.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function ExploreLink({
  href,
  label,
  compact = false,
}: {
  href: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold text-[#8f1d52] transition hover:text-[#6f143f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f1d52] focus-visible:ring-offset-2",
        compact ? "text-sm" : "text-lg",
      )}
    >
      <span>Explore</span>
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}