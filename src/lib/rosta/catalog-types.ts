export type RostaProduct = {
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
  showOnHome: boolean;
  attributes: Array<{
    id: string;
    rostaAttributeId: string;
    name: string;
  }>;
};

export type RostaCategory = {
  id: string;
  code: string;
  title: string;
  description: string;
  shortLabel: string;
  itemCount: number;
};

export type RostaWarehouse = {
  id: string;
  rostaWarehouseId: string;
  name: string;
  tradepointId: string | null;
  isActive: boolean;
  updatedAt: string;
};

export type RostaStock = {
  id: string;
  warehouseId: string;
  itemId: string;
  attributeId: string | null;
  quantity: number;
  sourceField: string;
  updatedAt: string;
};

export type CatalogProduct = {
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

export type CatalogCategory = {
  id: string;
  code: string;
  title: string;
  description: string;
  shortLabel: string;
  itemCount: number;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};
