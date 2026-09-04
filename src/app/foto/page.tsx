"use client";

import { equipmentCatalogDefaults } from "@/lib/home/content";
import { useEffect, useMemo, useState } from "react";

type FotoCard = {
  id: string;
  rostaItemId: string;
  name: string;
  image: string | null;
  customImage: string | null;
  category: string | null;
  showOnHome: boolean;
};

type FotoDraft = {
  image: string;
  category: string;
  showOnHome: boolean;
};

function toRenderableImageSrc(value: string | null | undefined): string | null {
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

export default function FotoAdminPage() {
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthorized, setAuthorized] = useState(false);
  const categoryOptions = equipmentCatalogDefaults.map((item) => ({
    value: item.shortLabel,
    label: item.title,
  }));

  const [cards, setCards] = useState<FotoCard[]>([]);
  const [drafts, setDrafts] = useState<Record<string, FotoDraft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/foto/cards", {
          method: "GET",
          cache: "no-store",
          headers: {
            "x-foto-username": authUsername,
            "x-foto-password": authPassword,
          },
        });

        const payload = (await response.json().catch(() => null)) as
          | {
              ok?: boolean;
              message?: string;
              items?: FotoCard[];
            }
          | null;

        if (!response.ok || !payload?.ok || !Array.isArray(payload.items)) {
          throw new Error(payload?.message || "Не удалось загрузить карточки");
        }

        setCards(payload.items);
        setDrafts(
          payload.items.reduce<Record<string, FotoDraft>>((acc, item) => {
            acc[item.id] = {
              image: item.customImage || item.image || "",
              category: item.category || "",
              showOnHome: Boolean(item.showOnHome),
            };
            return acc;
          }, {}),
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authPassword, authUsername, isAuthorized]);

  const filteredCards = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return cards;
    }

    return cards.filter((card) => card.name.toLowerCase().includes(needle));
  }, [cards, search]);

  const onSave = async (card: FotoCard) => {
    try {
      setSavingId(card.id);
      setError("");
      setSuccess("");

      const image = (drafts[card.id]?.image || "").trim();
      const category = (drafts[card.id]?.category || "").trim();
      const showOnHome = Boolean(drafts[card.id]?.showOnHome);

      const response = await fetch("/api/foto/cards", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-foto-username": authUsername,
          "x-foto-password": authPassword,
        },
        body: JSON.stringify({
          itemId: card.id,
          image,
          category,
          showOnHome,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: string;
            data?: {
              id: string;
              image: string | null;
              customImage: string | null;
              category: string | null;
              showOnHome: boolean;
            };
          }
        | null;

      if (!response.ok || !payload?.ok || !payload.data) {
        throw new Error(payload?.message || "Не удалось сохранить фото");
      }

      setCards((prev) =>
        prev.map((item) =>
          item.id === card.id
            ? {
                ...item,
                image: payload.data?.image || null,
                customImage: payload.data?.customImage || null,
                category: payload.data?.category || null,
                showOnHome: Boolean(payload.data?.showOnHome),
              }
            : item,
        ),
      );

      setSuccess(`Фото сохранено: ${card.name}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Ошибка сохранения");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="shell section foto-admin">
      {!isAuthorized ? (
        <div className="foto-login-card">
          <div className="section-head">
            <span className="tag">Защита</span>
            <h1>Вход в /foto</h1>
            <p>Для входа введите логин и пароль.</p>
          </div>

          <form
            className="foto-login-form"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              setSuccess("");
              setAuthorized(true);
            }}
          >
            <input
              type="text"
              value={authUsername}
              onChange={(event) => setAuthUsername(event.target.value)}
              placeholder="Логин"
              required
              autoComplete="off"
            />
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Пароль"
              required
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary">
              Войти
            </button>
          </form>

          {error ? <p className="foto-admin-status foto-admin-status-error">{error}</p> : null}
        </div>
      ) : null}

      {isAuthorized ? (
        <>
      <div className="section-head">
        <span className="tag">Админка</span>
        <h1>Управление фото карточек</h1>
        <p>Путь: /foto. Для каждой карточки можно заменить фото через ссылку на изображение.</p>
      </div>

      <div className="foto-admin-toolbar">
        <input
          type="search"
          placeholder="Поиск карточки"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Поиск карточки"
        />
      </div>

      {loading ? <p className="foto-admin-status">Загрузка...</p> : null}
      {error ? <p className="foto-admin-status foto-admin-status-error">{error}</p> : null}
      {success ? <p className="foto-admin-status foto-admin-status-success">{success}</p> : null}

      <div className="foto-admin-grid" role="list">
        {filteredCards.map((card) => (
          <article key={card.id} className="foto-admin-card" role="listitem">
            <div className="foto-admin-preview-wrap">
              {toRenderableImageSrc(drafts[card.id]?.image || card.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toRenderableImageSrc(drafts[card.id]?.image || card.image) || ""}
                  alt={card.name}
                  className="foto-admin-preview"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="foto-admin-preview foto-admin-preview-empty">NO IMAGE</div>
              )}
            </div>

            <h2>{card.name}</h2>
            <p>ID: {card.id}</p>

            <label>
              Ссылка на фото
              <input
                type="text"
                value={drafts[card.id]?.image || ""}
                onChange={(event) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [card.id]: {
                      image: event.target.value,
                      category: prev[card.id]?.category || "",
                      showOnHome: Boolean(prev[card.id]?.showOnHome),
                    },
                  }))
                }
                placeholder="https://... или /logos/..."
              />
            </label>

            <label>
              Категория
              <select
                value={drafts[card.id]?.category || ""}
                onChange={(event) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [card.id]: {
                      image: prev[card.id]?.image || "",
                      category: event.target.value,
                      showOnHome: Boolean(prev[card.id]?.showOnHome),
                    },
                  }))
                }
              >
                <option value="">Не выбрано</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="foto-admin-checkbox">
              <input
                type="checkbox"
                checked={Boolean(drafts[card.id]?.showOnHome)}
                onChange={(event) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [card.id]: {
                      image: prev[card.id]?.image || "",
                      category: prev[card.id]?.category || "",
                      showOnHome: event.target.checked,
                    },
                  }))
                }
              />
              Показывать карточку на главной
            </label>

            <div className="foto-admin-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onSave(card)}
                disabled={savingId === card.id}
              >
                {savingId === card.id ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setDrafts((prev) => ({
                    ...prev,
                    [card.id]: {
                      image: "",
                      category: prev[card.id]?.category || "",
                      showOnHome: Boolean(prev[card.id]?.showOnHome),
                    },
                  }))
                }
              >
                Очистить
              </button>
            </div>
          </article>
        ))}
      </div>
        </>
      ) : null}
    </main>
  );
}
