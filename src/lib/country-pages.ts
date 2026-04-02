import { CORE_SEO_KEYWORDS } from "@/lib/seo";

export type CountryPageContent = {
  code: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: readonly string[];
};

export const COUNTRY_PAGES: Record<string, CountryPageContent> = {
  kyrgyzstan: {
    code: "KG",
    slug: "kyrgyzstan",
    name: "Кыргызстан",
    title: "Автоматизация бизнеса в Кыргызстане: CRM, POS и склад",
    description:
      "Внедрение CRM, POS-терминалов, торговых весов и складского учета для бизнеса в Кыргызстане.",
    h1: "Автоматизация бизнеса в Кыргызстане",
    intro:
      "Помогаем компаниям в Кыргызстане внедрять цифровые процессы продаж, склада и управления клиентами.",
    keywords: [...CORE_SEO_KEYWORDS, "автоматизация бизнеса кыргызстан"],
  },
  kazakhstan: {
    code: "KZ",
    slug: "kazakhstan",
    name: "Казахстан",
    title: "Автоматизация бизнеса в Казахстане: CRM, POS, весы",
    description:
      "Автоматизация магазинов, кафе, СТО и сервисов в Казахстане: CRM, POS-система, торговое оборудование и аналитика.",
    h1: "Автоматизация бизнеса в Казахстане",
    intro:
      "Настраиваем решения под рынок Казахстана: от кассы и весов до управленческой аналитики и CRM.",
    keywords: [...CORE_SEO_KEYWORDS, "автоматизация бизнеса казахстан"],
  },
  uzbekistan: {
    code: "UZ",
    slug: "uzbekistan",
    name: "Узбекистан",
    title: "Автоматизация бизнеса в Узбекистане: CRM и POS",
    description:
      "Запуск CRM, POS-терминалов, учета склада и интеграций для бизнеса в Узбекистане.",
    h1: "Автоматизация бизнеса в Узбекистане",
    intro:
      "Реализуем проекты автоматизации для розницы, HoReCa и сервиса в Узбекистане с быстрым запуском.",
    keywords: [...CORE_SEO_KEYWORDS, "автоматизация бизнеса узбекистан"],
  },
  russia: {
    code: "RU",
    slug: "russia",
    name: "Россия",
    title: "Автоматизация бизнеса в России: CRM, POS, учет",
    description:
      "Комплексная автоматизация торговли и сервиса в России: CRM, касса, складской учет и финансовая аналитика.",
    h1: "Автоматизация бизнеса в России",
    intro:
      "Помогаем компаниям в России объединить продажи, клиентов, склад и аналитику в одной системе.",
    keywords: [...CORE_SEO_KEYWORDS, "автоматизация бизнеса россия"],
  },
  belarus: {
    code: "BY",
    slug: "belarus",
    name: "Беларусь",
    title: "Автоматизация бизнеса в Беларуси: POS и CRM",
    description:
      "Автоматизация процессов для бизнеса в Беларуси: CRM, POS-терминалы, учет товаров, интеграции и отчеты.",
    h1: "Автоматизация бизнеса в Беларуси",
    intro:
      "Запускаем решения для магазинов, кафе, СТО и сервисных компаний по всей Беларуси.",
    keywords: [...CORE_SEO_KEYWORDS, "автоматизация бизнеса беларусь"],
  },
};

export const countrySlugs = Object.keys(COUNTRY_PAGES);
export const countryList = countrySlugs.map((slug) => COUNTRY_PAGES[slug]);
