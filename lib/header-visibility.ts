function isHostPanel(pathname: string | null | undefined): boolean {
  return pathname === "/add" || Boolean(pathname?.startsWith("/add/"));
}

/** The host panel has its own header, so listing hosts are not pulled away to the public site. */
export function isSiteHeaderHidden(pathname: string | null | undefined): boolean {
  return isHostPanel(pathname);
}

/** The coliving wizard uses its own full-screen top bar instead of the host header. */
export function isHostTopBarHidden(pathname: string | null | undefined): boolean {
  return Boolean(pathname?.startsWith("/add/coliving-space"));
}
