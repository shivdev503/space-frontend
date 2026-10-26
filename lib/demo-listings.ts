/**
 * Detail URLs of the sample listings in `services/mock-db.ts` (`seedSpaces`). They were live
 * and indexed, so they answer `410 Gone` (see middleware) — Google drops 410s faster than 404s.
 * None of these slugs exists as a real listing. Keep in sync if seed listings change.
 */
export const DEMO_LISTING_PATHS: ReadonlySet<string> = new Set([
  // coworking
  "/coworking/altura-one-bkc",
  "/coworking/harbor-desk-anna-salai",
  "/coworking/capital-works-connaught-place",
  "/coworking/skyline-desk-hitec-city",
  "/coworking/riverfront-work-hub-lucknow",
  "/coworking/central-square-indore",
  "/coworking/sabarmati-studios-ahmedabad",
  "/coworking/gridline-koramangala",
  // virtual office
  "/virtual-office/addressly-koramangala",
  "/virtual-office/deskline-business-address-pune",
  "/virtual-office/registry-lane-connaught-place",
  "/virtual-office/signature-address-madhapur",
  // managed office
  "/managed-office/northlight-business-centre",
  "/managed-office/orbital-suites-noida-one",
  "/managed-office/the-quarter-5th-avenue",
  "/managed-office/harbor-suites-nariman-point",
  // coliving
  "/coliving/urbannest-dlf-phase-3-coliving",
  "/coliving/koramangala-commons-coliving",
  "/coliving/bandra-living-coliving",
  "/coliving/connaught-coliving-house",
  "/coliving/sector-62-noida-pg-coliving",
  "/coliving/koregaon-park-student-hub",
  "/coliving/gachibowli-nest-coliving",
]);

export function isDemoListingPath(pathname: string): boolean {
  return DEMO_LISTING_PATHS.has(pathname.replace(/\/+$/, "").toLowerCase());
}
