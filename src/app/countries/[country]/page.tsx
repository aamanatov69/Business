import { COUNTRY_PAGES, countrySlugs } from "@/lib/country-pages";
import {
  BRAND_ADDRESS,
  BRAND_CITY,
  BRAND_COUNTRY,
  BRAND_EMAIL,
  BRAND_PHONE,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { solutionList } from "@/lib/solution-pages";
import { topicList } from "@/lib/topic-pages";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ country: string }>;
};

export const revalidate = 86400;

export async function generateStaticParams() {
  return countrySlugs.map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { country } = await params;
  const page = COUNTRY_PAGES[country];

  if (!page) {
    return {};
  }

  const pageUrl = `${SITE_URL}/countries/${country}`;

  return {
    title: page.title,
    description: page.description,
    keywords: [...page.keywords],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      title: page.title,
      description: page.description,
      url: pageUrl,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/twitter-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CountryPage({ params }: PageProps) {
  const { country } = await params;
  const page = COUNTRY_PAGES[country];

  if (!page) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/countries/${country}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${page.name} - автоматизация бизнеса`,
    serviceType: "Автоматизация бизнеса",
    areaServed: [page.code],
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      telephone: BRAND_PHONE,
      email: BRAND_EMAIL,
      address: {
        "@type": "PostalAddress",
        streetAddress: BRAND_ADDRESS,
        addressLocality: BRAND_CITY,
        addressCountry: BRAND_COUNTRY,
      },
    },
    url: pageUrl,
    inLanguage: SITE_LANGUAGE,
    description: page.description,
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
      {
        "@type": "ListItem",
        position: 2,
        name: `Автоматизация в ${page.name}`,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="shell section" aria-labelledby="country-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="section-head">
        <span className="tag">География внедрения</span>
        <h1 id="country-title">{page.h1}</h1>
        <p>{page.intro}</p>
      </div>

      <section aria-label="Запросы и решения">
        <h2>Какие задачи закрываем в {page.name}</h2>
        <ul>
          <li>CRM для отдела продаж и поддержки клиентов</li>
          <li>POS-терминалы, кассы и торговые весы</li>
          <li>Складской учет, отчеты и финансовая аналитика</li>
        </ul>
      </section>

      <section aria-label="Решения по направлениям">
        <h2>Популярные решения</h2>
        <ul>
          {solutionList.map((solution) => (
            <li key={solution.slug}>
              <Link href={`/solutions/${solution.slug}`}>
                {solution.shortTitle}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Коммерческие запросы по стране">
        <h2>Страницы по ключевым коммерческим запросам</h2>
        <ul>
          {topicList.map((topic) => (
            <li key={topic.slug}>
              <Link href={`/countries/${country}/${topic.slug}`}>
                {topic.shortTitle} в {page.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Консультация">
        <h2>Получить консультацию по запуску</h2>
        <p>
          Работаем удаленно по СНГ и помогаем запустить автоматизацию бизнеса в
          короткие сроки.
        </p>
        <p>
          <Link href="/#connect">Оставить заявку</Link>
        </p>
      </section>
    </main>
  );
}
