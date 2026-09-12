import { JsonLd } from "@/app/components/JsonLd";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { pageMetadata } from "@/lib/page-metadata";
import { BUSINESS_ID, webPageSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/seo";
import Link from "next/link";

export const revalidate = 86400;

const title = "Блог об автоматизации бизнеса в Кыргызстане";
const description = "Как выбрать POS и CRM, перенести товары, настроить склад и запустить кафе или магазин. Практические инструкции для бизнеса в Бишкеке и Кыргызстане.";
export const metadata = pageMetadata("/blog", title, description);

export default function BlogPage() {
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    inLanguage: "ru",
    name: "Блог по автоматизации бизнеса",
    description,
    url: `${SITE_URL}/blog`,
    publisher: { "@id": BUSINESS_ID },
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
      <Breadcrumbs items={[{ name: "Главная", path: "/" }, { name: "Блог", path: "/blog" }]} />
      <JsonLd data={{ ...webPageSchema("/blog", title, description, "CollectionPage"), mainEntity: { "@id": `${SITE_URL}/blog#blog` } }} />
      <JsonLd data={blogListSchema} />

      <div className="section-head">
        <span className="tag">Практические руководства</span>
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
