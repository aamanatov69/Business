import { BLOG_POSTS } from "@/lib/blog-posts";
import { countryList } from "@/lib/country-pages";
import { solutionList } from "@/lib/solution-pages";
import type { SeoHubGroup } from "@/lib/home/types";

export function getHomeSeoHubGroups(): SeoHubGroup[] {
  return [
    {
      id: "connections", tag: "Подключение", title: "Программы и интеграции",
      description: "Rosta, amoCRM, обмен с сайтом и оценка подключения банковского терминала к кассе.",
      items: [
        { key: "rosta", href: "/solutions/rosta", label: "Rosta для магазина" },
        { key: "amocrm", href: "/solutions/amocrm", label: "Внедрение amoCRM" },
        { key: "integrations", href: "/integrations", label: "API и банковские интеграции" },
        { key: "catalog", href: "/catalog", label: "Каталог торгового оборудования" },
      ],
    },
    {
      id: "solutions",
      tag: "Услуги",
      title: "Страницы по ключевым направлениям автоматизации",
      description:
        "Подбор CRM, кассовых рабочих мест, торгового оборудования и товарного учета.",
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
        "Условия внедрения и консультации для компаний в разных странах.",
      items: countryList.filter((item) => item.slug !== "kyrgyzstan").map((item) => ({
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
