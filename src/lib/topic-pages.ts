import { CORE_SEO_KEYWORDS } from "@/lib/seo";

export type TopicPageContent = {
  slug: string;
  shortTitle: string;
  intro: string;
  bullets: string[];
  keywords: readonly string[];
};

export const TOPIC_PAGES: Record<string, TopicPageContent> = {
  crm: {
    slug: "crm",
    shortTitle: "CRM для бизнеса",
    intro:
      "Внедряем CRM-систему для продаж, поддержки и повторных сделок: единая база клиентов, автоматические задачи и прозрачная воронка.",
    bullets: [
      "Воронка продаж и контроль этапов сделки",
      "Сегментация базы и персональные предложения",
      "Интеграция CRM с кассой, складом и телефонией",
    ],
    keywords: [...CORE_SEO_KEYWORDS, "crm внедрение", "crm автоматизация"],
  },
  "pos-terminaly": {
    slug: "pos-terminaly",
    shortTitle: "POS-терминалы и кассы",
    intro:
      "Настраиваем POS-терминалы и кассовый контур для быстрой продажи, контроля смен и прозрачной выручки по каждой точке.",
    bullets: [
      "Онлайн-касса и POS-интерфейс под формат бизнеса",
      "Контроль возвратов, скидок и кассовых операций",
      "Синхронизация кассы с остатками и аналитикой",
    ],
    keywords: [
      ...CORE_SEO_KEYWORDS,
      "pos терминал купить",
      "онлайн касса для магазина",
    ],
  },
  vesy: {
    slug: "vesy",
    shortTitle: "Торговые весы и оборудование",
    intro:
      "Подключаем торговые весы, сканеры и печать этикеток в единую систему учета, чтобы ускорить обслуживание и исключить ошибки.",
    bullets: [
      "Интеграция весов с номенклатурой",
      "Передача веса и цены в кассу без ручного ввода",
      "Поддержка обновлений и сервисного обслуживания",
    ],
    keywords: [
      ...CORE_SEO_KEYWORDS,
      "торговые весы",
      "весы с печатью этикеток",
    ],
  },
  "avtomatizaciya-sklada": {
    slug: "avtomatizaciya-sklada",
    shortTitle: "Автоматизация склада",
    intro:
      "Оцифровываем складские процессы: приходы, перемещения, списания, инвентаризация и контроль оборачиваемости.",
    bullets: [
      "Актуальные остатки по складам и филиалам",
      "Инвентаризация и контроль пересорта",
      "Отчеты по оборачиваемости и закупкам",
    ],
    keywords: [
      ...CORE_SEO_KEYWORDS,
      "программа для склада",
      "автоматизация складского учета",
    ],
  },
};

export const topicSlugs = Object.keys(TOPIC_PAGES);
export const topicList = topicSlugs.map((slug) => TOPIC_PAGES[slug]);
