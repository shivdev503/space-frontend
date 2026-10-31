import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve metadata before streaming for every user agent, so <title>, description,
  // canonical and Open Graph tags are always in <head> (Next 15 otherwise streams them
  // into <body> for Googlebot and most crawlers).
  htmlLimitedBots: /.*/,
  async redirects() {
    return [
      // One city slug: /gurgaon (higher search volume). Old /gurugram city and area URLs redirect.
      {
        source: "/:vertical(coworking|virtual-office|managed-office|coliving)/gurugram/:path*",
        destination: "/:vertical/gurgaon/:path*",
        permanent: true,
      },
      { source: "/office-space/gurugram/:path*", destination: "/managed-office/gurgaon/:path*", permanent: true },
      { source: "/office-space", destination: "/managed-office", permanent: true },
      { source: "/office-space/:path*", destination: "/managed-office/:path*", permanent: true },
      // Indexed locality with no managed offices: its listings live on the city page.
      { source: "/managed-office/gurgaon/golf-course-road", destination: "/managed-office/gurgaon", permanent: true },
      // Duplicate PG listings that Google had indexed: each points at the listing that stays live.
      { source: "/coliving/guru-kripa-pg-in-sector-18-gurgaon-4", destination: "/coliving/guru-kripa-pg-in-sector-18-gurgaon-3", permanent: true },
      { source: "/coliving/homes-pg-in-sector-48-gurgaon-6", destination: "/coliving/homes-pg-in-sector-48-gurgaon-4", permanent: true },
      { source: "/coliving/living-hub-in-hudson-lane-delhi-2", destination: "/coliving/living-hub-in-hudson-lane-delhi", permanent: true },
      { source: "/coliving/living-hub-in-hudson-lane-delhi-3", destination: "/coliving/living-hub-in-hudson-lane-delhi", permanent: true },
      { source: "/coliving/living-hub-in-reids-line-delhi-univ-staff-flats-delhi-2", destination: "/coliving/living-hub-in-reids-line-delhi-univ-staff-flats-delhi", permanent: true },
      { source: "/coliving/royal-pg-in-gopal-pura-mode-jaipur-8", destination: "/coliving/royal-pg-in-gopal-pura-mode-jaipur-5", permanent: true },
      { source: "/coliving/the-starway-pg-in-sector-47-gurgaon-4", destination: "/coliving/the-starway-pg-in-sector-47-gurgaon-3", permanent: true },
      { source: "/coliving/virat-homes-in-sector-46-gurgaon-10", destination: "/coliving/virat-homes-in-sector-46-gurgaon-7", permanent: true },
      { source: "/coliving/virat-homes-in-sector-46-gurgaon-11", destination: "/coliving/virat-homes-in-sector-46-gurgaon-7", permanent: true },
    ];
  },
  images: {
    minimumCacheTTL: 86400,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.spacewallah.com",
      },
    ],
  },
};

export default nextConfig;
