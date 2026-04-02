export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://business-automation.kg";

export const SITE_NAME = "Центр автоматизации бизнеса";

export const SITE_TITLE =
  "Автоматизация бизнеса в Кыргызстане: POS, CRM, склад и аналитика";

export const SITE_DESCRIPTION =
  "Платформа для автоматизации магазинов, кафе, СТО, бильярда и бани: продажи, склад, клиенты, финансы и отчеты в одном сервисе.";

export const SITE_LOCALE = "ru_RU";

export const SITE_LANGUAGE = "ru";

export const BRAND_PHONE = "+996 559 474 999";

export const BRAND_EMAIL = "automat.busines@gmail.com";

export const BRAND_ADDRESS = "Улица Мадиева 23/1, Кок-Жар";

export const BRAND_CITY = "Бишкек";

export const BRAND_COUNTRY = "KG";

export const BRAND_POSTAL_CODE = "720000";

export const BRAND_LOGO_PATH = "/logo.png";

export const CIS_COUNTRIES = [
  "KG",
  "KZ",
  "UZ",
  "TJ",
  "TM",
  "RU",
  "BY",
  "AM",
  "AZ",
] as const;

export const CORE_SEO_KEYWORDS = [
  "автоматизация бизнеса",
  "автоматизация бизнеса СНГ",
  "CRM для бизнеса",
  "CRM система для магазина",
  "POS система",
  "POS терминал",
  "торговые весы",
  "автоматизация склада",
  "учет продаж",
  "программа для магазина",
  "автоматизация кафе",
  "автоматизация ресторана",
  "автоматизация СТО",
  "amoCRM интеграция",
  "бизнес аналитика",
] as const;
