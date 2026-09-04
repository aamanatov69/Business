"use client";

import { useCallback, useEffect, useState } from "react";

const TOKEN_STORAGE_KEY = "rosta_admin_token";

type ClientStatus = "active" | "disabled" | "error";

type ClientSummary = {
  id: string;
  name: string;
  status: ClientStatus;
  apiKeyMasked: string;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
  counts: {
    tradepoints: number;
    warehouses: number;
    items: number;
    stocks: number;
  };
};

type Tradepoint = {
  id: string;
  rostaTradepointId: string;
  name: string;
  warehouseId: string | null;
};

type Warehouse = {
  id: string;
  rostaWarehouseId: string;
  name: string;
  tradepointId: string | null;
};

type ClientDetail = ClientSummary & {
  tradepoints: Tradepoint[];
  warehouses: Warehouse[];
};

type SyncLog = {
  id: string;
  type: "FULL_SYNC" | "STOCK_SYNC";
  status: "running" | "success" | "error";
  startedAt: string;
  finishedAt: string | null;
  itemsProcessed: number;
  itemsUpdated: number;
  errorsCount: number;
  errorMessage: string | null;
};

const CONNECT_STEPS = [
  "Проверяем API Key…",
  "Получаем торговые точки…",
  "Получаем склады…",
  "Получаем товары…",
  "Настраиваем синхронизацию…",
];

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("ru-RU");
}

function statusBadge(status: ClientStatus): { label: string; className: string } {
  if (status === "active") {
    return { label: "🟢 Подключено", className: "rosta-badge rosta-badge-active" };
  }
  if (status === "error") {
    return { label: "🔴 Ошибка", className: "rosta-badge rosta-badge-error" };
  }
  return { label: "⚪ Отключено", className: "rosta-badge rosta-badge-disabled" };
}

async function apiFetch(token: string, path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "x-admin-token": token,
      "Content-Type": "application/json",
    },
  });

  const body = await response.json().catch(() => ({ ok: false, message: "Invalid server response." }));
  return { status: response.status, body };
}

