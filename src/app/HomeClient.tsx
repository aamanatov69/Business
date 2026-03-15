"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellDot,
  Box,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  CreditCard,
  LayoutGrid,
  ShoppingBag,
  Store,
  Users,
  Utensils,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import { type FormEvent, useEffect, useState } from "react";

type ModuleCard = {
  title: string;
  subtitle: string;
  points: string[];
  Icon: LucideIcon;
};

type AudienceCard = {
  title: string;
  Icon: LucideIcon;
};

const modules: ModuleCard[] = [
  {
    title: "POS система",
    subtitle: "для продаж",
    points: ["Онлайн-касса", "Склад и чеки"],
    Icon: CreditCard,
  },
  {
    title: "Управление складом",
    subtitle: "для товарного учета",
    points: ["Учет товаров", "Остатки и перемещения"],
    Icon: Warehouse,
  },
  {
    title: "CRM для клиентов",
    subtitle: "для удержания",
    points: ["База клиентов", "Сегментация и история"],
    Icon: Users,
  },
  {
    title: "Финансы и аналитика",
    subtitle: "для роста прибыли",
    points: ["Графики доходов", "Отчеты и прогноз"],
    Icon: BarChart3,
  },
];

const audiences: AudienceCard[] = [
  { title: "Магазины", Icon: ShoppingBag },
  { title: "Рестораны", Icon: Utensils },
  { title: "Розничные сети", Icon: Store },
  { title: "Малый бизнес", Icon: BriefcaseBusiness },
  { title: "Франшизы", Icon: Building2 },
];

const processSteps = [
  "Подключение бизнеса",
  "Настройка модулей",
  "Автоматизация процессов",
  "Аналитика и рост прибыли",
];

const heroStats = [
  { value: "500+", label: "точек и рабочих мест" },
  { value: "24/7", label: "доступ к показателям" },
  { value: "+32%", label: "рост повторных продаж" },
];

const heroFeaturePills = [
  "Продажи, склад и заявки в одной системе",
  "Рабочее пространство для команды и руководителя",
  "Показатели бизнеса в реальном времени",
];

const heroPreviewNav = [
  { label: "Операции", hint: "Контроль", Icon: LayoutGrid },
  { label: "Клиенты", hint: "CRM", Icon: Users },
  { label: "Каталог", hint: "Остатки", Icon: Box },
];

const heroPreviewFeed = ["Заявка передана в amoCRM", "Остатки обновлены"];

const trustItems = [
  "Продажи и касса",
  "Клиентская база",
  "Складской учет",
  "Финансовые отчеты",
  "Интеграция с amoCRM",
];

const integrationCards = [
  {
    title: "Аналитика и показатели",
    description:
      "Отслеживайте ключевые метрики, выручку и эффективность бизнеса в одном интерфейсе.",
    points: ["KPI-дашборды", "Динамика выручки", "Отчеты для руководителя"],
    Icon: BarChart3,
  },
  {
    title: "Продажи и складской учет",
    description:
      "Контролируйте продажи, остатки и движение товаров без ручных таблиц и сверок.",
    points: ["Контроль остатков", "Движение товаров", "Синхронизация операций"],
    Icon: Box,
  },
  {
    title: "Клиенты и обращения",
    description:
      "Ведите клиентскую базу, заявки и коммуникации в одной рабочей системе.",
    points: [
      "История клиента",
      "Обработка заявок",
      "Совместная работа команды",
    ],
    Icon: Users,
  },
];

const dashboardStats = [
  {
    label: "Продажи",
    value: "$39,482.60",
    trend: "+18.4%",
    Icon: CreditCard,
  },
  {
    label: "Клиенты",
    value: "284",
    trend: "+12.1%",
    Icon: Users,
  },
  {
    label: "Расходы",
    value: "$11,918.00",
    trend: "План выполнен на 92%",
    Icon: Calculator,
  },
  {
    label: "Операции",
    value: "98 событий",
    trend: "24 активных сейчас",
    Icon: BarChart3,
  },
];

const dashboardRevenueBars = [36, 52, 48, 74, 66, 84, 72];

