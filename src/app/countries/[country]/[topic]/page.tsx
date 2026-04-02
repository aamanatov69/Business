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
import { TOPIC_PAGES, topicSlugs } from "@/lib/topic-pages";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ country: string; topic: string }>;
};

export const revalidate = 86400;

export async function generateStaticParams() {
  return countrySlugs.flatMap((country) =>
    topicSlugs.map((topic) => ({ country, topic })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { country, topic } = await params;
  const countryPage = COUNTRY_PAGES[country];
  const topicPage = TOPIC_PAGES[topic];

  if (!countryPage || !topicPage) {
    return {};
  }

  const pageUrl = `${SITE_URL}/countries/${country}/${topic}`;
  const title = `${topicPage.shortTitle} в ${countryPage.name}`;
  const description = `${topicPage.shortTitle} для компаний в ${countryPage.name}: внедрение, интеграция и поддержка автоматизации бизнеса.`;

  return {
    title,
    description,
    keywords: [
      ...topicPage.keywords,
      `${topicPage.shortTitle} ${countryPage.name}`,
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CountryTopicPage({ params }: PageProps) {
  const { country, topic } = await params;
  const countryPage = COUNTRY_PAGES[country];
  const topicPage = TOPIC_PAGES[topic];

  if (!countryPage || !topicPage) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/countries/${country}/${topic}`;
  const pageTitle = `${topicPage.shortTitle} в ${countryPage.name}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: pageTitle,
    serviceType: topicPage.shortTitle,
    areaServed: [countryPage.code],
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
    description: `${topicPage.shortTitle} и автоматизация бизнес-процессов для компаний в ${countryPage.name}.`,
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
        name: `Автоматизация в ${countryPage.name}`,
        item: `${SITE_URL}/countries/${country}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: pageTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="shell section" aria-labelledby="country-topic-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="section-head">
        <span className="tag">Запрос + страна</span>
        <h1 id="country-topic-title">{pageTitle}</h1>
        <p>{topicPage.intro}</p>
      </div>

      <section aria-label="Что входит в решение">
        <h2>Что входит</h2>
        <ul>
          {topicPage.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Перелинковка по географии">
        <h2>Другие направления</h2>
        <ul>
          {topicSlugs
            .filter((slug) => slug !== topic)
            .map((slug) => (
              <li key={slug}>
                <Link href={`/countries/${country}/${slug}`}>
                  {TOPIC_PAGES[slug].shortTitle} в {countryPage.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section aria-label="Оставить заявку">
        <h2>Получить консультацию</h2>
        <p>
          Подскажем, как запустить {topicPage.shortTitle.toLowerCase()} в{" "}
          {countryPage.name} и быстро внедрить автоматизацию бизнеса.
        </p>
        <p>
          <Link href="/#connect">Оставить заявку</Link>
        </p>
      </section>
    </main>
  );
}
