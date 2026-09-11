import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "./seo";

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title: { absolute: title }, description,
    alternates: { canonical: `${SITE_URL}${path}` },
    robots: { index: true, follow: true },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "ru_RU", title, description,
      url: `${SITE_URL}${path}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] },
  };
}
