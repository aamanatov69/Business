"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BarChart3, Boxes, Warehouse } from "lucide-react";
import {
  OTHER_BUSINESS_TYPE,
  amocrmGallery,
  businessTypes,
  equipmentCatalogDefaults,
  equipmentPdfPath,
  faqItems,
  featureCards,
  foodBusinessOptions,
  heroAnimatedSegments,
  heroBoardGallery,
  heroStats,
  industries,
  nextMarketGallery,
  products,
  retailBusinessOptions,
  rostaGallery,
  servicesBusinessOptions,
  topNavItems,
  trustedOrganizations,
} from "@/lib/home/content";
import type { HomeClientProps } from "@/lib/home/types";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

type EquipmentStockRow = {
  id: string;
  code: string;
  title: string;
  description: string;
  shortLabel: string;
  itemCount: number;
};

type EquipmentCatalogProduct = {
  id: string;
  rostaItemId: string;
  name: string;
  sku: string | null;
  article: string | null;
  barcode: string | null;
  category: string | null;
  image: string | null;
  price: number | null;
  unit: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  quantity: number | null;
  sourceField: string | null;
  updatedAt: string | null;
  showOnHome: boolean;
};

type EquipmentWarehouse = {
  id: string;
  rostaWarehouseId: string;
  name: string;
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

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

function toRenderableImageSrc(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return encodeURI(trimmed);
    }

    if (trimmed.startsWith("//")) {
      return encodeURI(`https:${trimmed}`);
    }

    if (trimmed.startsWith("/")) {
      return encodeURI(trimmed);
    }

    return encodeURI(`https://${trimmed}`);
  } catch {
    return null;
  }
}

