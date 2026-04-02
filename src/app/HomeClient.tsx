"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BarChart3, Boxes, Play, Warehouse } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

type FeatureCard = {
  title: string;
  description: string;
  points: string[];
  imageUrl: string;
  imageAlt: string;
};

type IndustryCard = {
  title: string;
  imageUrl: string;
  imageAlt: string;
};

type ProductCard = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

type TrustedOrganization = {
  name: string;
  logoSrc?: string;
};

type SeoHubItem = {
  key: string;
  href: string;
  label: string;
};

type SeoHubGroup = {
  id: string;
  tag: string;
  title: string;
  description: string;
  items: SeoHubItem[];
  footerLink?: {
    href: string;
    label: string;
  };
};

type HomeClientProps = {
  seoHubGroups?: SeoHubGroup[];
};

const featureCards: FeatureCard[] = [
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

const industries: IndustryCard[] = [
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
      "https://easypayments.online/media//articles/img_1764942003.575413.jpg",
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

const products: ProductCard[] = [
  {
    title: "AMOCRM+Разработка сайтов",
    description:
      "Интеграция с AMOCRM для управления лидами, сделками и коммуникацией с клиентами.",
    imageUrl:
      "https://cdn-ru.bitrix24.ru/b2517/landing/a26/a265bfd1963525ab9e60443edb4b15b8/logo_bill_kg.jpg",
    imageAlt: "Логотип AMOCRM и разработки сайтов",
  },
  {
    title: "Торговое оборудование",
    description:
      "POS-оборудование, сканеры, принтеры и периферия для автоматизации.",
    imageUrl: "https://btpos.md/wp-content/uploads/2024/07/pos4-350x350.jpg",
    imageAlt: "Торговое и кассовое оборудование",
  },
  {
    title: "Программа Rosta",
    description:
      "Решение для учета, контроля операций и роста продаж в рознице.",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOIjQYTUuX_O5xQQbWfpGlpcjI3lcJxV2oJA&s",
    imageAlt: "Рабочий экран программы Rosta",
  },
  {
    title: "Программа Next Market",
    description:
      "Платформа для управления магазином, командой и клиентской базой.",
    imageUrl:
      "https://static.tildacdn.pro/tild3039-3438-4466-b165-333661643931/logo.png",
    imageAlt: "Интерфейс программы Next Market",
  },
];

const heroStats = [
  { value: "6000+", label: "бизнесов автоматизируют процессы" },
  { value: "до 30%", label: "рост повторных продаж" },
  { value: "24/7", label: "доступ к отчетам и контролю" },
];

const heroAnimatedSegments = [
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

const heroBoardGallery = [
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

const retailBusinessOptions = [
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

const foodBusinessOptions = [
  "Пекарня",
  "Кафе",
  "Фастфуд",
  "Ресторан",
  "Другое",
];

const servicesBusinessOptions = [
  "СТО",
  "Развлекательные центры",
  "Бани",
  "Сауна",
  "Бильярд",
  "Досуг",
  "Массаж",
  "Другое",
];

const equipmentPdfPath = encodeURI("/docs/прайс все позиции в сомах.pdf");

const faqItems = [
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

const trustedOrganizations: TrustedOrganization[] = [
  {
    name: "L'OCCITANE EN PROVENCE",
    logoSrc: "/logos/loccitane.svg",
  },
  {
    name: "Levi's",
    logoSrc: "/logos/levis.svg",
  },
  {
    name: "LACOSTE",
    logoSrc: "/logos/lacoste.svg",
  },
  {
    name: "TOMMY HILFIGER",
    logoSrc: "/logos/tommy.svg",
  },
  {
    name: "CALVIN KLEIN",
    logoSrc: "/logos/calvin-klein.svg",
  },
  {
    name: "vicco",
    logoSrc: "/logos/vicco.svg",
  },
  {
    name: "button EST. 2019",
    logoSrc: "/logos/button.svg",
  },
];

const topNavItems = [
  { href: "#hero", label: "Главная" },
  { href: "#features", label: "Возможности" },
  { href: "#products", label: "Продукция" },
  { href: "#industries", label: "Ниши" },
  { href: "#faq", label: "FAQ" },
  { href: "#connect", label: "Контакты" },
];

const businessTypes = ["Магазин", "СТО", "Бильярд", "Кафе", "Баня"] as const;
const OTHER_BUSINESS_TYPE = "Другое";

const LOCAL_PHONE_DIGITS = 9;

function normalizePhoneInput(value: string): string {
  const onlyDigits = value.replace(/\D/g, "");

  if (onlyDigits.startsWith("996")) {
    return onlyDigits.slice(3, 12);
  }

  return onlyDigits.slice(0, LOCAL_PHONE_DIGITS);
}

function formatKgPhone(localDigits: string): string {
  const paddedDigits = localDigits.slice(0, LOCAL_PHONE_DIGITS);

  if (!paddedDigits) {
    return "+996 ";
  }

  const chunks = [
    paddedDigits.slice(0, 3),
    paddedDigits.slice(3, 5),
    paddedDigits.slice(5, 7),
    paddedDigits.slice(7, 9),
  ].filter(Boolean);

  return `+996 ${chunks.join(" ")}`;
}

export default function HomeClient({ seoHubGroups = [] }: HomeClientProps) {
  const industriesSectionRef = useRef<HTMLElement | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEquipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [showRetailBusinessOptions, setShowRetailBusinessOptions] =
    useState(false);
  const [activeIndustryOptions, setActiveIndustryOptions] = useState<string[]>(
    retailBusinessOptions,
  );
  const [heroSegmentIndex, setHeroSegmentIndex] = useState(0);
  const [fullName, setFullName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [failedTrustedLogos, setFailedTrustedLogos] = useState<
    Record<string, boolean>
  >({});
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const markTrustedLogoFailed = (name: string) => {
    setFailedTrustedLogos((previous) => {
      if (previous[name]) {
        return previous;
      }

      return { ...previous, [name]: true };
    });
  };

  const clearAutoCloseTimer = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const switchTimer = setInterval(() => {
      setHeroSegmentIndex((previous) =>
        previous === heroAnimatedSegments.length - 1 ? 0 : previous + 1,
      );
    }, 2200);

    return () => {
      clearInterval(switchTimer);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isModalOpen && !isEquipmentModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
        setEquipmentModalOpen(false);
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [isModalOpen, isEquipmentModalOpen]);

  const openLeadModal = () => {
    setSubmitError("");
    setSubmitSuccess("");
    setModalOpen(true);
  };

  const openLeadModalForBusiness = (businessLabel: string) => {
    setSubmitError("");
    setSubmitSuccess("");
    setBusinessType(OTHER_BUSINESS_TYPE);
    setCustomBusinessType(businessLabel);
    setModalOpen(true);
  };

  const openEquipmentModal = () => {
    setEquipmentModalOpen(true);
  };

  const closeEquipmentModal = () => {
    setEquipmentModalOpen(false);
  };

  const closeLeadModal = () => {
    if (isSubmitting) {
      return;
    }

    clearAutoCloseTimer();
    setModalOpen(false);
  };

  const onPhoneChange = (value: string) => {
    setPhoneDigits(normalizePhoneInput(value));
  };

  const resetForm = () => {
    setFullName("");
    setPhoneDigits("");
    setEmail("");
    setBusinessType("");
    setCustomBusinessType("");
    setWebsite("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const nameValue = fullName.trim();
    const emailValue = email.trim();
    const phoneValue = formatKgPhone(phoneDigits).trim();
    const businessTypeValue = businessType.trim();
    const customBusinessTypeValue = customBusinessType.trim();

    if (!nameValue) {
      setSubmitError("Введите ФИО.");
      return;
    }

    if (phoneDigits.length !== LOCAL_PHONE_DIGITS) {
      setSubmitError("Введите номер в формате +996 000 00 00 00.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      setSubmitError("Введите корректный email.");
      return;
    }

    const isOtherBusinessType = businessTypeValue === OTHER_BUSINESS_TYPE;

    if (
      !isOtherBusinessType &&
      !businessTypes.includes(
        businessTypeValue as (typeof businessTypes)[number],
      )
    ) {
      setSubmitError("Выберите тип бизнеса.");
      return;
    }

    if (isOtherBusinessType && !customBusinessTypeValue) {
      setSubmitError("Укажите ваш тип бизнеса.");
      return;
    }

    const finalBusinessType = isOtherBusinessType
      ? customBusinessTypeValue
      : businessTypeValue;

    try {
      setSubmitting(true);

      const response = await fetch("/api/amocrm/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: nameValue,
          phone: phoneValue,
          email: emailValue,
          businessType: finalBusinessType,
          website,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(payload?.message ?? "Не удалось отправить заявку.");
      }

      setSubmitSuccess("Заявка отправлена. Мы скоро свяжемся с вами.");
      resetForm();
      clearAutoCloseTimer();
      autoCloseTimerRef.current = setTimeout(() => {
        setModalOpen(false);
        setSubmitSuccess("");
      }, 5000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ошибка отправки. Попробуйте позже.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      clearAutoCloseTimer();
    };
  }, []);

  useEffect(() => {
    if (!showRetailBusinessOptions) {
      return;
    }

    const onClickOutside = (event: MouseEvent) => {
      if (!industriesSectionRef.current) {
        return;
      }

      if (!industriesSectionRef.current.contains(event.target as Node)) {
        setShowRetailBusinessOptions(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [showRetailBusinessOptions]);

  return (
    <main className="landing">
      <header className="shell topbar">
        <a href="#hero" className="brand">
          <Image
            src="/logo.png"
            alt="Логотип"
            width={34}
            height={34}
            className="brand-logo"
          />
          Центр автоматизации бизнеса
        </a>

        <nav className="topnav" aria-label="Основная навигация">
          {topNavItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="btn btn-ghost topbar-demo-btn"
          onClick={openLeadModal}
        >
          Получить демо
        </button>
      </header>

      <section id="hero" className="shell hero">
        <div className="hero-showcase">
          <div className="hero-showcase-top">
            <Image
              src={heroBoardGallery[0].src}
              alt={heroBoardGallery[0].alt}
              width={1200}
              height={900}
              className="hero-board-photo hero-showcase-photo hero-showcase-photo-top-left"
              sizes="(max-width: 760px) 100vw, (max-width: 1080px) 42vw, 26vw"
            />

            <div className="hero-copy hero-copy-overlay">
              <span className="tag">Автоматизация торговли и сервиса</span>
              <h1>
                <span className="hero-title-static">
                  Автоматизация для
                  <br />
                  вашего бизнеса
                </span>
                <span className="hero-title-dynamic-wrap" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={heroAnimatedSegments[heroSegmentIndex]}
                      className="hero-title-dynamic"
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 14 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: -14 }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 0.32, ease: "easeOut" }
                      }
                    >
                      {heroAnimatedSegments[heroSegmentIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
              <p>
                Системы для кассы, склада, клиентов, финансов и управленческих
                решений. Контролируйте бизнес в реальном времени и
                масштабируйтесь без хаоса.
              </p>

              <div className="hero-actions">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary"
                  onClick={openLeadModal}
                >
                  Попробовать сейчас <ArrowRight size={16} />
                </motion.button>
                
              </div>
            </div>

            <Image
              src={heroBoardGallery[1].src}
              alt={heroBoardGallery[1].alt}
              width={1200}
              height={900}
              className="hero-board-photo hero-showcase-photo hero-showcase-photo-top-right"
              sizes="(max-width: 760px) 100vw, (max-width: 1080px) 42vw, 26vw"
            />
          </div>

          <motion.div
            className="hero-board"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="hero-board-collage">
              <Image
                src={heroBoardGallery[2].src}
                alt={heroBoardGallery[2].alt}
                width={1200}
                height={900}
                className="hero-board-photo hero-showcase-photo-bottom-left"
                sizes="(max-width: 760px) 100vw, (max-width: 1080px) 72vw, 30vw"
              />
              <Image
                src={heroBoardGallery[3].src}
                alt={heroBoardGallery[3].alt}
                width={1200}
                height={900}
                className="hero-board-photo hero-showcase-photo-bottom-center"
                sizes="(max-width: 760px) 100vw, (max-width: 1080px) 72vw, 34vw"
              />
              <Image
                src={heroBoardGallery[4].src}
                alt={heroBoardGallery[4].alt}
                width={1200}
                height={900}
                className="hero-board-photo hero-showcase-photo-bottom-right"
                sizes="(max-width: 760px) 100vw, (max-width: 1080px) 72vw, 30vw"
              />
            </div>
          </motion.div>
        </div>

        <ul className="hero-stats" aria-label="Ключевые показатели">
          {heroStats.map((item) => (
            <li key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="features" className="shell section">
        <div className="section-head">
          <span className="tag">Возможности</span>
          <h2>Решение всех ключевых задач в одном интерфейсе</h2>
          <p>
            От первых продаж до управленческой аналитики: весь операционный цикл
            в единой системе без ручных переносов и потери данных.
          </p>
        </div>

        <div className="feature-grid">
          {featureCards.map((card, index) => (
            <motion.article
              key={card.title}
              className="feature-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Image
                src={card.imageUrl}
                alt={card.imageAlt}
                className="feature-photo"
                width={1200}
                height={900}
                sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
              />
              <div className="feature-overlay" />
              <div className="feature-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <ul>
                  {card.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="shell section split-section">
        <div className="split-copy">
          <span className="tag">Почему выбирают нас</span>
          <h2>Понятная система для команды и руководителя</h2>
          <p>
            Сотрудники работают быстрее, руководитель видит цифры в реальном
            времени, а компания получает единый стандарт управления.
          </p>
          <ul>
            <li>
              <Boxes size={16} />
              Единый контур продаж, склада и CRM
            </li>
            <li>
              <Warehouse size={16} />
              Меньше ошибок в остатках и заказах
            </li>
            <li>
              <BarChart3 size={16} />
              Отчеты для решений, а не для галочки
            </li>
          </ul>
        </div>

        <div className="split-panel">
          <article>
            <span>До внедрения</span>
            <strong>Разрозненные таблицы</strong>
            <p>Потери времени на сверки и ручной контроль.</p>
          </article>
          <article>
            <span>После внедрения</span>
            <strong>Единая цифровая система</strong>
            <p>Прозрачные процессы, контроль и управляемый рост.</p>
          </article>
        </div>
      </section>

      <section id="products" className="shell section">
        <div className="section-head">
          <span className="tag">Продукции</span>
          <h2>Оборудование и программы для вашего бизнеса</h2>
          <p>
            Комплексно закрываем потребности точки: расходники, оборудование и
            программные решения Rosta и Next Market.
          </p>
        </div>

        <div className="product-grid">
          {products.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {item.title === "Торговое оборудование" ? (
                <button
                  type="button"
                  className="product-card product-card-trigger"
                  onClick={openEquipmentModal}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    className="product-photo"
                    width={1200}
                    height={800}
                    sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 25vw"
                  />
                  <div className="product-body">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </button>
              ) : (
                <article className="product-card">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    className="product-photo"
                    width={1200}
                    height={800}
                    sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 25vw"
                  />
                  <div className="product-body">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="industries"
        className="shell section"
        ref={industriesSectionRef}
      >
        <div className="section-head">
          <span className="tag">Ниши</span>
          <h2>Платформа для разных типов бизнеса</h2>
        </div>

        <div
          className={`industry-grid ${
            showRetailBusinessOptions ? "industry-grid-hidden" : ""
          }`}
        >
          {industries.slice(0, 3).map((item) =>
            item.title === "Магазины одежды" ||
            item.title === "Ритейл" ||
            item.title === "Общепит" ||
            item.title === "Услуги" ? (
              <button
                key={item.title}
                type="button"
                className="industry-card industry-card-trigger"
                onClick={() => {
                  if (
                    item.title === "Магазины одежды" ||
                    item.title === "Ритейл"
                  ) {
                    setActiveIndustryOptions(retailBusinessOptions);
                  } else if (item.title === "Общепит") {
                    setActiveIndustryOptions(foodBusinessOptions);
                  } else {
                    setActiveIndustryOptions(servicesBusinessOptions);
                  }

                  setShowRetailBusinessOptions(true);
                }}
                aria-expanded={showRetailBusinessOptions}
                aria-controls="industry-business-options"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="industry-photo"
                  width={900}
                  height={600}
                  sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
                />
                <h3 className="industry-title">{item.title}</h3>
              </button>
            ) : (
              <article key={item.title} className="industry-card">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="industry-photo"
                  width={900}
                  height={600}
                  sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
                />
                <h3 className="industry-title">{item.title}</h3>
              </article>
            ),
          )}
        </div>

        <div
          id="industry-business-options"
          className={`industry-business-options ${
            showRetailBusinessOptions ? "industry-business-options-visible" : ""
          }`}
        >
          <p className="industry-business-options-title">
            Выберите тип бизнеса для быстрой заявки:
          </p>
          <div className="industry-business-options-grid">
            {activeIndustryOptions.map((option) => (
              <button
                key={option}
                type="button"
                className="industry-business-option-btn"
                onClick={() => openLeadModalForBusiness(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <span className="tag">Нас выбрали</span>
          <h2>Нам доверяют бренды</h2>
        </div>

        <div className="trusted-logos" aria-label="Нам доверяют бренды">
          <div className="trusted-logos-track">
            {trustedOrganizations.map((item) => (
              <article
                key={item.name}
                className="trusted-logo-card"
                aria-label={item.name}
              >
                {item.logoSrc && !failedTrustedLogos[item.name] ? (
                  <img
                    src={item.logoSrc}
                    alt={item.name}
                    className="trusted-logo-image"
                    loading="lazy"
                    decoding="async"
                    onError={() => markTrustedLogoFailed(item.name)}
                  />
                ) : (
                  <span>{item.name}</span>
                )}
              </article>
            ))}
            {trustedOrganizations.map((item) => (
              <article
                key={`${item.name}-copy`}
                className="trusted-logo-card"
                aria-hidden="true"
              >
                {item.logoSrc && !failedTrustedLogos[item.name] ? (
                  <img
                    src={item.logoSrc}
                    alt=""
                    className="trusted-logo-image"
                    loading="lazy"
                    decoding="async"
                    onError={() => markTrustedLogoFailed(item.name)}
                  />
                ) : (
                  <span>{item.name}</span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="shell section">
        <div className="section-head">
          <span className="tag">FAQ</span>
          <h2>Частые вопросы перед запуском</h2>
        </div>

        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {seoHubGroups.length ? (
        <section className="shell section seo-hub" aria-label="SEO навигация">
          <details className="seo-hub-toggle">
            <summary className="btn btn-outline seo-hub-trigger">
              Быстрый доступ
            </summary>
            <div className="seo-hub-content">
              <div className="section-head">
                <h2>Навигация по решениям, странам и статьям</h2>
                <p>
                  Все ключевые ссылки сохранены для удобства пользователей и
                  стабильной индексации поисковыми системами.
                </p>
              </div>

              <div className="seo-hub-grid">
                {seoHubGroups.map((group) => (
                  <article key={group.id} className="seo-hub-card">
                    <span className="tag">{group.tag}</span>
                    <h3 className="seo-hub-title">{group.title}</h3>
                    <p className="seo-hub-description">{group.description}</p>
                    <ul className="seo-hub-links">
                      {group.items.map((item) => (
                        <li key={item.key}>
                          <Link className="seo-hub-link-btn" href={item.href}>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {group.footerLink ? (
                      <p className="seo-hub-footer-link">
                        <Link
                          className="btn btn-ghost"
                          href={group.footerLink.href}
                        >
                          {group.footerLink.label}
                        </Link>
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </details>
        </section>
      ) : null}

      <section id="connect" className="shell cta">
        <div className="cta-box">
          <span className="tag">Готовы запустить?</span>
          <h2>Получите персональную консультацию по внедрению</h2>
          <p>
            Покажем, как собрать продажи, склад, CRM и отчетность в единую
            систему именно под ваш сценарий.
          </p>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            onClick={openLeadModal}
          >
            Получить консультацию
          </motion.button>
        </div>
      </section>

      <AnimatePresence>
        {isEquipmentModalOpen ? (
          <motion.div
            className="lead-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEquipmentModal}
          >
            <motion.div
              className="lead-modal equipment-modal"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="equipment-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="equipment-modal-close"
                onClick={closeEquipmentModal}
                aria-label="Закрыть окно"
              >
                ×
              </button>
              <h3 id="equipment-modal-title">Список оборудования</h3>
              <div className="resource-preview-wrap">
                <iframe
                  src={`${equipmentPdfPath}#toolbar=0&navpanes=0&scrollbar=1`}
                  title="PDF торгового оборудования"
                  className="resource-pdf-preview"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {isModalOpen ? (
          <motion.div
            className="lead-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLeadModal}
          >
            <motion.div
              className="lead-modal"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              {submitSuccess ? (
                <div className="lead-success" role="status" aria-live="polite">
                  <h3 id="lead-modal-title">Спасибо за обращение!</h3>
                  <p>С вами скоро свяжутся.</p>
                </div>
              ) : (
                <>
                  <h3 id="lead-modal-title">Оставьте заявку</h3>
                  <p>Заполните форму, и мы свяжемся с вами для подключения.</p>

                  <form className="lead-form" onSubmit={onSubmit}>
                    <label htmlFor="lead-website" className="visually-hidden">
                      Website
                    </label>
                    <input
                      id="lead-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      className="visually-hidden"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                    />

                    <label htmlFor="lead-full-name">ФИО</label>
                    <input
                      id="lead-full-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Иванов Иван Иванович"
                      required
                    />

                    <label htmlFor="lead-phone">Номер телефона</label>
                    <input
                      id="lead-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      value={formatKgPhone(phoneDigits)}
                      onChange={(event) => onPhoneChange(event.target.value)}
                      placeholder="+996 000 00 00 00"
                      required
                    />

                    <label htmlFor="lead-email">Электронная почта</label>
                    <input
                      id="lead-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="example@company.kg"
                      required
                    />

                    <label htmlFor="lead-business-type">Тип бизнеса</label>
                    <select
                      id="lead-business-type"
                      name="businessType"
                      value={businessType}
                      onChange={(event) => {
                        const value = event.target.value;
                        setBusinessType(value);

                        if (value !== OTHER_BUSINESS_TYPE) {
                          setCustomBusinessType("");
                        }
                      }}
                      required
                    >
                      <option value="">Выберите тип бизнеса</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                      <option value={OTHER_BUSINESS_TYPE}>
                        {OTHER_BUSINESS_TYPE}
                      </option>
                    </select>

                    {businessType === OTHER_BUSINESS_TYPE ? (
                      <>
                        <label htmlFor="lead-custom-business-type">
                          Ваш тип бизнеса
                        </label>
                        <input
                          id="lead-custom-business-type"
                          name="customBusinessType"
                          type="text"
                          value={customBusinessType}
                          onChange={(event) =>
                            setCustomBusinessType(event.target.value)
                          }
                          placeholder="Например: Салон красоты"
                          required
                        />
                      </>
                    ) : null}

                    {submitError ? (
                      <p className="form-status form-status-error">
                        {submitError}
                      </p>
                    ) : null}

                    <div className="lead-form-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={closeLeadModal}
                        disabled={isSubmitting}
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Отправка..." : "Отправить"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
