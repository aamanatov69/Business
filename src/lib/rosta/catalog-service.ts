import { equipmentCatalogDefaults } from "@/lib/home/content";
import type {
  CatalogCategory,
  CatalogProduct,
  Pagination,
  RostaCategory,
  RostaProduct,
  RostaWarehouse,
} from "@/lib/rosta/catalog-types";
import {
  getAttributesByClient,
  getClientById,
  getItemsByClient,
  getStocksByClient,
  getStocksByClientAndWarehouse,
  getWarehousesByClient,
} from "@/lib/server/client-repository";
import {
  ensureFreshClientStock,
  refreshClientStock,
  sanitizeServiceError,
  syncClientRostaData,
} from "@/lib/rosta/service";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

type CatalogQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  warehouseId?: string;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function safePage(value?: number): number {
  return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : DEFAULT_PAGE;
}

function safeLimit(value?: number): number {
  if (!Number.isFinite(value) || !value || value <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.floor(value));
}

function inferFallbackCategoryCode(name: string): string | null {
  const lowered = normalizeText(name);

  if (/(^|\s)pos|касс|моноблок/.test(lowered)) {
    return "POS";
  }
  if (/скан|штрих/.test(lowered)) {
    return "SCAN";
  }
  if (/чек|принтер/.test(lowered)) {
    return "CHK";
  }
  if (/этикет|label/.test(lowered)) {
    return "LBL";
  }
  if (/вес/.test(lowered)) {
    return "WGT";
  }
  if (/ящик|cash/.test(lowered)) {
    return "CASH";
  }
  if (/тсд|терминал/.test(lowered)) {
    return "TSD";
  }
  if (/противокраж|рамк|метк/.test(lowered)) {
    return "SEC";
  }
  if (/термоэтик|этикетк/.test(lowered)) {
    return "THM";
  }
  if (/лента|чеков/.test(lowered)) {
    return "RCP";
  }
  if (/перифер|клавиат|мыш|адаптер|кабел|usb|хаб/.test(lowered)) {
    return "PRPH";
  }

  return null;
}

function resolveCategoryForItem(item: {
  category: string | null;
  name: string;
}): {
  code: string;
  title: string;
  description: string;
  shortLabel: string;
} {
  const explicitCategory = item.category?.trim();

  if (explicitCategory) {
    return {
      code: explicitCategory.toUpperCase(),
      title: explicitCategory,
      description: `Категория из данных клиента: ${explicitCategory}.`,
      shortLabel: explicitCategory.slice(0, 8).toUpperCase(),
    };
  }

  const fallbackCode = inferFallbackCategoryCode(item.name);
  if (fallbackCode) {
    const fallback = equipmentCatalogDefaults.find((entry) => entry.shortLabel === fallbackCode);
    if (fallback) {
      return {
        code: fallback.shortLabel,
        title: fallback.title,
        description: fallback.description,
        shortLabel: fallback.shortLabel,
      };
    }
  }

  return {
    code: "OTHER",
    title: "Прочее оборудование",
    description: "Товары без явной категории в Rosta.",
    shortLabel: "OTHER",
  };
}

function paginate<T>(items: T[], page: number, limit: number): { items: T[]; pagination: Pagination } {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const normalizedPage = Math.min(page, pages);
  const from = (normalizedPage - 1) * limit;

  return {
    items: items.slice(from, from + limit),
    pagination: {
      page: normalizedPage,
      limit,
      total,
      pages,
    },
  };
}

export async function ensureClientCatalogSeed(clientId: string): Promise<
  | { ok: true }
  | { ok: false; status: number; message: string }
