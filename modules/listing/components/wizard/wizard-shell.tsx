"use client";

import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

export type WizardStep = {
  id: string;
  title: string;
  /** Subtitle shown under the title in the step content header. */
  description?: string;
  /** Rendered inside the card body. */
  content: ReactNode;
  /** Client-side validation — return a message to block progression. */
  validate?: () => string | null;
};

type WizardShellProps = {
  steps: WizardStep[];
  currentIndex: number;
  onStepChange: (nextIndex: number) => void;
  onSubmit: () => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
  success?: string | null;
  /** Label for the final action button (defaults to "Save listing"). */
  submitLabel?: string;
  /**
   * When provided, a "Clear draft" link is rendered alongside Back. Your
   * wizard is expected to drop the persisted draft and reset state to
   * its initial values.
   */
  onResetDraft?: () => void;
};

/**
 * Reusable wizard chrome used by both the coworking and office-space add
 * flows. Holds the progress indicator, the card that renders the active step,
 * and the Back / Next / Submit buttons. Validation runs lazily on Next.
 */
export function WizardShell({
  steps,
  currentIndex,
  onStepChange,
  onSubmit,
  busy,
  error,
  success,
  submitLabel = "Save listing",
  onResetDraft,
}: WizardShellProps) {
  const active = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  function handleNext() {
    const validationError = active?.validate?.();
    if (validationError) return;
    if (isLast) {
      void onSubmit();
    } else {
      onStepChange(currentIndex + 1);
    }
  }

  function handleBack() {
    if (isFirst) return;
    onStepChange(currentIndex - 1);
  }

  const validationError = active?.validate?.() ?? null;
  const combinedError = error ?? validationError;

  return (
    <div className="grid gap-6">
      <ProgressIndicator steps={steps} currentIndex={currentIndex} onStepChange={onStepChange} />

      <div className="rounded-[1.75rem] border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">{active?.title}</h2>
          {active?.description ? (
            <p className="mt-2 text-sm text-ink/70">{active.description}</p>
          ) : null}
        </div>

        <div className="mt-6">{active?.content}</div>

        {combinedError ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {combinedError}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {success}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={busy || isFirst}
              className={cn(
                "h-11 rounded-xl border border-ink/15 bg-white px-5 text-sm font-semibold text-ink transition hover:border-ink/30",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              Back
            </button>

            {onResetDraft ? (
              <button
                type="button"
                onClick={() => {
                  if (busy) return;
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm(
                      "This will clear the saved draft and start over. Continue?",
                    )
                  ) {
                    return;
                  }
                  onResetDraft();
                }}
                disabled={busy}
                className={cn(
                  "text-sm font-medium text-ink/60 underline-offset-4 transition hover:text-ink hover:underline",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                Clear saved draft
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={busy || Boolean(validationError)}
            className={cn(
              "h-11 rounded-xl bg-ink px-6 text-sm font-semibold text-white transition hover:bg-ink/90",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Saving…
              </span>
            ) : isLast ? (
              submitLabel
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressIndicator({
  steps,
  currentIndex,
  onStepChange,
}: {
  steps: WizardStep[];
  currentIndex: number;
  onStepChange: (idx: number) => void;
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, idx) => {
        const state =
          idx === currentIndex ? "active" : idx < currentIndex ? "done" : "todo";
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => idx <= currentIndex && onStepChange(idx)}
              disabled={idx > currentIndex}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                state === "active" &&
                  "border-ink bg-ink text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
                state === "done" &&
                  "border-ink/20 bg-white text-ink hover:border-ink/40",
                state === "todo" &&
                  "cursor-not-allowed border-ink/10 bg-white/70 text-ink/50",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  state === "active" && "bg-white text-ink",
                  state === "done" && "bg-ink text-white",
                  state === "todo" && "bg-ink/10 text-ink/60",
                )}
              >
                {state === "done" ? "✓" : idx + 1}
              </span>
              <span className="truncate font-semibold">{step.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
