import { randomUUID } from "node:crypto";
import {
  type ClientRecord,
  type ClientStatus,
  type RostaAttributeRecord,
  type RostaItemRecord,
  type RostaStockRecord,
  type RostaSyncLogRecord,
  type RostaSyncLogStatus,
  type RostaSyncLogType,
  type RostaTradepointRecord,
  type RostaWarehouseRecord,
} from "@/lib/server/db-schema";
import { readDb, updateDb } from "@/lib/server/json-db";

function nowIso() {
  return new Date().toISOString();
}

export async function createClient(input: {
  name: string;
  rostaApiKeyEncrypted: string;
  rostaApiKeyMasked: string;
  status?: ClientStatus;
}): Promise<ClientRecord> {
  const createdAt = nowIso();
  const client: ClientRecord = {
    id: randomUUID(),
    name: input.name,
    rostaApiKeyEncrypted: input.rostaApiKeyEncrypted,
    rostaApiKeyMasked: input.rostaApiKeyMasked,
    status: input.status ?? "active",
    lastSyncAt: null,
    lastError: null,
    createdAt,
    updatedAt: createdAt,
  };

  await updateDb((db) => ({
    ...db,
    clients: [...db.clients, client],
  }));

  return client;
}

export async function getClientById(clientId: string): Promise<ClientRecord | null> {
  const db = await readDb();
  return db.clients.find((client) => client.id === clientId) ?? null;
}

export async function listClients(): Promise<ClientRecord[]> {
  const db = await readDb();
  return db.clients;
}

export async function updateClient(
  clientId: string,
  patch: Partial<
    Pick<ClientRecord, "name" | "status" | "lastSyncAt" | "lastError" | "rostaApiKeyEncrypted" | "rostaApiKeyMasked">
  >,
): Promise<ClientRecord | null> {
  let updated: ClientRecord | null = null;

  await updateDb((db) => {
    const index = db.clients.findIndex((client) => client.id === clientId);
    if (index < 0) {
      return db;
    }

    updated = {
      ...db.clients[index],
      ...patch,
      updatedAt: nowIso(),
    };

    const nextClients = [...db.clients];
    nextClients[index] = updated;

    return {
      ...db,
      clients: nextClients,
    };
  });

  return updated;
}

export async function disconnectClient(clientId: string): Promise<ClientRecord | null> {
  return updateClient(clientId, {
    status: "disabled",
    rostaApiKeyEncrypted: null,
    lastError: null,
  });
}

export async function upsertWarehouses(
  clientId: string,
  warehouses: Array<{
    rostaWarehouseId: string;
    name: string;
    tradepointId: string | null;
    isLimit: boolean | null;
    updatedAt: string;
  }>,
): Promise<RostaWarehouseRecord[]> {
  const updatedAt = nowIso();
  let records: RostaWarehouseRecord[] = [];

  await updateDb((db) => {
    const next = [...db.rostaWarehouses];

    for (const warehouse of warehouses) {
      const index = next.findIndex(
        (item) =>
          item.clientId === clientId && item.rostaWarehouseId === warehouse.rostaWarehouseId,
      );

      if (index >= 0) {
        next[index] = {
          ...next[index],
          name: warehouse.name,
          tradepointId: warehouse.tradepointId,
          isLimit: warehouse.isLimit,
          updatedAt,
        };
      } else {
        next.push({
          id: randomUUID(),
          clientId,
          rostaWarehouseId: warehouse.rostaWarehouseId,
          name: warehouse.name,
          tradepointId: warehouse.tradepointId,
          isLimit: warehouse.isLimit,
          updatedAt: warehouse.updatedAt || updatedAt,
          createdAt: updatedAt,
        });
      }
    }

    records = next.filter((item) => item.clientId === clientId);

    return {
      ...db,
      rostaWarehouses: next,
    };
  });

  return records;
}

