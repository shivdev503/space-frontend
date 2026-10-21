import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
