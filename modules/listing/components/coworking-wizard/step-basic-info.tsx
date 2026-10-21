"use client";

import type { ListingModel } from "@/types/listing.model";
import { cn } from "@/utils/cn";

import {
  CheckboxGrid,
  Field,
  Select,
  Switch,
  TextArea,
  TextInput,
} from "../wizard/fields";
import { HOUR_OPTIONS, MIN_DESCRIPTION_WORDS } from "../wizard/constants";

import type { UseCoworkingWizardReturn } from "./use-coworking-wizard";
import { countWords } from "./use-coworking-wizard";
import type { DeskTypeSelection } from "./types";

type Props = {
  wizard: UseCoworkingWizardReturn;
  catalog: {
    amenities: ListingModel.Amenity[];
    activeCategories: ListingModel.ActiveCategory[];
  };
  catalogLoading: boolean;
  catalogError: string | null;
};

const hourOptions = HOUR_OPTIONS.map((h) => ({ value: h, label: h }));

export function CoworkingStepBasicInfo({ wizard, catalog, catalogLoading, catalogError }: Props) {
  const { state, set, patchHours, toggleAmenity, toggleDeskType, setDeskPrice, busy } = wizard;
  const disabled = busy;
  const descWords = countWords(state.description);

  const amenityItems = catalog.amenities.map((a) => ({ id: a.id, label: a.name }));
  const amenityIds = new Set(state.amenities.map((a) => a.id));

  return (
    <div className="grid gap-6">
      {catalogError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {catalogError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name of the space" required>
          <TextInput
            value={state.name}
            onChange={(v) => set("name", v)}
            placeholder="e.g. SpaceWallah Cyber City"
            disabled={disabled}
          />
        </Field>
        <Field label="Total seats" required>
          <TextInput
            value={state.seats}
            onChange={(v) => set("seats", v.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="e.g. 120"
            disabled={disabled}
          />
        </Field>
      </div>

      <Field
        label="Description"
        required
        hint={`${descWords} / ${MIN_DESCRIPTION_WORDS} words minimum`}
      >
        <TextArea
          value={state.description}
          onChange={(v) => set("description", v)}
          placeholder="Describe what makes this coworking space special — the vibe, amenities, location edge, community, etc."
          rows={6}
          disabled={disabled}
        />
      </Field>

      {/* Desk types */}
      <div className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Desk types & pricing</h3>
          <p className="mt-1 text-xs text-ink/60">
            Pick the plans you offer and enter the starting monthly / daily price for each.
          </p>
        </div>
        {catalogLoading ? (
          <p className="text-sm text-ink/60">Loading desk types…</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.activeCategories.map((cat) => {
              const selected = state.deskTypes.find((d) => d.id === cat.id);
              return (
                <DeskTypeCard
                  key={cat.id}
                  category={cat}
                  selected={selected}
                  onToggle={() => !disabled && toggleDeskType(cat)}
                  onPriceChange={(p) => setDeskPrice(cat.id, p)}
                  disabled={disabled}
                />
              );
            })}
            {catalog.activeCategories.length === 0 ? (
              <p className="text-sm text-ink/60">No desk-type categories configured yet.</p>
            ) : null}
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Amenities</h3>
          <p className="mt-1 text-xs text-ink/60">
            Pick everything the space offers. Buyers filter heavily on these.
          </p>
        </div>
        {catalogLoading ? (
          <p className="text-sm text-ink/60">Loading amenities…</p>
        ) : (
          <CheckboxGrid
            items={amenityItems}
            selected={amenityIds}
            onToggle={(id) => {
              const match = catalog.amenities.find((a) => a.id === id);
              if (match) toggleAmenity(match);
            }}
            disabled={disabled}
            columns={3}
          />
        )}
      </div>

      {/* Hours of operation */}
      <div className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Hours of operation</h3>
          <p className="mt-1 text-xs text-ink/60">
            Keep each day switched off if the space is closed.
          </p>
        </div>
        <div className="grid gap-3">
          <DayRow
            label="Mon – Fri"
            open={state.hours.weekdayOpen}
            from={state.hours.weekdayFrom}
            to={state.hours.weekdayTo}
            onOpenChange={(v) => patchHours({ weekdayOpen: v })}
            onFromChange={(v) => patchHours({ weekdayFrom: v })}
            onToChange={(v) => patchHours({ weekdayTo: v })}
            disabled={disabled}
          />
          <DayRow
            label="Saturday"
            open={state.hours.saturdayOpen}
            from={state.hours.saturdayFrom}
            to={state.hours.saturdayTo}
            onOpenChange={(v) => patchHours({ saturdayOpen: v })}
            onFromChange={(v) => patchHours({ saturdayFrom: v })}
            onToChange={(v) => patchHours({ saturdayTo: v })}
            disabled={disabled}
          />
          <DayRow
            label="Sunday"
            open={state.hours.sundayOpen}
            from={state.hours.sundayFrom}
            to={state.hours.sundayTo}
            onOpenChange={(v) => patchHours({ sundayOpen: v })}
            onFromChange={(v) => patchHours({ sundayFrom: v })}
            onToChange={(v) => patchHours({ sundayTo: v })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

function DeskTypeCard({
  category,
  selected,
  onToggle,
  onPriceChange,
  disabled,
}: {
  category: ListingModel.ActiveCategory;
  selected?: DeskTypeSelection;
  onToggle: () => void;
  onPriceChange: (price: string) => void;
  disabled?: boolean;
}) {
  const checked = Boolean(selected);
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition",
        checked ? "border-ink bg-ink/5" : "border-ink/15 bg-white",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-ink">{category.name}</p>
          {category.description ? (
            <p className="text-xs text-ink/60">{category.description}</p>
          ) : null}
        </div>
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
            checked ? "border-ink bg-ink text-white" : "border-ink/30",
          )}
        >
          {checked ? "✓" : ""}
        </span>
      </button>
      {checked ? (
        <div className="mt-3">
          <Field label="Starting price (₹)" required>
            <TextInput
              value={selected?.price ?? ""}
              onChange={(v) => onPriceChange(v.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="e.g. 8000"
              disabled={disabled}
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
}

function DayRow({
  label,
  open,
  from,
  to,
  onOpenChange,
  onFromChange,
  onToChange,
  disabled,
}: {
  label: string;
  open: boolean;
  from: string;
  to: string;
  onOpenChange: (v: boolean) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-ink/10 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <Switch
        checked={open}
        onChange={onOpenChange}
        label={label}
        description={open ? "Open" : "Closed"}
        disabled={disabled}
      />
      <Select
        value={from}
        onChange={onFromChange}
        options={hourOptions}
        placeholder="From"
        disabled={disabled || !open}
      />
      <Select
        value={to}
        onChange={onToChange}
        options={hourOptions}
        placeholder="To"
        disabled={disabled || !open}
      />
    </div>
  );
}