export async function replaceRostaItems(
  clientId: string,
  items: Array<{
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
  }>,
): Promise<RostaItemRecord[]> {
  const timestamp = nowIso();
  const db = await readDb();
  const previousByRostaId = new Map(
    db.rostaItems
      .filter((row) => row.clientId === clientId)
      .map((row) => [row.rostaItemId, row]),
  );

  const nextItems: RostaItemRecord[] = items.map((item) => ({
    id: previousByRostaId.get(item.rostaItemId)?.id ?? randomUUID(),
    clientId,
    rostaItemId: item.rostaItemId,
    name: item.name,
    sku: item.sku,
    article: item.article,
    barcode: item.barcode,
    category: item.category,
    image: item.image,
    customImage: previousByRostaId.get(item.rostaItemId)?.customImage ?? null,
    manualCategory: previousByRostaId.get(item.rostaItemId)?.manualCategory ?? null,
    showOnHome: previousByRostaId.get(item.rostaItemId)?.showOnHome ?? false,
    price: item.price,
    unit: item.unit,
    parentId: item.parentId,
    typeId: item.typeId,
    unitId: item.unitId,
    updatedAt: item.updatedAt || timestamp,
    createdAt: previousByRostaId.get(item.rostaItemId)?.createdAt ?? timestamp,
  }));

  await updateDb((db) => ({
    ...db,
    rostaItems: [...db.rostaItems.filter((row) => row.clientId !== clientId), ...nextItems],
  }));

  return nextItems;
}

export async function replaceRostaAttributes(
  clientId: string,
  attributes: Array<{
    rostaAttributeId: string;
    rostaItemId: string;
    name: string;
    updatedAt: string;
  }>,
): Promise<RostaAttributeRecord[]> {
  const timestamp = nowIso();
  const db = await readDb();
  const previousByRostaAttributeId = new Map(
    db.rostaAttributes
      .filter((row) => row.clientId === clientId)
      .map((row) => [row.rostaAttributeId, row]),
  );

  const nextAttributes: RostaAttributeRecord[] = attributes.map((attribute) => ({
    id: previousByRostaAttributeId.get(attribute.rostaAttributeId)?.id ?? randomUUID(),
    clientId,
    rostaAttributeId: attribute.rostaAttributeId,
    rostaItemId: attribute.rostaItemId,
    name: attribute.name,
    updatedAt: attribute.updatedAt || timestamp,
    createdAt:
      previousByRostaAttributeId.get(attribute.rostaAttributeId)?.createdAt ?? timestamp,
  }));

  await updateDb((db) => ({
    ...db,
    rostaAttributes: [
      ...db.rostaAttributes.filter((row) => row.clientId !== clientId),
      ...nextAttributes,
    ],
  }));

  return nextAttributes;
}

export async function getWarehousesByClient(clientId: string): Promise<RostaWarehouseRecord[]> {
  const db = await readDb();
  return db.rostaWarehouses.filter((warehouse) => warehouse.clientId === clientId);
}

export async function getItemsByClient(clientId: string): Promise<RostaItemRecord[]> {
  const db = await readDb();
  return db.rostaItems.filter((item) => item.clientId === clientId);
}

export async function getItemByClientAndId(
  clientId: string,
  itemId: string,
): Promise<RostaItemRecord | null> {
  const db = await readDb();
  return (
    db.rostaItems.find((item) => item.clientId === clientId && item.id === itemId) ?? null
  );
}

