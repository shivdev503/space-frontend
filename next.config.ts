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
