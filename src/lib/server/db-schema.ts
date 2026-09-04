export type ClientStatus = "active" | "disabled" | "error";

export type ClientRecord = {
  id: string;
  name: string;
  rostaApiKeyEncrypted: string | null;
  rostaApiKeyMasked: string;
  status: ClientStatus;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RostaTradepointRecord = {
  id: string;
  clientId: string;
  rostaTradepointId: string;
  name: string;
  warehouseId: string | null;
  updatedAt: string;
  createdAt: string;
};

export type RostaSyncLogType = "FULL_SYNC" | "STOCK_SYNC";
export type RostaSyncLogStatus = "running" | "success" | "error";

export type RostaSyncLogRecord = {
  id: string;
  clientId: string;
  type: RostaSyncLogType;
  status: RostaSyncLogStatus;
  startedAt: string;
  finishedAt: string | null;
  itemsProcessed: number;
  itemsUpdated: number;
  errorsCount: number;
  errorMessage: string | null;
};

export type RostaWarehouseRecord = {
  id: string;
  clientId: string;
  rostaWarehouseId: string;
  name: string;
  tradepointId: string | null;
  isLimit: boolean | null;
  updatedAt: string;
  createdAt: string;
};

export type RostaItemRecord = {
  id: string;
  clientId: string;
  rostaItemId: string;
  name: string;
  sku: string | null;
  article: string | null;
  barcode: string | null;
  category: string | null;
  image: string | null;
  customImage: string | null;
  manualCategory: string | null;
  showOnHome: boolean;
  price: number | null;
  unit: string | null;
  parentId: string | null;
  typeId: string | null;
  unitId: string | null;
  updatedAt: string;
  createdAt: string;
};

export type RostaAttributeRecord = {
  id: string;
  clientId: string;
  rostaAttributeId: string;
  rostaItemId: string;
  name: string;
  updatedAt: string;
  createdAt: string;
};

export type RostaStockRecord = {
  id: string;
  clientId: string;
  warehouseId: string;
  itemId: string;
  attributeId: string | null;
  quantity: number;
  sourceField: string;
  updatedAt: string;
  createdAt: string;
};

export type AppDb = {
  clients: ClientRecord[];
  rostaTradepoints: RostaTradepointRecord[];
  rostaWarehouses: RostaWarehouseRecord[];
  rostaItems: RostaItemRecord[];
  rostaAttributes: RostaAttributeRecord[];
  rostaStocks: RostaStockRecord[];
  rostaSyncLogs: RostaSyncLogRecord[];
};

export const emptyDb: AppDb = {
  clients: [],
  rostaTradepoints: [],
  rostaWarehouses: [],
  rostaItems: [],
  rostaAttributes: [],
  rostaStocks: [],
  rostaSyncLogs: [],
};
