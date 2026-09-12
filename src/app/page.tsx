import { BUSINESS_ID, WEBSITE_ID } from "@/lib/structured-data";
import { JsonLd } from "@/app/components/JsonLd";
import { businessDirectionLinks } from "@/lib/business-directions";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { countryList } from "@/lib/country-pages";
import { getHomeSeoHubGroups } from "@/lib/home/seo-hub";
import {
  CIS_COUNTRIES,
  CORE_SEO_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";
import { solutionList } from "@/lib/solution-pages";
import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  keywords: [...CORE_SEO_KEYWORDS],
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
};

export default function Page() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: SITE_LANGUAGE,
    isPartOf: {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: [
      "Автоматизация продаж",
      "CRM",
      "Складской учет",
      "Финансовая аналитика",
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: SITE_URL,
      },
    ],
  };

  const serviceCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Решения по автоматизации бизнеса",
    itemListElement: solutionList.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/solutions/${item.slug}`,
      name: item.title,
    })),
  };

  const multiRegionSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Автоматизация бизнеса по СНГ",
    areaServed: [...CIS_COUNTRIES],
    provider: {
      "@type": "Organization",
      "@id": BUSINESS_ID,
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const countryCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Автоматизация бизнеса по странам СНГ",
    itemListElement: countryList.filter((item) => item.slug !== "kyrgyzstan").map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/countries/${item.slug}`,
      name: item.title,
    })),
  };

  const blogCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Статьи по автоматизации бизнеса",
    itemListElement: BLOG_POSTS.slice(0, 8).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/blog/${item.slug}`,
      name: item.title,
    })),
  };


  const seoHubGroups = getHomeSeoHubGroups();

  return (
    <>
      <JsonLd data={webPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceCatalogSchema} />
      <JsonLd data={multiRegionSchema} />
      <JsonLd data={countryCatalogSchema} />
      <JsonLd data={blogCatalogSchema} />
      <HomeClient seoHubGroups={seoHubGroups} directionLinks={businessDirectionLinks} />
    </>
  );
}
