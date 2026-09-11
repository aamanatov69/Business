import { JsonLd } from "@/app/components/JsonLd";
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
import { businessDirectionLinks, BUSINESS_DIRECTIONS } from "@/lib/business-directions";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Layers3, SlidersHorizontal, GraduationCap, Sparkles } from "lucide-react";
import styles from "./solution.module.css";
import { publicLinkLabel } from "@/lib/public-links";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;
export const dynamicParams = false;

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
    title: { absolute: page.title },
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
    areaServed: BUSINESS_DIRECTIONS[slug] ? BRAND_COUNTRY : [...CIS_COUNTRIES],
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
        name: page.shortTitle,
        item: `${SITE_URL}/solutions/${slug}`,
      },
    ],
  };

  return (
    <main className={`shell section solution-page ${styles.page}`} aria-labelledby="solution-title">
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />

      <nav className="solution-breadcrumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link><span aria-hidden="true"> / </span>
        <Link href="/#directions">Направления</Link><span aria-hidden="true"> / </span>
        <span aria-current="page">{page.shortTitle}</span>
      </nav>
      <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className="tag"><Sparkles size={14} aria-hidden="true" /> Решение под ваш бизнес</span>
        <h1 id="solution-title">{page.h1}</h1>
        <p>{page.intro}</p>
        <div className="solution-actions">
          <Link className="btn btn-primary" prefetch={false} href="/#request">Обсудить проект <ArrowRight size={18} aria-hidden="true" /></Link>
          <a className="btn btn-outline" href={`tel:${BRAND_PHONE.replace(/\s+/g, "")}`}>Позвонить</a>
        </div>
        <div className={styles.heroNotes}><span><Check size={16} aria-hidden="true" /> Подбор оборудования</span><span><Check size={16} aria-hidden="true" /> Обучение команды</span></div>
      </div>
      <aside className={styles.preview} aria-label="Состав решения">
        <div className={styles.previewTop}><span className={styles.logo}><Layers3 size={20} aria-hidden="true" /></span><span>Ваше рабочее пространство<small>{page.shortTitle}</small></span><span className={styles.dot} /></div>
        <div className={styles.previewHeading}><span>Состав решения</span><span className={styles.pill}>Под ваши задачи</span></div>
        <div className={styles.previewRows}>
          {page.bullets.map((item, index) => <div className={styles.previewRow} key={item}><span className={styles.rowNumber}>{String(index + 1).padStart(2, "0")}</span><span>{item}</span><Check size={16} aria-hidden="true" /></div>)}
        </div>
        <div className={styles.previewFooter}><SlidersHorizontal size={20} aria-hidden="true" /><div>Отдельные процессы — в общей системе<small>Комплектацию согласуем на консультации</small></div></div>
      </aside>
      </header>

      <section aria-labelledby="solution-features-title">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>Возможности</span><h2 id="solution-features-title">Все важное для ежедневной работы</h2><p>Соберем решение вокруг процессов вашей команды.</p></div>
        <ul className={styles.features}>
          {page.bullets.map((item, index) => (
            <li className={styles.feature} key={item}><span className={styles.featureIcon}><Check size={22} aria-hidden="true" /></span><span className={styles.featureNumber}>0{index + 1}</span><h3>{item}</h3></li>
          ))}
        </ul>
      </section>

      <div className={styles.contentGrid}>
      {page.sections?.map((section, index) => (
        <section className={styles.contentCard} key={section.title}>
          <span className={styles.eyebrow}>Подробнее / 0{index + 1}</span>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </section>
      ))}
      </div>
      {slug === "avtomatizaciya-kafe-i-restoranov" ? (
        <p><Link className={styles.textLink} href="/solutions/r-keeper">Подробнее о подборе автоматизации с учетом R-Keeper <ArrowRight size={18} aria-hidden="true" /></Link></p>
      ) : null}
      <section className={styles.stepsSection} aria-labelledby="solution-steps-title">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>От задачи к запуску</span><h2 id="solution-steps-title">Понятный план внедрения</h2></div>
        <ol className={styles.steps}>
          {[
            { icon: Layers3, title: "Разбираем задачи", text: "Обсуждаем формат бизнеса, текущий учет и то, что нужно изменить." },
            { icon: SlidersHorizontal, title: "Собираем решение", text: "Согласуем программу, оборудование, стоимость и этапы настройки." },
            { icon: GraduationCap, title: "Готовим к работе", text: "Проверяем рабочие сценарии и обучаем сотрудников перед запуском." },
          ].map((step, index) => <li key={step.title}><div className={styles.stepTop}><step.icon size={26} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{step.title}</h3><p>{step.text}</p></li>)}
        </ol>
      </section>
      {page.faq?.length ? (
        <section className={styles.faq} aria-labelledby="solution-faq-title">
          <div className={styles.sectionHeading}><span className={styles.eyebrow}>Ответы на вопросы</span><h2 id="solution-faq-title">Перед началом работы</h2><p>Поможем разобраться в деталях вашего проекта.</p></div>
          <div className="faq-list">
            {page.faq.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
      <section className={styles.cta} aria-label="Следующие шаги">
        <span className={styles.eyebrow}>Следующий шаг</span>
        <h2>Ваш бизнес. Ваша система работы.</h2>
        <p>
          Для обсуждения проекта сообщите формат бизнеса, город, число рабочих
          мест и название текущей программы. Согласуем состав решения, стоимость
          и сроки после уточнения задач.
        </p>
        <p>
          <Link className="btn btn-primary" prefetch={false} href="/#request">Получить расчет автоматизации <ArrowRight size={18} aria-hidden="true" /></Link>
        </p>
      </section>
      <nav aria-label="Другие направления автоматизации">
        <h2>Другие направления</h2>
        <div className="business-direction-grid">
          {businessDirectionLinks.filter((item) => item.href !== `/solutions/${slug}`).map((item) => (
            <Link className="btn btn-outline business-direction-link" key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </div>
      </nav>
      <nav aria-label="Оборудование и интеграции"><h2>Оборудование и подключение</h2><div className="business-direction-grid">{["/catalog", "/solutions/rosta", "/solutions/amocrm", "/integrations", "/contacts"].filter((href) => href !== `/solutions/${slug}`).map((href) => <Link className="btn btn-outline" key={href} href={href}>{publicLinkLabel(href)}</Link>)}</div></nav>
    </main>
  );
}
