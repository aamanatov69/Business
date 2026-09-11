import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { AppDb } from "./db-schema";
import { catalogCategories } from "../catalog-categories";

// Read-only snapshot: rendering must never trigger an upstream sync or create a DB.
// Only the configured storefront tenant and explicitly published cards are exposed.
export const getPublicProducts = cache(async () => {
  const clientId = process.env.ROSTA_DEFAULT_UI_CLIENT_ID?.trim();
  if (!clientId) return [];
  let raw: string;
  try { raw = await readFile(path.join(process.cwd(), "data", "app-db.json"), "utf8"); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  const db = JSON.parse(raw) as AppDb;
  if (!db.clients?.some((client) => client.id === clientId && client.status !== "disabled")) return [];
  return (db.rostaItems ?? []).filter((item) => item.clientId === clientId && item.showOnHome && item.name?.trim()).map((item) => {
    const code = (item.manualCategory || item.category || "").trim();
    const category = catalogCategories.find((entry) => entry.code === code.toUpperCase() || entry.title.toLowerCase() === code.toLowerCase());
    const candidate = item.customImage || item.image || "";
    const image = /^(https?:\/\/|\/(?!\/))/.test(candidate) ? candidate : undefined;
    return { id: item.id, name: item.name.trim(), sku: item.sku || item.article, barcode: item.barcode,
      unit: item.unit, image, category, updatedAt: item.updatedAt };
    // Currency and model-specific compatibility are not stored: no invented Offers/specs.
  });
});
