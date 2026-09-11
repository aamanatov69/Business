import { BLOG_POSTS } from "@/lib/blog-posts";
import { countrySlugs } from "@/lib/country-pages";
import { SITE_URL } from "@/lib/seo";
import { solutionSlugs } from "@/lib/solution-pages";
import { catalogCategories, productPath } from "@/lib/catalog-categories";
import { integrationPages } from "@/lib/integration-pages";
import { getPublicProducts } from "@/lib/server/public-catalog";
import type { MetadataRoute } from "next";

// Runtime snapshot includes newly published products without rebuilding.
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublicProducts();
  const paths = ["", "/catalog", "/integrations", "/contacts", "/blog",
    ...solutionSlugs.map((slug) => `/solutions/${slug}`),
    ...countrySlugs.filter((slug) => slug !== "kyrgyzstan").map((slug) => `/countries/${slug}`),
    ...catalogCategories.map((category) => `/catalog/${category.slug}`),
    ...integrationPages.map((page) => `/integrations/${page.slug}`),
  ];
  return [
    ...paths.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...BLOG_POSTS.map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: post.updatedAt })),
    ...products.map((product) => ({ url: `${SITE_URL}${productPath(product.id)}`,
      ...(product.updatedAt && Number.isFinite(Date.parse(product.updatedAt)) ? { lastModified: product.updatedAt } : {}),
    })),
  ];
}
