import { MapPin, Star } from "lucide-react";

import { operatorBrandName } from "@/lib/operator-brand";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { formatCurrency, toTitleCase } from "@/utils/format";

export function workspaceAddress(workspace: CoworkingModel.WorkSpace): string {
  const loc = workspace.location;
  return (
    loc.address?.trim() ||
    [loc.address1, loc.address2, loc.city?.name].filter(Boolean).join(", ").trim()
  );
}

export function workspaceCitySlugish(workspace: CoworkingModel.WorkSpace): string {
  const name = workspace.location?.city?.name?.trim() || "city";
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function workspaceRating(workspace: CoworkingModel.WorkSpace): number {
  const raw = workspace.ratings;
  const n = raw ? Number.parseFloat(raw) : NaN;
  return Number.isFinite(n) ? n : 0;
}

export function CoworkingDetailHeader({ workspace }: { workspace: CoworkingModel.WorkSpace }) {
  const address = workspaceAddress(workspace);
  const micro = workspace.location?.micro_location?.name?.trim();
  const city = workspace.location?.city?.name?.trim();
  const rating = workspaceRating(workspace);
  return (
    <header className="rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
            {operatorBrandName(workspace.brand) || "Coworking"}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{workspace.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {address || `${toTitleCase(micro || "micro location")}, ${toTitleCase(city || "city")}`}
            </span>
            {rating > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                <Star className="h-4 w-4 fill-current text-amber-500" />
                {rating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Starting from</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatCurrency(workspace.starting_price ?? 0)}
          </p>
        </div>
      </div>
    </header>
  );
}
