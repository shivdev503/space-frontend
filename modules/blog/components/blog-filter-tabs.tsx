"use client";

import type { BlogVerticalFilter } from "@/types/blog";
import { cn } from "@/utils/cn";

const FILTERS: { id: BlogVerticalFilter; label: string }[] = [
  { id: "all", label: "All insights" },
  { id: "coworking", label: "Coworking" },
  { id: "coliving", label: "Coliving Space" },
  { id: "virtual-office", label: "Virtual Office" },
  { id: "office-space", label: "Managed Office" },
];

export function BlogFilterTabs({
  active,
  onChange,
}: {
  active: BlogVerticalFilter;
  onChange: (filter: BlogVerticalFilter) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filter articles by space vertical"
    >
      {FILTERS.map((filter) => {
        const selected = active === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(filter.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              selected
                ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white shadow-[0_8px_20px_rgba(76,175,80,0.28)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}