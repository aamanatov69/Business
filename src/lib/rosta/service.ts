import { RostaClient, RostaRequestError } from "@/lib/rosta/client";
import {
  parseAttributes,
  parseItems,
  parseStockRows,
  parseTradepoints,
  parseWarehouses,
} from "@/lib/rosta/parser";
import {
  createClient,
  createSyncLog,
  disconnectClient as repositoryDisconnectClient,
  finishSyncLog,
  getAttributesByClient,
  getClientById,
  getItemsByClient,
  getStocksByClient,
  getWarehousesByClient,
  replaceRostaAttributes,
  replaceRostaItems,
  replaceStocksByClient,
  updateClient,
  upsertTradepoints,
  upsertWarehouses,
} from "@/lib/server/client-repository";
import { decryptSecret, encryptSecret, maskApiKey } from "@/lib/server/secrets";

const stockRefreshInFlight = new Map<
  string,
  Promise<{ ok: true; refreshed: boolean } | { ok: false; status: number; message: string }>
>();

function getBatchSize(): number {
  const raw = process.env.ROSTA_STOCK_BATCH_SIZE?.trim();
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 100;
  }

  return Math.floor(parsed);
}

function getStockRefreshIntervalMs(): number {
  const raw = process.env.ROSTA_STOCK_REFRESH_INTERVAL_MS?.trim();
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60 * 1000;
  }

  return Math.floor(parsed);
}

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length <= size) {
    return [items];
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export function sanitizeServiceError(error: unknown): { status: number; message: string } {
  if (error instanceof RostaRequestError) {
    const status = error.status || 502;

    if (status === 401) {
      return { status, message: "Rosta authorization failed: invalid API key." };
    }

    if (status === 403) {
      return { status, message: "Rosta access denied for this API key." };
    }

    if (status === 404) {
      return { status, message: "Rosta resource not found." };
    }

    if (status === 429) {
      return { status, message: "Rosta rate limit exceeded. Try again later." };
    }

    if (status >= 500) {
      return { status, message: "Rosta temporary server error." };
    }

    return { status, message: "Rosta request failed." };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : "Unknown server error.",
  };
}

async function getClientAndApi(clientId: string) {
  const client = await getClientById(clientId);
  if (!client) {
    return null;
  }

  if (client.status === "disabled" || !client.rostaApiKeyEncrypted) {
    throw new Error("Client is disabled.");
  }

  const apiKey = decryptSecret(client.rostaApiKeyEncrypted);
  return {
    client,
    rosta: new RostaClient(apiKey),
  };
}

export async function testApiKey(
  apiKey: string,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  try {
    const rosta = new RostaClient(apiKey);
    await rosta.getTradepoints();
    return { ok: true };
  } catch (error) {
    const normalized = sanitizeServiceError(error);
    return { ok: false, status: normalized.status, message: normalized.message };
  }
}

export async function syncClientRostaData(clientId: string) {
  const resolved = await getClientAndApi(clientId);

  if (!resolved) {
    return { ok: false, status: 404, message: "Client not found." } as const;
  }

  const log = await createSyncLog(clientId, "FULL_SYNC");

  try {
    const [tradepointsPayload, warehousesPayload, itemsPayload, attributesPayload] =
      await Promise.all([
        resolved.rosta.getTradepoints(),
        resolved.rosta.getWarehouses(),
        resolved.rosta.getItems(),
        resolved.rosta.getAttributes(),
      ]);

    const tradepoints = parseTradepoints(tradepointsPayload);
    const warehouses = parseWarehouses(warehousesPayload);
    const items = parseItems(itemsPayload);
    const attributes = parseAttributes(attributesPayload);

    const tradepointRows = await upsertTradepoints(clientId, tradepoints);
    const warehouseRows = await upsertWarehouses(clientId, warehouses);
    const itemRows = await replaceRostaItems(clientId, items);
    const attributeRows = await replaceRostaAttributes(clientId, attributes);

    const totalProcessed =
      tradepointRows.length + warehouseRows.length + itemRows.length + attributeRows.length;

    await finishSyncLog(log.id, {
      status: "success",
      itemsProcessed: totalProcessed,
      itemsUpdated: totalProcessed,
    });
    await updateClient(clientId, {
      status: "active",
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    });

    return {
      ok: true,
      status: 200,
      data: {
        clientId,
        tradepoints: tradepointRows.length,
        warehouses: warehouseRows.length,
        items: itemRows.length,
        attributes: attributeRows.length,
      },
    } as const;
  } catch (error) {
    const normalized = sanitizeServiceError(error);

    await finishSyncLog(log.id, {
      status: "error",
      errorsCount: 1,
      errorMessage: normalized.message,
    });
    await updateClient(clientId, {
      status: "error",
      lastError: normalized.message,
    });

    return {
      ok: false,
      status: normalized.status,
      message: normalized.message,
    } as const;
  }
}

export async function refreshClientStock(clientId: string, options?: { date?: string }) {
  const resolved = await getClientAndApi(clientId);

  if (!resolved) {
    return { ok: false, status: 404, message: "Client not found." } as const;
  }

  const log = await createSyncLog(clientId, "STOCK_SYNC");
  const result = await performStockRefresh(clientId, resolved, options);

  if (result.ok) {
    await finishSyncLog(log.id, {
      status: "success",
      itemsProcessed: result.data.parsedStockRows,
      itemsUpdated: result.data.parsedStockRows,
    });
    await updateClient(clientId, {
      status: "active",
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    });
  } else {
    await finishSyncLog(log.id, {
      status: "error",
      errorsCount: 1,
      errorMessage: result.message,
    });
    await updateClient(clientId, {
      status: "error",
      lastError: result.message,
    });
  }

  return result;
}

export async function ensureFreshClientStock(
  clientId: string,
  options?: { date?: string },
): Promise<{ ok: true; refreshed: boolean } | { ok: false; status: number; message: string }> {
  const client = await getClientById(clientId);
  if (!client) {
    return { ok: false, status: 404, message: "Client not found." };
  }

  const intervalMs = getStockRefreshIntervalMs();
  const lastSyncMs = client.lastSyncAt ? Date.parse(client.lastSyncAt) : NaN;

  if (Number.isFinite(lastSyncMs) && Date.now() - lastSyncMs < intervalMs) {
    return { ok: true, refreshed: false };
  }

  const inFlight = stockRefreshInFlight.get(clientId);
  if (inFlight) {
    return inFlight;
  }

  const refreshPromise = (async () => {
    // Keep item/warehouse catalogs in sync too, otherwise newly added products
    // in Rosta will not appear until a manual full sync is triggered.
    const fullSyncResult = await syncClientRostaData(clientId);
    if (!fullSyncResult.ok) {
      return {
        ok: false,
        status: fullSyncResult.status,
        message: fullSyncResult.message,
      } as const;
    }

    const result = await refreshClientStock(clientId, options);
    if (!result.ok) {
      return { ok: false, status: result.status, message: result.message } as const;
    }

    return { ok: true, refreshed: true } as const;
  })();

  stockRefreshInFlight.set(clientId, refreshPromise);

  try {
    return await refreshPromise;
  } finally {
    stockRefreshInFlight.delete(clientId);
  }
}

async function performStockRefresh(
  clientId: string,
  resolved: NonNullable<Awaited<ReturnType<typeof getClientAndApi>>>,
  options?: { date?: string },
) {
  try {
    let warehouses = await getWarehousesByClient(clientId);
    let items = await getItemsByClient(clientId);
    let attributes = await getAttributesByClient(clientId);

    if (!warehouses.length || !items.length) {
      const syncResult = await syncClientRostaData(clientId);
      if (!syncResult.ok) {
        return syncResult;
      }

      warehouses = await getWarehousesByClient(clientId);
      items = await getItemsByClient(clientId);
      attributes = await getAttributesByClient(clientId);
    }

    if (!warehouses.length) {
      return {
        ok: false,
        status: 409,
        message: "No Rosta warehouses found for this client.",
      } as const;
    }

    const itemMap = new Map(items.map((item) => [item.rostaItemId, item]));
    const requestRows = items.map((item) => ({
      item_id: item.rostaItemId,
    }));

    if (!requestRows.length) {
      return {
        ok: false,
        status: 409,
        message: "No synced Rosta items found for stock request.",
      } as const;
    }

    const batchSize = getBatchSize();
    const requestBatches = chunk(requestRows, batchSize);

    const allRawResponses: Array<{
      warehouseId: string;
      batch: number;
      payload: Record<string, unknown>;
    }> = [];

    const parsedRows: Array<{
      warehouseLocalId: string;
      rostaItemId: string;
      rostaAttributeId: string | null;
      quantity: number;
      sourceField: string;
    }> = [];

    for (const warehouse of warehouses) {
      for (let batchIndex = 0; batchIndex < requestBatches.length; batchIndex += 1) {
        const payload = await resolved.rosta.getWarehouseStock({
          warehouseId: warehouse.rostaWarehouseId,
          date: options?.date,
          items: requestBatches[batchIndex],
        });

        allRawResponses.push({
          warehouseId: warehouse.rostaWarehouseId,
          batch: batchIndex + 1,
          payload,
        });

        const stockRows = parseStockRows(payload);

        for (const row of stockRows) {
          parsedRows.push({
            warehouseLocalId: warehouse.id,
            rostaItemId: row.rostaItemId,
            rostaAttributeId: row.rostaAttributeId,
            quantity: row.quantity,
            sourceField: row.sourceField,
          });
        }
      }
    }

    const normalizedStocks = parsedRows
      .map((row) => {
        const item = itemMap.get(row.rostaItemId);
        if (!item) {
          return null;
        }

        return {
          warehouseId: row.warehouseLocalId,
          itemId: item.id,
          attributeId:
            row.rostaAttributeId === null
              ? null
              : attributes.find((attribute) => attribute.rostaAttributeId === row.rostaAttributeId)?.id ?? null,
          quantity: row.quantity,
          sourceField: row.sourceField,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    await replaceStocksByClient(clientId, normalizedStocks);

    const savedStocks = await getStocksByClient(clientId);
    const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));
    const itemById = new Map(items.map((item) => [item.id, item]));
    const attributeById = new Map(attributes.map((attribute) => [attribute.id, attribute]));

    const viewRows = savedStocks
      .filter((stock) => itemById.has(stock.itemId))
      .map((stock) => {
      const warehouse = warehouseById.get(stock.warehouseId);
      const item = itemById.get(stock.itemId);
      const attribute = stock.attributeId ? attributeById.get(stock.attributeId) : undefined;

      return {
        warehouseId: stock.warehouseId,
        warehouseName: warehouse?.name ?? null,
        itemId: item?.rostaItemId ?? null,
        itemName: item?.name ?? null,
        attributeId: attribute?.rostaAttributeId ?? null,
        attributeName: attribute?.name ?? null,
        quantity: stock.quantity,
        sourceField: stock.sourceField,
        updatedAt: stock.updatedAt,
      };
    });

    const detectedQuantityFields = [...new Set(viewRows.map((row) => row.sourceField))];

    return {
      ok: true,
      status: 200,
      data: {
        clientId,
        warehouses: warehouses.map((warehouse) => ({
          id: warehouse.id,
          rostaWarehouseId: warehouse.rostaWarehouseId,
          name: warehouse.name,
        })),
        batchesPerWarehouse: requestBatches.length,
        parsedStockRows: normalizedStocks.length,
        stockQuantityFieldDetected: normalizedStocks[0]?.sourceField ?? null,
        detectedQuantityFields,
        viewRows,
        warning:
          normalizedStocks.length === 0
            ? "Rosta response did not contain detectable stock quantity fields. Raw payload returned for inspection."
            : null,
        rawResponses: allRawResponses,
      },
    } as const;
  } catch (error) {
    const normalized = sanitizeServiceError(error);
    return {
      ok: false,
      status: normalized.status,
      message: normalized.message,
    } as const;
  }
}

export async function connectClient(input: { name: string; apiKey: string }): Promise<
  | {
      ok: true;
      data: {
        clientId: string;
        tradepoints: number;
        warehouses: number;
        items: number;
        stockRows: number;
        status: "active" | "error";
        warning: string | null;
      };
    }
  | { ok: false; status: number; message: string }
> {
  const apiKey = input.apiKey.trim();
  const keyCheck = await testApiKey(apiKey);

  if (!keyCheck.ok) {
    return { ok: false, status: keyCheck.status, message: keyCheck.message };
  }

  const client = await createClient({
    name: input.name,
    rostaApiKeyEncrypted: encryptSecret(apiKey),
    rostaApiKeyMasked: maskApiKey(apiKey),
    status: "active",
  });

  const syncResult = await syncClientRostaData(client.id);
  if (!syncResult.ok) {
    return {
      ok: true,
      data: {
        clientId: client.id,
        tradepoints: 0,
        warehouses: 0,
        items: 0,
        stockRows: 0,
        status: "error",
        warning: syncResult.message,
      },
    };
  }

  const stockResult = await refreshClientStock(client.id);

  return {
    ok: true,
    data: {
      clientId: client.id,
      tradepoints: syncResult.data.tradepoints,
      warehouses: syncResult.data.warehouses,
      items: syncResult.data.items,
      stockRows: stockResult.ok ? stockResult.data.parsedStockRows : 0,
      status: stockResult.ok ? "active" : "error",
      warning: stockResult.ok ? stockResult.data.warning : stockResult.message,
    },
  };
}

export async function disconnectClientService(clientId: string): Promise<
  { ok: true } | { ok: false; status: number; message: string }
> {
  const client = await getClientById(clientId);
  if (!client) {
    return { ok: false, status: 404, message: "Client not found." };
  }

  await repositoryDisconnectClient(clientId);
  return { ok: true };
}
