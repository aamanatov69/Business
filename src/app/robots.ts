import { SITE_URL } from "@/lib/seo";
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    // /foto and the Rosta admin remain crawlable so robots can see noindex.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