> {
  const client = await getClientById(clientId);
  if (!client) {
    return { ok: false, status: 404, message: "Client not found." };
  }

  if (client.status === "disabled") {
    return { ok: false, status: 403, message: "Client is disabled." };
  }

  const warehouses = await getWarehousesByClient(clientId);
  const items = await getItemsByClient(clientId);

  // Some clients may have no attributes in Rosta; that must not trigger re-sync on each request.
  if (warehouses.length && items.length) {
    return { ok: true };
  }

  const syncResult = await syncClientRostaData(clientId);
  if (!syncResult.ok) {
    return {
      ok: false,
      status: syncResult.status,
      message: syncResult.message,
    };
  }

  return { ok: true };
}

export async function syncClientCatalog(clientId: string, date?: string): Promise<
  | {
      ok: true;
      data: {
        clientId: string;
        sync: {
          warehouses: number;
          items: number;
          attributes: number;
        };
        stockRefreshed: number;
        warning: string | null;
      };
    }
  | { ok: false; status: number; message: string }
> {
  const syncResult = await syncClientRostaData(clientId);
  if (!syncResult.ok) {
    return {
      ok: false,
      status: syncResult.status,
      message: syncResult.message,
    };
  }

  const stockResult = await refreshClientStock(clientId, { date });

  if (!stockResult.ok) {
    return {
      ok: false,
      status: stockResult.status,
      message: stockResult.message,
    };
  }

  return {
    ok: true,
    data: {
      clientId,
      sync: {
        warehouses: syncResult.data.warehouses,
        items: syncResult.data.items,
        attributes: syncResult.data.attributes,
      },
      stockRefreshed: stockResult.data.parsedStockRows,
      warning: stockResult.data.warning,
    },
  };
}

function toRostaWarehouses(
  rows: Awaited<ReturnType<typeof getWarehousesByClient>>,
): RostaWarehouse[] {
  return rows.map((row) => ({
    id: row.id,
    rostaWarehouseId: row.rostaWarehouseId,
    name: row.name,
    tradepointId: row.tradepointId,
    isActive: true,
    updatedAt: row.updatedAt,
  }));
}

function buildCatalogProducts(input: {
  items: Awaited<ReturnType<typeof getItemsByClient>>;
  attributes: Awaited<ReturnType<typeof getAttributesByClient>>;
  stockRows: Awaited<ReturnType<typeof getStocksByClient>>;
}): RostaProduct[] {
  const attrsByItem = new Map<string, Array<{ id: string; rostaAttributeId: string; name: string }>>();
  for (const attr of input.attributes) {
    const bucket = attrsByItem.get(attr.rostaItemId) ?? [];
    bucket.push({
      id: attr.id,
      rostaAttributeId: attr.rostaAttributeId,
      name: attr.name,
    });
    attrsByItem.set(attr.rostaItemId, bucket);
  }

  return input.items.map((item) => {
    const category = resolveCategoryForItem({
      category: item.manualCategory ?? item.category,
      name: item.name,
    });

    return {
      id: item.id,
      rostaItemId: item.rostaItemId,
      name: item.name,
      sku: item.sku,
      article: item.article,
      barcode: item.barcode,
      category: category.code,
      image: item.customImage || item.image,
      price: item.price,
      unit: item.unit,
      showOnHome: Boolean(item.showOnHome),
      attributes: attrsByItem.get(item.rostaItemId) ?? [],
    };
  });
}

function buildCategories(products: RostaProduct[]): RostaCategory[] {
  const byCode = new Map<string, RostaCategory>();

  for (const product of products) {
    const code = product.category?.trim().toUpperCase() || "OTHER";
    const fallback = equipmentCatalogDefaults.find((entry) => entry.shortLabel === code);
    const title = fallback?.title ?? product.category ?? "Прочее оборудование";
    const description =
      fallback?.description ??
      (product.category
        ? `Категория из данных клиента: ${product.category}.`
        : "Товары без явной категории в Rosta.");
    const shortLabel = fallback?.shortLabel ?? code.slice(0, 8);

    const current = byCode.get(code);
    if (current) {
      current.itemCount += 1;
      continue;
    }

    byCode.set(code, {
      id: code,
      code,
      title,
      description,
      shortLabel,
      itemCount: 1,
    });
  }

  return [...byCode.values()].sort((a, b) => a.title.localeCompare(b.title, "ru"));
}

