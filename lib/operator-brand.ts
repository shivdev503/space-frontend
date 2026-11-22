/** Brand slugs that stand for "no known operator"; never show their name as an operator. */
export const NON_OPERATOR_BRAND_SLUGS: ReadonlySet<string> = new Set(["other-coworking"]);

/** The operator's name, or "" when the listing only has the placeholder brand or none. */
export function operatorBrandName(brand?: { name?: string | null; slug?: string | null } | null): string {
  const name = brand?.name?.trim() ?? "";
  if (NON_OPERATOR_BRAND_SLUGS.has(brand?.slug?.trim().toLowerCase() ?? "") || /^other coworking$/i.test(name)) return "";
  return name;
}
