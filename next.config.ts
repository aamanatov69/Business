import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "static.tildacdn.pro",
      },
      {
        protocol: "https",
        hostname: "btpos.md",
      },
      {
        protocol: "https",
        hostname: "www.btpos.md",
      },
    ],
  },
};

export default nextConfig;
