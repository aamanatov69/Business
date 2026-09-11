import type { NextConfig } from "next";
import { SITE_ORIGIN } from "./src/lib/site-origin";
import { legacyUrls } from "./src/lib/legacy-urls";

const siteUrl = SITE_ORIGIN;
const siteHostname = new URL(siteUrl).hostname;
const canonicalHostname = siteHostname.replace(/^www\./, "");
const wwwHostname = `www.${canonicalHostname}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
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
  async redirects() {
    return [
      ...Object.entries(legacyUrls).map(([source, destination]) => ({ source, destination: `${SITE_ORIGIN}${destination}`, statusCode: 301 as const })),
      {
        source: "/:path((?!api(?:/|$)).*)",
        has: [
          {
            type: "host",
            value: wwwHostname,
          },
        ],
        destination: `https://${canonicalHostname}/:path*`,
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
