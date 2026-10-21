"use client";

import type { ReactNode, ChangeEvent } from "react";

import { cn } from "@/utils/cn";

/**
 * Small set of form primitives used across both wizards. They share the
 * SpaceWallah look (cream bg, ink-1 borders, rounded-xl inputs) so the steps
 * stay visually consistent and concise.
 */

type FieldProps = {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  return (
    <label className={cn("grid gap-2 text-sm font-medium text-ink", className)}>
      <span>
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
      {hint && !error ? <span className="text-xs font-normal text-ink/60">{hint}</span> : null}
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

const inputBase =
  "h-11 rounded-xl border px-4 text-base text-ink outline-none transition placeholder:text-ink/40 border-ink/15 bg-white focus:border-ink/40 disabled:cursor-not-allowed disabled:opacity-60";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url" | "search";
  disabled?: boolean;
  maxLength?: number;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  disabled,
  maxLength,
}: TextInputProps) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={inputBase}
    />
  );
}

type TextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
};

export function TextArea({ value, onChange, placeholder, rows = 5, disabled }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        inputBase,
        "h-auto min-h-[9rem] py-3 leading-relaxed",
      )}
    />
  );
}

type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

export function Select({ value, onChange, options, placeholder, disabled }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(inputBase, "appearance-none pr-10")}
    >
      {placeholder ? (
        <option value="">{placeholder}</option>
      ) : null}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

type CheckboxGridProps = {
  items: ReadonlyArray<{ id: string; label: string }>;
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  disabled?: boolean;
  columns?: 2 | 3;
};

export function CheckboxGrid({ items, selected, onToggle, disabled, columns = 2 }: CheckboxGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {items.map((item) => {
        const checked = selected.has(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !disabled && onToggle(item.id)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm font-medium transition",
              "disabled:cursor-not-allowed disabled:opacity-60",
              checked
                ? "border-ink bg-ink text-white"
                : "border-ink/15 bg-white text-ink hover:border-ink/40",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                checked ? "border-white bg-white/20 text-white" : "border-ink/30",
              )}
            >
              {checked ? "✓" : ""}
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-ink/10 bg-white px-4 py-3">
      <div className="text-sm">
        <p className="font-semibold text-ink">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-ink/60">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60",
          checked ? "bg-ink" : "bg-ink/20",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-5" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
