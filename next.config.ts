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
      {
        protocol: "https",
        hostname: "art-trade.com.ua",
      },
      {
        protocol: "https",
        hostname: "www.art-trade.com.ua",
      },
      {
        protocol: "https",
        hostname: "inventure.com.ua",
      },
      {
        protocol: "https",
        hostname: "www.inventure.com.ua",
      },
      {
        protocol: "https",
        hostname: "easypayments.online",
      },
      {
        protocol: "https",
        hostname: "www.easypayments.online",
      },
      {
        protocol: "https",
        hostname: "cdn-ru.bitrix24.ru",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
};

export default nextConfig;
