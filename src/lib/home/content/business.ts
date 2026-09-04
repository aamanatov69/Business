import type { IndustryCard } from "@/lib/home/types";

export const industries: IndustryCard[] = [
  {
    title: "Ритейл",
    imageUrl:
      "https://art-trade.com.ua/image/cache/catalog/image/cache/catalog/Blog/riteil-1200x900.webp",
    imageAlt: "Интерьер магазина одежды",
  },
  {
    title: "Общепит",
    imageUrl:
      "https://inventure.com.ua/img/thumb.990.660/upload/user/1945/23e6de1643cc555ac025f68b972862a3.jpg",
    imageAlt: "Интерьер современного кафе",
  },
  {
    title: "Услуги",
    imageUrl:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Услуги и обслуживание клиентов",
  },
  {
    title: "СТО",
    imageUrl:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Автомастерская и диагностика автомобиля",
  },
  {
    title: "Кафе",
    imageUrl:
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Интерьер современного кафе",
  },
  {
    title: "Бани и досуг",
    imageUrl:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Зона отдыха и wellness",
  },
];

export const retailBusinessOptions = [
  "Продуктовый магазин",
  "Магазин обуви",
  "Косметика и парфюм",
  "Аптека",
  "Склад",
  "Торговая компания",
  "Маркет",
  "Зоотовары",
  "Эко товары",
  "Игрушки",
  "Другое",
];

export const foodBusinessOptions = ["Пекарня", "Кафе", "Фастфуд", "Ресторан", "Другое"];

export const servicesBusinessOptions = [
  "СТО",
  "Развлекательные центры",
  "Бани",
  "Сауна",
  "Бильярд",
  "Досуг",
  "Массаж",
  "Другое",
];

export const businessTypes = ["Магазин", "СТО", "Бильярд", "Кафе", "Баня"] as const;
export const OTHER_BUSINESS_TYPE = "Другое";
