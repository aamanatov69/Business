"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellDot,
  Boxes,
  Check,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
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
    title: "Магазины одежды",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Интерьер магазина одежды",
  },
  {
    title: "Обувные магазины",
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Полки с обувью в магазине",
  },
  {
    title: "Косметика",
    imageUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Косметические товары на витрине",
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
    title: "Пленка и расходники",
    description:
      "Кассовая и этикеточная пленка для стабильной работы торговых точек.",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNZQ57xViStF4M6bIkv0zCkWQwtlXvOTrT7w&s",
    imageAlt: "Рулоны пленки и расходные материалы",
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

const trustItems = ["Розница", "Кафе", "Сервисы", "Франшизы", "Сети", "СТО"];

const heroAnimatedSegments = [
  "магазинов",
  "складов",
  "кафе",
  "Бильярдов",
  "СТО",
  
];

const faqItems = [
  {
    question: "Для каких бизнесов подходит платформа?",
    answer:
      "Решение подходит для магазинов, кафе, сервисных точек, СТО, сетей и франшиз. Мы настраиваем процессы под ваш формат работы.",
  },
  {
    question: "Сколько времени занимает запуск?",
    answer:
      "Базовый запуск занимает от нескольких дней: подключаем кассу, склад, CRM и отчеты, затем обучаем команду.",
  },
  {
    question: "Есть ли интеграция с amoCRM?",
    answer:
      "Да. Лиды и контакты передаются в amoCRM, чтобы отдел продаж сразу работал с актуальными данными.",
  },
];

const testimonials = [
  {
    quote:
      "После внедрения мы перестали терять продажи в пиковые часы и увидели полную картину по остаткам.",
    author: "Сеть магазинов одежды",
  },
  {
    quote:
      "Команда работает в одной системе, а не в пяти таблицах. Руководителю стало проще управлять операциями.",
    author: "Розничная сеть",
  },
  {
    quote:
      "Отчеты по прибыли теперь собираются автоматически, решения принимаем быстрее и точнее.",
    author: "Сервисный бизнес",
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

export default function HomeClient() {
  const [isModalOpen, setModalOpen] = useState(false);
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
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

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
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [isModalOpen]);

  const openLeadModal = () => {
    setSubmitError("");
    setSubmitSuccess("");
    setModalOpen(true);
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
        <div className="hero-copy">
          <span className="tag">Автоматизация торговли и сервиса</span>
          <h1>
            <span className="hero-title-static">Автоматизация для</span>
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
            Одна система для кассы, склада, клиентов, финансов и управленческих
            решений. Контролируйте бизнес в реальном времени и масштабируйтесь
            без хаоса.
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
            <a href="#features" className="btn btn-outline">
              Смотреть возможности
            </a>
          </div>

          <ul className="hero-stats" aria-label="Ключевые показатели">
            {heroStats.map((item) => (
              <li key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          className="hero-board"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <div className="board-head">
            <div>
              <span>Business OS</span>
              <strong>Панель руководителя</strong>
            </div>
            <div className="chip chip-live">
              <BellDot size={14} />
              Онлайн
            </div>
          </div>

          <div className="board-metrics">
            <article>
              <span>Выручка</span>
              <strong>4 829 400 сом</strong>
              <small>+18% за месяц</small>
            </article>
            <article>
              <span>Средний чек</span>
              <strong>2 680 сом</strong>
              <small>+9% к прошлой неделе</small>
            </article>
            <article>
              <span>Повторные клиенты</span>
              <strong>39%</strong>
              <small>CRM-сегменты активны</small>
            </article>
          </div>

          <div className="board-wave" aria-hidden="true" />

          <ul className="board-feed">
            <li>
              <Check size={14} /> Лид отправлен в amoCRM
            </li>
            <li>
              <Check size={14} /> Инвентаризация завершена
            </li>
            <li>
              <Check size={14} /> Отчет по точкам обновлен
            </li>
          </ul>
        </motion.div>
      </section>

      <section className="trust-strip" aria-label="Подходит для отраслей">
        <div className="shell trust-track">
          {trustItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section id="features" className="shell section">
        <div className="section-head">
          <span className="tag">Одна программа</span>
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
          <span className="tag">Наша продукция</span>
          <h2>Пленка, оборудование и программы для вашего бизнеса</h2>
          <p>
            Комплексно закрываем потребности точки: расходники, оборудование и
            программные решения Rosta и Next Market.
          </p>
        </div>

        <div className="product-grid">
          {products.map((item, index) => (
            <motion.article
              key={item.title}
              className="product-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
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
            </motion.article>
          ))}
        </div>
      </section>

      <section id="industries" className="shell section">
        <div className="section-head">
          <span className="tag">Подходит для вашего формата</span>
          <h2>Платформа для разных типов бизнеса</h2>
        </div>

        <div className="industry-grid">
          {industries.map((item) => (
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
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <span className="tag">Отзывы</span>
          <h2>Бизнесы уже видят результат от автоматизации</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <blockquote key={item.author} className="testimonial-card">
              <p>{item.quote}</p>
              <cite>{item.author}</cite>
            </blockquote>
          ))}
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
