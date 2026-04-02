import {
  BRAND_ADDRESS,
  BRAND_CITY,
  BRAND_COUNTRY,
  BRAND_EMAIL,
  BRAND_PHONE,
  CIS_COUNTRIES,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { SOLUTION_PAGES, solutionSlugs } from "@/lib/solution-pages";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export async function generateStaticParams() {
  return solutionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = SOLUTION_PAGES[slug];

  if (!page) {
    return {};
  }

  const pageUrl = `${SITE_URL}/solutions/${slug}`;

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

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const page = SOLUTION_PAGES[slug];

  if (!page) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/solutions/${slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    serviceType: page.shortTitle,
    description: page.description,
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
    areaServed: [...CIS_COUNTRIES],
    url: pageUrl,
    inLanguage: SITE_LANGUAGE,
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
        name: "Решения",
        item: `${SITE_URL}/solutions/${slug}`,
      },
    ],
  };

  return (
    <main className="shell section" aria-labelledby="solution-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="section-head">
        <span className="tag">Решения для рынка СНГ</span>
        <h1 id="solution-title">{page.h1}</h1>
        <p>{page.intro}</p>
      </div>

      <section aria-label="Ключевые преимущества">
        <h2>Что вы получаете</h2>
        <ul>
          {page.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Следующие шаги">
        <h2>Запуск автоматизации</h2>
        <p>
          Работаем удаленно и очно, запускаем проекты для компаний в Бишкеке и
          по всему СНГ: Казахстан, Узбекистан, Россия, Беларусь и другие страны.
        </p>
        <p>
          <Link href="/#connect">Оставить заявку на внедрение</Link>
        </p>
      </section>
    </main>
  );
}