function toCatalogProducts(input: {
  products: RostaProduct[];
  stocks: Awaited<ReturnType<typeof getStocksByClient>>;
}): CatalogProduct[] {
  const stockByItem = new Map<
    string,
    { quantity: number; sourceField: string | null; updatedAt: string | null }
  >();

  for (const stock of input.stocks) {
    const prev = stockByItem.get(stock.itemId);

    const safeQuantity = Number.isFinite(stock.quantity) ? stock.quantity : 0;

    if (!prev) {
      stockByItem.set(stock.itemId, {
        quantity: safeQuantity,
        sourceField: stock.sourceField,
        updatedAt: stock.updatedAt,
      });
      continue;
    }

    stockByItem.set(stock.itemId, {
      quantity: prev.quantity + safeQuantity,
      sourceField:
        stock.updatedAt > (prev.updatedAt ?? "") ? stock.sourceField : prev.sourceField,
      updatedAt:
        stock.updatedAt > (prev.updatedAt ?? "") ? stock.updatedAt : prev.updatedAt,
    });
  }

  return input.products.map((product) => {
    const stock = stockByItem.get(product.id);

    let availability: CatalogProduct["availability"] = "unknown";
    if (typeof stock?.quantity === "number") {
      availability = stock.quantity > 0 ? "in_stock" : "out_of_stock";
    }

    return {
      id: product.id,
      rostaItemId: product.rostaItemId,
      name: product.name,
      sku: product.sku,
      article: product.article,
      barcode: product.barcode,
      category: product.category,
      image: product.image,
      price: product.price,
      unit: product.unit,
      availability,
      quantity: stock?.quantity ?? 0,
      sourceField: stock?.sourceField ?? null,
      updatedAt: stock?.updatedAt ?? null,
      showOnHome: product.showOnHome,
    };
  });
}

export async function getCatalogBundle(clientId: string, query: CatalogQuery): Promise<
  | {
      ok: true;
      data: {
        clientId: string;
        warehouses: RostaWarehouse[];
        activeWarehouseId: string | null;
        categories: CatalogCategory[];
        items: CatalogProduct[];
        pagination: Pagination;
        search: string;
        category: string;
        warning: string | null;
      };
    }
  | { ok: false; status: number; message: string }
> {
  const seeded = await ensureClientCatalogSeed(clientId);
  if (!seeded.ok) {
    return seeded;
  }

  let warning: string | null = null;
  const freshness = await ensureFreshClientStock(clientId);
  if (!freshness.ok) {
    warning = freshness.message;
  }

  const warehouses = await getWarehousesByClient(clientId);
  const items = await getItemsByClient(clientId);
  const attributes = await getAttributesByClient(clientId);

  const allWarehouseModels = toRostaWarehouses(warehouses);

  const requestedWarehouseId = query.warehouseId?.trim() || null;
  const defaultWarehouseId = process.env.ROSTA_DEFAULT_UI_WAREHOUSE_ID?.trim() || null;
  const preferredWarehouseId = requestedWarehouseId || defaultWarehouseId;
  const activeWarehouse =
    (preferredWarehouseId
      ? allWarehouseModels.find(
          (warehouse) =>
            warehouse.id === preferredWarehouseId ||
            warehouse.rostaWarehouseId === preferredWarehouseId,
        )
      : null) ?? allWarehouseModels[0] ?? null;

  const stockRows = activeWarehouse
    ? await getStocksByClientAndWarehouse(clientId, activeWarehouse.id)
    : await getStocksByClient(clientId);

  const products = buildCatalogProducts({
    items,
    attributes,
    stockRows,
  });

  const homepageProducts = products.filter((product) => product.showOnHome);
  const categories = buildCategories(homepageProducts);
  const category = query.category?.trim().toUpperCase() ?? "";
  const search = query.search?.trim() ?? "";
  const searchNeedle = normalizeText(search);

  const filteredByCategory = category
    ? homepageProducts.filter((product) => product.category === category)
    : homepageProducts;

  const filteredBySearch = searchNeedle
    ? filteredByCategory.filter((product) =>
        [product.name, product.sku, product.article, product.barcode]
          .filter((value): value is string => Boolean(value))
          .some((value) => normalizeText(value).includes(searchNeedle)),
      )
    : filteredByCategory;

  const catalogProducts = toCatalogProducts({
    products: filteredBySearch,
    stocks: stockRows,
  });

  const page = safePage(query.page);
  const limit = safeLimit(query.limit);
  const paginated = paginate(catalogProducts, page, limit);

  return {
    ok: true,
    data: {
      clientId,
      warehouses: allWarehouseModels,
      activeWarehouseId: activeWarehouse?.id ?? null,
      categories,
      items: paginated.items,
      pagination: paginated.pagination,
      search,
      category,
      warning,
    },
  };
}

