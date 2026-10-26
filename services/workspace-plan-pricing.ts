type PlanLike = Readonly<{
  price?: unknown;
  category?: unknown;
}>;

/** Category names excluded from “starting price” / min plan (exact match, lowercased). */
const EXCLUDED_COWORKING_PLAN_CATEGORIES_EXACT = new Set([
  "virtual office",
  "gst registration",
  "business address",
  "company incorporation",
  "company registration",
  "day pass",
  "hot desk",
  "hot desk pricing",
]);

/**
 * Display label for a coworking plan category (wire `category` may be `{ name }` or string).
 */
export function coworkingPlanCategoryLabel(plan: { category?: unknown }): string {
  const c = plan.category;
  if (c && typeof c === "object" && c !== null) {
    const name = (c as { name?: unknown }).name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  if (typeof c === "string" && c.trim()) return c.trim();
  return "Plan";
}

/**
 * True if this plan category must not affect starting price / min pricing
 * (virtual office, GST, business address, incorporation/registration, day pass, hot desk, etc.).
 */
export function isCoworkingPlanExcludedFromStartingPrice(categoryLabel: string): boolean {
  const n = categoryLabel.trim().toLowerCase();
  if (EXCLUDED_COWORKING_PLAN_CATEGORIES_EXACT.has(n)) return true;
  if (n.includes("hot desk")) return true;
  return false;
}

/** Monthly price unless the plan says otherwise — hourly/daily/yearly prices are not "per month". */
function isMonthlyPlan(plan: { duration?: unknown }): boolean {
  const duration = typeof plan.duration === "string" ? plan.duration.trim().toLowerCase() : "";
  return !duration || duration.startsWith("month");
}

/** Plans that count toward minimum starting price (monthly coworking plans only). */
export function filterCoworkingPlansForStartingPrice<T extends { category?: unknown; duration?: unknown }>(
  plans: ReadonlyArray<T> | null | undefined,
): T[] {
  if (!plans?.length) return [];
  return plans.filter(
    (p) => isMonthlyPlan(p) && !isCoworkingPlanExcludedFromStartingPrice(coworkingPlanCategoryLabel(p)),
  );
}

/**
 * Minimum numeric `price` across plans. Ignores non-finite values.
 */
export function extractMinimumPlanPrice(
  plans: ReadonlyArray<PlanLike> | null | undefined,
): number | null {
  if (!plans?.length) return null;

  let min: number | null = null;
  for (const plan of plans) {
    const raw = plan?.price;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n)) continue;
    if (min === null || n < min) min = n;
  }

  return min;
}

/**
 * Starting price: minimum among eligible coworking plans (excludes VO/GST/address/incorporation/day pass/hot desk, etc.),
 * then falls back to existing `starting_price`, else 0.
 */
export function resolveWorkspaceStartingPrice(workspace: {
  plans?: ReadonlyArray<PlanLike> | null;
  starting_price?: unknown;
}): number {
  const eligible = filterCoworkingPlansForStartingPrice(workspace.plans ?? undefined);
  const fromPlans = extractMinimumPlanPrice(eligible);
  if (fromPlans != null) return fromPlans;

  const sp = workspace.starting_price;
  if (typeof sp === "number" && Number.isFinite(sp)) return sp;
  const n = Number(sp);
  return Number.isFinite(n) ? n : 0;
}

/** Returns a copy with `starting_price` resolved from eligible plans (fallback: existing field). */
export function withResolvedStartingPrice<T extends { plans?: ReadonlyArray<PlanLike> | null; starting_price?: unknown }>(
  workspace: T,
): T & { starting_price: number } {
  return {
    ...workspace,
    starting_price: resolveWorkspaceStartingPrice(workspace),
  };
}
