import type { FaqItem, NavItem } from "@/lib/home/types";

export const faqItems: FaqItem[] = [
  {
    question: "Для каких бизнесов подходит платформа?",
    answer:
      "Мы автоматизируем различные типы бизнесов и помогаем настраивать процессы под ваш формат работы.",
  },
  {
    question: "Сколько времени занимает запуск?",
    answer:
      "Базовый запуск занимает от нескольких часов до того времени пока вы полноценно не заработаете: подключаем кассу, склад, CRM и отчеты, затем обучаем команду.",
  },
  {
    question: "Есть ли интеграция с amoCRM?",
    answer:
      "Да. Лиды и контакты передаются в amoCRM, чтобы отдел продаж сразу работал с актуальными данными.",
  },
];

export const topNavItems: NavItem[] = [
  { href: "#hero", label: "Главная" },
  { href: "#directions", label: "Автоматизация" },
  { href: "/catalog", label: "Оборудование" },
  { href: "/integrations", label: "Интеграции" },
  { href: "/blog", label: "Блог" },
  { href: "/contacts", label: "Контакты" },
];