export async function getClientCategories(clientId: string): Promise<
  | { ok: true; data: CatalogCategory[] }
  | { ok: false; status: number; message: string }
> {
  const seeded = await ensureClientCatalogSeed(clientId);
  if (!seeded.ok) {
    return seeded;
  }

  const items = await getItemsByClient(clientId);
  const attributes = await getAttributesByClient(clientId);
  const stocks = await getStocksByClient(clientId);

  const categories = buildCategories(
    buildCatalogProducts({
      items,
      attributes,
      stockRows: stocks,
    }),
  );

  return {
    ok: true,
    data: categories,
  };
}

export async function getClientProducts(
  clientId: string,
  query: CatalogQuery,
): Promise<
  | {
      ok: true;
      data: {
        items: CatalogProduct[];
        pagination: Pagination;
      };
    }
  | { ok: false; status: number; message: string }
> {
  const bundle = await getCatalogBundle(clientId, query);
  if (!bundle.ok) {
    return bundle;
  }

  return {
    ok: true,
    data: {
      items: bundle.data.items,
      pagination: bundle.data.pagination,
    },
  };
}

export async function getClientProductById(clientId: string, productId: string): Promise<
  | { ok: true; data: CatalogProduct }
  | { ok: false; status: number; message: string }
> {
  const bundle = await getCatalogBundle(clientId, { page: 1, limit: MAX_LIMIT });
  if (!bundle.ok) {
    return bundle;
  }

  const product = bundle.data.items.find((item) => item.id === productId);
  if (!product) {
    return {
      ok: false,
      status: 404,
      message: "Product not found.",
    };
  }

  return {
    ok: true,
    data: product,
  };
}

export async function getClientWarehouses(clientId: string): Promise<
  | { ok: true; data: RostaWarehouse[] }
  | { ok: false; status: number; message: string }
> {
  const seeded = await ensureClientCatalogSeed(clientId);
  if (!seeded.ok) {
    return seeded;
  }

  const warehouses = await getWarehousesByClient(clientId);

  return {
    ok: true,
    data: toRostaWarehouses(warehouses),
  };
}

export function normalizeCatalogQuery(searchParams: URLSearchParams): CatalogQuery {
  const pageRaw = Number(searchParams.get("page"));
  const limitRaw = Number(searchParams.get("limit"));

  return {
    page: Number.isFinite(pageRaw) ? pageRaw : undefined,
    limit: Number.isFinite(limitRaw) ? limitRaw : undefined,
    search: searchParams.get("search")?.trim() || undefined,
    category: searchParams.get("category")?.trim() || undefined,
    warehouseId: searchParams.get("warehouseId")?.trim() || undefined,
  };
}

export function sanitizeCatalogError(error: unknown): { status: number; message: string } {
  return sanitizeServiceError(error);
}