export default function HomeClient({ seoHubGroups = [] }: HomeClientProps) {
  const showTrustedBrandsSection = false;
  const industriesSectionRef = useRef<HTMLElement | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEquipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [isAmocrmModalOpen, setAmocrmModalOpen] = useState(false);
  const [amocrmSlideIndex, setAmocrmSlideIndex] = useState(0);
  const [isRostaModalOpen, setRostaModalOpen] = useState(false);
  const [rostaSlideIndex, setRostaSlideIndex] = useState(0);
  const [isNextMarketModalOpen, setNextMarketModalOpen] = useState(false);
  const [nextMarketSlideIndex, setNextMarketSlideIndex] = useState(0);
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
  const [equipmentRows, setEquipmentRows] = useState<EquipmentStockRow[]>([]);
  const [equipmentProducts, setEquipmentProducts] = useState<
    EquipmentCatalogProduct[]
  >([]);
  const [equipmentWarehouses, setEquipmentWarehouses] = useState<
    EquipmentWarehouse[]
  >([]);
  const [equipmentPagination, setEquipmentPagination] = useState<PaginationState>({
    page: 1,
    limit: 24,
    total: 0,
    pages: 1,
  });
  const [isEquipmentLoading, setEquipmentLoading] = useState(false);
  const [isEquipmentSyncing, setEquipmentSyncing] = useState(false);
  const [equipmentError, setEquipmentError] = useState("");
  const [equipmentWarning, setEquipmentWarning] = useState("");
  const [equipmentClientId, setEquipmentClientId] = useState<string | null>(null);
  const [equipmentClientIdOverride, setEquipmentClientIdOverride] = useState("");
  const [equipmentCategory, setEquipmentCategory] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [equipmentWarehouseId, setEquipmentWarehouseId] = useState("");
  const [equipmentRefreshKey, setEquipmentRefreshKey] = useState(0);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const amocrmTouchStartXRef = useRef<number | null>(null);
  const rostaTouchStartXRef = useRef<number | null>(null);
  const nextMarketTouchStartXRef = useRef<number | null>(null);
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
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get("category")?.trim().toUpperCase() || "";
    const initialSearch = params.get("search")?.trim() || "";
    const initialWarehouse = params.get("warehouseId")?.trim() || "";
    const initialClientId = params.get("clientId")?.trim() || "";
    const initialPageRaw = Number(params.get("page"));
    const initialPage =
      Number.isFinite(initialPageRaw) && initialPageRaw > 0
        ? Math.floor(initialPageRaw)
        : 1;

    setEquipmentCategory(initialCategory);
    setEquipmentSearch(initialSearch);
    setEquipmentWarehouseId(initialWarehouse);
    setEquipmentClientIdOverride(initialClientId);
    setEquipmentPagination((previous) => ({
      ...previous,
      page: initialPage,
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        setEquipmentRefreshKey((previous) => previous + 1);
      }
    }, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadEquipmentCatalog = async () => {
      try {
        setEquipmentLoading(true);
        setEquipmentError("");

        const params = new URLSearchParams();
        params.set("page", String(equipmentPagination.page));
        params.set("limit", String(equipmentPagination.limit));

        if (equipmentCategory) {
          params.set("category", equipmentCategory);
        }
        if (equipmentSearch) {
          params.set("search", equipmentSearch);
        }
        if (equipmentWarehouseId) {
          params.set("warehouseId", equipmentWarehouseId);
        }
        if (equipmentClientIdOverride) {
          params.set("clientId", equipmentClientIdOverride);
        }

        const response = await fetch(`/api/equipment/catalog?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => null)) as
          | {
              ok?: boolean;
              message?: string;
              data?: {
                clientId?: string;
                warning?: string | null;
                activeWarehouseId?: string | null;
                warehouses?: EquipmentWarehouse[];
                categories?: EquipmentStockRow[];
                items?: EquipmentCatalogProduct[];
                pagination?: PaginationState;
              };
            }
          | null;

        if (!response.ok || !payload?.ok || !payload.data) {
          throw new Error(payload?.message ?? "Не удалось загрузить данные");
        }

        setEquipmentClientId(payload.data.clientId ?? null);
        setEquipmentWarning(payload.data.warning ?? "");
        setEquipmentRows(
          Array.isArray(payload.data.categories) ? payload.data.categories : [],
        );
        setEquipmentProducts(Array.isArray(payload.data.items) ? payload.data.items : []);
        setEquipmentWarehouses(
          Array.isArray(payload.data.warehouses) ? payload.data.warehouses : [],
        );

        if (payload.data.activeWarehouseId) {
          setEquipmentWarehouseId(payload.data.activeWarehouseId);
        }

        if (payload.data.pagination) {
          setEquipmentPagination((previous) => ({
            ...previous,
            page: payload.data?.pagination?.page ?? previous.page,
            limit: payload.data?.pagination?.limit ?? previous.limit,
            total: payload.data?.pagination?.total ?? previous.total,
            pages: payload.data?.pagination?.pages ?? previous.pages,
          }));
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setEquipmentError(
          error instanceof Error ? error.message : "Не удалось загрузить данные",
        );
      } finally {
        setEquipmentLoading(false);
      }
    };

    void loadEquipmentCatalog();

    return () => {
      controller.abort();
    };
  }, [
    equipmentCategory,
    equipmentPagination.limit,
    equipmentPagination.page,
    equipmentRefreshKey,
    equipmentClientIdOverride,
    equipmentSearch,
    equipmentWarehouseId,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (equipmentCategory) {
      params.set("category", equipmentCategory);
    } else {
      params.delete("category");
    }

    if (equipmentSearch) {
      params.set("search", equipmentSearch);
    } else {
      params.delete("search");
    }

    if (equipmentWarehouseId) {
      params.set("warehouseId", equipmentWarehouseId);
    } else {
      params.delete("warehouseId");
    }

    if (equipmentPagination.page > 1) {
      params.set("page", String(equipmentPagination.page));
    } else {
      params.delete("page");
    }

    if (equipmentClientIdOverride) {
      params.set("clientId", equipmentClientIdOverride);
    } else {
      params.delete("clientId");
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
  }, [
    equipmentCategory,
    equipmentPagination.page,
    equipmentSearch,
    equipmentWarehouseId,
    equipmentClientIdOverride,
  ]);

  const onEquipmentSync = async () => {
    try {
      setEquipmentSyncing(true);
      setEquipmentError("");

      const syncParams = new URLSearchParams();
      if (equipmentClientIdOverride) {
        syncParams.set("clientId", equipmentClientIdOverride);
      }

      const response = await fetch(
        `/api/equipment/sync${syncParams.toString() ? `?${syncParams.toString()}` : ""}`,
        {
        method: "POST",
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Не удалось выполнить синхронизацию");
      }

      setEquipmentRefreshKey((previous) => previous + 1);
    } catch (error) {
      setEquipmentError(
        error instanceof Error ? error.message : "Не удалось выполнить синхронизацию",
      );
    } finally {
      setEquipmentSyncing(false);
    }
  };

  const formatStockUpdatedAt = (value: string | null) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("ru-RU");
  };

  const formatCatalogPrice = (value: number | null) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "Цена не указана";
    }

    return `${value.toLocaleString("ru-RU")} тнг.`;
  };

  const catalogCategories =
    equipmentRows.length > 0
      ? equipmentRows
      : equipmentCatalogDefaults.map((item) => ({
          id: item.id,
          code: item.shortLabel,
          title: item.title,
          description: item.description,
          shortLabel: item.shortLabel,
          itemCount: 0,
        }));


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
    if (
      !isModalOpen &&
      !isEquipmentModalOpen &&
      !isAmocrmModalOpen &&
      !isRostaModalOpen &&
      !isNextMarketModalOpen
    ) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
        setEquipmentModalOpen(false);
        setAmocrmModalOpen(false);
        setRostaModalOpen(false);
        setNextMarketModalOpen(false);
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [
    isAmocrmModalOpen,
    isEquipmentModalOpen,
    isModalOpen,
    isNextMarketModalOpen,
    isRostaModalOpen,
  ]);

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
    if (window.matchMedia("(max-width: 768px)").matches) {
      window.open(
        `${equipmentPdfPath}#toolbar=1&navpanes=0&view=FitH`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    setEquipmentModalOpen(true);
  };

  const closeEquipmentModal = () => {
    setEquipmentModalOpen(false);
  };

  const openAmocrmModal = () => {
    setAmocrmSlideIndex(0);
    setAmocrmModalOpen(true);
  };

  const closeAmocrmModal = () => {
    setAmocrmModalOpen(false);
  };

  const shiftAmocrmSlide = (step: number) => {
    setAmocrmSlideIndex((previous) => {
      const total = amocrmGallery.length;
      return (previous + step + total) % total;
    });
  };

  const handleAmocrmSlideDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    if (info.offset.x <= -60 || info.velocity.x <= -260) {
      shiftAmocrmSlide(1);
      return;
    }

    if (info.offset.x >= 60 || info.velocity.x >= 260) {
      shiftAmocrmSlide(-1);
    }
  };

  const handleAmocrmTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    amocrmTouchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleAmocrmTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = amocrmTouchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;

    amocrmTouchStartXRef.current = null;

    if (startX === null || endX === null) {
      return;
    }

    const deltaX = endX - startX;

    if (deltaX <= -48) {
      shiftAmocrmSlide(1);
      return;
    }

    if (deltaX >= 48) {
      shiftAmocrmSlide(-1);
    }
  };

  const openRostaModal = () => {
    setRostaSlideIndex(0);
    setRostaModalOpen(true);
  };

  const closeRostaModal = () => {
    setRostaModalOpen(false);
  };

  const shiftRostaSlide = (step: number) => {
    setRostaSlideIndex((previous) => {
      const total = rostaGallery.length;
      return (previous + step + total) % total;
    });
  };

  const handleRostaSlideDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    if (info.offset.x <= -60 || info.velocity.x <= -260) {
      shiftRostaSlide(1);
      return;
    }

    if (info.offset.x >= 60 || info.velocity.x >= 260) {
      shiftRostaSlide(-1);
    }
  };

  const handleRostaTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    rostaTouchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleRostaTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = rostaTouchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;

    rostaTouchStartXRef.current = null;

    if (startX === null || endX === null) {
      return;
    }

    const deltaX = endX - startX;

    if (deltaX <= -48) {
      shiftRostaSlide(1);
      return;
    }

    if (deltaX >= 48) {
      shiftRostaSlide(-1);
    }
  };

  const openNextMarketModal = () => {
    setNextMarketSlideIndex(0);
    setNextMarketModalOpen(true);
  };

  const closeNextMarketModal = () => {
    setNextMarketModalOpen(false);
  };

  const shiftNextMarketSlide = (step: number) => {
    setNextMarketSlideIndex((previous) => {
      const total = nextMarketGallery.length;
      return (previous + step + total) % total;
    });
  };

  const handleNextMarketSlideDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    if (info.offset.x <= -60 || info.velocity.x <= -260) {
      shiftNextMarketSlide(1);
      return;
    }

    if (info.offset.x >= 60 || info.velocity.x >= 260) {
      shiftNextMarketSlide(-1);
    }
  };

  const handleNextMarketTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    nextMarketTouchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleNextMarketTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = nextMarketTouchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;

    nextMarketTouchStartXRef.current = null;

    if (startX === null || endX === null) {
      return;
    }

    const deltaX = endX - startX;

    if (deltaX <= -48) {
      shiftNextMarketSlide(1);
      return;
    }

    if (deltaX >= 48) {
      shiftNextMarketSlide(-1);
    }
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
              priority
              fetchPriority="high"
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
              priority
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
              ) : item.title === "AMOCRM+Разработка сайтов" ? (
                <button
                  type="button"
                  className="product-card product-card-trigger"
                  onClick={openAmocrmModal}
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
              ) : item.title === "Программа Rosta" ? (
                <button
                  type="button"
                  className="product-card product-card-trigger"
                  onClick={openRostaModal}
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
              ) : item.title === "Программа Next Market" ? (
                <button
                  type="button"
                  className="product-card product-card-trigger"
                  onClick={openNextMarketModal}
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

        <div className="catalog-market" aria-labelledby="catalog-market-title">
          <h3 id="catalog-market-title">Каталог товаров</h3>

          <div className="catalog-market-layout">
            <aside className="catalog-market-sidebar" aria-label="Фильтры каталога">
              <p className="catalog-market-filter-title">Категории</p>
              <div className="catalog-market-category-list">
                <button
                  type="button"
                  className={`catalog-market-category ${
                    !equipmentCategory ? "catalog-market-category-active" : ""
                  }`}
                  onClick={() => {
                    setEquipmentCategory("");
                    setEquipmentPagination((previous) => ({
                      ...previous,
                      page: 1,
                    }));
                  }}
                >
                  Все
                </button>

                {catalogCategories.map((item) => {
                  const isActive = equipmentCategory === item.shortLabel;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`catalog-market-category ${
                        isActive ? "catalog-market-category-active" : ""
                      }`}
                      onClick={() => {
                        setEquipmentCategory(isActive ? "" : item.shortLabel);
                        setEquipmentPagination((previous) => ({
                          ...previous,
                          page: 1,
                        }));
                      }}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>

            </aside>

            <div className="catalog-market-main">
              {equipmentError ? (
                <p className="catalog-market-status catalog-market-status-error">
                  {equipmentError}
                </p>
              ) : null}

              {equipmentWarning ? (
                <p className="catalog-market-status">{equipmentWarning}</p>
              ) : null}

              {isEquipmentLoading ? (
                <p className="catalog-market-status" aria-live="polite">
                  Загрузка каталога...
                </p>
              ) : null}

              <div className="catalog-market-grid" role="list">
                {equipmentProducts.filter((row) => row.showOnHome).length > 0
                  ? equipmentProducts
                      .filter((row) => row.showOnHome)
                      .map((row) => (
                      <article
                        key={row.id}
                        className="catalog-market-card"
                        role="listitem"
                      >
                        <div className="catalog-market-image-wrap">
                          {toRenderableImageSrc(row.image) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={toRenderableImageSrc(row.image) || ""}
                              alt={row.name}
                              className="catalog-market-image"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              className="catalog-market-image catalog-market-image-fallback"
                              aria-hidden="true"
                            >
                              {row.category || "ITEM"}
                            </div>
                          )}
                        </div>
                        <div className="catalog-market-card-body">
                          <h4>{row.name}</h4>
                          <p>
                            Остаток на складе: {typeof row.quantity === "number" ? row.quantity : 0}{" "}
                            {row.unit || "шт"}
                          </p>
                          <p>
                            Цена: {typeof row.price === "number" ? `${row.price.toLocaleString("ru-RU")} сом` : "Цена не указана"}
                          </p>
                        </div>
                      </article>
                    ))
                  : (
                    <p className="catalog-market-status">
                      Нет карточек для главной. Отметьте товары в /foto через галочку.
                    </p>
                  )}
              </div>
            </div>
          </div>
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

      {showTrustedBrandsSection ? (
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
                    <Image
                      src={item.logoSrc}
                      alt={item.name}
                      className="trusted-logo-image"
                      width={160}
                      height={40}
                      loading="lazy"
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
                    <Image
                      src={item.logoSrc}
                      alt=""
                      className="trusted-logo-image"
                      width={160}
                      height={40}
                      loading="lazy"
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
      ) : null}

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

        {isAmocrmModalOpen ? (
          <motion.div
            className="lead-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAmocrmModal}
          >
            <motion.div
              className="lead-modal equipment-modal next-market-modal"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="amocrm-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="equipment-modal-close"
                onClick={closeAmocrmModal}
                aria-label="Закрыть окно"
              >
                ×
              </button>
              <h3 id="amocrm-modal-title">AMOCRM + Разработка сайтов</h3>
              <div
                className="next-market-slider"
                aria-label="Слайдер фотографий AMOCRM и разработки сайтов"
              >
                <button
                  type="button"
                  className="next-market-slider-nav"
                  onClick={() => shiftAmocrmSlide(-1)}
                  aria-label="Предыдущее фото"
                >
                  ←
                </button>
                <div
                  className="next-market-slider-viewport"
                  onTouchStart={handleAmocrmTouchStart}
                  onTouchEnd={handleAmocrmTouchEnd}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.figure
                      key={`${amocrmGallery[amocrmSlideIndex].src}-${amocrmSlideIndex}`}
                      className="next-market-gallery-item"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.08}
                      dragMomentum={false}
                      onDragEnd={handleAmocrmSlideDragEnd}
                    >
                      <Image
                        src={amocrmGallery[amocrmSlideIndex].src}
                        alt={amocrmGallery[amocrmSlideIndex].alt}
                        width={1200}
                        height={800}
                        className="next-market-gallery-image"
                        sizes="(max-width: 760px) 100vw, 70vw"
                        priority
                      />
                    </motion.figure>
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  className="next-market-slider-nav"
                  onClick={() => shiftAmocrmSlide(1)}
                  aria-label="Следующее фото"
                >
                  →
                </button>
              </div>
              <div className="next-market-slider-status" aria-live="polite">
                {amocrmSlideIndex + 1} / {amocrmGallery.length}
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {isRostaModalOpen ? (
          <motion.div
            className="lead-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeRostaModal}
          >
            <motion.div
              className="lead-modal equipment-modal next-market-modal"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="rosta-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="equipment-modal-close"
                onClick={closeRostaModal}
                aria-label="Закрыть окно"
              >
                ×
              </button>
              <h3 id="rosta-modal-title">Программа Rosta</h3>
              <div
                className="next-market-slider"
                aria-label="Слайдер фотографий программы Rosta"
              >
                <button
                  type="button"
                  className="next-market-slider-nav"
                  onClick={() => shiftRostaSlide(-1)}
                  aria-label="Предыдущее фото"
                >
                  ←
                </button>
                <div
                  className="next-market-slider-viewport"
                  onTouchStart={handleRostaTouchStart}
                  onTouchEnd={handleRostaTouchEnd}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.figure
                      key={`${rostaGallery[rostaSlideIndex].src}-${rostaSlideIndex}`}
                      className="next-market-gallery-item"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.08}
                      dragMomentum={false}
                      onDragEnd={handleRostaSlideDragEnd}
                    >
                      <Image
                        src={rostaGallery[rostaSlideIndex].src}
                        alt={rostaGallery[rostaSlideIndex].alt}
                        width={1200}
                        height={800}
                        className="next-market-gallery-image"
                        sizes="(max-width: 760px) 100vw, 70vw"
                        priority
                      />
                    </motion.figure>
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  className="next-market-slider-nav"
                  onClick={() => shiftRostaSlide(1)}
                  aria-label="Следующее фото"
                >
                  →
                </button>
              </div>
              <div className="next-market-slider-status" aria-live="polite">
                {rostaSlideIndex + 1} / {rostaGallery.length}
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {isNextMarketModalOpen ? (
          <motion.div
            className="lead-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNextMarketModal}
          >
            <motion.div
              className="lead-modal equipment-modal next-market-modal"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="next-market-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="equipment-modal-close"
                onClick={closeNextMarketModal}
                aria-label="Закрыть окно"
              >
                ×
              </button>
              <h3 id="next-market-modal-title">Программа Next Market</h3>
              <div
                className="next-market-slider"
                aria-label="Слайдер фотографий программы Next Market"
              >
                <button
                  type="button"
                  className="next-market-slider-nav"
                  onClick={() => shiftNextMarketSlide(-1)}
                  aria-label="Предыдущее фото"
                >
                  ←
                </button>
                <div
                  className="next-market-slider-viewport"
                  onTouchStart={handleNextMarketTouchStart}
                  onTouchEnd={handleNextMarketTouchEnd}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.figure
                      key={`${nextMarketGallery[nextMarketSlideIndex].src}-${nextMarketSlideIndex}`}
                      className="next-market-gallery-item"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.08}
                      dragMomentum={false}
                      onDragEnd={handleNextMarketSlideDragEnd}
                    >
                      <Image
                        src={nextMarketGallery[nextMarketSlideIndex].src}
                        alt={nextMarketGallery[nextMarketSlideIndex].alt}
                        width={1200}
                        height={800}
                        className="next-market-gallery-image"
                        sizes="(max-width: 760px) 100vw, 70vw"
                        priority
                      />
                    </motion.figure>
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  className="next-market-slider-nav"
                  onClick={() => shiftNextMarketSlide(1)}
                  aria-label="Следующее фото"
                >
                  →
                </button>
              </div>
              <div className="next-market-slider-status" aria-live="polite">
                {nextMarketSlideIndex + 1} / {nextMarketGallery.length}
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
