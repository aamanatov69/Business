type RostaRequestOptions = {
  method?: "GET" | "POST";
  path: string;
  query?: URLSearchParams;
  body?: unknown;
};

export class RostaRequestError extends Error {
  status: number;
  upstreamBody: string;
  retriable: boolean;

  constructor(message: string, status: number, upstreamBody: string, retriable: boolean) {
    super(message);
    this.name = "RostaRequestError";
    this.status = status;
    this.upstreamBody = upstreamBody;
    this.retriable = retriable;
  }
}

function getNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

const MAX_PAGES = 500;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function extractRows(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) {
    return [];
  }

  if (Array.isArray(root.data)) {
    return root.data;
  }

  const dataObj = asRecord(root.data);
  if (dataObj) {
    for (const key of ["items", "products", "result"]) {
      if (Array.isArray(dataObj[key])) {
        return dataObj[key] as unknown[];
      }
    }
  }

  return [];
}

function hasNextPage(payload: unknown, currentPage: number): boolean {
  const root = asRecord(payload);
  if (!root) {
    return false;
  }

  const links = asRecord(root.links);
  if (links && typeof links.next === "string" && links.next) {
    return true;
  }

  const meta = asRecord(root.meta);
  if (meta) {
    const lastPage = meta.last_page;
    if (typeof lastPage === "number") {
      return currentPage < lastPage;
    }
  }

  return false;
}

export class RostaClient {
  private readonly baseUrl = "https://next.rosta.kz/api/client/public";
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.timeoutMs = getNumberEnv("ROSTA_REQUEST_TIMEOUT_MS", 12000);
    this.maxRetries = getNumberEnv("ROSTA_MAX_RETRIES", 2);
  }

  private buildUrl(path: string, query?: URLSearchParams): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${this.baseUrl}${normalizedPath}`;

    if (!query || [...query.keys()].length === 0) {
      return url;
    }

    return `${url}?${query.toString()}`;
  }

  private async requestJson<T>(options: RostaRequestOptions): Promise<T> {
    const method = options.method ?? "GET";
    const url = this.buildUrl(options.path, options.query);

    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.maxRetries) {
      attempt += 1;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
          cache: "no-store",
        });

        const bodyText = await response.text();

        if (!response.ok) {
          const retriable = shouldRetryStatus(response.status);
          const error = new RostaRequestError(
            `Rosta request failed with status ${response.status}`,
            response.status,
            bodyText.slice(0, 1500),
            retriable,
          );

          if (!retriable || attempt > this.maxRetries) {
            throw error;
          }

          lastError = error;
          await wait(Math.min(8000, 500 * 2 ** (attempt - 1)));
          continue;
        }

        if (!bodyText) {
          return {} as T;
        }

        return JSON.parse(bodyText) as T;
      } catch (error) {
        const isAbortError =
          error instanceof Error && (error.name === "AbortError" || /aborted/i.test(error.message));

        if (error instanceof RostaRequestError) {
          throw error;
        }

        if (!isAbortError || attempt > this.maxRetries) {
          throw new RostaRequestError(
            isAbortError ? "Rosta request timeout" : "Rosta request failed",
            0,
            "",
            isAbortError,
          );
        }

        lastError = error;
        await wait(Math.min(8000, 500 * 2 ** (attempt - 1)));
      } finally {
        clearTimeout(timeout);
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new RostaRequestError("Rosta request failed", 0, "", false);
  }

  private async getPaginatedList(path: string): Promise<Record<string, unknown>> {
    const allRows: unknown[] = [];
    let page = 1;
    let lastPayload: Record<string, unknown> = {};

    while (page <= MAX_PAGES) {
      const query = new URLSearchParams({ page: String(page) });
      const payload = await this.requestJson<Record<string, unknown>>({
        method: "GET",
        path,
        query,
      });

      lastPayload = payload;
      const rows = extractRows(payload);
      allRows.push(...rows);

      if (!rows.length || !hasNextPage(payload, page)) {
        break;
      }

      page += 1;
    }

    return {
      ...lastPayload,
      data: allRows,
    };
  }

  async getTradepoints(): Promise<Record<string, unknown>> {
    return this.getPaginatedList("/tradepoints");
  }

  async getWarehouses(): Promise<Record<string, unknown>> {
    return this.getPaginatedList("/warehouses");
  }

  async getItems(): Promise<Record<string, unknown>> {
    return this.getPaginatedList("/items");
  }

  async getAttributes(): Promise<Record<string, unknown>> {
    return this.getPaginatedList("/items/attributes");
  }

  async getWarehouseStock(input: {
    warehouseId: string;
    date?: string;
    items: Array<{ item_id: string; attribute_id?: string }>;
  }): Promise<Record<string, unknown>> {
    return this.requestJson<Record<string, unknown>>({
      method: "POST",
      path: `/warehouses/${input.warehouseId}/items`,
      body: {
        ...(input.date ? { date: input.date } : {}),
        items: input.items,
      },
    });
  }
}
