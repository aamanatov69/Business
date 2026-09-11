import type { HeroBoardImage } from "@/lib/home/types";

export const heroStats = [
  { value: "POS", label: "касса и оборудование" },
  { value: "CRM", label: "клиенты и обращения" },
  { value: "Учет", label: "товары и склад" },
];

export const heroAnimatedSegments = [
  "магазинов",
  "складов",
  "кафе",
  "бильярдов",
  "СТО",
  "сервисных точек",
  "общепита",
  "услуг",
  "отделов продаж",
  "разработки сайтов",
];

export const heroBoardGallery: HeroBoardImage[] = [
  {
    src: "/mag2.jpg",
    alt: "Сотрудник работает в торговом зале",
    className: "hero-collage-item-top-left",
  },
  {
    src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
    alt: "Администратор за стойкой магазина",
    className: "hero-collage-item-top-right",
  },
  {
    src: "/mag.jpg",
    alt: "Обслуживание покупателя в магазине",
    className: "hero-collage-item-bottom-left",
  },
  {
    src: "/image_30b5ed0a.png",
    alt: "Команда работает с панелью автоматизации",
    className: "hero-collage-item-bottom-center",
  },
  {
    src: "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=1200&q=80",
    alt: "Работа с аналитикой на экране кассы",
    className: "hero-collage-item-bottom-right",
  },
];
