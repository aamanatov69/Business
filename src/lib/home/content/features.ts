import type { FeatureCard } from "@/lib/home/types";

export const featureCards: FeatureCard[] = [
  {
    title: "Продажи и касса",
    description:
      "Ускоряйте обслуживание, контролируйте смены и получайте прозрачную выручку по каждой точке.",
    points: ["Быстрые продажи", "Возвраты и скидки", "Контроль смен"],
    imageUrl:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Оплата на кассе в магазине",
  },
  {
    title: "Склад и остатки",
    description:
      "Держите товар под контролем: приходы, перемещения, инвентаризации и автоматическое списание.",
    points: ["Актуальные остатки", "Приемка и перемещения", "Инвентаризация"],
    imageUrl:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Складские стеллажи и учет товара",
  },
  {
    title: "Клиенты и лояльность",
    description:
      "Стройте повторные продажи через CRM, сегменты, историю покупок и персональные предложения.",
    points: ["Единая база", "Сегментация", "Повторные продажи"],
    imageUrl:
      "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Работа с клиентами и CRM",
  },
  {
    title: "Аналитика и прибыль",
    description:
      "Видьте маржинальность, лидеров продаж и проблемные зоны в режиме реального времени.",
    points: ["KPI-панель", "Отчеты по прибыли", "План-факт"],
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Дашборд с графиками аналитики",
  },
  {
    title: "Операционный контроль",
    description:
      "Соберите все процессы в одном окне и уберите ручные таблицы и хаотичные чаты.",
    points: ["Регламенты", "Роли и доступы", "Журнал действий"],
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Управление бизнес-процессами в офисе",
  },
  {
    title: "Интеграции",
    description:
      "Передавайте лиды в amoCRM и синхронизируйте данные между отделами без двойного ввода.",
    points: ["amoCRM", "Webhook-события", "Единый поток данных"],
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Командная работа и интеграции систем",
  },
];
