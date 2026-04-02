import { blogSlugs } from "@/lib/blog-posts";
import { countrySlugs } from "@/lib/country-pages";
import { SITE_URL } from "@/lib/seo";
import { solutionSlugs } from "@/lib/solution-pages";
import { topicSlugs } from "@/lib/topic-pages";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseEntry: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
    alternates: {
      languages: {
        ru: SITE_URL,
        "x-default": SITE_URL,
      },
    },
  };

  const solutionEntries: MetadataRoute.Sitemap = solutionSlugs.map((slug) => ({
    url: `${SITE_URL}/solutions/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: {
      languages: {
        ru: `${SITE_URL}/solutions/${slug}`,
        "x-default": `${SITE_URL}/solutions/${slug}`,
      },
    },
  }));

  const countryEntries: MetadataRoute.Sitemap = countrySlugs.map((slug) => ({
    url: `${SITE_URL}/countries/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
    alternates: {
      languages: {
        ru: `${SITE_URL}/countries/${slug}`,
        "x-default": `${SITE_URL}/countries/${slug}`,
      },
    },
  }));

  const countryTopicEntries: MetadataRoute.Sitemap = countrySlugs.flatMap(
    (country) =>
      topicSlugs.map((topic) => ({
        url: `${SITE_URL}/countries/${country}/${topic}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            ru: `${SITE_URL}/countries/${country}/${topic}`,
            "x-default": `${SITE_URL}/countries/${country}/${topic}`,
          },
        },
      })),
  );

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.75,
    alternates: {
      languages: {
        ru: `${SITE_URL}/blog/${slug}`,
        "x-default": `${SITE_URL}/blog/${slug}`,
      },
    },
  }));

  const blogIndexEntry: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.82,
    alternates: {
      languages: {
        ru: `${SITE_URL}/blog`,
        "x-default": `${SITE_URL}/blog`,
      },
    },
  };

  return [
    baseEntry,
    ...solutionEntries,
    ...countryEntries,
    ...countryTopicEntries,
    blogIndexEntry,
    ...blogEntries,
  ];
}
