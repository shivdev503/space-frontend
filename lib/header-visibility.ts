/** Pages that use their own full-screen top bar instead of the site header (coliving listing wizard). */
export function isSiteHeaderHidden(pathname: string | null | undefined): boolean {
  return Boolean(pathname?.startsWith("/add/coliving-space"));
}