export async function updateItemPresentationById(
  clientId: string,
  itemId: string,
  patch: {
    customImage?: string | null;
    manualCategory?: string | null;
    showOnHome?: boolean;
  },
): Promise<RostaItemRecord | null> {
  let updated: RostaItemRecord | null = null;

  await updateDb((db) => {
    const index = db.rostaItems.findIndex(
      (item) => item.clientId === clientId && item.id === itemId,
    );

    if (index < 0) {
      return db;
    }

    const nextItems = [...db.rostaItems];
    updated = {
      ...nextItems[index],
      customImage:
        patch.customImage !== undefined
          ? patch.customImage
          : nextItems[index].customImage,
      manualCategory:
        patch.manualCategory !== undefined
          ? patch.manualCategory
          : (nextItems[index].manualCategory ?? null),
      showOnHome:
        patch.showOnHome !== undefined
          ? patch.showOnHome
          : Boolean(nextItems[index].showOnHome),
      updatedAt: nowIso(),
    };
    nextItems[index] = updated;

    return {
      ...db,
      rostaItems: nextItems,
    };
  });

  return updated;
}

export async function getAttributesByClient(clientId: string): Promise<RostaAttributeRecord[]> {
  const db = await readDb();
  return db.rostaAttributes.filter((attribute) => attribute.clientId === clientId);
}

export async function getStocksByClient(clientId: string): Promise<RostaStockRecord[]> {
  const db = await readDb();
  return db.rostaStocks.filter((stock) => stock.clientId === clientId);
}

export async function getStocksByClientAndWarehouse(
  clientId: string,
  warehouseId: string,
): Promise<RostaStockRecord[]> {
  const db = await readDb();
  return db.rostaStocks.filter(
    (stock) => stock.clientId === clientId && stock.warehouseId === warehouseId,
  );
}

export async function upsertStocks(
  clientId: string,
  stocks: Array<{
    warehouseId: string;
    itemId: string;
    attributeId: string | null;
    quantity: number;
    sourceField: string;
  }>,
): Promise<RostaStockRecord[]> {
  const timestamp = nowIso();
  let result: RostaStockRecord[] = [];

  await updateDb((db) => {
    const next = [...db.rostaStocks];

    for (const stock of stocks) {
      const index = next.findIndex(
        (row) =>
          row.clientId === clientId &&
          row.warehouseId === stock.warehouseId &&
          row.itemId === stock.itemId &&
          row.attributeId === stock.attributeId,
      );

      if (index >= 0) {
        next[index] = {
          ...next[index],
          quantity: stock.quantity,
          sourceField: stock.sourceField,
          updatedAt: timestamp,
        };
      } else {
        next.push({
          id: randomUUID(),
          clientId,
          warehouseId: stock.warehouseId,
          itemId: stock.itemId,
          attributeId: stock.attributeId,
          quantity: stock.quantity,
          sourceField: stock.sourceField,
          updatedAt: timestamp,
          createdAt: timestamp,
        });
      }
    }

    result = next.filter((row) => row.clientId === clientId);

    return {
      ...db,
      rostaStocks: next,
    };
  });

  return result;
}

export async function replaceStocksByClient(
  clientId: string,
  stocks: Array<{
    warehouseId: string;
    itemId: string;
    attributeId: string | null;
    quantity: number;
    sourceField: string;
  }>,
): Promise<RostaStockRecord[]> {
  const timestamp = nowIso();
  let result: RostaStockRecord[] = [];

  await updateDb((db) => {
    const existingByKey = new Map(
      db.rostaStocks
        .filter((row) => row.clientId === clientId)
        .map((row) => [
          `${row.warehouseId}:${row.itemId}:${row.attributeId ?? ""}`,
          row,
        ]),
    );

    const dedupedByKey = new Map<string, (typeof stocks)[number]>();
    for (const stock of stocks) {
      const key = `${stock.warehouseId}:${stock.itemId}:${stock.attributeId ?? ""}`;
      dedupedByKey.set(key, stock);
    }

    const nextClientStocks: RostaStockRecord[] = [...dedupedByKey.entries()].map(
      ([key, stock]) => {
        const previous = existingByKey.get(key);
        return {
          id: previous?.id ?? randomUUID(),
          clientId,
          warehouseId: stock.warehouseId,
          itemId: stock.itemId,
          attributeId: stock.attributeId,
          quantity: stock.quantity,
          sourceField: stock.sourceField,
          updatedAt: timestamp,
          createdAt: previous?.createdAt ?? timestamp,
        };
      },
    );

    result = nextClientStocks;

    return {
      ...db,
      rostaStocks: [
        ...db.rostaStocks.filter((row) => row.clientId !== clientId),
        ...nextClientStocks,
      ],
    };
  });

  return result;
}

