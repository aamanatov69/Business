import { BLOG_POSTS } from "@/lib/blog-posts";
import { countryList } from "@/lib/country-pages";
import {
  BRAND_ADDRESS,
  BRAND_CITY,
  BRAND_COUNTRY,
  BRAND_EMAIL,
  BRAND_PHONE,
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
  title: SITE_TITLE,
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

const faqItems = [
  {
    question: "Для каких бизнесов подходит система?",
    answer:
      "Платформа подходит для магазина, СТО, кафе, бильярда, бани, розничных сетей и других форм малого и среднего бизнеса.",
  },
  {
    question: "Какие процессы можно автоматизировать?",
    answer:
      "Продажи, складской учет, CRM, финансовую аналитику, отчеты по прибыли и контроль операций в одной системе.",
  },
  {
    question: "Как быстро можно запустить систему?",
    answer:
      "Базовая настройка и подключение обычно выполняются в короткие сроки после заявки, в зависимости от сложности бизнеса.",
  },
];

export default function Page() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: SITE_LANGUAGE,
    isPartOf: {
      "@type": "WebSite",
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

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    telephone: BRAND_PHONE,
    email: BRAND_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND_ADDRESS,
      addressLocality: BRAND_CITY,
      addressCountry: BRAND_COUNTRY,
    },
    areaServed: "KG",
    serviceType: ["Автоматизация бизнеса", "POS", "CRM", "Складской учет"],
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
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const countryCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Автоматизация бизнеса по странам СНГ",
    itemListElement: countryList.map((item, index) => ({
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const seoHubGroups = [
    {
      id: "solutions",
      tag: "Популярные запросы",
      title: "Страницы по ключевым направлениям автоматизации",
      description:
        "Эти страницы помогают быстро найти подходящее решение по запросам CRM, POS-терминалы, торговые весы, склад и автоматизация в разных сферах.",
      items: solutionList.map((item) => ({
        key: item.slug,
        href: `/solutions/${item.slug}`,
        label: item.title,
      })),
    },
    {
      id: "countries",
      tag: "География",
      title: "Автоматизация бизнеса по странам СНГ",
      description:
        "Отдельные страницы по странам помогают лучше ранжироваться по запросам с геопривязкой: CRM, POS-терминалы, весы и складской учет.",
      items: countryList.map((item) => ({
        key: item.slug,
        href: `/countries/${item.slug}`,
        label: item.title,
      })),
    },
    {
      id: "blog",
      tag: "Полезные статьи",
      title: "Блог по CRM, POS и автоматизации бизнеса",
      description:
        "Регулярно публикуем материалы по внедрению CRM, POS-терминалов, торговых весов и складского учета для компаний в странах СНГ.",
      items: BLOG_POSTS.slice(0, 6).map((post) => ({
        key: post.slug,
        href: `/blog/${post.slug}`,
        label: post.title,
      })),
      footerLink: {
        href: "/blog",
        label: "Смотреть все статьи",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceCatalogSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(multiRegionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(countryCatalogSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCatalogSchema) }}
      />
      <HomeClient seoHubGroups={seoHubGroups} />
    </>
  );
}
