import { JsonLd } from "@/app/components/JsonLd";
import { BLOG_POSTS, blogSlugs } from "@/lib/blog-posts";
import { CORE_SEO_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicLinkLabel } from "@/lib/public-links";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { BUSINESS_ID, webPageSchema } from "@/lib/structured-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export async function generateStaticParams() {
  return blogSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) {
    return {};
  }

  const pageUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: { absolute: post.title },
    description: post.description,
    keywords: [...post.keywords, ...CORE_SEO_KEYWORDS],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [`${SITE_URL}/contacts`],
      title: post.title,
      description: post.description,
      url: pageUrl,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/twitter-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    inLanguage: "ru",
    isPartOf: { "@id": `${SITE_URL}/blog#blog` },
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    url: pageUrl,
    author: {
      "@id": BUSINESS_ID,
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@id": BUSINESS_ID,
      "@type": "Organization",
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Блог",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="shell section" aria-labelledby="blog-post-title">
      <JsonLd data={articleSchema} />
      <JsonLd data={{ ...webPageSchema(`/blog/${post.slug}`, post.title, post.description), mainEntity: { "@id": `${pageUrl}#article` } }} />
      <Breadcrumbs items={breadcrumbSchema.itemListElement.map((item) => ({ name: item.name, path: item.item.replace(SITE_URL, "") || "/" }))} />

      <article>
        <header className="section-head">
          <span className="tag">Экспертная статья</span>
          <h1 id="blog-post-title">{post.title}</h1>
          <p>{post.description}</p>
          <p>Редакция: <Link href="/contacts">{SITE_NAME}</Link></p>
          <p>Опубликовано: <time dateTime={post.publishedAt}>{post.publishedAt}</time>. Обновлено: <time dateTime={post.updatedAt}>{post.updatedAt}</time>.</p>
        </header>

        <nav aria-label="Содержание статьи">
          <h2>В этой статье</h2>
          <ol>{post.sections.map((section, index) => <li key={section.heading}><a href={`#section-${index + 1}`}>{section.heading}</a></li>)}</ol>
        </nav>
        {post.sections.map((section, index) => (
          <section key={section.heading} id={`section-${index + 1}`}>
            <h2>{section.heading}</h2>
            <p>{section.text}</p>
          </section>
        ))}

        <section aria-label="FAQ">
          <h2>Частые вопросы</h2>
          {post.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>

        <section aria-label="Навигация по блогу">
          <h2>Решения для вашего проекта</h2>
          <ul>{(post.relatedLinks || ["/catalog", "/solutions/avtomatizaciya-sklada-i-ucheta"]).map((href) => <li key={href}><Link href={href}>{publicLinkLabel(href)}</Link></li>)}</ul>
          <h2>Читать дальше</h2>
          <ul>{BLOG_POSTS.filter((item) => item.slug !== post.slug && item.relatedLinks?.some((href) => post.relatedLinks?.includes(href))).slice(0, 3).map((item) => <li key={item.slug}><Link href={`/blog/${item.slug}`}>{item.title}</Link></li>)}</ul>
          <p>
            <Link href="/blog">Все статьи блога</Link>
          </p>
          <p>
            <Link prefetch={false} href="/#request">Получить консультацию по внедрению</Link>
          </p>
        </section>
      </article>
    </main>
  );
}
