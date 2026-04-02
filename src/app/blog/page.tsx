import { BLOG_POSTS } from "@/lib/blog-posts";
import {
  CORE_SEO_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Блог по автоматизации бизнеса в СНГ",
  description:
    "Экспертные статьи по CRM, POS-терминалам, торговым весам, складу и аналитике для бизнеса в странах СНГ.",
  keywords: [
    ...CORE_SEO_KEYWORDS,
    "блог автоматизация бизнеса",
    "статьи crm pos",
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    type: "website",
    title: "Блог по автоматизации бизнеса в СНГ",
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/blog`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Блог по автоматизации бизнеса",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Блог по автоматизации бизнеса в СНГ",
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Блог по автоматизации бизнеса",
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    blogPost: BLOG_POSTS.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
    })),
  };

  return (
    <main className="shell section" aria-labelledby="blog-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <div className="section-head">
        <span className="tag">SEO блог</span>
        <h1 id="blog-title">Статьи по CRM, POS и автоматизации бизнеса</h1>
        <p>
          Публикуем практические материалы по внедрению автоматизации в
          Кыргызстане и странах СНГ.
        </p>
      </div>

      <ul>
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <article>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
