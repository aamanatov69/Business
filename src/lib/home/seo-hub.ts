import { BLOG_POSTS } from "@/lib/blog-posts";
import { countryList } from "@/lib/country-pages";
import { solutionList } from "@/lib/solution-pages";
import type { SeoHubGroup } from "@/lib/home/types";

export function getHomeSeoHubGroups(): SeoHubGroup[] {
  return [
    {
      id: "solutions",
      tag: "Популярные запросы",
      title: "Страницы по ключевым направлениям автоматизации",
      description:
        "Эти страницы помогают быстро найти подходящее решение по запросам CRM, POS-терминалы, торговые весы, склад и автоматизация в разных сферах.",
      items: solutionList.map((item) => ({
        key: item.slug,
        href: `/solutions/${item.slug}`,
        label: item.title,
      })),
    },
    {
      id: "countries",
      tag: "География",
      title: "Автоматизация бизнеса по странам СНГ",
      description:
        "Отдельные страницы по странам помогают лучше ранжироваться по запросам с геопривязкой: CRM, POS-терминалы, весы и складской учет.",
      items: countryList.map((item) => ({
        key: item.slug,
        href: `/countries/${item.slug}`,
        label: item.title,
      })),
    },
    {
      id: "blog",
      tag: "Полезные статьи",
      title: "Блог по CRM, POS и автоматизации бизнеса",
      description:
        "Регулярно публикуем материалы по внедрению CRM, POS-терминалов, торговых весов и складского учета для компаний в странах СНГ.",
      items: BLOG_POSTS.slice(0, 6).map((post) => ({
        key: post.slug,
        href: `/blog/${post.slug}`,
        label: post.title,
      })),
      footerLink: {
        href: "/blog",
        label: "Смотреть все статьи",
      },
    },
  ];
}