export function RostaAdminClient() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [connectName, setConnectName] = useState("");
  const [connectApiKey, setConnectApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState<string | null>(null);
  const [connectResult, setConnectResult] = useState<
    { ok: true; message: string } | { ok: false; message: string } | null
  >(null);

  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [detailByClient, setDetailByClient] = useState<Record<string, ClientDetail>>({});
  const [logsByClient, setLogsByClient] = useState<Record<string, SyncLog[]>>({});
  const [busyClientId, setBusyClientId] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setToken(stored);
    }
  }, []);

  const loadClients = useCallback(
    async (activeToken: string) => {
      const { status, body } = await apiFetch(activeToken, "/api/clients");

      if (status === 401) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUnlockError("Токен недействителен. Введите его снова.");
        return;
      }

      if (!body.ok) {
        setListError(body.message ?? "Не удалось загрузить список клиентов.");
        return;
      }

      setListError(null);
      setClients(body.data as ClientSummary[]);
    },
    [],
  );

  useEffect(() => {
    if (token) {
      void loadClients(token);
    }
  }, [token, loadClients]);

  function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) return;

    window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
    setUnlockError(null);
    setToken(trimmed);
  }

  function handleLock() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setClients(null);
  }

  async function handleConnect(event: React.FormEvent) {
    event.preventDefault();
    if (!token || connecting) return;

    const apiKey = connectApiKey.trim();
    if (!apiKey) {
      setConnectResult({ ok: false, message: "Введите API Key." });
      return;
    }

    setConnecting(true);
    setConnectResult(null);

    let stepIndex = 0;
    setConnectStep(CONNECT_STEPS[0]);
    const stepTimer = window.setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, CONNECT_STEPS.length - 1);
      setConnectStep(CONNECT_STEPS[stepIndex]);
    }, 900);

    try {
      const { body } = await apiFetch(token, "/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: connectName.trim() || undefined, apiKey }),
      });

      window.clearInterval(stepTimer);

      if (!body.ok) {
        setConnectResult({ ok: false, message: body.message ?? "Не удалось подключиться к Rosta." });
        setConnectStep(null);
        return;
      }

      setConnectStep("Готово");
      setConnectResult({
        ok: true,
        message: `Подключено: ${body.data.tradepoints} точек, ${body.data.warehouses} складов, ${body.data.items} товаров.`,
      });
      setConnectName("");
      setConnectApiKey("");
      await loadClients(token);
    } catch {
      window.clearInterval(stepTimer);
      setConnectResult({ ok: false, message: "Сетевая ошибка при подключении к Rosta." });
      setConnectStep(null);
    } finally {
      setConnecting(false);
    }
  }

  async function loadDetail(clientId: string) {
    if (!token) return;
    const [detailRes, logsRes] = await Promise.all([
      apiFetch(token, `/api/clients/${clientId}`),
      apiFetch(token, `/api/clients/${clientId}/logs?limit=10`),
    ]);

    if (detailRes.body.ok) {
      setDetailByClient((prev) => ({ ...prev, [clientId]: detailRes.body.data }));
    }
    if (logsRes.body.ok) {
      setLogsByClient((prev) => ({ ...prev, [clientId]: logsRes.body.items }));
    }
  }

  function toggleExpand(clientId: string) {
    setExpandedClientId((current) => (current === clientId ? null : clientId));
    if (!detailByClient[clientId]) {
      void loadDetail(clientId);
    }
  }

  async function handleSyncNow(clientId: string) {
    if (!token) return;
    setBusyClientId(clientId);
    try {
      await apiFetch(token, `/api/clients/${clientId}/rosta/sync`, { method: "POST" });
      await loadClients(token);
      await loadDetail(clientId);
    } finally {
      setBusyClientId(null);
    }
  }

  async function handleDisconnect(clientId: string) {
    if (!token) return;
    setBusyClientId(clientId);
    try {
      await apiFetch(token, `/api/clients/${clientId}`, { method: "DELETE" });
      await loadClients(token);
    } finally {
      setBusyClientId(null);
    }
  }

  if (!token) {
    return (
      <div className="rosta-admin-lock">
        <div className="rosta-admin-card">
          <h1 className="rosta-admin-title">Rosta — админ-панель</h1>
          <p className="rosta-admin-subtitle">Введите административный токен для доступа.</p>
          <form onSubmit={handleUnlock} className="rosta-admin-form">
            <input
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="Admin token"
              className="rosta-admin-input"
            />
            <button type="submit" className="rosta-admin-button rosta-admin-button-primary">
              Войти
            </button>
          </form>
          {unlockError ? <p className="rosta-admin-error">{unlockError}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rosta-admin-wrap">
      <div className="rosta-admin-header">
        <h1 className="rosta-admin-title">Rosta</h1>
        <button type="button" onClick={handleLock} className="rosta-admin-button rosta-admin-button-ghost">
          Выйти
        </button>
      </div>

      <div className="rosta-admin-card">
        <h2 className="rosta-admin-section-title">Подключить нового клиента</h2>
        <p className="rosta-admin-subtitle">
          Введите название (необязательно) и Rosta API Key. Всё остальное — точки, склады, товары и
          остатки — система получит автоматически.
        </p>
        <form onSubmit={handleConnect} className="rosta-admin-form">
          <input
            type="text"
            value={connectName}
            onChange={(event) => setConnectName(event.target.value)}
            placeholder="Название клиента (необязательно)"
            className="rosta-admin-input"
            disabled={connecting}
          />
          <input
            type="password"
            value={connectApiKey}
            onChange={(event) => setConnectApiKey(event.target.value)}
            placeholder="Rosta API Key"
            className="rosta-admin-input"
            disabled={connecting}
          />
          <button
            type="submit"
            className="rosta-admin-button rosta-admin-button-primary"
            disabled={connecting}
          >
            {connecting ? "Подключаем…" : "Подключить Rosta"}
          </button>
        </form>
        {connectStep ? <p className="rosta-admin-progress">{connectStep}</p> : null}
        {connectResult ? (
          <p className={connectResult.ok ? "rosta-admin-success" : "rosta-admin-error"}>
            {connectResult.ok ? "✅ " : "❌ "}
            {connectResult.message}
          </p>
        ) : null}
      </div>

      <div className="rosta-admin-card">
        <h2 className="rosta-admin-section-title">Подключённые клиенты</h2>
        {listError ? <p className="rosta-admin-error">{listError}</p> : null}
        {!clients ? (
          <p className="rosta-admin-subtitle">Загрузка…</p>
        ) : clients.length === 0 ? (
          <p className="rosta-admin-subtitle">Пока нет подключённых клиентов.</p>
        ) : (
          <div className="rosta-client-list">
            {clients.map((client) => {
              const badge = statusBadge(client.status);
              const detail = detailByClient[client.id];
              const logs = logsByClient[client.id];
              const isExpanded = expandedClientId === client.id;
              const isBusy = busyClientId === client.id;

              return (
                <div key={client.id} className="rosta-client-card">
                  <div className="rosta-client-card-head">
                    <div>
                      <p className="rosta-client-name">{client.name}</p>
                      <p className="rosta-client-key">{client.apiKeyMasked}</p>
                    </div>
                    <span className={badge.className}>{badge.label}</span>
                  </div>

                  <div className="rosta-client-counts">
                    <span>Точек: {client.counts.tradepoints}</span>
                    <span>Складов: {client.counts.warehouses}</span>
                    <span>Товаров: {client.counts.items}</span>
                    <span>Остатков: {client.counts.stocks}</span>
                  </div>

                  <p className="rosta-client-meta">
                    Последняя синхронизация: {formatDate(client.lastSyncAt)}
                  </p>
                  {client.lastError ? (
                    <p className="rosta-admin-error">Ошибка: {client.lastError}</p>
                  ) : null}

                  <div className="rosta-client-actions">
                    <button
                      type="button"
                      onClick={() => handleSyncNow(client.id)}
                      disabled={isBusy || client.status === "disabled"}
                      className="rosta-admin-button rosta-admin-button-primary"
                    >
                      {isBusy ? "Синхронизация…" : "Синхронизировать сейчас"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(client.id)}
                      className="rosta-admin-button rosta-admin-button-ghost"
                    >
                      {isExpanded ? "Скрыть детали" : "Подробнее"}
                    </button>
                    {client.status !== "disabled" ? (
                      <button
                        type="button"
                        onClick={() => handleDisconnect(client.id)}
                        disabled={isBusy}
                        className="rosta-admin-button rosta-admin-button-danger"
                      >
                        Отключить
                      </button>
                    ) : null}
                  </div>

                  {isExpanded ? (
                    <div className="rosta-client-detail">
                      <h3 className="rosta-admin-section-subtitle">Торговые точки и склады</h3>
                      {detail ? (
                        detail.tradepoints.length === 0 ? (
                          <p className="rosta-admin-subtitle">Нет данных.</p>
                        ) : (
                          <ul className="rosta-tree">
                            {detail.tradepoints.map((tradepoint) => (
                              <li key={tradepoint.id}>
                                {tradepoint.name}
                                <ul>
                                  {detail.warehouses
                                    .filter(
                                      (warehouse) =>
                                        warehouse.tradepointId === tradepoint.rostaTradepointId,
                                    )
                                    .map((warehouse) => (
                                      <li key={warehouse.id}>{warehouse.name}</li>
                                    ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        )
                      ) : (
                        <p className="rosta-admin-subtitle">Загрузка…</p>
                      )}

                      <h3 className="rosta-admin-section-subtitle">История синхронизации</h3>
                      {logs && logs.length > 0 ? (
                        <table className="rosta-log-table">
                          <thead>
                            <tr>
                              <th>Тип</th>
                              <th>Статус</th>
                              <th>Начало</th>
                              <th>Обработано</th>
                              <th>Ошибка</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.map((log) => (
                              <tr key={log.id}>
                                <td>{log.type}</td>
                                <td>{log.status}</td>
                                <td>{formatDate(log.startedAt)}</td>
                                <td>{log.itemsProcessed}</td>
                                <td>{log.errorMessage ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="rosta-admin-subtitle">Синхронизаций ещё не было.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