export async function upsertTradepoints(
  clientId: string,
  tradepoints: Array<{
    rostaTradepointId: string;
    name: string;
    warehouseId: string | null;
    updatedAt: string;
  }>,
): Promise<RostaTradepointRecord[]> {
  const updatedAt = nowIso();
  let records: RostaTradepointRecord[] = [];

  await updateDb((db) => {
    const next = [...db.rostaTradepoints];

    for (const tradepoint of tradepoints) {
      const index = next.findIndex(
        (item) =>
          item.clientId === clientId && item.rostaTradepointId === tradepoint.rostaTradepointId,
      );

      if (index >= 0) {
        next[index] = {
          ...next[index],
          name: tradepoint.name,
          warehouseId: tradepoint.warehouseId,
          updatedAt,
        };
      } else {
        next.push({
          id: randomUUID(),
          clientId,
          rostaTradepointId: tradepoint.rostaTradepointId,
          name: tradepoint.name,
          warehouseId: tradepoint.warehouseId,
          updatedAt: tradepoint.updatedAt || updatedAt,
          createdAt: updatedAt,
        });
      }
    }

    records = next.filter((item) => item.clientId === clientId);

    return {
      ...db,
      rostaTradepoints: next,
    };
  });

  return records;
}

export async function getTradepointsByClient(clientId: string): Promise<RostaTradepointRecord[]> {
  const db = await readDb();
  return db.rostaTradepoints.filter((tradepoint) => tradepoint.clientId === clientId);
}

export async function createSyncLog(
  clientId: string,
  type: RostaSyncLogType,
): Promise<RostaSyncLogRecord> {
  const startedAt = nowIso();
  const log: RostaSyncLogRecord = {
    id: randomUUID(),
    clientId,
    type,
    status: "running",
    startedAt,
    finishedAt: null,
    itemsProcessed: 0,
    itemsUpdated: 0,
    errorsCount: 0,
    errorMessage: null,
  };

  await updateDb((db) => ({
    ...db,
    rostaSyncLogs: [...db.rostaSyncLogs, log],
  }));

  return log;
}

export async function finishSyncLog(
  logId: string,
  patch: {
    status: RostaSyncLogStatus;
    itemsProcessed?: number;
    itemsUpdated?: number;
    errorsCount?: number;
    errorMessage?: string | null;
  },
): Promise<RostaSyncLogRecord | null> {
  let updated: RostaSyncLogRecord | null = null;

  await updateDb((db) => {
    const index = db.rostaSyncLogs.findIndex((log) => log.id === logId);
    if (index < 0) {
      return db;
    }

    updated = {
      ...db.rostaSyncLogs[index],
      status: patch.status,
      finishedAt: nowIso(),
      itemsProcessed: patch.itemsProcessed ?? db.rostaSyncLogs[index].itemsProcessed,
      itemsUpdated: patch.itemsUpdated ?? db.rostaSyncLogs[index].itemsUpdated,
      errorsCount: patch.errorsCount ?? db.rostaSyncLogs[index].errorsCount,
      errorMessage: patch.errorMessage ?? null,
    };

    const nextLogs = [...db.rostaSyncLogs];
    nextLogs[index] = updated;

    return {
      ...db,
      rostaSyncLogs: nextLogs,
    };
  });

  return updated;
}

export async function getSyncLogsByClient(
  clientId: string,
  limit = 20,
): Promise<RostaSyncLogRecord[]> {
  const db = await readDb();
  return db.rostaSyncLogs
    .filter((log) => log.clientId === clientId)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
    .slice(0, limit);
}
