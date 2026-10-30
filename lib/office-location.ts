/**
 * The office-space API sends `location.micro_location` as an array (coworking sends one object)
 * and leaves trailing spaces in names ("Cyber City "). Normalise to the coworking shape so shared
 * helpers (breadcrumbs, alt text, SEO, location blocks) read the locality correctly.
 */
export function normalizeOfficeLocation<T extends Record<string, unknown>>(row: T): T {
  const location = row.location as Record<string, unknown> | undefined;
  if (!location || typeof location !== "object") return row;

  const rawMicro = location.micro_location;
  const micro = Array.isArray(rawMicro) ? rawMicro.find((m) => m && typeof m === "object") : rawMicro;
  const tidyName = (v: unknown) =>
    v && typeof v === "object" && typeof (v as { name?: unknown }).name === "string"
      ? { ...(v as object), name: ((v as { name: string }).name).trim() }
      : v;

  const metro = location.metro_detail as Record<string, unknown> | undefined;
  return {
    ...row,
    location: {
      ...location,
      micro_location: tidyName(micro) ?? null,
      city: tidyName(location.city),
      ...(metro && typeof metro === "object"
        ? { metro_detail: { ...metro, name: typeof metro.name === "string" ? metro.name.trim() : metro.name } }
        : {}),
    },
  };
}
