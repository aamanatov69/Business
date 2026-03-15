import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import {
  BRAND_EMAIL,
  BRAND_PHONE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
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
    inLanguage: "ru",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
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
    areaServed: "KG",
    serviceType: ["Автоматизация бизнеса", "POS", "CRM", "Складской учет"],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
    </>
  );
}