const faqItems = [
  {
    question: "Для каких ниш подходит автоматизация?",
    answer:
      "Система подходит для магазинов, кафе, СТО, бильярдных, бань, франшиз и розничных сетей в Кыргызстане.",
  },
  {
    question: "Что включает внедрение?",
    answer:
      "Подключение POS-кассы, настройку склада, CRM для клиентов, финансовые отчеты, обучение сотрудников и запуск рабочих процессов.",
  },
  {
    question: "Можно ли интегрировать с amoCRM?",
    answer:
      "Да, заявки с сайта и контакты клиентов отправляются в amoCRM для обработки отделом продаж.",
  },
];

const topNavItems = [
  {
    href: "#hero",
    label: "Главная",
    info: "Обзор платформы и ключевые преимущества автоматизации бизнеса.",
  },
  {
    href: "#features",
    label: "Возможности",
    info: "Модули для продаж, склада, клиентов и управленческой аналитики.",
  },
  {
    href: "#connect",
    label: "Контакты",
    info: "Оставьте заявку и получите консультацию по внедрению.",
  },
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

export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

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

  return (
    <main className="landing-page">
      <div className="backdrop-orb orb-left" aria-hidden="true" />
      <div className="backdrop-orb orb-right" aria-hidden="true" />

      <header className="container topbar">
        <a href="#hero" className="brand-mark">
          <Image
            src="/logo.png"
            alt="Логотип"
            width={38}
            height={38}
            className="brand-logo"
          />
          ЦЕНТР АВТОМАТИЗАЦИИ БИЗНЕСА
        </a>
        <nav className="topnav" aria-label="Основная навигация">
          {topNavItems.map((item) => (
            <div key={item.href} className="topnav-item">
              <a href={item.href}>{item.label}</a>
              <div className="topnav-popover" role="tooltip">
                {item.info}
              </div>
            </div>
          ))}
        </nav>
      </header>

      <section id="hero" className="container hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-copy"
        >
          {/* <span className="eyebrow">
            Платформа для автоматизации и управления бизнесом
          </span> */}
          <h1>Одна система для продаж, клиентов, склада и аналитики</h1>
          <p>
            Объедините заявки, кассу, склад, CRM и управленческую отчетность в
            одном цифровом контуре без разрозненных таблиц и ручного контроля.
          </p>

          <div className="hero-actions">
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
              onClick={openLeadModal}
            >
              Получить консультацию
            </motion.button>
            <a
              href="#workspace"
              className="btn btn-secondary hero-secondary-action"
            >
              Посмотреть возможности
            </a>
          </div>

          <div className="hero-mini-proof">
            {heroFeaturePills.map((item) => (
              <span key={item}>
                <Check size={14} />
                {item}
              </span>
            ))}
          </div>

          <div className="hero-stat-grid">
            {heroStats.map((item) => (
              <div key={item.label} className="hero-stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="hero-proof-row">
            {audiences.slice(0, 3).map((item) => (
              <span key={item.title}>{item.title}</span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1 }}
          className="hero-visual"
        >
          <div className="hero-showcase glow-pulse">
            <div className="hero-showcase-card hero-showcase-card-main">
              <div className="hero-showcase-toolbar">
                <div>
                  <span className="hero-product-label">Система</span>
                  <strong>Панель бизнеса</strong>
                </div>
                <span className="badge">Онлайн</span>
              </div>

              <div className="hero-showcase-layout">
                <div className="hero-showcase-menu">
                  {heroPreviewNav.map((item) => (
                    <div key={item.label} className="hero-preview-nav-item">
                      <item.Icon size={16} />
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.hint}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hero-showcase-content">
                  <div className="hero-kpi-strip">
                    {dashboardStats.slice(0, 2).map((item) => (
                      <div key={item.label} className="hero-kpi-card">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <small>{item.trend}</small>
                      </div>
                    ))}
                  </div>

                  <div className="line-chart" aria-hidden="true">
                    <svg viewBox="0 0 420 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient
                          id="heroAreaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="rgba(150, 189, 255, 0.36)"
                          />
                          <stop
                            offset="100%"
                            stopColor="rgba(150, 189, 255, 0)"
                          />
                        </linearGradient>
                        <linearGradient
                          id="heroLineGrad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#7c8cff" />
                          <stop offset="100%" stopColor="#66d9ff" />
                        </linearGradient>
                      </defs>
                      <path
                        className="hero-chart-area"
                        d="M0,124 C40,118 68,98 104,100 C144,102 176,72 214,78 C250,84 280,48 322,42 C354,38 386,28 420,20 L420,180 L0,180 Z"
                        fill="url(#heroAreaGrad)"
                      />
                      <path
                        className="hero-chart-line"
                        d="M0,124 C40,118 68,98 104,100 C144,102 176,72 214,78 C250,84 280,48 322,42 C354,38 386,28 420,20"
                      />
                    </svg>
                  </div>

                  <div className="hero-bottom-panels">
                    <div className="bars" aria-hidden="true">
                      {dashboardRevenueBars.slice(0, 6).map((height, index) => (
                        <span
                          key={`${height}-${index}`}
                          style={{
                            height: `${height}px`,
                            animationDelay: `${index * 0.08}s`,
                          }}
                        />
                      ))}
                    </div>

                    <div className="hero-activity-panel">
                      <span className="hero-activity-title">
                        Последние обновления
                      </span>
                      <ul>
                        {heroPreviewFeed.map((item) => (
                          <li key={item}>
                            <BellDot size={14} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              className="hero-showcase-card hero-floating-card hero-floating-card-a"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              <Users size={18} />
              <div>
                <strong>Новый клиент</strong>
                <span>CRM обновлена</span>
              </div>
            </motion.div>

            <motion.div
              className="hero-showcase-card hero-floating-card hero-floating-card-b"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.6,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.25,
              }}
            >
              <CreditCard size={18} />
              <div>
                <strong>Выручка</strong>
                <span>Данные обновлены</span>
              </div>
            </motion.div>

            <motion.div
              className="hero-showcase-card hero-floating-card hero-floating-card-c"
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.35,
              }}
            >
              <BellDot size={18} />
              <div>
                <strong>Заявки</strong>
                <span>Все под контролем</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="container soft-feature-row">
        {integrationCards.map((item, index) => (
          <motion.article
            key={item.title}
            className="soft-feature-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <div className="soft-feature-icon">
              <item.Icon size={22} />
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </motion.article>
        ))}
      </section>

      <section id="workspace" className="container soft-workspace-section">
        <div className="soft-workspace-copy">
          <span className="section-kicker">Единая система для бизнеса</span>
          <h2>Управляйте операциями и ключевыми показателями из одного окна</h2>
          <p>
            Интерфейс для ежедневной работы команды и руководителя: заявки,
            продажи, клиенты, склад и отчеты в единой логике и с единым ритмом.
          </p>

          <ul className="soft-check-list">
            {modules.map((item) => (
              <li key={item.title}>
                <Check size={16} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.points.join(" • ")}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="soft-step-row">
            {processSteps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container faq-section" aria-labelledby="faq-title">
        <h2 id="faq-title">
          Вопросы, которые чаще всего задают перед подключением
        </h2>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="connect" className="container soft-cta-section">
        <div className="soft-cta-shell">
          <span className="section-kicker">
            Готовы автоматизировать бизнес?
          </span>
          <h2>Оставьте заявку и получите решение под ваш формат бизнеса</h2>
          <p>
            Покажем, как собрать продажи, склад, CRM и отчетность в одну
            понятную систему именно под ваш сценарий работы.
          </p>

          <div className="soft-cta-actions">
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
              onClick={openLeadModal}
            >
              Получить консультацию
            </motion.button>
          </div>

          <div className="soft-logo-row">
            {trustItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="soft-audience-row">
            {audiences.map((item) => (
              <span key={item.title}>
                <item.Icon size={16} />
                {item.title}
              </span>
            ))}
          </div>
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
              transition={{ duration: 0.22 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
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
                  <p className="form-status form-status-error">{submitError}</p>
                ) : null}
                {submitSuccess ? (
                  <p className="form-status form-status-success">
                    {submitSuccess}
                  </p>
                ) : null}

                <div className="lead-form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
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
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
