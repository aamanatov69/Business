export type ParsedWarehouse = {
  rostaWarehouseId: string;
  name: string;
  tradepointId: string | null;
  isLimit: boolean | null;
  updatedAt: string;
};

export type ParsedItem = {
  rostaItemId: string;
  name: string;
  sku: string | null;
  article: string | null;
  barcode: string | null;
  category: string | null;
  image: string | null;
  price: number | null;
  unit: string | null;
  parentId: string | null;
  typeId: string | null;
  unitId: string | null;
  updatedAt: string;
};

export type ParsedTradepoint = {
  rostaTradepointId: string;
  name: string;
  warehouseId: string | null;
  updatedAt: string;
};

export type ParsedAttribute = {
  rostaAttributeId: string;
  rostaItemId: string;
  name: string;
  updatedAt: string;
};

export type ParsedStockRow = {
  rostaItemId: string;
  rostaAttributeId: string | null;
  quantity: number;
  sourceField: string;
};

const STOCK_KEYS = [
  "total_gross",
  "quantity",
  "qty",
  "stock",
  "balance",
  "remains",
  "rest",
  "available",
  "amount",
  "inStock",
  "count",
] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/\s+/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getDataArray(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) {
    return [];
  }

  const data = root.data;
  if (Array.isArray(data)) {
    return data;
  }

  const dataObj = asRecord(data);
  if (!dataObj) {
    return [];
  }

  for (const key of ["items", "products", "result"]) {
    const rows = asArray(dataObj[key]);
    if (rows.length) {
      return rows;
    }
  }

  return [];
}

export function parseWarehouses(payload: unknown): ParsedWarehouse[] {
  return getDataArray(payload)
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => {
      const id = normalizeString(row.id);
      if (!id) {
        return null;
      }

      const tradepoint = asRecord(row.tradepoint);
      const tradepointId = normalizeString(row.tradepoint_id) ?? normalizeString(tradepoint?.id) ?? null;

      return {
        rostaWarehouseId: id,
        name: normalizeString(row.name) ?? "Unknown warehouse",
        tradepointId,
        isLimit: typeof row.is_limit === "boolean" ? row.is_limit : null,
        updatedAt: normalizeString(row.updated_at) ?? new Date().toISOString(),
      };
    })
    .filter((row): row is ParsedWarehouse => Boolean(row));
}

export function parseTradepoints(payload: unknown): ParsedTradepoint[] {
  return getDataArray(payload)
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => {
      const id = normalizeString(row.id);
      if (!id) {
        return null;
      }

      const warehouse = asRecord(row.warehouse);
      const warehouseId =
        normalizeString(row.warehouse_id) ?? normalizeString(warehouse?.id) ?? null;

      return {
        rostaTradepointId: id,
        name: normalizeString(row.name) ?? "Unknown tradepoint",
        warehouseId,
        updatedAt: normalizeString(row.updated_at) ?? new Date().toISOString(),
      };
    })
    .filter((row): row is ParsedTradepoint => Boolean(row));
}

export function parseItems(payload: unknown): ParsedItem[] {
  return getDataArray(payload)
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => {
      const id = normalizeString(row.id);
      if (!id) {
        return null;
      }

      return {
        rostaItemId: id,
        name: normalizeString(row.name) ?? "Unknown item",
        sku: normalizeString(row.sku),
        article: normalizeString(row.article),
        barcode: normalizeString(row.barcode),
        category: normalizeString(row.category),
        image: normalizeString(row.image),
        price: normalizeNumber(row.price),
        unit: normalizeString(row.unit),
        parentId: normalizeString(row.parent_id),
        typeId: normalizeString(row.type_id),
        unitId: normalizeString(row.unit_id),
        updatedAt: normalizeString(row.updated_at) ?? new Date().toISOString(),
      };
    })
    .filter((row): row is ParsedItem => Boolean(row));
}

export function parseAttributes(payload: unknown): ParsedAttribute[] {
  return getDataArray(payload)
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => {
      const id = normalizeString(row.id);
      const itemId = normalizeString(row.item_id);

      if (!id || !itemId) {
        return null;
      }

      return {
        rostaAttributeId: id,
        rostaItemId: itemId,
        name: normalizeString(row.name) ?? "Unknown attribute",
        updatedAt: normalizeString(row.updated_at) ?? new Date().toISOString(),
      };
    })
    .filter((row): row is ParsedAttribute => Boolean(row));
}

export function parseStockRows(payload: unknown): ParsedStockRow[] {
  const rows: ParsedStockRow[] = [];
  const queue: unknown[] = [payload];
  const seen = new Set<unknown>();

  while (queue.length) {
    const current = queue.shift();

    if (!current || typeof current !== "object") {
      continue;
    }

    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    const row = current as Record<string, unknown>;

    const itemId = normalizeString(row.item_id) ?? normalizeString(row.id);
    const attributeId = normalizeString(row.attribute_id);

    if (itemId) {
      for (const key of STOCK_KEYS) {
        const value = normalizeNumber(row[key]);
        if (value === null) {
          continue;
        }

        rows.push({
          rostaItemId: itemId,
          rostaAttributeId: attributeId,
          quantity: value,
          sourceField: key,
        });
        break;
      }
    }

    for (const nested of Object.values(row)) {
      if (nested && typeof nested === "object") {
        queue.push(nested);
      }
    }
  }

  const unique = new Map<string, ParsedStockRow>();
  for (const row of rows) {
    const key = `${row.rostaItemId}:${row.rostaAttributeId ?? ""}`;
    if (!unique.has(key)) {
      unique.set(key, row);
    }
  }

  return [...unique.values()];
}
