import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.saavncdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.saavncdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.jiosaavn.com',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
